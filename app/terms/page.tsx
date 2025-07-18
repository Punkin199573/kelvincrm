import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using the Kelvin Creekman Fan Club website and services, you accept and agree to be
                bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Membership Services</h2>
              <p className="text-muted-foreground mb-3">
                Our membership services include access to exclusive content, fan community features, and special events.
                Membership benefits vary by tier:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Frost Fan: Basic access to exclusive content and community</li>
                <li>Blizzard VIP: Enhanced access with additional perks and priority support</li>
                <li>Avalanche Backstage: Premium access with backstage content and meet & greet opportunities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Payment and Billing</h2>
              <p className="text-muted-foreground">
                Membership fees are billed monthly and are non-refundable except as required by law. You may cancel your
                subscription at any time, and cancellation will take effect at the end of your current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
              <p className="text-muted-foreground">
                You agree to use our services respectfully and in accordance with all applicable laws. Prohibited
                activities include harassment, spam, sharing inappropriate content, or attempting to circumvent our
                security measures.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content provided through our services, including music, videos, images, and text, is protected by
                copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative
                works without explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Privacy</h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
                protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                We provide our services "as is" without warranties of any kind. We shall not be liable for any indirect,
                incidental, special, or consequential damages arising from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via
                email or through our website. Continued use of our services after changes constitutes acceptance of the
                new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at support@kelvincreekman.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
