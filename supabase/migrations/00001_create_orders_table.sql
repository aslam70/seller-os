CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id TEXT,
  customer TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  product TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  delivery_charge NUMERIC DEFAULT 60,
  payment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  courier TEXT DEFAULT 'Pathao',
  notes TEXT DEFAULT '',
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
