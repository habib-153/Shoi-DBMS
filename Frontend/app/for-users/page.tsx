import Link from "next/link";
import { Heart, Clock, Shield, MessageCircle, Users, CheckCircle, Star, ArrowRight } from "lucide-react";

export default function ForUsers() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2596be] to-[#1d7a99] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your Mental Health Matters
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Connect with licensed therapists who understand your journey. 
                Get the support you deserve in a safe, confidential environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#2596be] rounded-xl hover:bg-gray-100 font-semibold">
                  Start Your Journey
                </Link>
                <Link href="/appointments" className="inline-flex items-center justify-center px-8 py-3 border border-white text-white rounded-xl hover:bg-white/10 font-semibold">
                  Book a Session
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img src="/mental-health-support.png" alt="Mental Health Support" className="w-full max-w-lg rounded-2xl shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose সই?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to making mental health care accessible, effective, and supportive for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compassionate Care</h3>
              <p className="text-gray-600">
                Our therapists provide empathetic, non-judgmental support tailored to your unique needs and circumstances.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Scheduling</h3>
              <p className="text-gray-600">
                Book appointments that work with your schedule. Available evenings, weekends, and emergency slots.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Privacy</h3>
              <p className="text-gray-600">
                Your sessions and personal information are completely confidential and protected with end-to-end encryption.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple Formats</h3>
              <p className="text-gray-600">
                Choose from in-person visits, video calls, or chat sessions based on your comfort and preference.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Therapists</h3>
              <p className="text-gray-600">
                All our therapists are licensed professionals with specialized training in various mental health areas.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proven Results</h3>
              <p className="text-gray-600">
                Evidence-based therapy approaches with measurable outcomes and progress tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services We Offer */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Services We Offer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're dealing with specific challenges or want to improve your overall well-being, we're here to help.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Individual Therapy</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Anxiety and stress management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Depression and mood disorders</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Trauma and PTSD therapy</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Relationship and family issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Self-esteem and confidence building</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Specialized Support</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Couples and marriage counseling</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Teen and adolescent therapy</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Addiction and substance abuse</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Grief and loss counseling</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Career and life transitions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. Follow these steps to begin your mental health journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2596be] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600 text-sm">Create your account and complete a brief assessment</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2596be] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Find Your Therapist</h3>
              <p className="text-gray-600 text-sm">Browse therapists and find the perfect match for you</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2596be] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Book & Pay</h3>
              <p className="text-gray-600 text-sm">Schedule your session and pay securely online</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2596be] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Start Healing</h3>
              <p className="text-gray-600 text-sm">Attend your session and begin your journey to wellness</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from people who found support and healing through our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "সই helped me find the right therapist when I was struggling with anxiety. 
                The platform is easy to use and my therapist is incredibly understanding."
              </p>
              <div className="font-semibold text-gray-900">Sarah M.</div>
              <div className="text-gray-600 text-sm">Anxiety Management</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "After my divorce, I didn't know where to turn. The therapist I found through 
                সই helped me rebuild my confidence and find my way forward."
              </p>
              <div className="font-semibold text-gray-900">Ahmed R.</div>
              <div className="text-gray-600 text-sm">Life Transitions</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The convenience of online sessions made it possible for me to get help while 
                managing my busy schedule. Highly recommend!"
              </p>
              <div className="font-semibold text-gray-900">Fatima K.</div>
              <div className="text-gray-600 text-sm">Stress Management</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2596be] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take the First Step?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Your mental health journey starts with a single step. We're here to support you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#2596be] rounded-xl hover:bg-gray-100 font-semibold">
              <Heart className="w-5 h-5 mr-2" />
              Start Your Journey
            </Link>
            <Link href="/appointments" className="inline-flex items-center justify-center px-8 py-3 border border-white text-white rounded-xl hover:bg-white/10 font-semibold">
              <ArrowRight className="w-5 h-5 mr-2" />
              Book a Session
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}