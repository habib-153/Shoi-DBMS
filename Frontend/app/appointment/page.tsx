"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

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

export default function AppointmentPage() {
  const router = useRouter();

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

  // filters
  const [gender, setGender] = useState<"" | "Male" | "Female" | "Other">("");
  const [minRating, setMinRating] = useState<number>(0);
  const [feeMin, setFeeMin] = useState<number>(0);
  const [feeMax, setFeeMax] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<"rating" | "feeAsc" | "feeDesc" | "experience">("rating");

  const DEMO_USER_ID = 1;

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

  useEffect(() => {
    if (!selectedTherapist || !date) return;
    setPickedSlot(null);
    fetch(`/api/slots?therapist_id=${selectedTherapist.therapist_id}&date=${date}`)
      .then(r => r.json())
      .then((data: Slot[]) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]));
  }, [selectedTherapist, date]);

  const headerTitle = useMemo(() => {
    const s = specialties.find(x => x.specialty_id === activeSpec)?.name ?? "Appointment";
    return `Book a ${s}`;
  }, [specialties, activeSpec]);

  const filteredTherapists = useMemo(() => {
    let list = [...therapists];
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
  }, [therapists, gender, minRating, feeMin, feeMax, sortBy]);

  // ====== IMPORTANT: force-redirect bookNow ======
  async function bookNow() {
    if (!selectedTherapist || !pickedSlot) {
      alert("Please select a therapist and time slot");
      return;
    }

    try {
      // 1) appointment
      const r1 = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: DEMO_USER_ID,
          therapist_id: selectedTherapist.therapist_id,
          start_time: pickedSlot.start,
          end_time: pickedSlot.end,
        }),
      });
      const j1 = await r1.json();
      if (!r1.ok || !j1.ok || !j1.appointment_id) {
        throw new Error(j1.message || `Appointment failed (${r1.status})`);
      }

      // 2) payment intent
      const r2 = await fetch("/api/payments/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: j1.appointment_id, user_id: DEMO_USER_ID }),
      });
      const j2 = await r2.json();
      if (!r2.ok || !j2.ok || !j2.payment_id) {
        throw new Error(j2.message || `Payment init failed (${r2.status})`);
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
      alert(err?.message || "Could not complete booking.");
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-[#2596be]/20 bg-gradient-to-r from-[#e0f2f1] to-[#2596be]/15">
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
          {!filteredTherapists.length && <div className="col-span-2 text-gray-600">No therapists match the filters.</div>}
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
                <div className="grid grid-cols-2 gap-2">
                  {slots.map(s => (
                    <button
                      key={s.start}
                      onClick={() => setPickedSlot(s)}
                      className={`text-sm px-3 py-2 rounded-xl border flex items-center gap-2 ${
                        pickedSlot?.start === s.start ? "bg-[#2596be] text-white border-[#2596be]" : "bg-white"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {dayjs(s.start).format("h:mm A")}
                    </button>
                  ))}
                </div>
                {!selectedTherapist && <p className="text-xs text-gray-500 mt-2">Pick a therapist to see slots.</p>}
              </div>
            </div>

            <button onClick={bookNow} disabled={!selectedTherapist || !pickedSlot} className="mt-6 w-full rounded-xl bg-[#2596be] text-white py-3 font-semibold disabled:opacity-50">
              Confirm & Continue
            </button>
            <p className="mt-3 text-xs text-gray-500">You'll be redirected to payment on the next step.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
