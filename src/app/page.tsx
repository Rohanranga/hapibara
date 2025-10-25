import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import LandingNavbar from "@/components/landing-page/landing-navbar";
import HeroSection from "@/components/landing-page/hero-section"
import MascotSection from "@/components/landing-page/mascot-section"
import PurposeSection from "@/components/landing-page/purpose-section"
import TestimonialsSection from "@/components/landing-page/testimonials-section"
import ExploreSection from "@/components/landing-page/explore-section"
import HighlightsStrip from "@/components/landing-page/highlights-strip"
import SectionNavigation from "@/components/landing-page/sticky-bottom-navigation"
import CTASection from "@/components/landing-page/cta-section";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/home");
  }

  // Show landing page for unauthenticated users
  return (
    <div id="home" className="min-h-screen bg-background text-foreground overflow-x-hidden pb-16">
      <LandingNavbar />
      <HeroSection id="hero" />
      <HighlightsStrip id="highlights" />
      <PurposeSection id="purpose" />
      <ExploreSection id="explore" />
      <MascotSection id="mascot" />
      <TestimonialsSection id="testimonials" />
      <CTASection id="join" />
      <SectionNavigation />
    </div>
  );
}
