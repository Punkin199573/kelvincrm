-- Create admin user with the correct credentials
-- This will create the admin user if it doesn't exist

-- First, let's make sure we have the correct admin setup
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user exists in auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'punkin199573@gmail.com';
    
    -- If admin user doesn't exist, we need to create it
    -- Note: This requires manual creation through Supabase dashboard or API
    -- as we can't directly insert into auth.users from SQL
    
    -- Create or update the profile for admin user
    INSERT INTO profiles (
        id, 
        email, 
        full_name, 
        tier, 
        subscription_status, 
        is_admin, 
        created_at, 
        updated_at
    )
    SELECT 
        au.id,
        'punkin199573@gmail.com',
        'Admin User',
        'avalanche_backstage',
        'active',
        true,
        NOW(),
        NOW()
    FROM auth.users au
    WHERE au.email = 'punkin199573@gmail.com'
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        is_admin = EXCLUDED.is_admin,
        tier = EXCLUDED.tier,
        subscription_status = EXCLUDED.subscription_status,
        updated_at = NOW();
        
END $$;
