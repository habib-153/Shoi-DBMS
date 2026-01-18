import { Heart, Users, Clock, TrendingUp, Award, Globe, MessageCircle, BookOpen, Star, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Impact() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#2596be] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Impact</h1>
            <p className="text-xl md:text-2xl text-cyan-50/90 max-w-3xl mx-auto">
              Together, we're breaking down barriers and making mental health care accessible to everyone in Bangladesh.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">By The Numbers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real impact, real change. See how সই is transforming mental health care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-100 p-8 text-center hover:shadow-xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-[#2596be] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-[#2596be] mb-2">10,000+</h3>
              <p className="text-gray-600 font-medium">People Helped</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-100 p-8 text-center hover:shadow-xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-[#2596be] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-[#2596be] mb-2">500+</h3>
              <p className="text-gray-600 font-medium">Licensed Therapists</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-100 p-8 text-center hover:shadow-xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-[#2596be] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-[#2596be] mb-2">50,000+</h3>
              <p className="text-gray-600 font-medium">Sessions Completed</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-100 p-8 text-center hover:shadow-xl transition-all hover:scale-105">
              <div className="w-16 h-16 bg-[#2596be] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-[#2596be] mb-2">4.8/5</h3>
              <p className="text-gray-600 font-medium">Average Rating</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-100">
              <div className="flex items-center gap-4">
                <Clock className="w-10 h-10 text-[#2596be]" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">24/7</p>
                  <p className="text-gray-600">Support Available</p>
                </div>
              </div>
            </div>

            <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-100">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-10 h-10 text-[#2596be]" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                  <p className="text-gray-600">Improvement Rate</p>
                </div>
              </div>
            </div>

            <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-100">
              <div className="flex items-center gap-4">
                <Globe className="w-10 h-10 text-[#2596be]" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">64+</p>
                  <p className="text-gray-600">Cities Reached</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-cyan-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from real people who found support through সই.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "সই gave me the courage to seek help. My therapist understood my cultural background and helped me overcome my anxiety. I'm forever grateful."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2596be] rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ayesha R.</p>
                  <p className="text-sm text-gray-600">Dhaka</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Finding a therapist who speaks Bangla and understands our culture made all the difference. The platform is easy to use and very professional."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2596be] rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mohammed K.</p>
                  <p className="text-sm text-gray-600">Chittagong</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "As a therapist, সই has helped me reach more patients who need support. The platform makes scheduling and communication seamless."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2596be] rounded-full flex items-center justify-center text-white font-bold">
                  D
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dr. Sultana F.</p>
                  <p className="text-sm text-gray-600">Sylhet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-8 text-center">
              At সই, we're on a mission to make mental health care accessible, affordable, and stigma-free 
              for everyone in Bangladesh. We believe that mental health is just as important as physical health, 
              and everyone deserves access to quality care.
            </p>

            {/* Image in the middle */}
            <div className="flex justify-center mb-8">
              <img 
                src="/landing page/FFB18686-A6C6-4FA3-A9AA-B6D1F69391F5.png" 
                alt="Mental Health Platform Overview" 
                className="w-full max-w-4xl rounded-2xl shadow-2xl border-4 border-cyan-100" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#2596be] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Breaking Stigma</h3>
                  <p className="text-gray-600">Creating safe spaces for open conversations about mental health</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#2596be] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Accessible Care</h3>
                  <p className="text-gray-600">Making therapy available to everyone, regardless of location</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#2596be] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cultural Understanding</h3>
                  <p className="text-gray-600">Connecting people with therapists who understand their culture</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#2596be] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quality Assurance</h3>
                  <p className="text-gray-600">Working only with licensed, qualified mental health professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#2596be] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 mx-auto mb-6 text-cyan-100" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Be Part of Our Story</h2>
          <p className="text-xl text-cyan-50/90 mb-8">
            Join thousands of people who have taken the first step towards better mental health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#2596be] rounded-xl hover:bg-gray-100 font-semibold text-lg transition-all hover:scale-105">
              Get Started Today
            </Link>
            <Link href="/for-specialists" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 font-semibold text-lg transition-all hover:scale-105">
              Join as a Therapist
            </Link>
          </div>
        </div>
      </section>

      {/* Partners & Recognition */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recognition & Awards</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by leading organizations and recognized for our impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg border-2 border-cyan-100 p-8 text-center hover:shadow-xl transition-shadow">
              <Award className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Best Healthcare Innovation</h3>
              <p className="text-gray-600">Digital Bangladesh Awards 2024</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-2 border-cyan-100 p-8 text-center hover:shadow-xl transition-shadow">
              <BookOpen className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Mental Health Excellence</h3>
              <p className="text-gray-600">Bangladesh Medical Association 2024</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-2 border-cyan-100 p-8 text-center hover:shadow-xl transition-shadow">
              <Users className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Social Impact Award</h3>
              <p className="text-gray-600">Tech for Good Initiative 2025</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
