'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DebugAuthPage() {
  const { user, isLoading, login } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [email, setEmail] = useState('sharmin.akter@hotmail.com');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check localStorage directly
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    
    setLocalStorageData({
      storedUser: storedUser ? JSON.parse(storedUser) : null,
      storedRole
    });
  }, []);

  const manualLogin = () => {
    const testUser = {
      user_id: 1,
      name: 'Test User',
      email: 'test@test.com',
      role: 'user' as const
    };
    
    login(testUser);
    alert('Manually logged in!');
  };

  const createTestUser = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: 'Test User',
          email: 'test@test.com', 
          password: 'test123', 
          role: 'user' 
        }),
      });
      
      const data = await response.json();
      console.log('Register response:', data);
      
      if (response.ok) {
        alert('Test user created successfully!');
        setEmail('test@test.com');
        setPassword('test123');
      } else {
        alert('Registration failed: ' + data.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration error: ' + error);
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'user' }),
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok) {
        login({ ...data.user, role: data.role });
        alert('Login successful!');
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error: ' + error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Test User Creation & Login:</h2>
          <div className="space-y-2">
            <Button onClick={manualLogin} className="mr-2">Manual Login (Test)</Button>
            <Button onClick={createTestUser} className="mr-2">Create Test User</Button>
            <Input 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              placeholder="Password" 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={testLogin}>Test Login</Button>
          </div>
        </div>
      
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Auth Context Data:</h2>
          <p>Loading: {isLoading.toString()}</p>
          <p>User: {JSON.stringify(user, null, 2)}</p>
        </div>
        
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold">LocalStorage Data:</h2>
          <p>Stored User: {JSON.stringify(localStorageData.storedUser, null, 2)}</p>
          <p>Stored Role: {localStorageData.storedRole}</p>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold">Validation Results:</h2>
          <p>Is User Role: {user?.role === 'user' ? 'Yes' : 'No'}</p>
          <p>Has User ID: {user?.user_id ? 'Yes' : 'No'}</p>
          <p>Is Therapist Role: {user?.role === 'therapist' ? 'Yes' : 'No'}</p>
          <p>Has Therapist ID: {user?.therapist_id ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}