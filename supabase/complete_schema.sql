-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE membership_tier AS ENUM ('frost_fan', 'blizzard_vip', 'avalanche_backstage');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE call_method AS ENUM ('whatsapp', 'signal', 'daily');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    membership_tier membership_tier DEFAULT 'frost_fan',
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    is_exclusive BOOLEAN DEFAULT false,
    required_tier membership_tier DEFAULT 'frost_fan',
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    image_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    size TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    required_tier membership_tier DEFAULT 'frost_fan',
    status event_status DEFAULT 'upcoming',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations table
CREATE TABLE public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Meet and greet sessions table
CREATE TABLE public.meet_greet_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 15,
    call_method call_method NOT NULL,
    contact_info JSONB NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id TEXT,
    status session_status DEFAULT 'scheduled',
    call_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table for exclusive content
CREATE TABLE public.content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL, -- 'video', 'image', 'audio', 'text'
    content_url TEXT,
    thumbnail_url TEXT,
    required_tier membership_tier DEFAULT 'frost_fan',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    tier membership_tier NOT NULL,
    status TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_membership_tier ON public.users(membership_tier);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_in_stock ON public.products(in_stock);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_meet_greet_sessions_user_id ON public.meet_greet_sessions(user_id);
CREATE INDEX idx_meet_greet_sessions_date ON public.meet_greet_sessions(session_date);
CREATE INDEX idx_content_tier ON public.content(required_tier);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_greet_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Products policies
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Order items policies
CREATE POLICY "Users can view their order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create order items for their orders" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Event registrations policies
CREATE POLICY "Users can view their registrations" ON public.event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their registrations" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Meet and greet sessions policies
CREATE POLICY "Users can view their sessions" ON public.meet_greet_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their sessions" ON public.meet_greet_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.meet_greet_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Content policies
CREATE POLICY "Users can view content based on tier" ON public.content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (
                membership_tier = 'avalanche_backstage' OR
                (membership_tier = 'blizzard_vip' AND required_tier IN ('frost_fan', 'blizzard_vip')) OR
                (membership_tier = 'frost_fan' AND required_tier = 'frost_fan')
            )
        )
    );

-- User subscriptions policies
CREATE POLICY "Users can view their subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meet_greet_sessions_updated_at BEFORE UPDATE ON public.meet_greet_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.products (name, description, price, category, in_stock, is_exclusive, required_tier, sizes, colors, image_urls) VALUES
('Kelvin Creekman T-Shirt', 'Official Kelvin Creekman merchandise t-shirt', 29.99, 'apparel', true, false, 'frost_fan', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Blue'], ARRAY['/merch/kelvin-tshirt.webp']),
('Exclusive Beanie', 'Limited edition beanie for VIP members', 24.99, 'accessories', true, true, 'blizzard_vip', ARRAY['One Size'], ARRAY['Black', 'Gray'], ARRAY['/merch/beanie.jpg']),
('Coffee Mug - Black', 'Start your day with Kelvin', 19.99, 'drinkware', true, false, 'frost_fan', ARRAY['11oz'], ARRAY['Black'], ARRAY['/merch/mug-black.webp']),
('Coffee Mug - White', 'Start your day with Kelvin', 19.99, 'drinkware', true, false, 'frost_fan', ARRAY['11oz'], ARRAY['White'], ARRAY['/merch/mug-white.webp']),
('Notepad', 'Official Kelvin Creekman notepad', 12.99, 'stationery', true, false, 'frost_fan', ARRAY['A5'], ARRAY['White'], ARRAY['/merch/notepad.webp']),
('Collector Pin', 'Limited edition collector pin', 9.99, 'accessories', true, true, 'avalanche_backstage', ARRAY['One Size'], ARRAY['Gold'], ARRAY['/merch/pin.webp']);

INSERT INTO public.events (title, description, event_date, location, max_attendees, price, required_tier, image_url) VALUES
('Meet & Greet Session', 'Exclusive meet and greet with Kelvin Creekman', '2024-02-15 18:00:00+00', 'Los Angeles, CA', 50, 75.00, 'blizzard_vip', '/placeholder.jpg'),
('VIP Concert Experience', 'Private concert experience for Avalanche members', '2024-02-20 20:00:00+00', 'New York, NY', 25, 150.00, 'avalanche_backstage', '/placeholder.jpg'),
('Fan Club Meetup', 'General fan club meetup - all tiers welcome', '2024-02-25 16:00:00+00', 'Chicago, IL', 100, 25.00, 'frost_fan', '/placeholder.jpg');

INSERT INTO public.content (title, description, content_type, content_url, required_tier, is_featured) VALUES
('Behind the Scenes Video', 'Exclusive behind the scenes content', 'video', '/content/bts-video.mp4', 'blizzard_vip', true),
('Acoustic Session', 'Private acoustic performance', 'video', '/content/acoustic.mp4', 'avalanche_backstage', true),
('Photo Gallery', 'Exclusive photo collection', 'image', '/content/photos/', 'frost_fan', false);

-- Create admin user (this will be handled by your signup process)
-- The admin user should be created through the normal signup flow with email: cloudyzaddy@gmail.com
