import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path === '/') return t('sidebar.dashboard');
    if (path.startsWith('/projects')) return t('sidebar.projects');
    if (path.startsWith('/templates')) return t('sidebar.templates');
    if (path.startsWith('/scripts')) return t('sidebar.scripts');
    if (path.startsWith('/voiceover')) return t('sidebar.voiceover');
    if (path.startsWith('/drive-videos')) return t('sidebar.driveVideos');
    if (path.startsWith('/settings')) return t('sidebar.settings');
    return 'VideoAutoStudio';
  };

  const toggleTheme = () => {
    const htmlElement = document.querySelector('html');
    if (htmlElement.classList.contains('dark')) {
      htmlElement.classList.remove('dark');
      htmlElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-indigo-500/5">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative group flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
            search
          </span>
          <input 
            type="text"
            placeholder="Search projects or assets..."
            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-indigo-500 transition-all font-body-sm w-full"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 font-manrope text-sm tracking-wide">
          <span className="text-slate-400 hover:text-slate-200 transition-all duration-300 cursor-pointer">
            Language
          </span>
          <span 
            className="material-symbols-outlined text-slate-400 hover:text-slate-200 cursor-pointer"
            onClick={toggleTheme}
          >
            {document.querySelector('html')?.classList.contains('dark') ? 'light_mode' : 'dark_mode'}
          </span>
          <span className="material-symbols-outlined text-slate-400 hover:text-slate-200 cursor-pointer">
            notifications
          </span>
        </div>
        
        {/* User Avatar */}
        <div className="h-8 w-8 rounded-full overflow-hidden border border-indigo-500/30">
          <img 
            alt="User profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8hD3Xls4ArpdRHm3Hm5qgdHd8WNWdpM8UzG...uMocggyuwKPB3ogkP5n4sDlfAq8dFuINU4o3xCKpxIAjAiAWg2aadBVQ9M_uTJlAv_YlmP7rEhWfBeqKY7MxuNLbHD5KTHoD7Lod6nVM7LqGz...pzpbeLKxUb..."
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
