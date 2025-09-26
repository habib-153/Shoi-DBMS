import Banner from "@/components/Banner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Banner />
      <Footer />
    </div>
  );
}

