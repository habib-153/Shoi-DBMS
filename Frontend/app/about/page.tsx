import { Heart, Users, Shield, Award, Clock, Globe } from "lucide-react";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-modern">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About সই</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Your trusted companion in mental health and well-being. We're here to support you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                At সই, we believe that mental health care should be accessible, affordable, and stigma-free. 
                We're committed to breaking down barriers and creating a safe space where everyone can 
                find the support they need.
              </p>
              <p className="text-lg text-gray-700 mb-8">
                Our platform connects individuals with qualified mental health professionals, 
                providing a seamless experience for booking appointments, receiving care, and 
                tracking your mental health journey.
              </p>
              <div className="flex items-center gap-4">
                <Heart className="w-8 h-8 text-[#2596be]" />
                <span className="text-lg font-semibold text-gray-900">Compassionate Care for All</span>
              </div>
            </div>
            <div className="flex justify-center">
              <img src="/mission.png" alt="Our Mission" className="w-full max-w-md rounded-2xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and shape our commitment to your mental health.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-modern border-0 p-8 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">Privacy & Security</h3>
              <p className="text-muted-foreground">
                Your personal information and sessions are completely confidential and protected with 
                industry-standard security measures.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
              <Users className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Inclusive Community</h3>
              <p className="text-gray-600">
                We welcome everyone regardless of background, identity, or circumstances. 
                Mental health support is a human right.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
              <Award className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Care</h3>
              <p className="text-gray-600">
                All our therapists are licensed professionals with expertise in various 
                mental health specialties and evidence-based treatments.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
              <Clock className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Convenient Access</h3>
              <p className="text-gray-600">
                Book appointments that fit your schedule with flexible timing and 
                both in-person and online session options.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
              <Globe className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cultural Sensitivity</h3>
              <p className="text-gray-600">
                Our platform is designed with cultural awareness and sensitivity to 
                serve diverse communities effectively.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
              <Heart className="w-12 h-12 text-[#2596be] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Empathetic Support</h3>
              <p className="text-gray-600">
                We approach every interaction with empathy, understanding, and 
                non-judgmental support for your mental health journey.
              </p>
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
              Getting started with your mental health journey is simple and straightforward.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2596be] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Account</h3>
              <p className="text-gray-600">
                Sign up and tell us a bit about yourself and what kind of support you're looking for.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2596be] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Find Your Therapist</h3>
              <p className="text-gray-600">
                Browse our network of qualified therapists and find someone who matches your needs and preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2596be] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Start Your Journey</h3>
              <p className="text-gray-600">
                Book your appointment and begin your path to better mental health with professional support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-[#2596be] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-blue-200">People Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Licensed Therapists</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Support Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Mental Health Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Take the first step towards better mental health. Our compassionate team is here to support you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center px-8 py-3 bg-[#2596be] text-white rounded-xl hover:bg-[#1d7a99] font-semibold">
              Get Started Today
            </Link>
            <Link href="/appointments" className="inline-flex items-center justify-center px-8 py-3 border border-[#2596be] text-[#2596be] rounded-xl hover:bg-[#2596be]/10 font-semibold">
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}