import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { scriptsAPI, templatesAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const ScriptsPage = () => {
  const { t } = useTranslation();
  const [scripts, setScripts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    language: 'en',
    tone: 'professional',
    templateId: '',
    variables: {}
  });
  const [generatedScript, setGeneratedScript] = useState('');
  const [editingScript, setEditingScript] = useState(null);

  useEffect(() => {
    loadScripts();
    loadTemplates();
  }, []);

  const loadScripts = async () => {
    try {
      const res = await scriptsAPI.getAll();
      setScripts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load scripts:', err);
      toast.error('Failed to load scripts');
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await templatesAPI.getAll();
      setTemplates(res.data.data || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await scriptsAPI.generate({
        templateId: formData.templateId || undefined,
        variables: {
          title: formData.title,
          ...formData.variables
        },
        language: formData.language,
        tone: formData.tone
      });
      setGeneratedScript(res.data.data.content);
      setShowGenerateModal(false);
      setFormData({ title: '', language: 'en', tone: 'professional', templateId: '', variables: {} });
      await loadScripts();
      toast.success('Script generated successfully!');
    } catch (err) {
      toast.error('Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingScript) return;
    try {
      await scriptsAPI.update(editingScript.id, {
        content: generatedScript
      });
      setEditingScript(null);
      setGeneratedScript('');
      await loadScripts();
      toast.success('Script saved!');
    } catch (err) {
      toast.error('Failed to save script');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    try {
      await scriptsAPI.delete(id);
      await loadScripts();
      toast.success('Script deleted');
    } catch (err) {
      toast.error('Failed to delete script');
    }
  };

  return (
    <div className="animate-fade-in p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-h1 text-heading-1 text-on-surface">{t('sidebar.scripts')}</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Generate and manage AI-powered scripts</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ title: '', language: 'en', tone: 'professional', templateId: '', variables: {} });
            setShowGenerateModal(true);
          }}
          className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-primary flex items-center gap-2 hover:bg-primary/10 transition-all"
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          Generate Script
        </button>
      </div>

       {/* Scripts Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {scripts.map((script, index) => (
           <div 
             key={script.id} 
             className="glass glass-hover rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] group"
             style={{ animationDelay: `${index * 50}ms` }}
           >
             {/* Script Header */}
             <div className="relative h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center">
               <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 group-hover:text-on-surface-variant/50 transition-colors">
                 {script.language === 'vi' ? 'translate' : 'description'}
               </span>
               <div className="absolute top-3 right-3 flex gap-1">
                 <button 
                   onClick={() => {
                     setEditingScript(script);
                     setGeneratedScript(script.content);
                   }}
                   className="p-2 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-indigo-500/20 transition-colors"
                 >
                   <span className="material-symbols-outlined text-sm text-white">edit</span>
                 </button>
               </div>
             </div>
             
             {/* Script Info */}
             <div className="p-4">
               <h3 className="font-bold text-on-surface mb-3 truncate">{script.title}</h3>
               
               <div className="flex flex-wrap gap-2 mb-3">
                 <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                   script.language === 'vi' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                 }`}>
                   {script.language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
                 </span>
                 <span className="px-2 py-1 bg-white/5 text-on-surface-variant rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                   {script.tone}
                 </span>
               </div>
               
               <p className="text-xs text-on-surface-variant overflow-hidden line-clamp-3 mb-4">
                 {script.content}
               </p>
               
               <button 
                 onClick={() => handleDelete(script.id)}
                 className="w-full glass glass-hover py-2 rounded-lg font-bold text-on-surface-variant text-xs flex items-center justify-center gap-1 hover:text-red-400 hover:bg-red-500/10 transition-colors"
               >
                 <span className="material-symbols-outlined text-sm">delete</span>
                 Delete
               </button>
             </div>
           </div>
         ))}
       </div>

      {scripts.length === 0 && (
        <div className="glass rounded-xl p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">description</span>
          <h3 className="font-h2 text-heading-2 text-on-surface mb-2">No scripts yet</h3>
          <p className="text-on-surface-variant mb-6">Generate your first AI script to get started</p>
          <button 
            onClick={() => {
              setFormData({ title: '', language: 'en', tone: 'professional', templateId: '', variables: {} });
              setShowGenerateModal(true);
            }}
            className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-primary"
          >
            <span className="material-symbols-outlined align-middle mr-2">auto_awesome</span>
            Generate First Script
          </button>
        </div>
      )}

      {/* Editing Modal */}
      {editingScript && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h2 className="font-h2 text-heading-2 text-on-surface">Edit Script</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={generatedScript}
                onChange={(e) => setGeneratedScript(e.target.value)}
                className="w-full h-96 bg-white/5 border border-white/10 rounded-lg p-4 text-on-surface focus:outline-none focus:border-primary transition-all resize-none font-mono text-sm"
              />
            </div>
            <div className="p-6 border-t border-white/5 flex gap-4">
              <button onClick={handleSaveEdit} className="flex-1 glass glass-hover py-3 rounded-xl font-button text-button text-primary">
                Save Changes
              </button>
              <button 
                onClick={() => { setEditingScript(null); setGeneratedScript(''); }} 
                className="flex-1 glass glass-hover py-3 rounded-xl font-button text-button text-on-surface-variant"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5">
              <h2 className="font-h2 text-heading-2 text-on-surface">Generate AI Script</h2>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-6">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Title</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Language</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>

              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Tone</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={formData.tone}
                  onChange={(e) => setFormData({...formData, tone: e.target.value})}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="funny">Funny</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Template (Optional)</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={formData.templateId}
                  onChange={(e) => setFormData({...formData, templateId: e.target.value})}
                >
                  <option value="">No Template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 glass glass-hover py-3 rounded-xl font-button text-button text-primary" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Script'}
                </button>
                <button 
                  type="button" 
                  className="flex-1 glass glass-hover py-3 rounded-xl font-button text-button text-on-surface-variant"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptsPage;
