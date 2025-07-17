-- Create admin user setup function
CREATE OR REPLACE FUNCTION setup_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'cloudyzaddy@gmail.com';
    
    -- If admin user doesn't exist, we'll need to create it through the Supabase dashboard
    -- This script will just ensure the profile is set up correctly if the user exists
    
    IF admin_user_id IS NOT NULL THEN
        -- Update or insert admin profile
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            is_admin,
            membership_tier,
            created_at,
            updated_at
        )
        VALUES (
            admin_user_id,
            'cloudyzaddy@gmail.com',
            'Admin User',
            true,
            'Avalanche Backstage',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) 
        DO UPDATE SET
            is_admin = true,
            membership_tier = 'Avalanche Backstage',
            updated_at = NOW();
            
        RAISE NOTICE 'Admin user profile updated successfully';
    ELSE
        RAISE NOTICE 'Admin user not found. Please create user through Supabase Auth first.';
    END IF;
END;
$$;

-- Execute the function
SELECT setup_admin_user();

-- Drop the function after use
DROP FUNCTION setup_admin_user();

-- Ensure RLS policies allow admin access
CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE is_admin = true
        )
    );

-- Grant necessary permissions for admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
