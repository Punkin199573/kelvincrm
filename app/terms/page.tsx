import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray dark:prose-invert max-w-none">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this
                agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Membership Services</h2>
              <p className="text-muted-foreground">
                Our membership services provide access to exclusive content, events, and merchandise. Membership fees
                are charged monthly and are non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Conduct</h2>
              <p className="text-muted-foreground">
                Users agree to use the service in a lawful manner and not to engage in any activity that could harm the
                service or other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Privacy</h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use
                your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend access to our service immediately, without prior notice,
                for any reason whatsoever.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:support@kelvincreekman.com" className="text-primary hover:underline">
                  support@kelvincreekman.com
                </a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
