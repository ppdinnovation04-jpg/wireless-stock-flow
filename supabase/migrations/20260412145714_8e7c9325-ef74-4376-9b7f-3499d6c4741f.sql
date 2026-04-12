DROP POLICY "Users can update inventory items" ON public.inventory_items;

CREATE POLICY "Authenticated users can update inventory"
  ON public.inventory_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);