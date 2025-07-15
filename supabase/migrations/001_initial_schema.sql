-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_tier AS ENUM ('frost_fan', 'blizzard_vip', 'avalanche_backstage');
CREATE TYPE product_category AS ENUM ('apparel', 'accessories', 'music', 'collectibles');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier user_tier NOT NULL DEFAULT 'frost_fan',
  stripe_customer_id TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category product_category NOT NULL,
  tier_visibility user_tier[] DEFAULT ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'],
  in_stock BOOLEAN DEFAULT TRUE,
  is_exclusive BOOLEAN DEFAULT FALSE,
  sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table for CMS
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL, -- 'homepage', 'events', 'store', etc.
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- RLS Policies for products
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- RLS Policies for images
CREATE POLICY "Anyone can view images" ON images
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage images" ON images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, tier_visibility, is_exclusive) VALUES
('Kelvin Creekman Beanie', 'Premium knit beanie with embroidered Kelvin Creekman logo', 24.99, '/merch/beanie.jpg', 'apparel', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], FALSE),
('Sacred Geometry Mug - Black', '15oz ceramic mug featuring the iconic sacred geometry design', 18.99, '/merch/mug-black.webp', 'accessories', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], FALSE),
('Sacred Geometry Pin', 'High-quality enamel pin with sacred geometry design', 12.99, '/merch/pin.webp', 'accessories', ARRAY['blizzard_vip', 'avalanche_backstage'], TRUE),
('Kelvin Creekman Notepad', 'Premium notepad for jotting down your thoughts and lyrics', 8.99, '/merch/notepad.webp', 'accessories', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], FALSE),
('Sacred Geometry Mug - White', '15oz ceramic mug with sacred geometry design on white background', 18.99, '/merch/mug-white.webp', 'accessories', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], FALSE),
('Kelvin Portrait T-Shirt', 'Exclusive t-shirt featuring Kelvin Creekman portrait design', 29.99, '/merch/kelvin-tshirt.webp', 'apparel', ARRAY['avalanche_backstage'], TRUE);

-- Insert sample images for CMS
INSERT INTO images (name, url, category, alt_text) VALUES
('Hero Background', '/hero-bg.jpg', 'homepage', 'Hero section background'),
('About Section Image', '/about-kelvin.jpg', 'homepage', 'Kelvin Creekman portrait'),
('Event Banner 1', '/event-banner-1.jpg', 'events', 'Concert event banner'),
('Event Banner 2', '/event-banner-2.jpg', 'events', 'Meet and greet banner'),
('Store Banner', '/store-banner.jpg', 'store', 'Merchandise store banner');
