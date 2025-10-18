
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHiddenAuth } from '../context/HiddenAuthContext';
import Header from '../components/Header';

const HiddenLoginPage: React.FC = () => {
  const [regNumber, setRegNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useHiddenAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(regNumber, pin);
      navigate('/discreet-results');
    } catch (err: any) {
      // On failure, ensure any previous session is cleared and redirect to the main login
      logout();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 m-4">
        <Header />
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Log in:</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-gray-900"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800 transition disabled:bg-gray-400"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HiddenLoginPage;
