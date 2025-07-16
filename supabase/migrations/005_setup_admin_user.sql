-- Create admin user setup
-- This will be handled through the Supabase Auth UI or programmatically

-- First, let's ensure we have the admin profile setup function
CREATE OR REPLACE FUNCTION setup_admin_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Look for the admin user by email
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'cloudyzaddy@gmail.com';
    
    -- If admin user exists, update their profile
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            is_admin,
            membership_tier,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'cloudyzaddy@gmail.com',
            'Admin User',
            true,
            'Avalanche Backstage',
            now(),
            now()
        )
        ON CONFLICT (id) 
        DO UPDATE SET
            is_admin = true,
            membership_tier = 'Avalanche Backstage',
            updated_at = now();
    END IF;
END;
$$;

-- Create a trigger to automatically set up admin profile when the user signs up
CREATE OR REPLACE FUNCTION handle_admin_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if this is the admin email
    IF NEW.email = 'cloudyzaddy@gmail.com' THEN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            is_admin,
            membership_tier,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            'Admin User',
            true,
            'Avalanche Backstage',
            now(),
            now()
        );
    ELSE
        -- Regular user profile creation
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            is_admin,
            membership_tier,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            false,
            'Frost Fan',
            now(),
            now()
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_admin_user_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.session_bookings TO authenticated;
GRANT ALL ON public.active_video_sessions TO authenticated;
GRANT ALL ON public.events TO authenticated;

-- RLS Policies for admin access
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admin policies for products
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admin policies for orders
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admin policies for session bookings
CREATE POLICY "Admins can view all session bookings" ON public.session_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admin policies for events
CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );
