-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Create safe RLS policies for profiles table
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (
  auth.uid() = id OR 
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Fix products policies to prevent recursion
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products visible to appropriate tiers" ON products;

CREATE POLICY "products_select_policy" ON products
FOR SELECT USING (
  in_stock = true AND 
  (
    tier_visibility = '{}' OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  )
);

-- Fix orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;

CREATE POLICY "orders_select_policy" ON orders
FOR SELECT USING (
  user_id = auth.uid() OR 
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

CREATE POLICY "orders_insert_policy" ON orders
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Fix events policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Active events are viewable" ON events;

CREATE POLICY "events_select_policy" ON events
FOR SELECT USING (is_active = true);

-- Fix session_bookings policies
DROP POLICY IF EXISTS "Users can view own bookings" ON session_bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON session_bookings;

CREATE POLICY "session_bookings_select_policy" ON session_bookings
FOR SELECT USING (
  user_id = auth.uid() OR 
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

CREATE POLICY "session_bookings_insert_policy" ON session_bookings
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Fix content policies
DROP POLICY IF EXISTS "Content visible to appropriate tiers" ON content;

CREATE POLICY "content_select_policy" ON content
FOR SELECT USING (is_published = true);

-- Fix images policies
DROP POLICY IF EXISTS "Images are viewable by everyone" ON images;

CREATE POLICY "images_select_policy" ON images
FOR SELECT USING (is_active = true);

-- Admin policies for all tables
CREATE POLICY "admin_full_access_profiles" ON profiles
FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

CREATE POLICY "admin_full_access_products" ON products
FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

CREATE POLICY "admin_full_access_orders" ON orders
FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

CREATE POLICY "admin_full_access_events" ON events
FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

CREATE POLICY "admin_full_access_session_bookings" ON session_bookings
FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

CREATE POLICY "admin_full_access_content" ON content
FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);

CREATE POLICY "admin_full_access_images" ON images
FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM profiles WHERE is_admin = true)
);
