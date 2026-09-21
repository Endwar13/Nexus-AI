import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Database, Loader2, Sparkles, MessageSquare, Plus } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  renderType?: 'text' | 'table' | 'chart';
  renderData?: any;
}

export default function Agentic() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'chat' | 'agentic'>('chat');
  const [loading, setLoading] = useState(false);
  const [contextData, setContextData] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAddContext = async () => {
    try {
      const { data, error } = await supabase.from('monitoring_data').select('*').limit(50);
      if (error) throw error;
      setContextData(JSON.stringify(data, null, 2));
      alert('Context data attached successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to attach context. Make sure table exists.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const endpoint = mode === 'chat' ? '/api/chat' : '/api/agentic';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage.content, 
          contextData,
          apiKey: profile?.gemini_api_key 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Server error');

      if (mode === 'agentic' && data.action) {
        if (data.action === 'generate_table') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Berikut adalah tabel berdasarkan data yang diminta:',
            renderType: 'table',
            renderData: data.args
          }]);
        } else if (data.action === 'generate_chart') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Berikut adalah grafik berdasarkan data yang diminta:',
            renderType: 'chart',
            renderData: data.args
          }]);
        } else if (data.action === 'summarize_database') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.args.summary,
            renderType: 'text'
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.text,
          renderType: 'text'
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${err.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (msg: Message) => {
    if (msg.renderType === 'table' && msg.renderData) {
      const { columns, rows } = msg.renderData;
      return (
        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((col: string, idx: number) => (
                  <th key={idx} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row: string[], rowIdx: number) => (
                <tr key={rowIdx}>
                  {row.map((cell: string, cellIdx: number) => (
                    <td key={cellIdx} className="px-4 py-2 text-gray-900 dark:text-gray-100">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (msg.renderType === 'chart' && msg.renderData) {
      const { type, data } = msg.renderData;
      const COLORS = ['#0ea5e9', '#84cc16', '#3b82f6', '#f59e0b', '#8b5cf6'];
      
      return (
        <div className="mt-4 h-64 w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4,4,0,0]} />
              </BarChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="markdown-body prose dark:prose-invert max-w-none text-sm">
        <ReactMarkdown>{msg.content}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 sticky top-0">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Bot className="mr-2 text-sky-500" />
          Agentic AI Assistant
        </h1>
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setMode('chat')}
            className={clsx(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center",
              mode === 'chat' ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <MessageSquare size={16} className="mr-1.5" /> Chat
          </button>
          <button
            onClick={() => setMode('agentic')}
            className={clsx(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center",
              mode === 'agentic' ? "bg-white dark:bg-gray-700 text-sky-600 dark:text-sky-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Sparkles size={16} className="mr-1.5" /> Agentic
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4">
            <Bot size={48} className="opacity-20" />
            <p className="text-center max-w-sm">
              {mode === 'chat' 
                ? "Tanyakan seputar lingkungan, ekosistem, atau pengelolaan sampah."
                : "Minta asisten untuk membuat tabel, grafik, atau ringkasan data dari database."}
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={clsx("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={clsx(
                "max-w-[85%] rounded-2xl px-5 py-4",
                msg.role === 'user' 
                  ? "bg-sky-600 text-white rounded-br-none" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700"
              )}>
                {renderContent(msg)}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none px-5 py-4 border border-gray-200 dark:border-gray-700 flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sedang menganalisis database & DeepSearch...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddContext}
              className="flex items-center text-xs font-medium px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus size={14} className="mr-1" /> Add Monitoring Data {contextData && '(Attached)'}
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ketik pesan Anda di sini..."
              className="w-full pl-5 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-sky-600"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
