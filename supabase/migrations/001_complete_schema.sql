-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS active_video_sessions CASCADE;
DROP TABLE IF EXISTS session_bookings CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS event_bookings CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_tier CASCADE;
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS session_type CASCADE;

-- Create custom types
CREATE TYPE user_tier AS ENUM ('frost_fan', 'blizzard_vip', 'avalanche_backstage');
CREATE TYPE product_category AS ENUM ('apparel', 'accessories', 'music', 'collectibles');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE event_type AS ENUM ('concert', 'meet_greet', 'exclusive', 'virtual');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE session_type AS ENUM ('signal', 'whatsapp', 'video');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier user_tier NOT NULL DEFAULT 'frost_fan',
  stripe_customer_id TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT, -- UploadThing URL
  category product_category NOT NULL,
  tier_visibility user_tier[] DEFAULT ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'],
  in_stock BOOLEAN DEFAULT TRUE,
  is_exclusive BOOLEAN DEFAULT FALSE,
  sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]',
  shipping_address JSONB,
  billing_address JSONB,
  tracking_number TEXT,
  notes TEXT,
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

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  image_url TEXT, -- UploadThing URL
  tier_required user_tier DEFAULT 'frost_fan',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_bookings table
CREATE TABLE event_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status booking_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2),
  booking_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create session_bookings table
CREATE TABLE session_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type session_type NOT NULL,
  session_duration INTEGER NOT NULL, -- in minutes
  amount_paid DECIMAL(10,2) NOT NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  contact_info JSONB, -- whatsapp, signal, etc.
  special_requests TEXT,
  preferred_time TEXT,
  status booking_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  video_call_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create active_video_sessions table
CREATE TABLE active_video_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_booking_id UUID REFERENCES session_bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  daily_room_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table for CMS
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL, -- UploadThing URL
  category TEXT NOT NULL, -- 'homepage', 'events', 'store', etc.
  alt_text TEXT,
  file_key TEXT, -- UploadThing file key for deletion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_video_sessions ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (user_id = auth.uid());

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

CREATE POLICY "Admins can manage all order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- RLS Policies for events
CREATE POLICY "Anyone can view active events" ON events
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- RLS Policies for event_bookings
CREATE POLICY "Users can view own event bookings" ON event_bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own event bookings" ON event_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all event bookings" ON event_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- RLS Policies for session_bookings
CREATE POLICY "Users can view own session bookings" ON session_bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own session bookings" ON session_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own session bookings" ON session_bookings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all session bookings" ON session_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- RLS Policies for active_video_sessions
CREATE POLICY "Users can view own video sessions" ON active_video_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own video sessions" ON active_video_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all video sessions" ON active_video_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_bookings_updated_at BEFORE UPDATE ON event_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_bookings_updated_at BEFORE UPDATE ON session_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample products with UploadThing URLs (replace with actual URLs)
INSERT INTO products (name, description, price, image_url, category, tier_visibility, is_exclusive, stock_quantity) VALUES
('Kelvin Creekman Beanie', 'Premium knit beanie with embroidered Kelvin Creekman logo', 24.99, 'https://utfs.io/f/sample-beanie.jpg', 'apparel', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], FALSE, 50),
('Sacred Geometry Mug - Black', '15oz ceramic mug featuring the iconic sacred geometry design', 18.99, 'https://utfs.io/f/sample-mug-black.jpg', 'accessories', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], FALSE, 30),
('Sacred Geometry Pin', 'High-quality enamel pin with sacred geometry design', 12.99, 'https://utfs.io/f/sample-pin.jpg', 'accessories', ARRAY['blizzard_vip', 'avalanche_backstage'], TRUE, 100),
('Kelvin Creekman Notepad', 'Premium notepad for jotting down your thoughts and lyrics', 8.99, 'https://utfs.io/f/sample-notepad.jpg', 'accessories', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], FALSE, 75),
('Sacred Geometry Mug - White', '15oz ceramic mug with sacred geometry design on white background', 18.99, 'https://utfs.io/f/sample-mug-white.jpg', 'accessories', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], FALSE, 25),
('Kelvin Portrait T-Shirt', 'Exclusive t-shirt featuring Kelvin Creekman portrait design', 29.99, 'https://utfs.io/f/sample-tshirt.jpg', 'apparel', ARRAY['avalanche_backstage'], TRUE, 20);

-- Insert sample events
INSERT INTO events (title, description, event_type, date, location, price, max_attendees, image_url, tier_required) VALUES
('Kelvin Live Concert 2024', 'Experience Kelvin Creekman live in concert with exclusive performances', 'concert', '2024-03-15 20:00:00+00', 'Madison Square Garden, NYC', 75.00, 500, 'https://utfs.io/f/sample-concert.jpg', 'frost_fan'),
('VIP Meet & Greet Experience', 'Exclusive meet and greet session with Kelvin Creekman', 'meet_greet', '2024-03-16 18:00:00+00', 'Backstage at MSG', 150.00, 50, 'https://utfs.io/f/sample-meetgreet.jpg', 'blizzard_vip'),
('Avalanche Backstage Pass', 'Ultimate backstage experience with Kelvin', 'exclusive', '2024-03-17 17:00:00+00', 'Private Studio', 300.00, 10, 'https://utfs.io/f/sample-backstage.jpg', 'avalanche_backstage'),
('Virtual Acoustic Session', 'Intimate virtual acoustic performance', 'virtual', '2024-03-20 19:00:00+00', 'Online', 25.00, 1000, 'https://utfs.io/f/sample-virtual.jpg', 'frost_fan');

-- Insert sample images for CMS
INSERT INTO images (name, url, category, alt_text, file_key) VALUES
('Hero Background', 'https://utfs.io/f/hero-bg.jpg', 'homepage', 'Hero section background', 'hero-bg-key'),
('About Section Image', 'https://utfs.io/f/about-kelvin.jpg', 'homepage', 'Kelvin Creekman portrait', 'about-kelvin-key'),
('Event Banner 1', 'https://utfs.io/f/event-banner-1.jpg', 'events', 'Concert event banner', 'event-banner-1-key'),
('Event Banner 2', 'https://utfs.io/f/event-banner-2.jpg', 'events', 'Meet and greet banner', 'event-banner-2-key'),
('Store Banner', 'https://utfs.io/f/store-banner.jpg', 'store', 'Merchandise store banner', 'store-banner-key');

-- Create admin user (replace email with actual admin email)
INSERT INTO profiles (id, email, full_name, tier, is_admin) 
VALUES (
  gen_random_uuid(), 
  'cloudyzaddy@gmail.com', 
  'Admin User', 
  'avalanche_backstage', 
  TRUE
) ON CONFLICT (email) DO UPDATE SET is_admin = TRUE, tier = 'avalanche_backstage';

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_tier_visibility ON products USING GIN(tier_visibility);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_session_bookings_user_id ON session_bookings(user_id);
CREATE INDEX idx_session_bookings_status ON session_bookings(status);
CREATE INDEX idx_session_bookings_date ON session_bookings(scheduled_date);
