import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { voiceoverAPI, scriptsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const VoiceoverPage = () => {
  const { t } = useTranslation();
  const [voiceovers, setVoiceovers] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [formData, setFormData] = useState({
    scriptId: '',
    voiceId: '',
    speed: 1.0
  });

  const getAudioUrl = (voiceoverId) => {
    const token = localStorage.getItem('token');
    return `/api/voiceover/${voiceoverId}/download?token=${token}`;
  };

  useEffect(() => {
    loadVoiceovers();
    loadScripts();
    loadVoices();
  }, []);

  const loadVoiceovers = async () => {
    try {
      const res = await voiceoverAPI.getAll();
      setVoiceovers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load voiceovers:', err);
      toast.error('Failed to load voiceovers');
    }
  };

  const loadScripts = async () => {
    try {
      const res = await scriptsAPI.getAll();
      setScripts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load scripts:', err);
    }
  };

  const loadVoices = async () => {
    try {
      const res = await voiceoverAPI.getVoices();
      setVoices(res.data.data || []);
    } catch (err) {
      console.error('Failed to load voices:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.scriptId || !formData.voiceId) {
      toast.error('Please select script and voice');
      return;
    }

    try {
      setLoading(true);
      await voiceoverAPI.generate({
        scriptId: formData.scriptId,
        voiceId: formData.voiceId,
        speed: formData.speed
      });
      setShowGenerateModal(false);
      setFormData({ scriptId: '', voiceId: '', speed: 1.0 });
      await loadVoiceovers();
      toast.success('Voiceover generated successfully!');
    } catch (err) {
      toast.error('Failed to generate voiceover');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm'))) return;
    try {
      await voiceoverAPI.delete(id);
      await loadVoiceovers();
      toast.success('Voiceover deleted');
    } catch (err) {
      toast.error('Failed to delete voiceover');
    }
  };

  return (
    <div className="animate-fade-in p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-h1 text-heading-1 text-on-surface">{t('sidebar.voiceover')}</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Generate ultra-realistic AI voiceovers</p>
        </div>
        <button 
          onClick={() => setShowGenerateModal(true)}
          className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-primary flex items-center gap-2 hover:bg-primary/10 transition-all"
        >
          <span className="material-symbols-outlined">mic</span>
          Generate Voiceover
        </button>
      </div>

      {/* Voiceovers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {voiceovers.map(voiceover => (
          <div key={voiceover.id} className="glass glass-hover rounded-xl p-5 transition-all duration-300 hover:translate-y-[-4px]">
            <h3 className="font-bold text-on-surface mb-4">{voiceover.voice_name || 'Voiceover'}</h3>
            
            <div className="flex gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                voiceover.language === 'vi' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              }`}>
                {voiceover.language === 'vi' ? 'Tiếng Việt' : 'English'}
              </span>
              <span className="px-3 py-1 bg-white/5 text-on-surface-variant rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                Speed: {voiceover.speed}x
              </span>
            </div>

            <div className="mb-4">
              <audio 
                controls 
                src={getAudioUrl(voiceover.id)}
                className="w-full"
              />
            </div>

            <button 
              onClick={() => handleDelete(voiceover.id)}
              className="w-full glass glass-hover py-2 rounded-lg font-bold text-on-surface-variant text-sm flex items-center justify-center gap-1 hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Delete
            </button>
          </div>
        ))}
      </div>

      {voiceovers.length === 0 && (
        <div className="glass rounded-xl p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">mic</span>
          <h3 className="font-h2 text-heading-2 text-on-surface mb-2">No voiceovers yet</h3>
          <p className="text-on-surface-variant mb-6">Generate your first AI voiceover to get started</p>
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-primary"
          >
            <span className="material-symbols-outlined align-middle mr-2">mic</span>
            Generate First Voiceover
          </button>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5">
              <h2 className="font-h2 text-heading-2 text-on-surface">Generate Voiceover</h2>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-6">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Script</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={formData.scriptId}
                  onChange={(e) => setFormData({...formData, scriptId: e.target.value})}
                  required
                >
                  <option value="">Select a script...</option>
                  {scripts.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Voice</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={formData.voiceId}
                  onChange={(e) => setFormData({...formData, voiceId: e.target.value})}
                  required
                >
                  <option value="">Select a voice...</option>
                  {voices.map(v => (
                    <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Speed: {formData.speed}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={formData.speed}
                  onChange={(e) => setFormData({...formData, speed: parseFloat(e.target.value)})}
                  className="w-full accent-primary"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 glass glass-hover py-3 rounded-xl font-button text-button text-primary" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Voiceover'}
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

export default VoiceoverPage;
