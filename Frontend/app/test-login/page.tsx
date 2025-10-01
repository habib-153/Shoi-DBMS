"use client";

import { useEffect } from 'react';

export default function TestLogin() {
  useEffect(() => {
    // Set test user data based on your actual database
    const testUser = {
      user_id: 1, // Use actual user ID from your database
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    };

    localStorage.setItem('user', JSON.stringify(testUser));
    console.log('Test user data set in localStorage:', testUser);
  }, []);

  const setTestTherapist = () => {
    const testTherapist = {
      therapist_id: 1, // Use actual therapist ID from your database
      name: 'Dr. Smith',
      email: 'dr.smith@example.com',
      role: 'therapist'
    };

    localStorage.setItem('user', JSON.stringify(testTherapist));
    console.log('Test therapist data set in localStorage:', testTherapist);
    window.location.href = '/profile';
  };

  const setTestUser = () => {
    const testUser = {
      user_id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    };

    localStorage.setItem('user', JSON.stringify(testUser));
    console.log('Test user data set in localStorage:', testUser);
    window.location.href = '/profile';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Test Profile Page</h1>
        <p className="mb-6">Choose a test user to view their profile:</p>
        
        <div className="space-y-4">
          <button
            onClick={setTestUser}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login as Test User
          </button>
          
          <button
            onClick={setTestTherapist}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Login as Test Therapist
          </button>

          <a
            href="/profile"
            className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
          >
            Go to Profile Page
          </a>
        </div>
      </div>
    </div>
  );
}