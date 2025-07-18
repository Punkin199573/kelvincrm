export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">Have questions or need support? We'd love to hear from you.</p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">support@kelvincrm.com</p>
              </div>

              <div>
                <h3 className="font-semibold">Business Inquiries</h3>
                <p className="text-muted-foreground">business@kelvincrm.com</p>
              </div>

              <div>
                <h3 className="font-semibold">Response Time</h3>
                <p className="text-muted-foreground">We typically respond within 24 hours</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">How do I cancel my membership?</h3>
                <p className="text-sm text-muted-foreground">
                  You can cancel your membership anytime from your dashboard.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">When will my order ship?</h3>
                <p className="text-sm text-muted-foreground">Orders typically ship within 3-5 business days.</p>
              </div>

              <div>
                <h3 className="font-semibold">How do I join a meet & greet?</h3>
                <p className="text-sm text-muted-foreground">
                  After booking, you'll receive instructions via email with the Signal call link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
