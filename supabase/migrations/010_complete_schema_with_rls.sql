-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  tier TEXT DEFAULT 'frost_fan' CHECK (tier IN ('frost_fan', 'blizzard_vip', 'avalanche_backstage')),
  subscription_status TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  phone TEXT,
  address JSONB,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create images table with proper categories
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('profile', 'website', 'content', 'product', 'general')),
  alt_text TEXT,
  file_size BIGINT,
  dimensions JSONB,
  upload_thing_key TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('apparel', 'accessories', 'music', 'collectibles')),
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  is_exclusive BOOLEAN DEFAULT FALSE,
  tier_visibility TEXT[] DEFAULT ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'],
  sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
  colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  additional_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  stripe_price_id TEXT,
  weight DECIMAL(10,2),
  dimensions JSONB,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('concert', 'meet_greet', 'exclusive', 'virtual')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  virtual_link TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  image_url TEXT,
  gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_exclusive BOOLEAN DEFAULT FALSE,
  required_tier TEXT DEFAULT 'frost_fan' CHECK (required_tier IN ('frost_fan', 'blizzard_vip', 'avalanche_backstage')),
  is_active BOOLEAN DEFAULT TRUE,
  registration_deadline TIMESTAMPTZ,
  cancellation_policy TEXT,
  additional_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'image', 'text')),
  content_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  file_size BIGINT,
  required_tier TEXT DEFAULT 'frost_fan' CHECK (required_tier IN ('frost_fan', 'blizzard_vip', 'avalanche_backstage')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  billing_address JSONB,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session_bookings table
CREATE TABLE IF NOT EXISTS session_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  platform TEXT DEFAULT 'zoom' CHECK (platform IN ('whatsapp', 'signal', 'zoom', 'daily')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  daily_room_url TEXT,
  contact_info JSONB DEFAULT '{}',
  special_requests TEXT,
  admin_notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2),
  additional_info JSONB DEFAULT '{}',
  UNIQUE(event_id, user_id)
);

-- Create website_settings table
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_bookings_updated_at BEFORE UPDATE ON session_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_settings_updated_at BEFORE UPDATE ON website_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for images
CREATE POLICY "Users can view all active images" ON images FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their own images" ON images FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own images" ON images FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own images" ON images FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all images" ON images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for products
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for events
CREATE POLICY "Anyone can view active events" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for content
CREATE POLICY "Users can view published content based on tier" ON content FOR SELECT USING (
  is_published = true AND (
    required_tier = 'frost_fan' OR
    (required_tier = 'blizzard_vip' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND tier IN ('blizzard_vip', 'avalanche_backstage')
    )) OR
    (required_tier = 'avalanche_backstage' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND tier = 'avalanche_backstage'
    ))
  )
);
CREATE POLICY "Admins can manage all content" ON content FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for session_bookings
CREATE POLICY "Users can view their own session bookings" ON session_bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own session bookings" ON session_bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own session bookings" ON session_bookings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all session bookings" ON session_bookings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for event_registrations
CREATE POLICY "Users can view their own event registrations" ON event_registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own event registrations" ON event_registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all event registrations" ON event_registrations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- RLS Policies for website_settings
CREATE POLICY "Anyone can view website settings" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage website settings" ON website_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
