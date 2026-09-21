import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { User, Lock, Save, LogOut, Moon, Sun, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Profile State
  const [username, setUsername] = useState(profile?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState(profile?.gemini_api_key || '');
  const [loading, setLoading] = useState(false);
  
  // AI Config
  const [aiDetail, setAiDetail] = useState<'singkat' | 'mendetail'>('singkat');
  
  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check initial theme
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
    
    // Load AI preference from localStorage
    const savedAiDetail = localStorage.getItem('ems_ai_detail');
    if (savedAiDetail === 'singkat' || savedAiDetail === 'mendetail') {
      setAiDetail(savedAiDetail);
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update Username and API Key
      if (username !== profile?.username || geminiApiKey !== profile?.gemini_api_key) {
        const { error } = await supabase.from('profiles').upsert([
          { 
            id: user?.id, 
            username: username, 
            email: user?.email, 
            gemini_api_key: geminiApiKey || null,
            updated_at: new Date().toISOString() 
          }
        ]);
        if (error) throw error;
        await refreshProfile();
      }

      // Update Password
      if (password) {
        if (password !== confirmPassword) throw new Error('Password tidak cocok');
        if (password.length < 6) throw new Error('Password minimal 6 karakter');
        
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword('');
        setConfirmPassword('');
      }
      
      alert('Profil berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAiPreference = (val: 'singkat' | 'mendetail') => {
    setAiDetail(val);
    localStorage.setItem('ems_ai_detail', val);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
        
        {/* Profile & Security */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="mr-2" size={20} />
            Profil & Kredensial
          </h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Read-only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gemini API Key (Opsional)</label>
              <input
                type="text"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Gunakan API key Anda sendiri untuk menghindari rate limit global.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Lock className="mr-2" size={16} /> Ubah Password
              </h3>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Password Baru (Kosongkan jika tidak ingin diubah)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
                {password && (
                  <input
                    type="password"
                    placeholder="Konfirmasi Password Baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center mt-4"
            >
              <Save size={18} className="mr-2" />
              {loading ? 'Menyimpan...' : 'Update Profile & Security'}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          {/* AI Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Bot className="mr-2" size={20} />
              Konfigurasi AI
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Atur tingkat detail balasan AI di Agentic Page.
            </p>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="aiDetail" 
                  value="singkat"
                  checked={aiDetail === 'singkat'}
                  onChange={() => handleAiPreference('singkat')}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Singkat & Padat</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="aiDetail" 
                  value="mendetail"
                  checked={aiDetail === 'mendetail'}
                  onChange={() => handleAiPreference('mendetail')}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Sangat Mendetail</span>
              </label>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tema Visual</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Mode {theme === 'light' ? 'Terang' : 'Gelap'}</span>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 p-6">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
              Akhiri sesi Anda di perangkat ini.
            </p>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <LogOut size={16} className="mr-2" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
