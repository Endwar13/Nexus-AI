import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin_otp' | 'signin_password' | 'signup'>('signin_password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      if (authMode === 'signin_password') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      } else if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Cek email Anda untuk konfirmasi pendaftaran!');
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        setMessage('Cek email Anda untuk link login atau OTP!');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-t-4 border-sky-500">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
            <Leaf className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Ecosystem Management System
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          {authMode === 'signin_password' 
            ? 'Masuk dengan password' 
            : authMode === 'signup' 
              ? 'Buat akun baru' 
              : 'Masuk dengan Email (Magic Link / OTP)'}
        </p>

        {message && (
          <div className="mb-4 p-3 bg-lime-50 dark:bg-lime-900/20 text-lime-600 dark:text-lime-400 rounded-lg text-sm border border-lime-200 dark:border-lime-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white outline-none transition-colors"
              placeholder="nama@email.com"
              required
            />
          </div>

          {(authMode === 'signin_password' || authMode === 'signup') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading 
              ? 'Memproses...' 
              : authMode === 'signin_password' 
                ? 'Masuk' 
                : authMode === 'signup' 
                  ? 'Daftar' 
                  : 'Kirim Link Masuk'}
          </button>
        </form>

        <div className="mt-6 flex flex-col space-y-2 text-center">
          {authMode === 'signin_password' ? (
            <>
              <button
                onClick={() => setAuthMode('signup')}
                className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
              >
                Belum punya akun? Daftar di sini
              </button>
              <button
                onClick={() => setAuthMode('signin_otp')}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Atau masuk dengan Magic Link
              </button>
            </>
          ) : authMode === 'signup' ? (
            <button
              onClick={() => setAuthMode('signin_password')}
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              Sudah punya akun? Masuk di sini
            </button>
          ) : (
            <button
              onClick={() => setAuthMode('signin_password')}
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              Kembali ke login dengan password
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
