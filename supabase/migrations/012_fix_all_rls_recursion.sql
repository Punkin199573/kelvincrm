-- Drop existing policies on profiles that cause recursion or might conflict
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Drop admin policies from other tables that might conflict or cause recursion
DROP POLICY IF EXISTS "Admins can manage all images" ON images;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Admins can manage all content" ON content;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all session bookings" ON session_bookings;
DROP POLICY IF EXISTS "Admins can view all event registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can manage website settings" ON website_settings;

-- Drop the helper function if it already exists
DROP FUNCTION IF EXISTS is_user_admin();

-- Create a helper function to check if the current user is an admin.
-- This function runs with `SECURITY DEFINER` to bypass RLS on `profiles` itself when querying for `is_admin`.
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  is_admin_flag BOOLEAN;
BEGIN
  -- Set search_path to public to explicitly query public.profiles
  SET search_path TO public;
  
  SELECT is_admin INTO is_admin_flag
  FROM profiles
  WHERE id = auth.uid();

  RETURN COALESCE(is_admin_flag, FALSE);
END;
$$;

-- Grant execution to authenticated users so RLS policies can call it
GRANT EXECUTE ON FUNCTION is_user_admin() TO authenticated;

-- Re-create RLS policies for profiles using the helper function
CREATE POLICY "Allow individual read access to own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow individual update access to own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (is_user_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (is_user_admin());

-- Re-create RLS policies for other tables, fixing admin checks
-- Images policies
CREATE POLICY "Users can view all active images" ON images FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their own images" ON images FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own images" ON images FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own images" ON images FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all images" ON images FOR ALL USING (is_user_admin());

-- Products policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_user_admin());

-- Events policies
CREATE POLICY "Anyone can view active events" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (is_user_admin());

-- Content policies
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
CREATE POLICY "Admins can manage all content" ON content FOR ALL USING (is_user_admin());

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_user_admin());
CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING (is_user_admin());

-- Session bookings policies
CREATE POLICY "Users can view their own session bookings" ON session_bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own session bookings" ON session_bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own session bookings" ON session_bookings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all session bookings" ON session_bookings FOR ALL USING (is_user_admin());

-- Event registrations policies
CREATE POLICY "Users can view their own event registrations" ON event_registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own event registrations" ON event_registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all event registrations" ON event_registrations FOR SELECT USING (is_user_admin());

-- Website settings policies
CREATE POLICY "Anyone can view website settings" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage website settings" ON website_settings FOR ALL USING (is_user_admin());

-- Re-confirm enable RLS on all tables, just in case (already in 010, but harmless to repeat)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Ensure the 'on_auth_user_created' trigger is still functioning correctly
-- This is a duplication from 010 but ensures the function and trigger exist after drops.
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
