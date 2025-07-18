export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Kelvin Creekman Fan Club website and services, you accept and agree to be
                bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Membership and Subscriptions</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our fan club offers different membership tiers with varying benefits:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Frost Fan ($9.99/month) - Basic membership with exclusive content access</li>
                <li>Blizzard VIP ($19.99/month) - Enhanced membership with additional perks</li>
                <li>Avalanche Backstage ($49.99/month) - Premium membership with all benefits</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Subscriptions are billed monthly and automatically renew unless cancelled. You may cancel your
                subscription at any time through your account dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Payment and Billing</h2>
              <p className="text-muted-foreground leading-relaxed">
                All payments are processed securely through Stripe. By providing payment information, you authorize us
                to charge your payment method for the selected membership tier. Refunds are handled on a case-by-case
                basis and may be subject to our refund policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Content and Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content provided through the fan club, including but not limited to music, videos, images, and text,
                is the intellectual property of Kelvin Creekman or licensed content providers. Members are granted a
                limited, non-exclusive license to access and enjoy this content for personal use only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Members agree to use the service respectfully and lawfully. Prohibited activities include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Sharing login credentials with others</li>
                <li>Downloading or redistributing exclusive content</li>
                <li>Harassment or inappropriate behavior in community spaces</li>
                <li>Attempting to circumvent payment or access restrictions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                We respect your privacy and are committed to protecting your personal information. Please review our
                Privacy Policy for detailed information about how we collect, use, and protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend access to our service immediately, without prior notice or
                liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our support channels
                or email us directly.
              </p>
            </section>

            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                These terms are effective immediately and apply to all users of the Kelvin Creekman Fan Club service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
