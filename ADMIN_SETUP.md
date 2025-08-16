# Admin Setup Instructions

## 🔐 Admin Credentials
- **Email**: punkin199573@gmail.com
- **Password**: Benefitpay

## 📋 Setup Steps

### 1. Create Admin User in Supabase
Since we cannot directly create auth users from SQL migrations, you need to:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter:
   - Email: punkin199573@gmail.com
   - Password: Benefitpay
   - Email Confirm: true (check this box)

### 2. Run Database Migrations
Execute the following SQL scripts in your Supabase SQL Editor:

\`\`\`sql
-- Run this to fix RLS policies and create admin profile
-- Copy and paste the content from scripts/fix-rls-policies.sql
\`\`\`

### 3. Verify Admin Access
1. Try logging in with the admin credentials
2. Navigate to `/admin` to verify admin panel access
3. Check that the profile shows `is_admin: true`

### 4. Environment Variables
Ensure these environment variables are set in your `.env.local`:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Product IDs
STRIPE_FROST_FAN_PRICE_ID=your_frost_fan_price_id
STRIPE_BLIZZARD_VIP_PRICE_ID=your_blizzard_vip_price_id
STRIPE_AVALANCHE_BACKSTAGE_PRICE_ID=your_avalanche_backstage_price_id

# Email
RESEND_API_KEY=your_resend_api_key

# UploadThing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
\`\`\`

### 5. Stripe Setup
1. Create products in Stripe Dashboard for each membership tier
2. Copy the price IDs to your environment variables
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Configure webhook events (see WEBHOOK_SETUP.md)

### 6. UploadThing Setup
1. Create account at uploadthing.com
2. Create new app and get API keys
3. Add keys to environment variables

## 🎯 Admin Features

Once logged in as admin, you'll have access to:

### Admin Panel (`/admin`)
- **Dashboard**: Overview of users, orders, events
- **Event Management**: Create and manage events
- **Product Management**: Manage store inventory
- **Session Management**: Create meet & greet sessions
- **Image Management**: Upload and organize images
- **User Management**: View and manage user accounts

### Key Admin Functions
- Full access to all user profiles
- Product management
- Event management
- Content management
- Order management
- Analytics dashboard

## 🔧 Troubleshooting

### Admin Access Issues
If admin status isn't automatically assigned:
1. Check the database trigger is working
2. Manually update the profile:
\`\`\`sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'punkin199573@gmail.com';
\`\`\`

### RLS Policy Issues
If you encounter permission errors:
1. Run the `scripts/fix-rls-policies.sql` script
2. Make sure the admin user exists in auth.users
3. Verify the profile has `is_admin: true`

### Upload Issues
If image uploads fail:
1. Verify UploadThing environment variables
2. Check file size limits
3. Ensure proper CORS configuration

## 📱 Mobile Admin Access
The admin panel is fully responsive and works on mobile devices. All admin functions are accessible through the mobile interface.

## 🚀 Production Deployment
1. Set all environment variables in your hosting platform
2. Run database migrations
3. Configure Stripe webhooks with production URL
4. Test all admin functions before going live

## 📞 Support
If you encounter any issues during setup, check the console logs and database for error messages. Most issues are related to missing environment variables or incomplete migrations.

## Prerequisites

-   A deployed instance of the Kelvin Creekman Fan Club website.
-   Access to the Supabase project associated with the website.

## Steps

1.  **Access the Supabase Console:**

    -   Go to your Supabase project dashboard.
    -   Navigate to the "SQL Editor" from the left sidebar.

2.  **Create an Admin User:**

    -   Run the following SQL query to create an admin user. Replace `'punkin199573@gmail.com'` and `'Benefitpay'` with the desired email and password for the admin user.

    \`\`\`sql
    INSERT INTO auth.users (email, raw_app_meta_data)
    VALUES ('punkin199573@gmail.com', '{"is_admin": true}');

    -- Hash the password using pgcrypto
    UPDATE auth.users
    SET encrypted_password = crypt('Benefitpay', gen_salt('bf'))
    WHERE email = 'punkin199573@gmail.com';
    \`\`\`

3.  **Update the `profiles` Table:**

    -   Run the following SQL query to update the `profiles` table and set the `is_admin` field to `true` for the newly created user.

    \`\`\`sql
    INSERT INTO public.profiles (id, email, full_name, is_admin, created_at, updated_at)
    VALUES (
        (SELECT id FROM auth.users WHERE email = 'punkin199573@gmail.com'),
        'punkin199573@gmail.com',
        'Admin User',
        TRUE,
        NOW(),
        NOW()
    );
    \`\`\`

4.  **Verify Admin Access:**

    -   Sign in to the website using the admin user's email and password.
    -   Navigate to the `/admin` route. You should now have access to the admin dashboard.

## Notes

-   Ensure that the `pgcrypto` extension is enabled in your Supabase project. You can enable it by running `CREATE EXTENSION IF NOT EXISTS pgcrypto;` in the SQL Editor.
-   Remember to replace the placeholder email and password with secure credentials.
-   This setup assumes that you have the necessary RLS policies in place to protect the admin routes.
