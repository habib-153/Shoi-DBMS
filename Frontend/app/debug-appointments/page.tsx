"use client";

import { useEffect, useState } from 'react';

export default function AppointmentsDebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      localStorage: {},
      therapistInfo: null,
      appointmentsData: null,
      apiTest: null,
      errors: []
    };

    try {
      // Check localStorage
      const therapist = localStorage.getItem('therapist');
      const user = localStorage.getItem('user');
      results.localStorage = {
        therapist: therapist ? JSON.parse(therapist) : null,
        user: user ? JSON.parse(user) : null
      };

      const therapistData = therapist ? JSON.parse(therapist) : (user ? JSON.parse(user) : null);
      results.therapistInfo = therapistData;

      if (!therapistData?.therapist_id) {
        results.errors.push('❌ No therapist_id found in localStorage');
      } else {
        // Test API call
        const apiUrl = `/api/therapists/${therapistData.therapist_id}/appointments?status=confirmed,pending,scheduled`;
        console.log('Testing API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        results.apiTest = {
          url: apiUrl,
          status: response.status,
          response: data
        };

        if (data.success && data.appointments) {
          const now = new Date();
          results.appointmentsAnalysis = {
            total: data.appointments.length,
            future: data.appointments.filter((a: any) => new Date(a.start_time) > now).length,
            past: data.appointments.filter((a: any) => new Date(a.start_time) <= now).length,
            appointments: data.appointments.map((a: any) => ({
              id: a.appointment_id,
              user: a.user_name,
              time: a.start_time,
              status: a.status,
              isFuture: new Date(a.start_time) > now
            }))
          };
        }
      }

      // Fetch debug endpoints
      const debugAppts = await fetch('/api/debug-appointments');
      results.appointmentsData = await debugAppts.json();

      const debugTherapist = await fetch('/api/debug-therapist-info');
      const therapistDebug = await debugTherapist.json();
      results.therapistDebugInfo = therapistDebug;

    } catch (error: any) {
      results.errors.push(`Error: ${error.message}`);
    }

    setDiagnostics(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Running Diagnostics...</h1>
          <div className="animate-pulse">Please wait...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Appointments Debug Page</h1>
        
        {/* Errors */}
        {diagnostics?.errors?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ Errors Found</h2>
            {diagnostics.errors.map((err: string, i: number) => (
              <div key={i} className="text-red-700">{err}</div>
            ))}
          </div>
        )}

        {/* LocalStorage Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">1. LocalStorage Data</h2>
          <div className="bg-gray-50 p-4 rounded font-mono text-sm overflow-auto">
            <pre>{JSON.stringify(diagnostics?.localStorage, null, 2)}</pre>
          </div>
          {diagnostics?.therapistInfo?.therapist_id && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <strong className="text-green-800">✅ Therapist ID Found: {diagnostics.therapistInfo.therapist_id}</strong>
            </div>
          )}
        </div>

        {/* API Test */}
        {diagnostics?.apiTest && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">2. API Test Results</h2>
            <div className="mb-2"><strong>URL:</strong> {diagnostics.apiTest.url}</div>
            <div className="mb-2"><strong>Status:</strong> {diagnostics.apiTest.status}</div>
            <div className="bg-gray-50 p-4 rounded font-mono text-sm overflow-auto">
              <pre>{JSON.stringify(diagnostics.apiTest.response, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Appointments Analysis */}
        {diagnostics?.appointmentsAnalysis && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">3. Appointments Analysis</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{diagnostics.appointmentsAnalysis.total}</div>
                <div className="text-sm text-blue-800">Total Appointments</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{diagnostics.appointmentsAnalysis.future}</div>
                <div className="text-sm text-green-800">Future Appointments</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-2xl font-bold text-gray-600">{diagnostics.appointmentsAnalysis.past}</div>
                <div className="text-sm text-gray-800">Past Appointments</div>
              </div>
            </div>
            
            {diagnostics.appointmentsAnalysis.future === 0 && diagnostics.appointmentsAnalysis.total > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded p-4 mb-4">
                <strong className="text-orange-800">⚠️ All appointments are in the past!</strong>
                <p className="text-orange-700 text-sm mt-2">You need to create appointments with future dates.</p>
              </div>
            )}

            <h3 className="font-bold mb-2">Appointment Details:</h3>
            <div className="space-y-2">
              {diagnostics.appointmentsAnalysis.appointments?.map((apt: any) => (
                <div 
                  key={apt.id} 
                  className={`p-3 rounded border ${apt.isFuture ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div><strong>ID:</strong> {apt.id}</div>
                      <div><strong>User:</strong> {apt.user}</div>
                      <div><strong>Time:</strong> {apt.time}</div>
                      <div><strong>Status:</strong> {apt.status}</div>
                    </div>
                    <div className={`px-3 py-1 rounded text-sm font-bold ${apt.isFuture ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                      {apt.isFuture ? '✅ FUTURE' : '❌ PAST'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database Info */}
        {diagnostics?.appointmentsData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">4. Database Debug Info</h2>
            <div className="bg-gray-50 p-4 rounded font-mono text-sm overflow-auto max-h-96">
              <pre>{JSON.stringify(diagnostics.appointmentsData, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Therapist Debug Info */}
        {diagnostics?.therapistDebugInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">5. Therapist Debug Info</h2>
            <div className="bg-gray-50 p-4 rounded font-mono text-sm overflow-auto max-h-96">
              <pre>{JSON.stringify(diagnostics.therapistDebugInfo, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">🔧 Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={runDiagnostics}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔄 Re-run Diagnostics
            </button>
            <div className="mt-4">
              <a 
                href="/therapist/dashboard" 
                className="text-blue-600 hover:underline"
              >
                ← Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Raw Data */}
        <details className="mt-6">
          <summary className="cursor-pointer text-lg font-bold mb-2">Show Raw Diagnostics Data</summary>
          <div className="bg-gray-100 p-4 rounded font-mono text-xs overflow-auto">
            <pre>{JSON.stringify(diagnostics, null, 2)}</pre>
          </div>
        </details>
      </div>
    </div>
  );
}
