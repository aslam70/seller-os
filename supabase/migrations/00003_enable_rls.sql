-- Enable Row Level Security (RLS) on all core tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 1. Orders RLS Policies
CREATE POLICY "Sellers can only select their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Sellers can only insert their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can only update their own orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can only delete their own orders"
ON orders FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- 2. Products RLS Policies
CREATE POLICY "Sellers can only select their own products"
ON products FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Sellers can only insert their own products"
ON products FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can only update their own products"
ON products FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can only delete their own products"
ON products FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- 3. Customers RLS Policies
CREATE POLICY "Sellers can only select their own customers"
ON customers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Sellers can only insert their own customers"
ON customers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can only update their own customers"
ON customers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can only delete their own customers"
ON customers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
