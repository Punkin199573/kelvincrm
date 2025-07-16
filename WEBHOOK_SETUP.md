# Stripe Webhook Setup Guide

## 1. Create Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select the following events to listen for:

### Required Events:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `invoice.payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## 2. Get Webhook Secret

1. After creating the webhook, click on it
2. Copy the "Signing secret" (starts with `whsec_`)
3. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

## 3. Environment Variables Required

\`\`\`env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
\`\`\`

## 4. Test Webhook

Use the Stripe CLI to test webhooks locally:

\`\`\`bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to Stripe
stripe login

# Forward events to local endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
\`\`\`

## 5. Webhook Events Handled

### Subscription Events
- **checkout.session.completed**: Upgrades user tier after successful subscription payment
- **customer.subscription.created**: Creates subscription record
- **customer.subscription.updated**: Updates subscription status and billing period
- **customer.subscription.deleted**: Downgrades user to basic tier
- **invoice.payment_succeeded**: Processes recurring subscription payments
- **invoice.payment_failed**: Handles failed payments and notifications

### Store Events
- **checkout.session.completed**: Marks orders as processing after payment
- **payment_intent.succeeded**: Logs successful payments

### Event Registration
- **checkout.session.completed**: Confirms event registrations after payment

### Session Booking
- **checkout.session.completed**: Confirms meet & greet sessions after payment

## 6. Webhook Security

The webhook handler:
- Verifies Stripe signature using webhook secret
- Uses Supabase service role key for database operations
- Includes error handling and logging
- Sends confirmation emails for successful payments

## 7. Monitoring

Monitor webhook delivery in:
- Stripe Dashboard > Webhooks > [Your Endpoint] > Attempts
- Your application logs
- Supabase database for updated records

## 8. Production Deployment

1. Deploy your application to production
2. Update webhook endpoint URL in Stripe Dashboard
3. Ensure all environment variables are set in production
4. Test with real payments in Stripe test mode first
\`\`\`

Finally, let's create a webhook status checker:
