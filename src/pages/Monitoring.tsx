import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Filter, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Monitoring() {
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chart Filters
  const [chartTimeRange, setChartTimeRange] = useState('7'); // '7', '30', 'all'
  const [chartCategory, setChartCategory] = useState('All');

  // Table Filters
  const [tableTimeRange, setTableTimeRange] = useState('all');
  const [tableCategory, setTableCategory] = useState('All');

  useEffect(() => {
    fetchData();

    const subscription = supabase
      .channel('public:monitoring_data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monitoring_data' }, payload => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase.from('monitoring_data').select('*').order('created_at', { ascending: false });
    
    if (!error && result) {
      setAllData(result);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    const dataToExport = tableData;
    if (dataToExport.length === 0) return;
    const keys = Object.keys(dataToExport[0]);
    const csvContent = [
      keys.join(','),
      ...dataToExport.map(row => keys.map(k => `"${row[k]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'monitoring_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterData = (data: any[], timeRange: string, category: string) => {
    let filtered = [...data];
    if (category !== 'All') {
      filtered = filtered.filter(d => d.category === category);
    }
    
    if (timeRange !== 'all') {
      const days = parseInt(timeRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(d => new Date(d.created_at) >= cutoffDate);
    }
    return filtered;
  };

  const chartRawData = useMemo(() => filterData(allData, chartTimeRange, chartCategory), [allData, chartTimeRange, chartCategory]);
  const tableData = useMemo(() => filterData(allData, tableTimeRange, tableCategory), [allData, tableTimeRange, tableCategory]);

  const trendData = useMemo(() => {
    const grouped = chartRawData.reduce((acc: any, row: any) => {
      const date = new Date(row.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date].value = (acc[date].value || 0) + Number(row.value || 0);
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [chartRawData]);

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pemantauan Ekosistem Real-Time</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <Download size={16} className="mr-2" /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="bg-sky-100 dark:bg-sky-900/40 p-4 rounded-full mr-4">
            <FileText className="text-sky-600 dark:text-sky-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Entries (All Time)</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{allData.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="bg-amber-100 dark:bg-amber-900/40 p-4 rounded-full mr-4">
            <TrendingUp className="text-amber-600 dark:text-amber-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Volume Sampah</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {allData.filter(d => d.category === 'Sampah').reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)} kg
            </h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded-full mr-4">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Rata-rata Polusi Udara (AQI)</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {allData.filter(d => d.category === 'Polusi Udara').length > 0 
                ? Math.round(allData.filter(d => d.category === 'Polusi Udara').reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) / allData.filter(d => d.category === 'Polusi Udara').length)
                : 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 shrink-0 h-96 flex flex-col">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Grafik Trend Nilai {chartCategory !== 'All' ? chartCategory : 'Keseluruhan'}
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center text-gray-500 dark:text-gray-400 font-medium text-sm mr-2">
              <Filter size={16} className="mr-1" /> Chart Filters:
            </div>
            <select
              value={chartTimeRange}
              onChange={(e) => setChartTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="all">Semua Waktu</option>
            </select>
            <select
              value={chartCategory}
              onChange={(e) => setChartCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white"
            >
              <option value="All">Semua Kategori</option>
              <option value="Sampah">Sampah</option>
              <option value="Polusi Udara">Polusi Udara</option>
              <option value="Polusi Air">Polusi Air</option>
            </select>
          </div>
        </div>
        
        {chartRawData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#0ea5e9' }}
              />
              <Line type="monotone" dataKey="value" name="Total Nilai" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Tidak ada data untuk rentang waktu/kategori ini.
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0 mb-6 flex flex-col min-h-[300px]">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Data Tabel Monitoring
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center text-gray-500 dark:text-gray-400 font-medium text-sm mr-2">
              <Filter size={16} className="mr-1" /> Table Filters:
            </div>
            <select
              value={tableTimeRange}
              onChange={(e) => setTableTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="all">Semua Waktu</option>
            </select>
            <select
              value={tableCategory}
              onChange={(e) => setTableCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:bg-gray-700 dark:text-white"
            >
              <option value="All">Semua Kategori</option>
              <option value="Sampah">Sampah</option>
              <option value="Polusi Udara">Polusi Udara</option>
              <option value="Polusi Air">Polusi Air</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full flex-1">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nilai</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : tableData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Data tidak ditemukan.</td></tr>
              ) : (
                tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{row.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {row.value} <span className="text-gray-500 text-xs ml-1">{row.unit || ''}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">{row.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
