'use client'
import React, { useState } from 'react';

export default function VerifyPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || 'Verification failed');
    } else {
      setSuccess('Verification successful! You can now log in.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Verify OTP</h1>
      <form className="w-full max-w-xs" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="mb-2 p-2 border rounded w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="OTP"
          className="mb-2 p-2 border rounded w-full"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
}