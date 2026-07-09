import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/features/landing/hero-section";
import { FeaturesSection } from "@/features/landing/features-section";
import { WhySection } from "@/features/landing/why-section";
import { CtaSection } from "@/features/landing/cta-section";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <WhySection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
