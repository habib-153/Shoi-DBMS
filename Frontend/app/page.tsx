

import Navigation from "@/components/Navigation";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Banner />
      
      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-[#2596be]/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-[#2596be]/10 text-[#2596be] px-4 py-2 rounded-full text-sm font-medium mb-6">
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted Mental Health Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional, compassionate care designed to help you navigate life's challenges with confidence and support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="card-modern p-8 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#2596be]/20 transition-colors duration-300">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Compassionate Care</h3>
              <p className="text-gray-600 leading-relaxed">Our experienced therapists provide empathetic and understanding support for your mental health journey.</p>
            </div>
            
            <div className="card-modern p-8 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#2596be]/20 transition-colors duration-300">
                <span className="text-3xl">🌐</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Accessible Online</h3>
              <p className="text-gray-600 leading-relaxed">Connect with qualified professionals from the comfort of your home through our secure platform.</p>
            </div>
            
            <div className="card-modern p-8 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#2596be]/20 transition-colors duration-300">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">Your privacy and confidentiality are our top priorities with end-to-end encrypted sessions.</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
