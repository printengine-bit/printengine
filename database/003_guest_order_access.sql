ALTER TABLE orders ADD COLUMN IF NOT EXISTS access_token_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_access_token_hash ON orders(access_token_hash) WHERE access_token_hash IS NOT NULL;
