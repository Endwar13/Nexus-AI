import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function SetupProfile() {
  const { user, refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setError('Password dan Konfirmasi Password tidak cocok.');
        return;
      }
      if (password.length < 6) {
        setError('Password harus minimal 6 karakter.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      if (password) {
        // Update password using Supabase Auth
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
      }

      // Insert or update profile record
      const { error: profileError } = await supabase.from('profiles').upsert([
        { 
          id: user?.id,
          username: username,
          email: user?.email,
          gemini_api_key: geminiApiKey || null,
          updated_at: new Date().toISOString()
        }
      ]);
      
      if (profileError) throw profileError;

      await refreshProfile();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-t-4 border-sky-500">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Set Up Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Lengkapi Username Anda untuk melanjutkan. Anda juga dapat mengatur ulang password di sini.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white outline-none transition-colors"
              placeholder="Username unik"
              required
            />
          </div>
          <div className="pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Opsional: Isi jika ingin menggunakan API Key mandiri untuk fitur AI (Mencegah Rate Limit)</p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gemini API Key
            </label>
            <input
              type="text"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white outline-none transition-colors"
              placeholder="AIzaSy..."
            />
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Opsional: Isi jika ingin membuat / mengubah password</p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white outline-none transition-colors"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white outline-none transition-colors"
              placeholder="Ketik ulang password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Menyimpan...' : 'Simpan Profil & Lanjutkan'}
          </button>
        </form>
      </div>
    </div>
  );
}
