"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Clock, Languages, GraduationCap, Award, Calendar, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { RatingDisplay } from "@/components/StarRating";
import { toast } from "sonner";
import dayjs from "dayjs";

interface Therapist {
  therapist_id: number;
  name: string;
  email: string;
  phone?: string;
  qualifications?: string;
  experience_years?: number;
  rating?: number;
  bio?: string;
  profile_picture?: string;
  location?: string;
  consultation_fee?: number;
  languages?: string;
  created_at?: string;
  updated_at?: string;
  specialties?: string[];
}

export default function Experts() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  
  // Booking states
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [availableSlots, setAvailableSlots] = useState<{start: string; end: string}[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{start: string; end: string} | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  const { user } = useAuth();

  const specialties = ["all", "Anxiety Disorders", "Depression", "Child Psychology", "Couples Therapy", "Trauma Recovery", "Addiction Recovery"];

  // Handle booking modal
  const handleOpenBookingModal = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setShowBookingModal(true);
    setSelectedDate(dayjs().add(1, "day").format("YYYY-MM-DD"));
    setSelectedSlot(null);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedTherapist(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
  };

  // Fetch available slots when date or therapist changes
  useEffect(() => {
    if (!selectedTherapist || !selectedDate) return;
    
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const res = await fetch(`/api/slots?therapist_id=${selectedTherapist.therapist_id}&date=${selectedDate}`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.slots)) {
          setAvailableSlots(data.slots);
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    
    fetchSlots();
  }, [selectedTherapist, selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedTherapist || !selectedSlot || !user) {
      toast.error("Please select a time slot");
      return;
    }

    setIsBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id || user.therapist_id,
          therapist_id: selectedTherapist.therapist_id,
          start_time: selectedSlot.start,
          end_time: selectedSlot.end,
          status: 'scheduled',
        }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      toast.success("Appointment booked successfully!");
      handleCloseBookingModal();
      
      // Optionally redirect to appointments page
      setTimeout(() => {
        window.location.href = '/appointments/history';
      }, 1500);
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  // Fetch therapists from API
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/therapists');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(errorData.details || errorData.error || 'Failed to fetch therapists');
        }
        
        const data = await response.json();
        
        // Check if we got an error response
        if (data.error) {
          throw new Error(data.details || data.error);
        }
        
        // Handle empty data
        if (!Array.isArray(data) || data.length === 0) {
          console.warn('No therapists found in database');
          setTherapists([]);
          setFilteredTherapists([]);
          setError('No therapists available at the moment. Please check back later.');
          return;
        }
        
        // Group therapists by id and collect their specialties
        const therapistsMap = new Map<number, Therapist>();
        data.forEach((row: any) => {
          const id = row.therapist_id;
          if (!therapistsMap.has(id)) {
            therapistsMap.set(id, {
              therapist_id: row.therapist_id,
              name: row.name,
              email: row.email,
              phone: row.phone,
              qualifications: row.qualifications,
              experience_years: row.experience_years || 0,
              rating: row.rating || 4.5,
              bio: row.bio || "Experienced mental health professional dedicated to helping clients achieve their wellness goals.",
              profile_picture: row.profile_picture || "/experts/default-therapist.jpg",
              location: row.location || "Dhaka, Bangladesh",
              consultation_fee: row.consultation_fee || 2000,
              languages: row.languages || "English, Bengali",
              created_at: row.created_at,
              updated_at: row.updated_at,
              specialties: []
            });
          }
        });
        
        const therapistsArray = Array.from(therapistsMap.values());
        setTherapists(therapistsArray);
        setFilteredTherapists(therapistsArray);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load therapists. Please check your database connection.';
        setError(errorMessage);
        console.error('Error fetching therapists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  useEffect(() => {
    let filtered = therapists;

    // Filter by specialty
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(therapist =>
        therapist.specialties && therapist.specialties.some(specialty =>
          specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
        )
      );
    }

    // Sort therapists
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "experience":
        filtered.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "fees":
        filtered.sort((a, b) => (a.consultation_fee || 0) - (b.consultation_fee || 0));
        break;
    }

    setFilteredTherapists(filtered);
  }, [therapists, selectedSpecialty, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading our expert therapists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Therapists</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="text-sm text-gray-600 mb-6 text-left bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">Possible solutions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check if MySQL is running</li>
                  <li>Verify database credentials in .env.local</li>
                  <li>Ensure the database and tables exist</li>
                  <li>Check the browser console for details</li>
                </ul>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-[#2596be] text-white px-4 py-2 rounded-lg hover:bg-[#1d7a99] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50/20 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2596be] to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Our Mental Health Experts
            </h1>
            <p className="text-xl text-cyan-50 max-w-3xl mx-auto">
              Connect with experienced professionals who are dedicated to supporting your mental health journey. 
              Our experts are here to provide personalized care and evidence-based treatments.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty === "all" ? "All Specialties" : specialty}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="price">Lowest Price</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredTherapists.length} of {therapists.length} therapists
            </div>
          </div>
        </div>

        {/* Therapists Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredTherapists.map((therapist) => (
            <div key={therapist.therapist_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Therapist Image */}
              <div className="h-48 bg-[#2596be] flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#2596be] text-2xl font-bold">
                  {therapist.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>

              <div className="p-6">
                {/* Basic Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{therapist.name}</h3>
                  <p className="text-[#2596be] font-medium mb-2">{therapist.qualifications || "Licensed Therapist"}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <RatingDisplay rating={therapist.rating || 4.5} size={16} showValue={true} />
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">Licensed Professional</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4 mr-1" />
                    {therapist.experience_years || 0} years experience
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Languages className="w-4 h-4 mr-1" />
                    {therapist.languages || "English, Bengali"}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {therapist.location || "Dhaka, Bangladesh"}
                  </div>
                </div>

                {/* Fees */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Consultation Fee: </span>
                    ৳{therapist.consultation_fee || 2000}
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {therapist.bio || "Experienced mental health professional dedicated to helping clients achieve their wellness goals."}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button 
                    onClick={() => handleOpenBookingModal(therapist)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#2596be] text-white px-4 py-2 rounded-lg hover:bg-[#1d7a99] transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </button>
                  <Link 
                    href={`/experts/${therapist.therapist_id}`}
                    className="w-full inline-flex items-center justify-center gap-2 border border-[#2596be] text-[#2596be] px-4 py-2 rounded-lg hover:bg-[#2596be]/5 transition-colors"
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTherapists.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No therapists found matching your criteria.</p>
            <button 
              onClick={() => {
                setSelectedSpecialty("all");
                setSortBy("rating");
              }}
              className="bg-[#2596be] text-white px-4 py-2 rounded-lg hover:bg-[#1d7a99] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Can't find the right expert for you?
            </h2>
            <p className="text-gray-600 mb-6">
              Our team can help you find the perfect match based on your specific needs and preferences.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#2596be] text-white px-6 py-3 rounded-lg hover:bg-[#1d7a99] transition-colors"
            >
              Get Personalized Recommendations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedTherapist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-900">Book Appointment</h3>
              <button
                onClick={handleCloseBookingModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Therapist Card */}
              <div className="bg-gradient-to-br from-[#2596be]/10 to-[#1d7a99]/10 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#2596be] to-[#1d7a99] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedTherapist.name.charAt(0)}
                    </div>
                  </div>

                  {/* Therapist Info */}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedTherapist.name}
                    </h4>
                    <p className="text-[#2596be] font-medium mb-3">
                      {selectedTherapist.qualifications || "Licensed Therapist"}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{selectedTherapist.rating || 4.5}</span>
                        <span className="ml-1">Rating</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedTherapist.experience_years || 0} years exp.
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Languages className="w-4 h-4 mr-1" />
                        {selectedTherapist.languages || "English, Bengali"}
                      </div>

                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {selectedTherapist.location || "Dhaka"}
                      </div>
                    </div>

                    {/* Consultation Fee */}
                    <div className="mt-3 pt-3 border-t border-[#2596be]/20">
                      <p className="text-sm text-gray-600">Consultation Fee</p>
                      <p className="text-xl font-bold text-gray-900">
                        ৳{selectedTherapist.consultation_fee || 2000}
                        <span className="text-sm font-normal text-gray-500 ml-1">/ session</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={dayjs().add(1, "day").format("YYYY-MM-DD")}
                  max={dayjs().add(30, "days").format("YYYY-MM-DD")}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                />
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                
                {slotsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2596be] mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading available slots...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No available slots for this date</p>
                    <p className="text-sm text-gray-500 mt-1">Please try another date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2">
                    {availableSlots.map((slot, idx) => {
                      const isSelected = selectedSlot?.start === slot.start;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            isSelected
                              ? 'border-[#2596be] bg-[#2596be] text-white shadow-md'
                              : 'border-gray-200 hover:border-[#2596be] hover:bg-[#2596be]/5 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dayjs(slot.start).format("hh:mm A")}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Session Details</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Session duration: 45-60 minutes</li>
                      <li>• You'll receive confirmation via email and SMS</li>
                      <li>• Please arrive 5 minutes before your appointment</li>
                      <li>• Cancellation allowed up to 24 hours before</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={handleCloseBookingModal}
                disabled={isBooking}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={!selectedSlot || isBooking}
                className="flex-1 px-6 py-3 bg-[#2596be] text-white rounded-lg hover:bg-[#1d7a99] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBooking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}