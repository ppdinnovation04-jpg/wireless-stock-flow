import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type InventoryItem = Tables<"inventory_items">;
type ActivityLog = Tables<"activity_logs">;

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("inventory_items")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }, []);

  const fetchLogs = useCallback(async () => {
    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setLogs(data);
  }, []);

  useEffect(() => {
    fetchItems();
    fetchLogs();

    const itemsSub = supabase
      .channel("inventory-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory_items" }, () => {
        fetchItems();
      })
      .subscribe();

    const logsSub = supabase
      .channel("logs-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSub);
      supabase.removeChannel(logsSub);
    };
  }, [fetchItems, fetchLogs]);

  const addItem = useCallback(async (item: Omit<TablesInsert<"inventory_items">, "created_by">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("inventory_items")
      .insert({ ...item, created_by: user.id })
      .select()
      .single();
    if (error) throw error;

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "created",
      item_id: data.id,
      item_name: data.name,
      details: { quantity: data.quantity, sku: data.sku },
    });

    return data;
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const oldItem = items.find((i) => i.id === id);
    const { data, error } = await supabase
      .from("inventory_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (oldItem) {
      for (const key of Object.keys(updates) as (keyof typeof updates)[]) {
        if (oldItem[key] !== updates[key]) {
          changes[key] = { from: oldItem[key], to: updates[key] };
        }
      }
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "updated",
      item_id: data.id,
      item_name: data.name,
      details: changes,
    });

    return data;
  }, [items]);

  const deleteItem = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const item = items.find((i) => i.id === id);
    if (!item) throw new Error("Item not found");

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "deleted",
      item_id: null,
      item_name: item.name,
      details: { sku: item.sku, quantity: item.quantity },
    });

    const { error } = await supabase.from("inventory_items").delete().eq("id", id);
    if (error) throw error;
  }, [items]);

  const stats = {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    lowStock: items.filter((i) => i.status === "low_stock").length,
    outOfStock: items.filter((i) => i.status === "out_of_stock").length,
  };

  return { items, logs, loading, stats, addItem, updateItem, deleteItem, refetch: fetchItems };
}
