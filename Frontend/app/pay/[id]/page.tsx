"use client";

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, RequireAuth } from '@/lib/auth-context';
import { CheckCircle, CreditCard, Calendar, User, Smartphone, Building2, Wallet } from 'lucide-react';

type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card' | 'bank';

function PaymentPageContent({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const paymentId = searchParams.get('pid');
  const resolvedParams = use(params);
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    // Fetch appointment details
    fetch(`/api/appointments/${resolvedParams.id}`)
      .then(r => r.json())
      .then(data => {
        console.log('Appointment data:', data);
        setAppointment(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching appointment:', err);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', icon: '📱', color: 'bg-pink-500' },
    { id: 'nagad', name: 'Nagad', icon: '💰', color: 'bg-orange-500' },
    { id: 'rocket', name: 'Rocket', icon: '🚀', color: 'bg-purple-500' },
    { id: 'card', name: 'Card', icon: '💳', color: 'bg-blue-500' },
    { id: 'bank', name: 'Bank', icon: '🏦', color: 'bg-green-500' },
  ];

  const handlePayment = async () => {
    if (!phoneNumber && (selectedMethod === 'bkash' || selectedMethod === 'nagad' || selectedMethod === 'rocket')) {
      alert('Please enter your phone number');
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      const paymentResponse = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'completed',
          payment_method: selectedMethod,
          phone_number: phoneNumber,
          transaction_id: transactionId || `TXN-${Date.now()}`
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment update failed');
      }

      // Update appointment status to paid
      const appointmentResponse = await fetch(`/api/appointments/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });

      if (appointmentResponse.ok) {
        alert('✅ Payment successful! Your appointment is confirmed.');
        router.push('/dashboard');
      } else {
        throw new Error('Appointment update failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">⚠️ Appointment not found</p>
          <button 
            onClick={() => router.push('/appointments')}
            className="px-6 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ba0]"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  const amount = appointment.fees_min || appointment.amount || 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <CreditCard className="w-16 h-16 text-[#2596be] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600 mt-2">Choose your preferred payment method</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Appointment Details */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Appointment Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Therapist</p>
                    <p className="font-medium">{appointment.therapist_name || 'Dr. Therapist'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {appointment.start_time ? new Date(appointment.start_time).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount</span>
                    <span className="text-2xl font-bold text-[#2596be]">৳{amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment Methods */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Select Payment Method</h2>

              {/* Payment Method Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-[#2596be] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <div className="font-medium">{method.name}</div>
                  </button>
                ))}
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                {(selectedMethod === 'bkash' || selectedMethod === 'nagad' || selectedMethod === 'rocket') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Instructions:</strong>
                      </p>
                      <ol className="text-sm text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                        <li>Dial *{selectedMethod === 'bkash' ? '247' : selectedMethod === 'nagad' ? '167' : '322'}# from your mobile</li>
                        <li>Select "Send Money"</li>
                        <li>Enter merchant number: 01XXXXXXXXX</li>
                        <li>Enter amount: ৳{amount}</li>
                        <li>Enter your PIN and confirm</li>
                      </ol>
                    </div>
                  </>
                )}

                {selectedMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'bank' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Bank Transfer Details:</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Bank Name:</strong> Example Bank Ltd.</p>
                      <p><strong>Account Name:</strong> Rahi Mental Health</p>
                      <p><strong>Account Number:</strong> 1234567890</p>
                      <p><strong>Branch:</strong> Dhaka Main Branch</p>
                      <p className="mt-2 text-xs text-gray-500">
                        Please use your appointment ID ({resolvedParams.id}) as reference
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID if you have one"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2596be] focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-[#2596be] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#1e7ba0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Pay ৳{amount}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 Your payment is secure and encrypted. You will receive a confirmation email after successful payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();

  return (
    <RequireAuth
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2596be]/10 via-sky-50 to-indigo-50">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to complete payment.</p>
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
      <PaymentPageContent params={params} />
    </RequireAuth>
  );
}
