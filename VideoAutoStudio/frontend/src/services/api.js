import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Request interceptor - add token
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => apiClient.post('/auth/login', { email, password }),
    register: (username, email, password) => apiClient.post('/auth/register', { username, email, password }),
    me: () => apiClient.get('/auth/me'),
    changePassword: (currentPassword, newPassword) => apiClient.post('/auth/change-password', { currentPassword, newPassword })
};

// Videos API
export const videosAPI = {
    getDriveAuthUrl: () => apiClient.get('/videos/drive/auth-url'),
    saveDriveTokens: (tokens) => apiClient.post('/videos/drive/save-tokens', tokens),
    disconnectDrive: () => apiClient.delete('/videos/drive/disconnect'),
    getDriveStatus: () => apiClient.get('/videos/drive/status'),
    getFolders: (parentId) => apiClient.get('/videos/drive/folders', { params: { parentId } }),
    getVideos: (folderId) => apiClient.get('/videos/drive/files', { params: { folderId } }),
    importVideo: (fileId, folderId) => apiClient.post('/videos/import', { fileId, folderId }),
    listImported: () => apiClient.get('/videos')
};

// Templates API
export const templatesAPI = {
    getAll: (category) => apiClient.get('/templates', { params: { category } }),
    getById: (id) => apiClient.get(`/templates/${id}`),
    create: (data) => apiClient.post('/templates', data),
    update: (id, data) => apiClient.put(`/templates/${id}`, data),
    delete: (id) => apiClient.delete(`/templates/${id}`)
};

// Scripts API
export const scriptsAPI = {
    generate: (data) => apiClient.post('/scripts/generate', data),
    getAll: () => apiClient.get('/scripts'),
    getById: (id) => apiClient.get(`/scripts/${id}`),
    update: (id, data) => apiClient.put(`/scripts/${id}`, data),
    delete: (id) => apiClient.delete(`/scripts/${id}`)
};

// Voiceover API
export const voiceoverAPI = {
    getVoices: (language) => apiClient.get('/voiceover/voices', { params: { language } }),
    generate: (data) => apiClient.post('/voiceover/generate', data),
    getAll: () => apiClient.get('/voiceover'),
    delete: (id) => apiClient.delete(`/voiceover/${id}`)
};

// Stats API
export const statsAPI = {
    get: () => apiClient.get('/stats')
};

// Projects API
export const projectsAPI = {
    create: (data) => apiClient.post('/projects', data),
    getAll: (status) => apiClient.get('/projects', { params: { status } }),
    getById: (id) => apiClient.get(`/projects/${id}`),
    update: (id, data) => apiClient.put(`/projects/${id}`, data),
    delete: (id) => apiClient.delete(`/projects/${id}`),
    process: (id) => apiClient.post(`/projects/${id}/process`),
    reorderVideos: (id, videoOrders) => apiClient.put(`/projects/${id}/videos/reorder`, { videoOrders }),
    removeVideo: (projectId, videoId) => apiClient.delete(`/projects/${projectId}/videos/${videoId}`)
};

export default apiClient;
