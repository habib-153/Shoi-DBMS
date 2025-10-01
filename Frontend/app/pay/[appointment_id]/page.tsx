"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import dayjs from "dayjs";
import { CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";

type Details = {
  payment_id: number;
  amount: number;
  currency: string;
  status: string;
  provider_ref: string | null;
  display_name: string | null;
  appointment_id: number;
  appointment_status: string;
  start_time: string;
  end_time: string;
  therapist_name: string;
};

export default function PayPage() {
  const params = useParams();
  const search = useSearchParams();

  // dynamic segment auto detect (folder must be pay/[appointment_id])
  const segKey = Object.keys(params)[0];
  const appointmentId = Number((params as any)[segKey]);

  const pidFromQuery = search.get("pid");
  const [paymentId, setPaymentId] = useState<number | null>(pidFromQuery ? Number(pidFromQuery) : null);
  const [details, setDetails] = useState<Details | null>(null);
  const [provider, setProvider] = useState("bKash");
  const [trx, setTrx] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function boot() {
      try {
        if (!Number.isFinite(appointmentId)) throw new Error("Invalid appointment ID in URL.");

        // pid থাকলে সরাসরি details আনুন
        if (paymentId) { await fetchDetails(paymentId); return; }

        // না থাকলে intent বানান
        const res = await fetch("/api/payments/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointment_id: appointmentId, user_id: 1 }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok || !data.payment_id) throw new Error(data.message || `Could not initialize payment (${res.status})`);
        setPaymentId(data.payment_id);
        await fetchDetails(data.payment_id);
      } catch (e: any) {
        console.error(e);
        alert(e?.message || "Could not initialize payment. Please try again.");
      }
    }
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDetails(pid: number) {
    const r = await fetch(`/api/payments/details?payment_id=${pid}`);
    const j = await r.json();
    if (!r.ok || !j.ok || !j.data) throw new Error(j.message || "Failed to load payment details");
    setDetails(j.data);
  }

  async function confirm() {
    if (!paymentId) return alert("Payment ID missing");
    if (!trx.trim()) return alert("Enter transaction/reference number");

    setLoading(true);
    try {
      const r = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId, provider, provider_ref: trx.trim() }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.message || "Failed to confirm payment");
      setDone(true);
      await fetchDetails(paymentId);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-3xl bg-gradient-to-r from-[#e0f2f1] to-[#2596be]/20 p-8 border border-[#2596be]/20">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1f6d89] flex items-center gap-3">
          <CreditCard className="w-8 h-8" /> Secure Payment
        </h1>
        <p className="mt-2 text-gray-700">
          Complete your booking with a fast, secure payment. You'll receive a confirmation instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Summary */}
        <div className="lg:col-span-2 rounded-3xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-[#1f6d89]">Appointment Summary</h3>
          {details ? (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Therapist</span><span className="font-medium">{details.therapist_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Date</span><span className="font-medium">{dayjs(details.start_time).format("DD MMM YYYY")}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Time</span><span className="font-medium">{dayjs(details.start_time).format("h:mm A")} – {dayjs(details.end_time).format("h:mm A")}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Appointment Status</span><span className="font-medium">{details.appointment_status}</span></div>
            </div>
          ) : (
            <div className="mt-4 text-gray-500">Loading details…</div>
          )}

          <div className="mt-8">
            <h4 className="text-lg font-semibold text-[#1f6d89]">Choose Payment Method</h4>
            <div className="mt-3 flex flex-wrap gap-3">
              {["bKash", "Nagad", "Card (SSLCOMMERZ)", "Cash"].map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-4 py-2 rounded-full border transition ${
                    provider === p ? "bg-[#2596be] text-white border-[#2596be]" : "bg-white text-[#2596be] border-[#2596be]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-sm text-gray-600">Transaction / Reference Number</label>
              <input
                value={trx}
                onChange={e => setTrx(e.target.value)}
                placeholder="e.g., BK123XYZ890 or SSLC-REF-XXXXX"
                className="mt-2 w-full rounded-xl border px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                In production: open provider checkout and set the returned reference here automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Pay box */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payable Amount</span>
              <div className="text-2xl font-bold text-[#1f6d89]">
                {details ? `${details.amount} ${details.currency}` : "—"}
              </div>
            </div>

            <button
              onClick={confirm}
              disabled={!details || loading}
              className="mt-6 w-full rounded-xl bg-[#2596be] text-white py-3 font-semibold disabled:opacity-50"
            >
              {loading ? "Processing…" : "Pay & Confirm"}
            </button>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4" /> 256-bit encryption • Refunds if session canceled
            </div>

            {done && (
              <div className="mt-6 rounded-xl border bg-[#e8fff3] text-[#066e3b] p-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Payment successful! Your appointment is confirmed.
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
