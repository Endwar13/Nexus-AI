import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, PlusSquare, Settings, LogOut, ChevronLeft, ChevronRight, User, Menu, X, Leaf } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { user, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navItems = [
    { name: 'Agentic AI', path: '/', icon: LayoutDashboard },
    { name: 'Data Monitoring', path: '/monitoring', icon: Database },
    { name: 'Input & Create Table', path: '/input', icon: PlusSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "bg-indigo-300 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 flex flex-col fixed md:relative z-50 h-full shadow-xl md:shadow-none",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-8 bg-sky-500 text-white rounded-full p-1 z-10 hover:bg-sky-600 focus:outline-none shadow-sm"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="p-4 border-b border-gray-900 dark:border-gray-700 flex flex-col items-center justify-center min-h-[140px] relative">
          <button 
            className="md:hidden absolute top-4 right-4 text-gray-500 dark:text-gray-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
          
          <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center mb-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="text-sky-600 dark:text-sky-400" size={24} />
            )}
          </div>
          
          <div className={clsx("text-center overflow-hidden w-full px-2", collapsed ? "hidden md:hidden" : "block", collapsed ? "md:hidden" : "")}>
             <h3 className="font-medium text-gray-900 dark:text-white truncate">
               {profile?.username || 'New User'}
             </h3>
             <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user?.email}>
               {user?.email}
             </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  "flex items-center p-3 rounded-lg transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-indigo-150 dark:bg-indigo-900/30 text-sky-600 dark:text-sky-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={20} className={clsx("min-w-[20px]", collapsed ? "md:mr-0 mr-3" : "mr-3")} />
              <span className={clsx(collapsed ? "md:hidden" : "block")}>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors whitespace-nowrap"
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut size={20} className={clsx("min-w-[20px]", collapsed ? "md:mr-0 mr-3" : "mr-3")} />
            <span className={clsx(collapsed ? "md:hidden" : "block")}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col w-full">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center ml-2">
            <Leaf className="w-5 h-5 text-emerald-500 mr-2" />
            <span className="font-bold text-gray-900 dark:text-white text-lg">Nexus ECO</span>
          </div>
        </div>
        
        {/* Router Outlet */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
