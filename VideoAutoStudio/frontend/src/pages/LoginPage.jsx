import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
      
      <div className="glass rounded-2xl p-8 w-full max-w-md space-y-6 relative z-10 backdrop-blur-xl">
        {/* Logo & Title */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <span className="material-symbols-outlined text-4xl text-white">smart_display</span>
          </div>
          <h1 className="font-h1 text-heading-1 gradient-text">CineFlow AI</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('app.description')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-slide-in">
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">{t('auth.username')}</label>
              <input
                type="text"
                name="username"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="animate-slide-in" style={{animationDelay: '0.1s'}}>
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="animate-slide-in" style={{animationDelay: '0.2s'}}>
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          
          {error && (
            <div className="border-l-4 border-red-500 p-3 bg-red-500/10 rounded animate-scale-in">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-button text-button shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 animate-slide-in"
            style={{animationDelay: '0.3s'}}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin">refresh</span>
                {t('common.loading')}
              </span>
            ) : (
              isLogin ? t('auth.loginButton') : t('auth.registerButton')
            )}
          </button>
        </form>
        
        <p className="text-center font-body-sm text-body-sm text-on-surface-variant animate-fade-in">
          {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', email: '', password: '' });
            }}
            className="ml-2 text-primary hover:underline font-bold bg-transparent border-none cursor-pointer transition-all hover:text-indigo-400"
          >
            {isLogin ? t('auth.register') : t('auth.login')}
          </button>
        </p>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 border border-indigo-500/20 rounded-full"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-purple-500/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default LoginPage;
