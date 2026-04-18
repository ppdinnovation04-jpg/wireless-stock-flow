import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type InventoryItem = Tables<"inventory_items">;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export function QRCodeDialog({ open, onOpenChange, item }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const productUrl = item
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${item.id}`
    : "";

  useEffect(() => {
    if (!open || !item) return;
    let cancelled = false;
    // Defer to next tick so the canvas inside DialogContent is mounted
    const timer = setTimeout(() => {
      if (cancelled) return;
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, productUrl, {
          width: 280,
          margin: 2,
          color: { dark: "#0f172a", light: "#ffffff" },
        }).catch(() => toast.error("Failed to generate QR code"));
      }
      QRCode.toDataURL(productUrl, { width: 600, margin: 2 })
        .then((url) => !cancelled && setDataUrl(url))
        .catch(() => toast.error("Failed to generate QR code"));
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, item, productUrl]);

  const handleDownload = () => {
    if (!dataUrl || !item) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${item.sku}.png`;
    a.click();
    toast.success("QR code downloaded");
  };

  const handlePrint = () => {
    if (!dataUrl || !item) return;
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return toast.error("Popup blocked");
    w.document.write(`
      <html><head><title>QR — ${item.sku}</title>
      <style>
        body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}
        .label{text-align:center;border:1px solid #e5e7eb;border-radius:12px;padding:24px;max-width:320px;}
        .label img{width:240px;height:240px;}
        .name{font-size:16px;font-weight:600;margin:12px 0 4px;color:#0f172a;}
        .sku{font-family:monospace;font-size:12px;color:#64748b;}
        @media print{.label{border:none;}}
      </style></head>
      <body><div class="label">
        <img src="${dataUrl}" alt="QR"/>
        <div class="name">${item.name}</div>
        <div class="sku">${item.sku}</div>
      </div>
      <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500);}</script>
      </body></html>
    `);
    w.document.close();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Product QR Code</DialogTitle>
          <DialogDescription>
            Scan to open the product details page.
          </DialogDescription>
        </DialogHeader>
        {item && (
          <div className="space-y-4">
            <div className="flex justify-center rounded-lg border border-border bg-white p-4">
              <canvas ref={canvasRef} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
              <code className="flex-1 truncate text-xs text-muted-foreground">{productUrl}</code>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground"
                title="Copy link"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleDownload} className="gap-1.5">
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button onClick={handlePrint} className="gap-1.5">
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
