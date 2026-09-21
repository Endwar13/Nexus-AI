import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function InputData() {
  const [activeTab, setActiveTab] = useState<'input' | 'create'>('input');
  
  // Input Data State
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Sampah');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('kg');
  const [description, setDescription] = useState('');
  
  // Standard Units
  const standardUnits = ['kg', 'ton', 'AQI', 'mg/L', 'µg/m³', 'ppm', '°C', 'pH', 'm³', 'Unit'];
  
  // Create Category State
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<string[]>(['Sampah', 'Polusi Udara', 'Polusi Air']);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !value) {
      showToast('Lokasi dan Nilai wajib diisi', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('monitoring_data').insert([
        { location, category, value: Number(value), unit, description, created_at: new Date().toISOString() }
      ]);
      
      if (error) throw error;
      
      showToast('Data berhasil disimpan!', 'success');
      setLocation('');
      setValue('');
      setDescription('');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory) return;
    
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      showToast('Kategori tabel baru berhasil dibuat!', 'success');
      setNewCategory('');
      setActiveTab('input');
      setCategory(newCategory);
    } else {
      showToast('Kategori sudah ada', 'error');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Input & Create Table</h1>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('input')}
          className={clsx(
            "py-2 px-4 font-medium text-sm transition-colors border-b-2",
            activeTab === 'input' 
              ? "border-sky-500 text-sky-600 dark:text-sky-400" 
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Input Data
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={clsx(
            "py-2 px-4 font-medium text-sm transition-colors border-b-2",
            activeTab === 'create' 
              ? "border-sky-500 text-sky-600 dark:text-sky-400" 
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Buat Tabel Baru
        </button>
      </div>

      <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        {activeTab === 'input' ? (
          <form onSubmit={handleInputSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori Tabel</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Sungai Ciliwung"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai / Jumlah <span className="text-red-500">*</span></label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Contoh: 150"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white"
                  required
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-1/3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white"
                >
                  {standardUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan (Opsional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tambahkan catatan khusus..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Menyimpan...' : 'Submit Data'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Tabel / Kategori Baru</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Contoh: Pemantauan Limbah Pabrik X"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Kolom Standar (Otomatis ditambahkan):</p>
              <ul className="list-disc pl-5 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <li>Tanggal (Waktu pencatatan)</li>
                <li>Lokasi (Teks)</li>
                <li>Nilai / Jumlah (Angka)</li>
                <li>Keterangan (Teks)</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white font-medium rounded-lg transition-colors mt-4"
            >
              Simpan Skema
            </button>
          </form>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={clsx(
          "fixed bottom-6 right-6 p-4 rounded-lg shadow-lg flex items-center z-50 transform transition-all duration-300 translate-y-0",
          toast.type === 'success' ? "bg-sky-50 text-sky-800 border border-sky-200" : "bg-red-50 text-red-800 border border-red-200"
        )}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 text-sky-500" /> : <AlertCircle className="w-5 h-5 mr-2 text-red-500" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
