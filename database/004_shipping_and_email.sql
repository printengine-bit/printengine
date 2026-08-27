ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_provider text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_label_url text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_error text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_shipment_id ON orders(shipment_id) WHERE shipment_id IS NOT NULL;

