import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);
    
    const fetchUser = async (token) => {
        try {
            const res = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data.data);
            // Set language from user preference
            if (res.data.data.language_preference) {
                i18n.changeLanguage(res.data.data.language_preference);
            }
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };
    
    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        const { token, user } = res.data.data;
        localStorage.setItem('token', token);
        setUser(user);
        if (user.language_preference) {
            i18n.changeLanguage(user.language_preference);
        }
        return user;
    };
    
    const register = async (username, email, password) => {
        const res = await axios.post('/api/auth/register', { username, email, password });
        const { token, user } = res.data.data;
        localStorage.setItem('token', token);
        setUser(user);
        return user;
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };
    
    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('videoautostudio_language', lang);
        if (user) {
            // Update user preference in backend
            axios.put('/api/auth/language', { language: lang }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
        }
    };
    
    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            changeLanguage,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};
