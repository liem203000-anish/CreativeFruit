import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { templatesAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const TemplatesPage = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'intro',
    template_config: '{}'
  });

  const categories = ['intro', 'outro', 'transition', 'lower_third', 'title', 'music_promo'];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await templatesAPI.getAll();
      setTemplates(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let config;
      try {
        config = JSON.parse(formData.template_config);
      } catch {
        toast.error('Invalid JSON config');
        setLoading(false);
        return;
      }

      if (editingTemplate) {
        await templatesAPI.update(editingTemplate.id, { ...formData, template_config: config });
        toast.success('Template updated!');
      } else {
        await templatesAPI.create({ ...formData, template_config: config });
        toast.success('Template created!');
      }

      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ name: '', description: '', category: 'intro', template_config: '{}' });
      await loadTemplates();
    } catch (err) {
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category || 'intro',
      template_config: JSON.stringify(template.template_config || {}, null, 2)
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    try {
      await templatesAPI.delete(id);
      toast.success('Template deleted!');
      await loadTemplates();
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({ name: '', description: '', category: 'intro', template_config: '{}' });
  };

  return (
    <div className="animate-fade-in p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-h1 text-heading-1 text-on-surface">{t('sidebar.templates')}</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Create and manage video templates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-primary flex items-center gap-2 hover:bg-primary/10 transition-all">
          <span className="material-symbols-outlined">add</span>
          New Template
        </button>
      </div>

       {loading && templates.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl"></div>
            <div className="h-4 w-32 bg-white/5 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template, index) => (
            <div 
              key={template.id} 
              className="glass glass-hover rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Template Preview */}
              <div className="relative h-40 bg-gradient-to-br from-surface-container-high to-surface-container overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 group-hover:text-on-surface-variant/50 transition-colors">
                    {template.category === 'intro' ? 'movie_edit' : 
                     template.category === 'outro' ? 'movie_filter' :
                     template.category === 'transition' ? 'swap_horiz' :
                     template.category === 'lower_third' ? 'subtitles' :
                     template.category === 'title' ? 'title' : 'music_note'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                      className="flex-1 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-bold hover:bg-white/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm align-middle mr-1">edit</span>
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                      className="py-2 px-3 bg-red-500/20 backdrop-blur-sm rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-bold text-on-surface mb-2 truncate">{template.name}</h3>
                
                {template.description && (
                  <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{template.description}</p>
                )}
                
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                    {template.category.replace('_', ' ')}
                  </span>
                  {template.template_config?.duration && (
                    <span className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">timer</span>
                      {template.template_config.duration}s
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center border-2 border-dashed border-white/10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">movie_edit</span>
          </div>
          <h3 className="font-h2 text-heading-2 text-on-surface mb-2">No templates yet</h3>
          <p className="text-on-surface-variant mb-6 max-w-md mx-auto">Create your first template to get started with professional video editing</p>
          <button onClick={() => setShowModal(true)} className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-primary inline-flex items-center gap-2 hover:bg-primary/10 transition-all">
            <span className="material-symbols-outlined">add</span>
            Create First Template
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5">
              <h2 className="font-h2 text-heading-2 text-on-surface">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Name</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Category</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Template Config (JSON)</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all resize-none font-mono text-sm"
                  value={formData.template_config}
                  onChange={(e) => setFormData({...formData, template_config: e.target.value})}
                  rows={8}
                />
              </div>
              
              <div className="flex gap-4">
                <button type="submit" className="flex-1 glass glass-hover py-3 rounded-xl font-button text-button text-primary" disabled={loading}>
                  {loading ? t('common.loading') : (editingTemplate ? 'Update' : 'Create')}
                </button>
                <button 
                  type="button" 
                  className="flex-1 glass glass-hover py-3 rounded-xl font-button text-button text-on-surface-variant"
                  onClick={handleCloseModal}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
