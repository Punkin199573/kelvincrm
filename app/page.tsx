import { MembershipTiers } from "@/components/membership-tiers"
import { Testimonials } from "@/components/testimonials"
import { UpcomingEvents } from "@/components/upcoming-events"
import { HeroSection } from "@/components/hero-section"
import { SuperFansWidget } from "@/components/super-fans-widget"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <MembershipTiers />
      <UpcomingEvents />
      <Testimonials />
     <SuperFansWidget/>
    </div>
  )
}
