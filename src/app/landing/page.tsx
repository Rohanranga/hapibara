import CTASection from "@/components/landing-page/cta-section"
import HeroSection from "@/components/landing-page/hero-section"
import MascotSection from "@/components/landing-page/mascot-section"
import PurposeSection from "@/components/landing-page/purpose-section"
import TestimonialsSection from "@/components/landing-page/testimonials-section"
import ExploreSection from "@/components/landing-page/explore-section"
import HighlightsStrip from "@/components/landing-page/highlights-strip"
import StickyBottomNav from "@/components/landing-page/sticky-bottom-navigation"

export default function LandingPage() {
  return (
    <div id="home" className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection id="hero" />
      <HighlightsStrip id="highlights" />
      <PurposeSection id="purpose" />
      <ExploreSection id="explore" />
      <MascotSection id="mascot" />
      <TestimonialsSection id="testimonials" />
      <CTASection id="join" />
      <StickyBottomNav />
    </div>
  )
}
