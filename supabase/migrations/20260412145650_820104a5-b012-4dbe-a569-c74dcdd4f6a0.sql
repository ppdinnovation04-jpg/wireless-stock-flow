-- Drop the overly permissive update policy
DROP POLICY "Authenticated users can update inventory" ON public.inventory_items;

-- Replace with a more restrictive policy
CREATE POLICY "Users can update inventory items"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));