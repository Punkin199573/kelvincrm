# Stripe and Resend Integration Guide

This guide provides step-by-step instructions for integrating Stripe for payments and Resend for email confirmations in the Kelvin Creekman Fan Club website.

## Prerequisites

-   A Stripe account.
-   A Resend account.
-   A deployed instance of the Kelvin Creekman Fan Club website.
-   Access to the Vercel project associated with the website.

## Stripe Setup

1.  **Create a Stripe Account:**

    -   Go to [Stripe](https://stripe.com/) and create an account.
    -   Follow the steps to activate your account.

2.  **Retrieve API Keys:**

    -   In your Stripe dashboard, navigate to the "Developers" section.
    -   Under "API keys", you will find your "Publishable key" and "Secret key".
    -   Copy these keys, as you will need them to configure the environment variables in Vercel.

3.  **Create Webhook Endpoint:**

    -   In your Stripe dashboard, navigate to the "Webhooks" section.
    -   Click "Add endpoint" to create a new webhook.
    -   Set the "Endpoint URL" to your Vercel deployment URL, followed by `/api/webhooks/stripe` (e.g., `https://kelvincreekman.vercel.app/api/webhooks/stripe`).
    -   Select the following events to listen to:
        -   `checkout.session.completed`
        -   `payment_intent.succeeded`
        -   `invoice.payment_succeeded`
        -   `customer.subscription.created`
        -   `customer.subscription.updated`
        -   `customer.subscription.deleted`
        -   `invoice.payment_failed`
    -   Click "Add endpoint" to save the webhook configuration.
    -   Copy the "Signing secret" from the webhook details page. You will need this to configure the environment variables in Vercel.

## Resend Setup

1.  **Create a Resend Account:**

    -   Go to [Resend](https://resend.com/) and create an account.
    -   Follow the steps to verify your domain.

2.  **Retrieve API Key:**

    -   In your Resend dashboard, navigate to the "API Keys" section.
    -   Click "Create API Key" to generate a new API key.
    -   Copy the API key, as you will need it to configure the environment variables in Vercel.

3.  **Create Email Templates:**

    -   In your Resend dashboard, navigate to the "Emails" section.
    -   Create the following email templates:
        -   Welcome Email: Sent to new users after signing up.
        -   Order Confirmation Email: Sent to users after placing an order.
        -   Event Confirmation Email: Sent to users after registering for an event.
        -   Meet & Greet Confirmation Email: Sent to users after booking a meet & greet session.
    -   Note the IDs of these email templates, as you may need them for further customization.

## Vercel Configuration

1.  **Access Vercel Project Settings:**

    -   Log in to your Vercel account.
    -   Go to your project dashboard.
    -   Navigate to the "Settings" tab.
    -   Select "Environment Variables" from the sidebar.

2.  **Add Environment Variables:**

    -   Add the following environment variables, using the values you retrieved from Stripe and Resend:

        -   `STRIPE_SECRET_KEY`: Your Stripe secret key.
        -   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key.
        -   `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret.
        -   `RESEND_API_KEY`: Your Resend API key.

3.  **Deploy the Project:**

    -   Click the "Deploy" button to redeploy your project with the new environment variables.

## Testing

1.  **Sign Up and Sign In:**

    -   Ensure that users can successfully sign up and sign in to the website.
    -   Verify that the welcome email is sent to new users.

2.  **Test Membership Payments:**

    -   Sign up for a membership tier and complete the payment process.
    -   Verify that the user's tier is updated in the Supabase database.
    -   Ensure that the welcome email is sent to the user.

3.  **Test Store Purchases:**

    -   Add items to the cart and proceed to checkout.
    -   Complete the payment process.
    -   Verify that the order is created in the Supabase database.
    -   Ensure that the order confirmation email is sent to the user.

4.  **Test Event Registrations:**

    -   Register for an event and complete the payment process.
    -   Verify that the event registration is created in the Supabase database.
    -   Ensure that the event confirmation email is sent to the user.

## Troubleshooting

-   If you encounter any issues during deployment, check the Vercel logs for error messages.
-   Ensure that all environment variables are set correctly in Vercel.
-   Verify that the Stripe webhook is configured correctly and is listening for the required events.
-   Check the Resend dashboard for any email delivery issues.
