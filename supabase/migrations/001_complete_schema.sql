-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE tier_type AS ENUM ('frost_fan', 'blizzard_vip', 'avalanche_backstage');
CREATE TYPE event_type AS ENUM ('concert', 'meet_greet', 'exclusive', 'virtual');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE call_method AS ENUM ('whatsapp', 'signal', 'daily');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    tier tier_type DEFAULT 'frost_fan',
    is_admin BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    is_exclusive BOOLEAN DEFAULT FALSE,
    required_tier tier_type DEFAULT 'frost_fan',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event bookings table
CREATE TABLE event_bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    is_exclusive BOOLEAN DEFAULT FALSE,
    required_tier tier_type DEFAULT 'frost_fan',
    sizes TEXT[],
    colors TEXT[],
    image_url TEXT,
    stripe_price_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    size TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Private sessions table
CREATE TABLE private_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 15,
    call_method call_method NOT NULL,
    status session_status DEFAULT 'pending',
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    daily_room_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table (for exclusive content)
CREATE TABLE content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL, -- 'video', 'audio', 'image', 'text'
    content_url TEXT,
    thumbnail_url TEXT,
    required_tier tier_type DEFAULT 'frost_fan',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Events policies
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Event bookings policies
CREATE POLICY "Users can view own bookings" ON event_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON event_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON event_bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Products policies
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create own order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Private sessions policies
CREATE POLICY "Users can view own sessions" ON private_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON private_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON private_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can update sessions" ON private_sessions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Content policies
CREATE POLICY "Users can view content based on tier" ON content FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (
            tier = 'avalanche_backstage' OR
            (tier = 'blizzard_vip' AND content.required_tier IN ('frost_fan', 'blizzard_vip')) OR
            (tier = 'frost_fan' AND content.required_tier = 'frost_fan')
        )
    )
);
CREATE POLICY "Admins can manage content" ON content FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Functions and triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_private_sessions_updated_at BEFORE UPDATE ON private_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO events (title, description, event_type, date, location, price, max_attendees, image_url, required_tier) VALUES
('Rock the Night Concert', 'An electrifying night of rock and metal music', 'concert', '2024-02-15 20:00:00+00', 'Madison Square Garden, NYC', 75.00, 500, '/placeholder.svg?height=400&width=600', 'frost_fan'),
('VIP Meet & Greet', 'Exclusive meet and greet with Kelvin', 'meet_greet', '2024-02-16 18:00:00+00', 'Backstage Lounge', 150.00, 20, '/placeholder.svg?height=400&width=600', 'blizzard_vip'),
('Acoustic Session', 'Intimate acoustic performance', 'exclusive', '2024-02-20 19:00:00+00', 'Studio A', 200.00, 50, '/placeholder.svg?height=400&width=600', 'avalanche_backstage');

INSERT INTO products (name, description, price, category, in_stock, stock_quantity, image_url, stripe_price_id) VALUES
('Kelvin Creekman T-Shirt', 'Official band t-shirt with fire design', 29.99, 'apparel', true, 100, '/merch/kelvin-tshirt.webp', 'price_1234567890'),
('Black Coffee Mug', 'Start your day with Kelvin''s energy', 19.99, 'accessories', true, 50, '/merch/mug-black.webp', 'price_1234567891'),
('White Coffee Mug', 'Classic white mug with band logo', 19.99, 'accessories', true, 50, '/merch/mug-white.webp', 'price_1234567892'),
('Band Beanie', 'Stay warm with style', 24.99, 'apparel', true, 75, '/merch/beanie.jpg', 'price_1234567893'),
('Enamel Pin', 'Collectible enamel pin', 9.99, 'accessories', true, 200, '/merch/pin.webp', 'price_1234567894'),
('Notepad', 'Write your thoughts and lyrics', 14.99, 'accessories', true, 30, '/merch/notepad.webp', 'price_1234567895');

INSERT INTO content (title, description, content_type, content_url, required_tier, is_featured) VALUES
('Behind the Scenes: Studio Session', 'Exclusive look at recording process', 'video', '/placeholder.svg?height=300&width=400', 'frost_fan', true),
('Acoustic Version: Fire Within', 'Stripped down acoustic performance', 'audio', '/placeholder.svg?height=300&width=400', 'blizzard_vip', true),
('Personal Message from Kelvin', 'Special message for backstage members', 'video', '/placeholder.svg?height=300&width=400', 'avalanche_backstage', true);

-- Create admin user (you'll need to sign up with this email first)
-- This will be handled by the trigger when the user signs up
