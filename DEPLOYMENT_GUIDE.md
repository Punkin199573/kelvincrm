# Kelvin Creekman Fan Club - Deployment Guide

## Environment Variables Setup

### Required Environment Variables

The following environment variables are already configured in your project:

#### Supabase Configuration
\`\`\`env
SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
\`\`\`

#### Database Configuration
\`\`\`env
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_prisma_connection_string
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_connection_string
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
POSTGRES_HOST=your_postgres_host
\`\`\`

#### Stripe Configuration
\`\`\`env
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_FROST_FAN_PRICE_ID=your_frost_fan_price_id
STRIPE_BLIZZARD_VIP_PRICE_ID=your_blizzard_vip_price_id
STRIPE_AVALANCHE_BACKSTAGE_PRICE_ID=your_avalanche_backstage_price_id
\`\`\`

#### Email Configuration
\`\`\`env
RESEND_API_KEY=your_resend_api_key
\`\`\`

#### Application Configuration
\`\`\`env
NEXT_PUBLIC_BASE_URL=your_application_base_url
\`\`\`

### Additional Environment Variables for UploadThing

If you want to integrate UploadThing for file uploads, add these variables:

\`\`\`env
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
\`\`\`

## Admin User Setup

### Creating the Admin User

1. **Through Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Users
   - Click "Add user"
   - Email: `cloudyzaddy@gmail.com`
   - Password: `KelvinAdmin2024!`
   - Click "Add user"

2. **Run the Admin Setup Migration:**
   \`\`\`bash
   # After creating the user, run the migration to set admin privileges
   npx supabase db push
   \`\`\`

3. **Verify Admin Access:**
   - Sign in with the admin credentials
   - Navigate to `/admin` to access the admin dashboard
   - Verify all admin features are working

## Deployment Steps

### 1. Vercel Deployment

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# Or use CLI:
vercel env add SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... add all other environment variables
\`\`\`

### 2. Database Setup

\`\`\`bash
# Run all migrations
npx supabase db push

# Seed initial data (if needed)
npx supabase db seed
\`\`\`

### 3. Stripe Webhook Setup

1. Create webhook endpoint in Stripe dashboard
2. Point to: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 4. Email Setup (Resend)

1. Create account at resend.com
2. Get API key
3. Add to `RESEND_API_KEY` environment variable
4. Verify email sending functionality

## Mobile Responsiveness Features

### Navigation
- ✅ Hamburger menu for mobile devices
- ✅ Mobile footer navigation
- ✅ Touch-friendly interface
- ✅ Responsive design across all screen sizes

### Key Features
- ✅ Mobile-optimized admin dashboard
- ✅ Touch-friendly cart and checkout
- ✅ Responsive event booking
- ✅ Mobile-friendly video calls
- ✅ Optimized image loading

## Production Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] Admin user created and tested
- [ ] Stripe webhooks configured
- [ ] Email functionality tested
- [ ] Mobile responsiveness verified
- [ ] All pages load without errors
- [ ] Database migrations applied

### After Deployment
- [ ] Test admin login: `cloudyzaddy@gmail.com` / `KelvinAdmin2024!`
- [ ] Verify all payment flows
- [ ] Test email notifications
- [ ] Check mobile navigation
- [ ] Verify all API endpoints
- [ ] Test real-time features

## Troubleshooting

### Common Issues

1. **Admin Access Denied**
   - Verify user exists in Supabase Auth
   - Check `is_admin` flag in profiles table
   - Ensure RLS policies are correct

2. **Mobile Navigation Not Working**
   - Check if JavaScript is enabled
   - Verify responsive CSS classes
   - Test on different devices/browsers

3. **Payment Issues**
   - Verify Stripe keys are correct
   - Check webhook endpoint is accessible
   - Ensure HTTPS is enabled

4. **Database Connection Issues**
   - Verify connection strings
   - Check Supabase project status
   - Ensure database is accessible

## Support

For deployment issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Test individual features in development
4. Contact support if issues persist

## Security Notes

- Never commit environment variables to version control
- Use strong passwords for admin accounts
- Enable 2FA where possible
- Regularly update dependencies
- Monitor for security vulnerabilities
\`\`\`

Finally, let me ensure the cart context is properly handling undefined states:
