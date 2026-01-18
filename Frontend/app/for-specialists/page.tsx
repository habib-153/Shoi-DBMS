import Link from "next/link";
import { Users, Calendar, Shield, TrendingUp, Clock, Globe, CheckCircle, Star, DollarSign } from "lucide-react";

export default function ForSpecialistsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#2596be] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Join Our Network of Mental Health Professionals
              </h1>
              <p className="text-xl text-cyan-50/90 mb-8">
                Expand your practice, reach more clients, and make a meaningful impact 
                with our comprehensive platform designed for mental health specialists.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?type=therapist" className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#2596be] rounded-xl hover:bg-gray-100 font-semibold">
                  Join as Therapist
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center px-8 py-3 border border-white text-white rounded-xl hover:bg-white/10 font-semibold">
                  Therapist Login
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="/landing page/BD8EEEE5-024D-45D6-9920-887C8A846CDD.png" 
                alt="Mental Health Professional Platform" 
                className="w-full max-w-lg rounded-2xl shadow-xl border-4 border-white" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Join সই?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Grow your practice with our comprehensive platform built specifically for mental health professionals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expand Your Reach</h3>
              <p className="text-gray-600">
                Connect with clients who need your expertise. Our platform matches you with patients based on your specialties.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Scheduling</h3>
              <p className="text-gray-600">
                Set your own availability and manage appointments with our intuitive scheduling system. Work on your terms.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Platform</h3>
              <p className="text-gray-600">
                HIPAA-compliant platform with end-to-end encryption ensures patient confidentiality and data security.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Grow Your Practice</h3>
              <p className="text-gray-600">
                Access to marketing tools, analytics, and resources to help you build and expand your practice effectively.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Time Management</h3>
              <p className="text-gray-600">
                Streamlined workflow with automated reminders, session notes, and progress tracking tools.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-[#2596be]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Online & In-Person</h3>
              <p className="text-gray-600">
                Offer both virtual and in-person sessions to accommodate all types of clients and preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to run your practice efficiently and provide excellent patient care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Practice Management</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Appointment scheduling and calendar management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Patient intake forms and assessments</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Session notes and progress tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Automated reminders and notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Client communication tools</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Business Tools</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Integrated payment processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Revenue reporting and analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Professional profile and credentials</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Patient matching and referrals</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Marketing and practice growth tools</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Telehealth Features</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>HD video and audio sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Screen sharing and digital whiteboards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Secure messaging and file sharing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Session recording (with consent)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Mobile app for on-the-go access</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Compliance & Security</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>HIPAA-compliant infrastructure</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Automated data backups</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Audit trails and documentation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Regular security updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for your practice. No hidden fees, no long-term contracts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-[#2596be] mb-4">৳2,000<span className="text-lg text-gray-600">/month</span></div>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>Up to 50 patients</li>
                <li>Basic scheduling</li>
                <li>Telehealth sessions</li>
                <li>Payment processing</li>
                <li>Email support</li>
              </ul>
              <Link href="/register?type=therapist&plan=starter" className="block w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-xl hover:bg-gray-200 font-semibold">
                Get Started
              </Link>
            </div>
            
            <div className="bg-[#2596be] text-white p-8 rounded-xl shadow-lg border-2 border-[#2596be] text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <div className="text-3xl font-bold mb-4">৳4,000<span className="text-lg text-blue-200">/month</span></div>
              <ul className="space-y-3 text-blue-100 mb-8">
                <li>Up to 200 patients</li>
                <li>Advanced scheduling</li>
                <li>All telehealth features</li>
                <li>Analytics & reporting</li>
                <li>Priority support</li>
                <li>Marketing tools</li>
              </ul>
              <Link href="/register?type=therapist&plan=professional" className="block w-full bg-white text-[#2596be] py-3 px-6 rounded-xl hover:bg-gray-100 font-semibold">
                Start Free Trial
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-[#2596be] mb-4">৳8,000<span className="text-lg text-gray-600">/month</span></div>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>Unlimited patients</li>
                <li>Custom integrations</li>
                <li>White-label options</li>
                <li>Advanced analytics</li>
                <li>24/7 phone support</li>
                <li>Account manager</li>
              </ul>
              <Link href="/register?type=therapist&plan=enterprise" className="block w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-xl hover:bg-gray-200 font-semibold">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Therapists Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from mental health professionals who have grown their practices with সই.
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
                "সই has transformed my practice. The scheduling system is intuitive, 
                and I've been able to reach more clients than ever before."
              </p>
              <div className="font-semibold text-gray-900">Dr. Rashida Ahmed</div>
              <div className="text-gray-600 text-sm">Licensed Psychologist</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The telehealth features are excellent. My clients love the convenience, 
                and I can provide quality care from anywhere."
              </p>
              <div className="font-semibold text-gray-900">Dr. Mohammad Hassan</div>
              <div className="text-gray-600 text-sm">Clinical Therapist</div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The platform's security features give me and my clients complete peace of mind. 
                Professional and reliable service."
              </p>
              <div className="font-semibold text-gray-900">Dr. Fatima Khan</div>
              <div className="text-gray-600 text-sm">Marriage Counselor</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2596be] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Grow Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of mental health professionals who trust সই to manage and grow their practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?type=therapist" className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#2596be] rounded-xl hover:bg-gray-100 font-semibold">
              <Users className="w-5 h-5 mr-2" />
              Join as Therapist
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center px-8 py-3 border border-white text-white rounded-xl hover:bg-white/10 font-semibold">
              Already a member? Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}