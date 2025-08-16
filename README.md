# Kelvin Creekman Fan Club

A comprehensive fan club platform built with Next.js, Supabase, and Stripe.

## Features

- **Authentication System**: Complete user registration and login
- **Membership Tiers**: Frost Fan, Blizzard VIP, Avalanche Backstage
- **E-commerce Store**: Product catalog with Stripe integration
- **Event Management**: Concert and meet-and-greet bookings
- **Content Management**: Exclusive content for different tiers
- **Admin Dashboard**: Complete admin panel for management
- **Responsive Design**: Mobile-first responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **Email**: Resend
- **File Upload**: UploadThing
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd kelvin-creekman-fan-club
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your environment variables:
- Supabase URL and keys
- Stripe keys
- Resend API key
- UploadThing keys

4. Set up the database:
- Run the SQL migrations in your Supabase dashboard
- Create the admin user (see ADMIN_SETUP.md)

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Admin Access

- **Email**: punkin199573@gmail.com
- **Password**: Benefitpay

See `ADMIN_SETUP.md` for detailed setup instructions.

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Utility libraries
├── supabase/             # Database migrations
├── public/               # Static assets
└── styles/               # Global styles
\`\`\`

## Key Features

### Authentication
- User registration and login
- Email verification
- Password reset
- Profile management

### E-commerce
- Product catalog
- Shopping cart
- Stripe checkout
- Order management

### Events
- Event listings
- Ticket booking
- Meet and greet sessions
- Payment processing

### Content Management
- Tier-based content access
- Media uploads
- Content organization

### Admin Panel
- User management
- Product management
- Event management
- Order tracking
- Analytics

## Deployment

The application is configured for deployment on Vercel:

1. Connect your repository to Vercel
2. Set up environment variables
3. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary and confidential.
