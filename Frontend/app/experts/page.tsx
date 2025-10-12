"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Clock, Languages, GraduationCap, Award, Calendar, ArrowRight } from "lucide-react";

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

  const specialties = ["all", "Anxiety Disorders", "Depression", "Child Psychology", "Couples Therapy", "Trauma Recovery", "Addiction Recovery"];

  // Fetch therapists from API
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/therapists');
        if (!response.ok) {
          throw new Error('Failed to fetch therapists');
        }
        const data = await response.json();
        
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
      } catch (err) {
        setError('Failed to load therapists');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#2596be] text-white px-4 py-2 rounded-lg hover:bg-[#1d7a99] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-modern">
      {/* Header */}
      <div className="glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Meet Our Mental Health Experts
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              <div className="h-48 bg-gradient-to-br from-[#2596be] to-[#1d7a99] flex items-center justify-center">
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
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{therapist.rating || 4.5}</span>
                    </div>
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
                  <Link 
                    href="/appointments"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#2596be] text-white px-4 py-2 rounded-lg hover:bg-[#1d7a99] transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </Link>
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
    </div>
  );
}