# Stripe and Resend Integration Setup Guide

This guide will help you set up Stripe payments and Resend email notifications for the Kelvin Creekman Fan Club website.

## Prerequisites

- A Vercel account (for deployment)
- A Stripe account
- A Resend account
- Access to your project's environment variables

## Stripe Setup

### 1. Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account verification process
3. Navigate to the Stripe Dashboard

### 2. Get Your API Keys

1. In the Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Publishable key** and **Secret key**
3. For webhooks, you'll also need the **Webhook signing secret** (see step 4)

### 3. Create Products (Optional)

You can create products directly in Stripe or let the application create them dynamically:

1. Go to **Products** in the Stripe Dashboard
2. Create products for:
   - Membership tiers (Frost Fan, Blizzard VIP, Avalanche Backstage)
   - Meet & Greet sessions
   - Merchandise items

### 4. Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
4. Select the following events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret**

### 5. Environment Variables

Add these to your `.env.local` file and Vercel environment variables:

\`\`\`env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your secret key (use sk_live_ for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook signing secret

# Stripe Price IDs (if using predefined products)
STRIPE_FROST_FAN_PRICE_ID=price_...
STRIPE_BLIZZARD_VIP_PRICE_ID=price_...
STRIPE_AVALANCHE_BACKSTAGE_PRICE_ID=price_...
\`\`\`

## Resend Setup

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your email address

### 2. Add Your Domain

1. In the Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `kelvincreekman.com`)
4. Follow the DNS setup instructions to verify your domain

### 3. Get Your API Key

1. Go to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Kelvin Creekman Website")
4. Copy the API key

### 4. Environment Variables

Add this to your `.env.local` file and Vercel environment variables:

\`\`\`env
# Resend Configuration
RESEND_API_KEY=re_... # Your Resend API key
\`\`\`

## UploadThing Setup

### 1. Create an UploadThing Account

1. Go to [uploadthing.com](https://uploadthing.com) and create an account
2. Create a new app for your project

### 2. Get Your API Keys

1. In the UploadThing dashboard, go to your app settings
2. Copy your **App ID** and **Secret**

### 3. Environment Variables

Add these to your `.env.local` file and Vercel environment variables:

\`\`\`env
# UploadThing Configuration
UPLOADTHING_SECRET=sk_live_... # Your UploadThing secret
UPLOADTHING_APP_ID=your-app-id # Your UploadThing app ID
\`\`\`

## Complete Environment Variables List

Here's the complete list of environment variables you need:

\`\`\`env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_FROST_FAN_PRICE_ID=price_...
STRIPE_BLIZZARD_VIP_PRICE_ID=price_...
STRIPE_AVALANCHE_BACKSTAGE_PRICE_ID=price_...

# Resend
RESEND_API_KEY=re_...

# UploadThing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your-app-id

# Application
NEXT_PUBLIC_BASE_URL=https://your-domain.com
\`\`\`

## Deployment Steps

### 1. Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in all the environment variables
3. Run `npm run dev` to test locally

### 2. Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. In Vercel dashboard, go to your project settings
4. Add all environment variables in **Settings** → **Environment Variables**
5. Redeploy your application

### 3. Database Setup

1. Run the Supabase migrations:
   \`\`\`bash
   npx supabase db push
   \`\`\`

2. Set up Row Level Security policies
3. Create an admin user in the `profiles` table

## Testing

### Test Stripe Integration

1. Use Stripe's test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

2. Test the following flows:
   - Membership subscription
   - Meet & Greet session booking
   - Store purchases

### Test Resend Integration

1. Book a meet & greet session
2. Check that confirmation emails are sent
3. Verify email formatting and content

### Test UploadThing Integration

1. Upload a profile image in the dashboard
2. Upload website images in the admin panel
3. Verify files are stored and accessible

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Use HTTPS** in production
3. **Validate webhooks** using Stripe's signature verification
4. **Implement proper authentication** for admin routes
5. **Rate limit** API endpoints to prevent abuse

## Troubleshooting

### Common Issues

1. **Stripe webhook failures**: Check that your webhook URL is accessible and returns 200
2. **Email delivery issues**: Verify your domain is properly configured in Resend
3. **Upload failures**: Check UploadThing file size limits and allowed file types
4. **CORS errors**: Ensure your domain is properly configured in all services

### Debug Mode

Enable debug logging by adding:

\`\`\`env
DEBUG=stripe:*,resend:*
\`\`\`

## Support

- Stripe: [stripe.com/docs](https://stripe.com/docs)
- Resend: [resend.com/docs](https://resend.com/docs)
- UploadThing: [docs.uploadthing.com](https://docs.uploadthing.com)

For project-specific issues, check the application logs in Vercel dashboard.
\`\`\`

Now let me update the admin page to include session management:
