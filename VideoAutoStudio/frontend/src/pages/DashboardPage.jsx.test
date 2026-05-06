import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsAPI, scriptsAPI, voiceoverAPI, videosAPI, statsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalScripts: 0,
    totalVoiceovers: 0,
    totalVideos: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, projectsRes] = await Promise.all([
        statsAPI.get().catch(() => ({ data: { data: {} } })),
        projectsAPI.getAll().catch(() => ({ data: { data: [] } }))
      ]);

      const projects = projectsRes.data.data || [];
      const completed = projects.filter(p => p.status === 'completed').length;
      
      setStats({
        totalProjects: projects.length,
        completedProjects: completed,
        totalScripts: 0,
        totalVoiceovers: 0,
        totalVideos: 0
      });

      setRecentProjects(projects.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: t('sidebar.projects'), 
      value: stats.totalProjects, 
      icon: 'video_library',
      color: 'bg-indigo-500/10 text-indigo-400',
      borderColor: 'border-indigo-500/20',
      trend: '+12%',
      trendColor: 'text-emerald-400'
    },
    { 
      title: t('sidebar.scripts'), 
      value: stats.totalScripts, 
      icon: 'description',
      color: 'bg-indigo-500/10 text-indigo-400',
      borderColor: 'border-indigo-500/20',
      trend: '+5%',
      trendColor: 'text-emerald-400'
    },
    { 
      title: 'AI Scripts', 
      value: stats.totalScripts, 
      icon: 'auto_awesome',
      color: 'bg-indigo-500/10 text-indigo-400',
      borderColor: 'border-indigo-500/20',
      link: '/scripts'
    },
    { 
      title: t('sidebar.voiceover'), 
      value: stats.totalVoiceovers, 
      icon: 'mic',
      color: 'bg-indigo-500/10 text-indigo-400',
      borderColor: 'border-indigo-500/20',
      link: '/voiceover'
    }
  ];

  const quickActions = [
    { 
      title: 'New Project', 
      description: 'Create a new video project',
      icon: 'add',
      action: () => navigate('/projects'),
      gradient: 'from-indigo-700 to-indigo-900'
    },
    { 
      title: 'Import Videos', 
      description: 'Sync from local or cloud drive',
      icon: 'upload_file',
      action: () => navigate('/drive-videos'),
      gradient: 'from-indigo-800 to-indigo-950'
    },
    { 
      title: 'Generate Voiceover', 
      description: 'Ultra-realistic AI speech',
      icon: 'mic',
      action: () => navigate('/voiceover'),
      gradient: 'from-indigo-800 to-indigo-950'
    }
  ];

  const systemStatus = [
    { name: 'Frontend', status: 'online', color: 'bg-emerald-500' },
    { name: 'Backend', status: 'online', color: 'bg-emerald-500' },
    { name: 'AI Service', status: 'online', color: 'bg-emerald-500' },
    { name: 'Voice API', status: 'warning', color: 'bg-amber-500 animate-pulse' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Stats Grid */}
       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {statCards.map((stat, index) => (
           <div key={index} className={`glass glass-hover p-lg rounded-xl transition-all duration-300 ${stat.borderColor} text-center`}>
             <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-lg ${stat.color} mx-auto`}>
                 <span className="material-symbols-outlined">{stat.icon}</span>
               </div>
               {stat.trend && (
                 <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendColor}`}>
                   <span className="material-symbols-outlined text-sm">trending_up</span>
                   {stat.trend}
                 </div>
               )}
             </div>
             <div className="font-h1 text-heading-2 text-on-surface mb-1">{stat.value}</div>
             <div className="font-label-caps text-label-caps text-on-surface-variant">{stat.title}</div>
           </div>
         ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-heading-3 text-heading-3 text-on-surface px-1">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                onClick={action.action}
                className="glass glass-hover p-4 rounded-xl flex items-center gap-4 text-left group transition-all w-full"
              >
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined">{action.icon}</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface">{action.title}</div>
                  <div className="text-xs text-on-surface-variant">{action.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* System Status */}
          <div className="pt-4 space-y-4">
            <h3 className="font-heading-3 text-heading-3 text-on-surface px-1">System Health</h3>
            <div className="grid grid-cols-2 gap-3">
              {systemStatus.map((item, index) => (
                <div key={index} className="bg-surface-container-low p-3 rounded-lg border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">{item.name}</span>
                  <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm shadow-emerald-500/50`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-heading-3 text-heading-3 text-on-surface">Recent Projects</h3>
            <button 
              onClick={() => navigate('/projects')}
              className="text-primary text-sm font-bold hover:underline"
            >
              View all
            </button>
          </div>
          
          <div className="glass rounded-xl overflow-hidden divide-y divide-white/5">
            {recentProjects.length > 0 ? (
              recentProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => navigate('/projects')}
                >
                   <div className="h-16 w-24 rounded bg-surface-container-highest overflow-hidden flex-shrink-0 relative">
                     <img 
                       src={project.videos && project.videos[0] ? `/api/videos/${project.videos[0].id}/thumbnail?token=${localStorage.getItem('token')}` : `/api/projects/${project.id}/preview?t=1&token=${localStorage.getItem('token')}`}
                       alt={project.name}
                       className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                       onError={(e) => {
                         const char = project.name ? project.name.charAt(0).toUpperCase() : '?';
                         e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%2334343d'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23c7c4d7' font-family='sans-serif' font-size='48' font-weight='bold'%3E${char}%3C/text%3E%3C/svg%3E`;
                       }}
                     />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                       <span className="material-symbols-outlined text-white text-xl">play_circle</span>
                     </div>
                   </div>
                  <div className="flex-grow">
                    <div className="font-bold text-on-surface">{project.name}</div>
                    <div className="text-xs text-on-surface-variant">
                      {project.updated_at 
                        ? `Last edited ${Math.floor((new Date() - new Date(project.updated_at)) / (1000 * 60 * 60))}h ago`
                        : 'Recently created'} 
                      • {project.output_file_path ? `${(project.output_file_path.length / 1024 / 1024).toFixed(1)} MB` : 'Draft'}
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      project.status === 'processing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-400 mb-4 block">video_library</span>
                <p className="text-on-surface-variant">No projects yet. Create your first project to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips & Tricks */}
      <div className="glass p-6 rounded-xl border-l-4 border-indigo-500">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-1">Pro Tip: Cinematic Voiceovers</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Try using the 'Deep Narrative' voice preset with a 0.8x speed multiplier for a more professional cinematic documentary feel in your intros.
            </p>
          </div>
          <button className="ml-auto text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
