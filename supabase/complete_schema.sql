-- =====================================================
-- KELVIN CREEKMAN FAN CLUB - COMPLETE SUPABASE SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS active_video_sessions CASCADE;
DROP TABLE IF EXISTS session_bookings CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_tier CASCADE;
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS call_method CASCADE;
DROP TYPE IF EXISTS content_type CASCADE;

-- =====================================================
-- CREATE CUSTOM TYPES
-- =====================================================

CREATE TYPE user_tier AS ENUM ('frost_fan', 'blizzard_vip', 'avalanche_backstage');
CREATE TYPE product_category AS ENUM ('apparel', 'accessories', 'music', 'collectibles');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE event_type AS ENUM ('concert', 'meet_greet', 'exclusive', 'virtual');
CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE call_method AS ENUM ('whatsapp', 'signal', 'daily');
CREATE TYPE content_type AS ENUM ('video', 'audio', 'image', 'text');

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    tier user_tier DEFAULT 'frost_fan' NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    phone TEXT,
    address JSONB,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category product_category NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    is_exclusive BOOLEAN DEFAULT FALSE,
    tier_visibility TEXT[] DEFAULT ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'],
    sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
    colors TEXT[] DEFAULT ARRAY[]::TEXT[],
    image_url TEXT,
    additional_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    stripe_price_id TEXT,
    weight DECIMAL(5,2),
    dimensions JSONB,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(10,2) DEFAULT 0 CHECK (shipping_amount >= 0),
    status order_status DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    tracking_number TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    size TEXT,
    color TEXT,
    product_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    virtual_link TEXT,
    price DECIMAL(10,2) DEFAULT 0 CHECK (price >= 0),
    max_attendees INTEGER CHECK (max_attendees > 0),
    current_attendees INTEGER DEFAULT 0 CHECK (current_attendees >= 0),
    image_url TEXT,
    gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_exclusive BOOLEAN DEFAULT FALSE,
    required_tier user_tier DEFAULT 'frost_fan',
    is_active BOOLEAN DEFAULT TRUE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    cancellation_policy TEXT,
    additional_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations table
CREATE TABLE event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT,
    registration_status TEXT DEFAULT 'pending',
    amount_paid DECIMAL(10,2) DEFAULT 0,
    special_requests TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Session bookings table (for private meet & greet sessions)
CREATE TABLE session_bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 15 CHECK (duration_minutes > 0),
    call_method call_method NOT NULL,
    status session_status DEFAULT 'pending',
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 50.00 CHECK (amount_paid >= 0),
    daily_room_url TEXT,
    contact_info JSONB,
    special_requests TEXT,
    admin_notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active video sessions table (for tracking live sessions)
CREATE TABLE active_video_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_booking_id UUID REFERENCES session_bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    session_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table (for exclusive content)
CREATE TABLE content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content_type content_type NOT NULL,
    content_url TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    file_size BIGINT,
    required_tier user_tier DEFAULT 'frost_fan',
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_tier ON profiles(tier);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_tier_visibility ON products USING GIN(tier_visibility);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_is_active ON events(is_active);
CREATE INDEX idx_events_required_tier ON events(required_tier);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_session_bookings_user_id ON session_bookings(user_id);
CREATE INDEX idx_session_bookings_session_date ON session_bookings(session_date);
CREATE INDEX idx_session_bookings_status ON session_bookings(status);
CREATE INDEX idx_content_content_type ON content(content_type);
CREATE INDEX idx_content_required_tier ON content(required_tier);
CREATE INDEX idx_content_is_featured ON content(is_featured);
CREATE INDEX idx_content_is_published ON content(is_published);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Products policies
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create order items for own orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all order items" ON order_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Events policies
CREATE POLICY "Anyone can view active events" ON events
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Event registrations policies
CREATE POLICY "Users can view own registrations" ON event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own registrations" ON event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" ON event_registrations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

CREATE POLICY "Admins can update all registrations" ON event_registrations
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Session bookings policies
CREATE POLICY "Users can view own sessions" ON session_bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON session_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON session_bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON session_bookings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

CREATE POLICY "Admins can update all sessions" ON session_bookings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Active video sessions policies
CREATE POLICY "Users can view own video sessions" ON active_video_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own video sessions" ON active_video_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all video sessions" ON active_video_sessions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

CREATE POLICY "Admins can manage all video sessions" ON active_video_sessions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Content policies
CREATE POLICY "Users can view content based on tier" ON content
    FOR SELECT USING (
        is_published = TRUE AND
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

CREATE POLICY "Admins can manage content" ON content
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- =====================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to handle new user creation
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'KC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events 
        SET current_attendees = current_attendees + 1 
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events 
        SET current_attendees = current_attendees - 1 
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at 
    BEFORE UPDATE ON event_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_bookings_updated_at 
    BEFORE UPDATE ON session_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for order number generation
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Trigger for event attendee count
CREATE TRIGGER update_event_attendee_count_trigger
    AFTER INSERT OR DELETE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample products
INSERT INTO products (name, description, price, category, in_stock, stock_quantity, image_url, tier_visibility, featured) VALUES
('Kelvin Creekman Official T-Shirt', 'Premium cotton t-shirt with exclusive Kelvin Creekman design', 29.99, 'apparel', true, 100, '/merch/kelvin-tshirt.webp', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], true),
('Sacred Geometry Mug - Black', '15oz ceramic mug featuring the iconic sacred geometry design', 18.99, 'accessories', true, 50, '/merch/mug-black.webp', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], false),
('Sacred Geometry Mug - White', '15oz ceramic mug with sacred geometry design on white background', 18.99, 'accessories', true, 45, '/merch/mug-white.webp', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], false),
('Kelvin Creekman Beanie', 'Premium knit beanie with embroidered Kelvin Creekman logo', 24.99, 'apparel', true, 75, '/merch/beanie.jpg', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], true),
('Sacred Geometry Pin', 'High-quality enamel pin with sacred geometry design', 12.99, 'accessories', true, 200, '/merch/pin.webp', ARRAY['blizzard_vip', 'avalanche_backstage'], false),
('Kelvin Creekman Notepad', 'Premium notepad for jotting down your thoughts and lyrics', 8.99, 'accessories', true, 30, '/merch/notepad.webp', ARRAY['frost_fan', 'blizzard_vip', 'avalanche_backstage'], false),
('Exclusive Vinyl Record', 'Limited edition vinyl record - Avalanche members only', 49.99, 'music', true, 25, '/placeholder.svg?height=400&width=400', ARRAY['avalanche_backstage'], true),
('VIP Backstage Pass Replica', 'Collectible replica of actual backstage pass', 34.99, 'collectibles', true, 15, '/placeholder.svg?height=400&width=400', ARRAY['blizzard_vip', 'avalanche_backstage'], true);

-- Insert sample events
INSERT INTO events (title, description, event_type, start_date, end_date, location, price, max_attendees, image_url, required_tier, is_active) VALUES
('Rock the Night Concert 2024', 'An electrifying night of rock and metal music with Kelvin Creekman live in concert', 'concert', '2024-03-15 20:00:00+00', '2024-03-15 23:00:00+00', 'Madison Square Garden, NYC', 75.00, 500, '/placeholder.svg?height=400&width=600', 'frost_fan', true),
('VIP Meet & Greet Experience', 'Exclusive meet and greet session with Kelvin Creekman - limited spots available', 'meet_greet', '2024-03-16 18:00:00+00', '2024-03-16 20:00:00+00', 'Backstage Lounge, MSG', 150.00, 20, '/placeholder.svg?height=400&width=600', 'blizzard_vip', true),
('Avalanche Backstage Experience', 'Ultimate backstage experience with Kelvin - watch soundcheck, meet the band', 'exclusive', '2024-03-17 17:00:00+00', '2024-03-17 19:00:00+00', 'Private Studio, NYC', 300.00, 10, '/placeholder.svg?height=400&width=600', 'avalanche_backstage', true),
('Virtual Acoustic Session', 'Intimate virtual acoustic performance streamed live', 'virtual', '2024-03-20 19:00:00+00', '2024-03-20 20:30:00+00', 'Online Stream', 25.00, 1000, '/placeholder.svg?height=400&width=600', 'frost_fan', true),
('Summer Festival Appearance', 'Kelvin Creekman headlining the Summer Rock Festival', 'concert', '2024-07-15 21:00:00+00', '2024-07-15 23:30:00+00', 'Central Park, NYC', 85.00, 2000, '/placeholder.svg?height=400&width=600', 'frost_fan', true);

-- Insert sample content
INSERT INTO content (title, description, content_type, content_url, thumbnail_url, required_tier, is_featured, duration) VALUES
('Behind the Scenes: Studio Session', 'Exclusive look at Kelvin recording his latest track in the studio', 'video', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', 'frost_fan', true, 480),
('Acoustic Version: Fire Within', 'Stripped down acoustic performance of the hit song Fire Within', 'audio', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', 'blizzard_vip', true, 245),
('Personal Message from Kelvin', 'Special personal message from Kelvin to all Avalanche Backstage members', 'video', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', 'avalanche_backstage', true, 120),
('Guitar Tutorial: Sacred Riffs', 'Learn to play Kelvin''s signature riffs with this detailed tutorial', 'video', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', 'blizzard_vip', false, 720),
('Exclusive Photo Gallery', 'High-resolution photos from recent concerts and backstage moments', 'image', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', 'avalanche_backstage', false, 0);

-- =====================================================
-- FINAL SETUP COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Kelvin Creekman Fan Club database setup completed successfully!';
    RAISE NOTICE 'Tables created: profiles, products, orders, order_items, events, event_registrations, session_bookings, active_video_sessions, content';
    RAISE NOTICE 'Sample data inserted for products, events, and content';
    RAISE NOTICE 'RLS policies enabled for all tables';
    RAISE NOTICE 'Ready for deployment!';
END $$;
