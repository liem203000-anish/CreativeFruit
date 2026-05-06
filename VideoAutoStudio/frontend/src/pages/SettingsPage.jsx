import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user, changeLanguage } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    language: user?.language_preference || 'en'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        language: user.language_preference || 'en'
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (formData.language !== user?.language_preference) {
        changeLanguage(formData.language);
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      toast.success('Profile updated successfully!');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password' });
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="font-h1 text-heading-1 text-on-surface">{t('sidebar.settings')}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage your account settings and preferences</p>
      </div>

      {message.text && (
        <div className={`glass border-l-4 p-4 rounded-lg ${
          message.type === 'success' ? 'border-emerald-500' : 'border-red-500'
        }`}>
          <p className={message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'profile' 
              ? 'text-primary border-primary' 
              : 'text-on-surface-variant border-transparent hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-sm align-middle mr-2">person</span>
          Profile
        </button>
        <button
          onClick={() => setActiveTab('language')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'language' 
              ? 'text-primary border-primary' 
              : 'text-on-surface-variant border-transparent hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-sm align-middle mr-2">language</span>
          Language
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass rounded-xl p-6 space-y-6">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Username</label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Email</label>
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <button type="submit" className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-primary flex items-center gap-2" disabled={loading}>
              <span className="material-symbols-outlined text-sm">save</span>
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </form>

          <div className="pt-6 border-t border-white/10">
            <h3 className="font-h3 text-heading-3 text-red-400 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Current Password</label>
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">New Password</label>
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  minLength={8}
                />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-all"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  minLength={8}
                />
              </div>
              <button type="submit" className="glass glass-hover px-6 py-3 rounded-xl font-button text-button text-on-surface-variant flex items-center gap-2" disabled={loading}>
                <span className="material-symbols-outlined text-sm">lock</span>
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Language Tab */}
      {activeTab === 'language' && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-h3 text-heading-3 text-on-surface mb-4">{t('settings.selectLanguage')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => {
                setFormData({...formData, language: 'en'});
                changeLanguage('en');
              }}
              className={`glass glass-hover p-6 rounded-xl cursor-pointer border-2 transition-all ${
                formData.language === 'en' ? 'border-primary bg-primary/10' : 'border-white/10'
              }`}
            >
              <h4 className="font-bold text-on-surface mb-2">🇺🇸 English</h4>
              <p className="text-sm text-on-surface-variant">English interface</p>
            </div>
            <div
              onClick={() => {
                setFormData({...formData, language: 'vi'});
                changeLanguage('vi');
              }}
              className={`glass glass-hover p-6 rounded-xl cursor-pointer border-2 transition-all ${
                formData.language === 'vi' ? 'border-primary bg-primary/10' : 'border-white/10'
              }`}
            >
              <h4 className="font-bold text-on-surface mb-2">🇻🇳 Tiếng Việt</h4>
              <p className="text-sm text-on-surface-variant">Giao diện tiếng Việt</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
