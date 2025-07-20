# Deployment Guide

This guide provides step-by-step instructions for deploying the Kelvin Creekman Fan Club website to Vercel.

## Prerequisites

-   A Vercel account.
-   A GitHub, GitLab, or Bitbucket account.
-   The project code in a Git repository.

## Steps

1.  **Create a Vercel Project:**

    -   Log in to your Vercel account.
    -   Click on "Add New..." and select "Project".
    -   Connect your Git repository by selecting the appropriate provider (GitHub, GitLab, or Bitbucket).
    -   Choose the repository containing the Kelvin Creekman Fan Club website code.

2.  **Configure Project Settings:**

    -   Vercel should automatically detect that the project is a Next.js application. If not, configure the following settings:
        -   **Framework Preset:** `Next.js`
        -   **Build Command:** `next build`
        -   **Output Directory:** `.next`

3.  **Add Environment Variables:**

    -   Navigate to the "Settings" tab of your Vercel project.
    -   Select "Environment Variables" from the sidebar.
    -   Add the following environment variables, ensuring that you use the correct values for your project:

        -   `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key for your Supabase project.
        -   `SUPABASE_SERVICE_ROLE_KEY`: The service role key for your Supabase project.
        -   `STRIPE_SECRET_KEY`: Your Stripe secret key.
        -   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key.
        -   `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret.
        -   `RESEND_API_KEY`: Your Resend API key.
        -   `NEXT_PUBLIC_BASE_URL`: The base URL of your deployed website (e.g., `https://kelvincreekman.vercel.app`).

4.  **Deploy the Project:**

    -   Click the "Deploy" button.
    -   Vercel will automatically build and deploy your project.
    -   Once the deployment is complete, you will receive a URL to access your live website.

## Post-Deployment Setup

1.  **Set Up Stripe Webhooks:**

    -   In your Stripe dashboard, configure the webhook endpoint to point to your Vercel deployment URL (e.g., `https://kelvincreekman.vercel.app/api/webhooks/stripe`).
    -   Ensure that the webhook is configured to listen for the following events:
        -   `checkout.session.completed`
        -   `payment_intent.succeeded`
        -   `invoice.payment_succeeded`
        -   `customer.subscription.created`
        -   `customer.subscription.updated`
        -   `customer.subscription.deleted`
        -   `invoice.payment_failed`

2.  **Configure Resend:**

    -   Verify your domain in Resend.
    -   Update the `RESEND_API_KEY` environment variable in Vercel with your Resend API key.
    -   Ensure that your email templates are set up correctly in Resend.

3.  **Set Up Admin User:**

    -   Follow the steps in the [Admin Setup Guide](ADMIN_SETUP.md) to create an admin user in your Supabase project.

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
