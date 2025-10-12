"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, RequireAuth } from "@/lib/auth-context";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import {
  Calendar,
  Clock,
  ChevronRight,
  Phone,
  SlidersHorizontal,
  Star,
  Search,
} from "lucide-react";
import { toast } from "sonner";

type Specialty = { specialty_id: number; name: string };
type Therapist = {
  therapist_id: number;
  name: string;
  email: string;
  qualifications: string;
  specialty_id: number | null;
  education: string | null;
  experience: string | null;
  license_no: string | null;
  years_experience: number | null;
  gender: string | null;
  fees_min: number | null;
  fees_max: number | null;
  languages: string | null;
  rating: number | null;
  image: string | null;
};
type Slot = { start: string; end: string };

function AppointmentPageContent() {
  const router = useRouter();
  const { user } = useAuth();

  // tabs
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [activeSpec, setActiveSpec] = useState<number | null>(null);

  // data
  const [allTherapists, setAllTherapists] = useState<Therapist[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  // booking
  const [date, setDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pickedSlot, setPickedSlot] = useState<Slot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [blockedSlotStart, setBlockedSlotStart] = useState<string | null>(null);

  // filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [gender, setGender] = useState<"" | "Male" | "Female" | "Other">("");
  const [minRating, setMinRating] = useState<number>(0);
  const [feeMin, setFeeMin] = useState<number>(0);
  const [feeMax, setFeeMax] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<"rating" | "feeAsc" | "feeDesc" | "experience">("rating");

  // init
  useEffect(() => {
    setSpecialties([
      { specialty_id: 1, name: "Psychologist" },
      { specialty_id: 2, name: "Psychiatrist" },
    ]);
    setActiveSpec(2);
  }, []);

  useEffect(() => {
    fetch("/api/therapists")
      .then(r => r.json())
      .then((data: Therapist[]) => (Array.isArray(data) ? setAllTherapists(data) : setAllTherapists([])))
      .catch(() => setAllTherapists([]));
  }, []);

  useEffect(() => {
    if (!allTherapists.length) return;
    const mins = allTherapists.map(t => t.fees_min ?? 0);
    const maxs = allTherapists.map(t => t.fees_max ?? 0);
    setFeeMin(Math.min(...mins.filter(n => n > 0), 500) || 500);
    setFeeMax(Math.max(...maxs, 2000) || 2000);
  }, [allTherapists]);

  useEffect(() => {
    const next = allTherapists.filter(t => {
      if (activeSpec === 1) return !t.license_no; // Psychologist
      if (activeSpec === 2) return !!t.license_no; // Psychiatrist
      return true;
    });
    setTherapists(next);
    setSelectedTherapist(null);
    setPickedSlot(null);
  }, [activeSpec, allTherapists]);

  // Function to refresh slots
  const refreshSlots = useCallback(() => {
    if (!selectedTherapist || !date) return;
    setSlotsLoading(true);
    fetch(`/api/slots?therapist_id=${selectedTherapist.therapist_id}&date=${date}`)
      .then(r => r.json())
      .then((data: Slot[]) => {
        const newSlots = Array.isArray(data) ? data : [];
        setSlots(newSlots);
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedTherapist, date]);

  // Separate effect to check if selected slot is still available
  // TEMPORARILY DISABLED - causing selection issues
  // useEffect(() => {
  //   if (pickedSlot && slots.length > 0) {
  //     const isSlotStillAvailable = slots.some(slot => slot.start === pickedSlot.start);
  //     if (!isSlotStillAvailable) {
  //       setPickedSlot(null);
  //       toast.warning("Your selected time slot is no longer available. Please select another slot.");
  //     }
  //   }
  // }, [slots, pickedSlot]);

  useEffect(() => {
    if (!selectedTherapist || !date) return;
    setPickedSlot(null);
    refreshSlots();
  }, [selectedTherapist, date, refreshSlots]);

  // Real-time slot updates - refresh every 30 seconds when therapist and date are selected
  // TEMPORARILY DISABLED - causing selection issues
  // useEffect(() => {
  //   if (!selectedTherapist || !date) return;
    
  //   const interval = setInterval(() => {
  //     refreshSlots();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [selectedTherapist, date, refreshSlots]);

  const headerTitle = useMemo(() => {
    const s = specialties.find(x => x.specialty_id === activeSpec)?.name ?? "Appointment";
    return `Book a ${s}`;
  }, [specialties, activeSpec]);

  const filteredTherapists = useMemo(() => {
    let list = [...therapists];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        t.name.toLowerCase().includes(query) ||
        (t.qualifications || "").toLowerCase().includes(query) ||
        (t.languages || "").toLowerCase().includes(query) ||
        (t.education || "").toLowerCase().includes(query)
      );
    }
    
    if (gender) list = list.filter(t => (t.gender || "").toLowerCase() === gender.toLowerCase());
    if (minRating > 0) list = list.filter(t => (t.rating ?? 0) >= minRating);
    list = list.filter(t => {
      const fmin = t.fees_min ?? 0;
      const fmax = t.fees_max ?? fmin;
      return fmax >= feeMin && fmin <= feeMax;
    });
    switch (sortBy) {
      case "feeAsc": list.sort((a, b) => (a.fees_min ?? 0) - (b.fees_min ?? 0)); break;
      case "feeDesc": list.sort((a, b) => (b.fees_min ?? 0) - (a.fees_min ?? 0)); break;
      case "experience": list.sort((a, b) => (b.years_experience ?? 0) - (a.years_experience ?? 0)); break;
      default: list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return list;
  }, [therapists, searchQuery, gender, minRating, feeMin, feeMax, sortBy]);

  // ====== IMPORTANT: force-redirect bookNow ======
  async function bookNow() {
    if (!selectedTherapist || !pickedSlot || isBooking) {
      if (isBooking) return; // Prevent double-clicks
      toast.warning("Please select a therapist and time slot");
      return;
    }

    // Store the current picked slot
    const bookedSlot = pickedSlot;
    
    // IMMEDIATELY mark this slot as blocked to make it unselectable
    setBookedSlots(prev => new Set([...prev, bookedSlot.start]));
    setBlockedSlotStart(bookedSlot.start);
    
    setIsBooking(true);

    try {
      // 1) appointment
      const r1 = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.user_id || user?.therapist_id,
          therapist_id: selectedTherapist.therapist_id,
          start_time: bookedSlot.start,
          end_time: bookedSlot.end,
        }),
      });
      const j1 = await r1.json();
      
      console.log('Appointment response:', j1); // Debug log
      console.log('Response status:', r1.status, 'OK:', r1.ok);
      console.log('JSON ok field:', j1.ok, 'appointment_id:', j1.appointment_id, 'type:', typeof j1.appointment_id);
      
      if (!r1.ok) {
        console.log('HTTP request failed');
        throw new Error(j1.message || `Appointment failed (${r1.status})`);
      }
      
      if (!j1.ok) {
        console.log('API response indicates failure');
        throw new Error(j1.message || 'Failed to create appointment');
      }
      
      if (typeof j1.appointment_id !== 'number' || j1.appointment_id < 0) {
        console.log('Invalid appointment ID in response:', j1.appointment_id);
        throw new Error('Failed to get valid appointment ID');
      }
      
      console.log('Appointment created successfully with ID:', j1.appointment_id);

      // Show success notification
      toast.success("Appointment booked successfully! Redirecting to payment...");

      // Refresh slots to get the latest state from server
      refreshSlots();

      // 2) payment intent
      const r2 = await fetch("/api/payments/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: j1.appointment_id, user_id: user?.user_id || user?.therapist_id }),
      });
      const j2 = await r2.json();
      
      console.log('Payment response:', j2); // Debug log
      
      if (!r2.ok) {
        throw new Error(j2.message || `Payment init failed (${r2.status})`);
      }
      
      if (!j2.ok || !j2.payment_id) {
        throw new Error(j2.message || 'Failed to get payment ID');
      }

      // 3) redirect URL
      const target = `/pay/${j1.appointment_id}?pid=${j2.payment_id}`;
      const abs = new URL(target, window.location.origin).toString();
      console.log("[BOOK] redirect:", abs);

      // try router first
      try { router.push(target); } catch {}
      // force fallback (যেকোনো পরিস্থিতিতে নেবে)
      setTimeout(() => {
        if (window.location.href !== abs) window.location.assign(abs);
      }, 60);
    } catch (err: any) {
      console.error(err);
      // Restore the slot if booking failed
      setBookedSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookedSlot.start);
        return newSet;
      });
      setBlockedSlotStart(null);
      setPickedSlot(bookedSlot);
      setIsBooking(false);
      toast.error(err?.message || "Could not complete booking. Please try again.");
    }
    // Note: we don't reset isBooking on success since we're redirecting
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/20 bg-gradient-modern">
        <div className="relative z-10 grid items-center gap-6 p-8 lg:p-10 md:grid-cols-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1f6d89]">{headerTitle}</h1>
            <p className="mt-2 text-gray-700">Pick your specialist, choose a time, and confirm. It's that simple.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur border">
                <Calendar className="w-4 h-4" /> Flexible online sessions
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur border">
                <Phone className="w-4 h-4" /> Helpline: 01xxxxxxxxx
              </span>
            </div>
          </div>
          <div className="relative mx-auto md:mx-0 w-full max-w-[520px]">
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#2596be]/25 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#1f6d89]/15 blur-3xl" />
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#2596be]/30 via-transparent to-transparent blur-[20px]" />
            <div className="relative z-10 rounded-[28px] border border-white/70 bg-white/80 backdrop-blur shadow-2xl">
              <div className="p-2 sm:p-3">
                <img src="/Appointment.jpg" alt="Easy appointment booking" className="block w-full rounded-[22px] object-cover" />
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/5 to-transparent" />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {specialties.map(s => (
          <button
            key={s.specialty_id}
            onClick={() => setActiveSpec(s.specialty_id)}
            className={`px-4 py-2 rounded-full border transition-all ${
              activeSpec === s.specialty_id ? "bg-[#2596be] text-white border-[#2596be]" : "bg-white text-[#2596be] border-[#2596be]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 card-modern border-0 p-4">
        <div className="flex items-center gap-2 text-primary font-semibold mb-3">
          <Search className="w-5 h-5" /> Search Therapists
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, qualifications, languages, or education..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 input-modern"
          />
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredTherapists.length} therapist{filteredTherapists.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}
        {!searchQuery && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Quick search:</p>
            <div className="flex flex-wrap gap-2">
              {["Psychology", "Psychiatry", "Anxiety", "Depression", "Counseling", "English", "Bengali", "Female", "Male"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-[#2596be] hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#1f6d89] font-semibold mb-3">
          <SlidersHorizontal className="w-5 h-5" /> Filters
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full rounded-xl border px-3 py-2">
              <option value="">Any</option><option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min rating</label>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="w-full" />
              <div className="w-12 text-sm font-medium flex items-center gap-1"><Star className="w-4 h-4" /> {minRating.toFixed(1)}</div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min fee (BDT)</label>
            <input type="number" value={feeMin} onChange={e => setFeeMin(Number(e.target.value))} className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max fee (BDT)</label>
            <input type="number" value={feeMax} onChange={e => setFeeMax(Number(e.target.value))} className="w-full rounded-xl border px-3 py-2" />
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort by</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="w-full rounded-xl border px-3 py-2">
              <option value="rating">Rating (high → low)</option>
              <option value="feeAsc">Fee (low → high)</option>
              <option value="feeDesc">Fee (high → low)</option>
              <option value="experience">Experience (high → low)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setGender(""); setMinRating(0);
                const mins = therapists.map(t => t.fees_min ?? 0);
                const maxs = therapists.map(t => t.fees_max ?? 0);
                setFeeMin(Math.min(...mins.filter(n => n > 0), 500) || 500);
                setFeeMax(Math.max(...maxs, 2000) || 2000);
                setSortBy("rating");
              }}
              className="rounded-xl border px-4 py-2 text-[#2596be] border-[#2596be]"
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
          {filteredTherapists.map(t => (
            <div
              key={t.therapist_id}
              className={`rounded-3xl border bg-white p-5 shadow-sm hover:shadow-lg transition ${selectedTherapist?.therapist_id === t.therapist_id ? "ring-2 ring-[#2596be]" : ""}`}
            >
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-[#1f6d89]">{t.name}</h3>
                    <span className="text-sm text-gray-500">⭐ {t.rating ?? "—"}</span>
                  </div>
                  {t.license_no && <p className="text-xs text-green-600 font-medium mt-1">license_no: {t.license_no}</p>}
                  {t.education && <p className="text-sm text-gray-700 mt-1">{t.education}</p>}
                  <p className="text-sm text-gray-600">
                    {t.experience ? `${t.experience} • ` : ""}{t.gender ?? "—"} • {t.languages ?? "—"}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#2596be]">
                    Fee: {t.fees_min ?? "—"}–{t.fees_max ?? "—"} BDT
                  </p>
                  <button onClick={() => setSelectedTherapist(t)} className="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#2596be] text-white hover:bg-[#1d7a99]">
                    Select <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!filteredTherapists.length && (
            <div className="col-span-2 text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? `No therapists match your search for "${searchQuery}"` : "No therapists match your current filters."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setGender(""); 
                  setMinRating(0);
                  const mins = therapists.map(t => t.fees_min ?? 0);
                  const maxs = therapists.map(t => t.fees_max ?? 0);
                  setFeeMin(Math.min(...mins.filter(n => n > 0), 500) || 500);
                  setFeeMax(Math.max(...maxs, 2000) || 2000);
                  setSortBy("rating");
                }}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-[#2596be] text-white hover:bg-[#1d7a99] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* booking panel */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 rounded-3xl border bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-[#1f6d89]">Your booking</h4>

            <div className="mt-4 space-y-4 text-sm">
              <div><div className="text-gray-500">Specialty</div><div className="font-medium">{specialties.find(s => s.specialty_id === activeSpec)?.name ?? "—"}</div></div>
              <div><div className="text-gray-500">Therapist</div><div className="font-medium">{selectedTherapist?.name ?? "Select a therapist"}</div></div>
              <div>
                <label className="text-gray-500 block mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-xl border px-3 py-2" min={dayjs().format("YYYY-MM-DD")} />
              </div>
              <div>
                <div className="text-gray-500 mb-2">Available Time</div>
                {slotsLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin w-6 h-6 border-2 border-[#2596be] border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading available slots...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map(s => {
                      const isBooked = bookedSlots.has(s.start) || blockedSlotStart === s.start;
                      const isSelected = pickedSlot?.start === s.start;
                      
                      return (
                        <button
                          key={s.start}
                          onClick={() => {
                            if (isBooked) return; // Don't allow selecting booked slots
                            console.log('Slot clicked:', s.start);
                            setPickedSlot(s);
                          }}
                          disabled={slotsLoading || isBooking || isBooked}
                          className={`text-sm px-3 py-2 rounded-xl border flex items-center gap-2 transition-colors ${
                            isSelected && isBooked
                              ? "bg-[#2596be]/50 text-white/70 border-[#2596be]/50 cursor-not-allowed opacity-60 blur-sm"
                              : isSelected 
                                ? "bg-[#2596be] text-white border-[#2596be]"
                                : isBooked
                                  ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-60 blur-sm"
                                  : "bg-white hover:bg-gray-50"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Clock className="w-4 h-4" />
                          {dayjs(s.start).format("h:mm A")}
                        </button>
                      );
                    })}
                    {slots.length === 0 && selectedTherapist && !slotsLoading && (
                      <div className="col-span-2 text-center py-4 text-gray-500">
                        No available slots for this date
                      </div>
                    )}
                  </div>
                )}
                {!selectedTherapist && <p className="text-xs text-gray-500 mt-2">Pick a therapist to see slots.</p>}
              </div>
            </div>

            <button 
              onClick={bookNow} 
              disabled={!selectedTherapist || !pickedSlot || isBooking} 
              className="mt-6 w-full rounded-xl bg-[#2596be] text-white py-3 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isBooking && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              )}
              {isBooking ? "Booking..." : "Confirm & Continue"}
            </button>
            <p className="mt-3 text-xs text-gray-500">You'll be redirected to payment on the next step.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function AppointmentPage() {
  const router = useRouter();

  return (
    <RequireAuth
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2596be]/10 via-sky-50 to-indigo-50">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to book appointments.</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-[#2596be] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2596be]/90 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      }
    >
      <AppointmentPageContent />
    </RequireAuth>
  );
}