

import Navigation from "@/components/Navigation";
import UltraEnhancedBanner from "@/components/UltraEnhancedBanner";
import UltraEnhancedFeatures from "@/components/UltraEnhancedFeatures";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <UltraEnhancedBanner />
      <UltraEnhancedFeatures />
      <Footer />
    </div>
  );
}
