import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', icon: 'dashboard', label: t('sidebar.dashboard') },
    { path: '/projects', icon: 'video_library', label: t('sidebar.projects') },
    { path: '/templates', icon: 'auto_awesome', label: t('sidebar.templates') },
    { path: '/drive-videos', icon: 'inventory_2', label: t('sidebar.driveVideos') },
    { path: '/scripts', icon: 'description', label: t('sidebar.scripts') },
    { path: '/voiceover', icon: 'mic', label: t('sidebar.voiceover') },
    { path: '/settings', icon: 'settings', label: t('sidebar.settings') }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`h-screen border-r border-white/5 fixed left-0 top-0 bg-slate-950/90 backdrop-blur-2xl z-40 hidden md:flex flex-col py-6 gap-6 ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
      {/* Logo */}
      <div className="px-6 mb-2 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="material-symbols-outlined text-white text-2xl">smart_display</span>
            </div>
            <h1 className="text-xl font-black gradient-text tracking-tighter">CineFlow AI</h1>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="material-symbols-outlined text-slate-400 hover:text-slate-200 cursor-pointer transition-transform hover:scale-110"
        >
          {collapsed ? 'chevron_right' : 'chevron_left'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 font-manrope text-xs font-semibold uppercase tracking-widest transition-all duration-200 group relative ${
              isActive(item.path) 
                ? 'text-indigo-400 bg-indigo-500/10 rounded-lg' 
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {isActive(item.path) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"></div>
            )}
            <span className={`material-symbols-outlined mr-3 transition-transform group-hover:scale-110 ${
              isActive(item.path) ? 'text-indigo-400' : ''
            }`}>{item.icon}</span>
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && isActive(item.path) && (
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* New Project Button */}
      {!collapsed && (
        <div className="px-6">
          <button 
            onClick={() => navigate('/projects')}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-button text-button shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            New Project
          </button>
        </div>
      )}

      {/* User Info & Logout */}
      <div className="px-2 pt-6 border-t border-white/5">
        {!collapsed && user && (
          <div className="px-4 mb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-indigo-400 font-bold text-sm">{user.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.username}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button 
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-manrope text-xs font-semibold uppercase tracking-widest group"
        >
          <span className="material-symbols-outlined mr-3 group-hover:scale-110 transition-transform">logout</span>
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
