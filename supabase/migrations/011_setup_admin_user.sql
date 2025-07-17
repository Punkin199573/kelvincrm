-- Insert admin user profile (this will be created when the user signs up)
-- The trigger will handle the initial profile creation
-- We'll update it to admin status after signup

-- Function to make a user admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET is_admin = true, tier = 'avalanche_backstage'
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make the specified email an admin (run this after the user signs up)
-- SELECT make_user_admin('cloudyzaddy@gmail.com');
