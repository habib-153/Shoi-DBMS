"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Filter, Search, Star, Award, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Specialty {
  specialty_id: number;
  name: string;
  description: string;
}

interface Therapist {
  therapist_id: number;
  name: string;
  email: string;
  license_no: string;
  years_experience: number;
  gender: string;
  fees_min: number;
  fees_max: number;
  bio: string;
  languages: string;
  rating: number;
  interesterd_field: string;
  educational_info: string;
  image: string;
  specialties?: Specialty[];
}

interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string;
}

export default function AppointmentsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock user data - in real app, get from auth context
  const [currentUser] = useState<User>({
    user_id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+8801234567890"
  });
  
  // Form fields matching your schema
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60); // minutes
  const [appointmentStatus] = useState<"pending" | "scheduled" | "cancelled" | "completed">("pending");

  // Filter state
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  useEffect(() => {
    fetchTherapists();
    fetchSpecialties();
  }, []);

  const fetchTherapists = async () => {
    try {
      const response = await fetch('/api/therapists-with-specialties');
      const data = await response.json();
      if (response.ok) {
        setTherapists(data.therapists || []);
      } else {
        // Fallback to existing therapists API
        const fallbackResponse = await fetch('/api/therapists');
        const fallbackData = await fallbackResponse.json();
        if (fallbackResponse.ok) {
          setTherapists(fallbackData.therapists || []);
        }
      }
    } catch (error) {
      console.error('Error fetching therapists:', error);
      toast.error('Failed to load therapists');
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/specialties');
      const data = await response.json();
      if (response.ok) {
        setSpecialties(data.specialties || []);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
      // Continue without specialties filter
    }
  };

  const calculateEndTime = (startDateTime: string, durationMin: number): string => {
    const start = new Date(startDateTime);
    const end = new Date(start.getTime() + durationMin * 60000);
    return end.toISOString().slice(0, 19).replace('T', ' ');
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTherapist || !selectedDate || !startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDateTime = `${selectedDate} ${startTime}:00`;
    const endDateTime = calculateEndTime(startDateTime, sessionDuration);

    const appointmentData = {
      user_id: currentUser.user_id,
      therapist_id: selectedTherapist.therapist_id,
      start_time: startDateTime,
      end_time: endDateTime,
      status: appointmentStatus
    };

    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Appointment booked successfully!');
        resetForm();
      } else {
        toast.error(data.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTherapist(null);
    setShowBookingForm(false);
    setSelectedDate("");
    setStartTime("");
    setSessionDuration(60);
  };

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.interesterd_field?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.educational_info?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !filterSpecialty || 
                            therapist.specialties?.some(s => s.name.toLowerCase().includes(filterSpecialty.toLowerCase())) ||
                            therapist.interesterd_field?.toLowerCase().includes(filterSpecialty.toLowerCase());
    
    const matchesGender = !filterGender || therapist.gender?.toLowerCase() === filterGender.toLowerCase();
    
    const matchesExperience = !filterExperience || (therapist.years_experience || 0) >= parseInt(filterExperience);
    
    const matchesRating = !filterRating || (therapist.rating || 0) >= parseFloat(filterRating);
    
    const matchesPrice = (!therapist.fees_min || therapist.fees_min >= priceRange.min) && 
                        (!therapist.fees_max || therapist.fees_max <= priceRange.max);
    
    return matchesSearch && matchesSpecialty && matchesGender && matchesExperience && matchesRating && matchesPrice;
  });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  const durationOptions = [30, 45, 60, 90, 120];

  // Get today's date for minimum date selection
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2596be]/10 via-sky-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2596be] mb-2">সই — Book an Appointment</h1>
          <p className="text-gray-600">Find and book appointments with qualified mental health professionals</p>
        </div>

        {!showBookingForm ? (
          <>
            {/* Advanced Search and Filter Section */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Find Your Perfect Therapist</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="Search by name, specialty, or education..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                >
                  <option value="">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty.specialty_id} value={specialty.name}>
                      {specialty.name}
                    </option>
                  ))}
                  <option value="anxiety">Anxiety</option>
                  <option value="depression">Depression</option>
                  <option value="stress">Stress Management</option>
                  <option value="relationship">Relationship Counseling</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                >
                  <option value="">Any Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                  value={filterExperience}
                  onChange={(e) => setFilterExperience(e.target.value)}
                >
                  <option value="">Any Experience</option>
                  <option value="1">1+ Years</option>
                  <option value="3">3+ Years</option>
                  <option value="5">5+ Years</option>
                  <option value="10">10+ Years</option>
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>

                <div className="flex items-center gap-2">
                  <label className="text-sm">Price Range:</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                    className="w-20"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 10000})}
                    className="w-20"
                  />
                </div>

                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterSpecialty("");
                    setFilterGender("");
                    setFilterExperience("");
                    setFilterRating("");
                    setPriceRange({ min: 0, max: 10000 });
                  }}
                  variant="outline"
                  className="border-[#2596be] text-[#2596be]"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </Card>

            {/* Therapists Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTherapists.map((therapist) => (
                <Card key={therapist.therapist_id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center overflow-hidden">
                      {therapist.image ? (
                        <img src={therapist.image} alt={therapist.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-[#2596be]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{therapist.name}</h3>
                      <p className="text-sm text-gray-600">{therapist.educational_info}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{Number(therapist.rating || 0).toFixed(1) || 'New'}</span>
                        </div>
                        {therapist.gender && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {therapist.gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      <Award className="w-4 h-4 inline mr-1" />
                      <strong>Experience:</strong> {therapist.years_experience || 0} years
                    </p>
                    {therapist.license_no && (
                      <p className="text-xs text-gray-500">License: {therapist.license_no}</p>
                    )}
                  </div>

                  {/* Specialties */}
                  {therapist.specialties && therapist.specialties.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {therapist.specialties.slice(0, 3).map(specialty => (
                          <span key={specialty.specialty_id} className="text-xs bg-[#2596be]/10 text-[#2596be] px-2 py-1 rounded-full">
                            {specialty.name}
                          </span>
                        ))}
                        {therapist.specialties.length > 3 && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            +{therapist.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interested Field */}
                  {therapist.interesterd_field && (
                    <div className="mb-3">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Focus: {therapist.interesterd_field}
                      </span>
                    </div>
                  )}

                  {/* Languages */}
                  {therapist.languages && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Languages:</strong> {therapist.languages}
                      </p>
                    </div>
                  )}

                  {therapist.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{therapist.bio}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Session Fee: </span>
                      <span className="text-[#2596be] font-semibold">
                        ৳{therapist.fees_min || 1000} - ৳{therapist.fees_max || 3000}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      setSelectedTherapist(therapist);
                      setShowBookingForm(true);
                    }}
                    className="w-full bg-[#2596be] hover:bg-[#1d7a99] text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </Card>
              ))}
            </div>

            {filteredTherapists.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No therapists found matching your criteria.</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              </Card>
            )}
          </>
        ) : (
          /* Booking Form */
          <Card className="max-w-3xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#2596be]">Schedule Your Session</h2>
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="border-gray-300"
              >
                ← Back to Therapists
              </Button>
            </div>

            {/* Current User Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">Booking for:</h4>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#2596be]/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#2596be]" />
                </div>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-gray-600">{currentUser.email}</p>
                  <p className="text-sm text-gray-600">{currentUser.phone}</p>
                </div>
              </div>
            </div>

            {selectedTherapist && (
              <div className="bg-gradient-to-r from-[#2596be]/5 to-sky-50 rounded-lg p-6 mb-6">
                <h4 className="font-medium mb-3">Selected Therapist:</h4>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#2596be]/10 rounded-full flex items-center justify-center overflow-hidden">
                    {selectedTherapist.image ? (
                      <img src={selectedTherapist.image} alt={selectedTherapist.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-[#2596be]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedTherapist.name}</h3>
                    <p className="text-sm text-gray-600">{selectedTherapist.educational_info}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{Number(selectedTherapist.rating || 0).toFixed(1) || 'New'}</span>
                      </div>
                      <span className="text-sm text-[#2596be] font-medium">
                        ৳{selectedTherapist.fees_min || 1000} - ৳{selectedTherapist.fees_max || 3000} per session
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedTherapist.years_experience || 0} years exp.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Appointment Date *
                  </label>
                  <Input
                    type="date"
                    required
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Start Time *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    <option value="">Select start time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Session Duration *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                  >
                    {durationOptions.map(duration => (
                      <option key={duration} value={duration}>
                        {duration} minutes
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDate && startTime && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Session End Time</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                      {(() => {
                        const start = new Date(`${selectedDate} ${startTime}`);
                        const end = new Date(start.getTime() + sessionDuration * 60000);
                        return end.toTimeString().slice(0, 5);
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Session Cost Calculation */}
              {selectedTherapist && sessionDuration && (
                <div className="bg-[#2596be]/5 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Session Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{sessionDuration} minutes</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fee Range:</span>
                      <span className="ml-2 font-semibold text-[#2596be]">
                        ৳{selectedTherapist.fees_min || 1000} - ৳{selectedTherapist.fees_max || 3000}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium text-orange-600">Pending Confirmation</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Therapist ID:</span>
                      <span className="ml-2 font-medium">{selectedTherapist.therapist_id}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Final fee will be confirmed by the therapist before the session
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Booking Information</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Your appointment will be marked as "Pending" until confirmed by the therapist</li>
                  <li>• You will receive a confirmation email once the therapist approves your request</li>
                  <li>• Please arrive 5-10 minutes early for your session</li>
                  <li>• You can reschedule or cancel up to 24 hours before your appointment</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2596be] hover:bg-[#1d7a99] text-white py-3 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Booking Your Session...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Confirm Appointment Booking
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}