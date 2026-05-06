# Phase 7: Internationalization (EN/VI)

**Duration**: 1 week  
**Priority**: Medium  
**Status**: Not Started  
**Depends On**: Phase 1 (Foundation)

## Overview

Implement full internationalization (i18n) support for English and Vietnamese across the entire application. Users should be able to switch languages seamlessly, with all UI text, date formats, number formats, and content adapting to the selected language.

## Goals

1. Complete i18n setup with react-i18next
2. Translate all UI text to Vietnamese
3. Implement language switcher with persistence
4. Handle date/number formatting per locale
5. Support language-specific content (scripts, voiceovers)

## Deliverables

### 7.1 i18n Configuration

**File**: `frontend/src/i18n/config.js`

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './en.json';
import viTranslations from './vi.json';

const resources = {
    en: {
        translation: enTranslations
    },
    vi: {
        translation: viTranslations
    }
};

i18n
    .use(LanguageDetector) // Auto-detect browser language
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en', // Default language
        debug: process.env.NODE_ENV === 'development',
        
        interpolation: {
            escapeValue: false // React already escapes values
        },
        
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'videoautostudio_language'
        }
    });

export default i18n;
```

**Integration in main.jsx**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/config'; // Import i18n config before app
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### 7.2 Translation Files

**File**: `frontend/src/i18n/en.json`

```json
{
  "app": {
    "name": "VideoAutoStudio",
    "description": "Automated Video Creation Platform"
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "driveVideos": "Drive Videos",
    "templates": "Templates",
    "scripts": "Scripts",
    "voiceover": "Voiceover",
    "projects": "Projects",
    "settings": "Settings",
    "logout": "Logout"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "username": "Username",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "forgotPassword": "Forgot Password?",
    "dontHaveAccount": "Don't have an account?",
    "alreadyHaveAccount": "Already have an account?",
    "loginButton": "Login",
    "registerButton": "Register"
  },
  "dashboard": {
    "welcome": "Welcome back, {{name}}!",
    "stats": {
      "totalProjects": "Total Projects",
      "videosImported": "Videos Imported",
      "scriptsGenerated": "Scripts Generated",
      "voiceoversCreated": "Voiceovers Created"
    },
    "recentProjects": "Recent Projects",
    "quickActions": "Quick Actions"
  },
  "drive": {
    "connectDrive": "Connect Google Drive",
    "disconnectDrive": "Disconnect",
    "browseFolders": "Browse Folders",
    "importVideo": "Import Video",
    "importing": "Importing...",
    "importSuccess": "Video imported successfully!",
    "importFailed": "Failed to import video",
    "noVideosFound": "No videos found in this folder",
    "selectFolder": "Select a folder to view videos"
  },
  "templates": {
    "title": "Templates",
    "gallery": "Template Gallery",
    "uploadTemplate": "Upload Template",
    "preview": "Preview",
    "useTemplate": "Use This Template",
    "variables": "Template Variables",
    "categories": {
      "all": "All",
      "business": "Business",
      "lifestyle": "Lifestyle",
      "gaming": "Gaming",
      "education": "Education"
    }
  },
  "scripts": {
    "title": "Script Generator",
    "generate": "Generate Script",
    "regenerate": "Regenerate",
    "language": "Language",
    "tone": "Tone",
    "template": "Template",
    "customPrompt": "Custom Prompt",
    "scriptContent": "Script Content",
    "saveScript": "Save Script",
    "copyToClipboard": "Copy to Clipboard",
    "tones": {
      "professional": "Professional",
      "casual": "Casual",
      "funny": "Funny",
      "inspirational": "Inspirational",
      "educational": "Educational"
    }
  },
  "voiceover": {
    "title": "Voiceover",
    "selectScript": "Select Script",
    "selectVoice": "Select Voice",
    "generateVoiceover": "Generate Voiceover",
    "generating": "Generating voiceover...",
    "speed": "Speed",
    "preview": "Preview",
    "download": "Download",
    "delete": "Delete",
    "voices": {
      "english": "English Voices",
      "vietnamese": "Vietnamese Voices"
    }
  },
  "projects": {
    "title": "Projects",
    "newProject": "New Project",
    "editProject": "Edit Project",
    "deleteProject": "Delete Project",
    "projectName": "Project Name",
    "description": "Description",
    "status": {
      "draft": "Draft",
      "processing": "Processing",
      "completed": "Completed"
    },
    "selectVideos": "Select Videos",
    "addAudio": "Add Audio",
    "processVideo": "Process Video",
    "processing": "Processing video...",
    "preview": "Preview",
    "download": "Download",
    "timeline": "Timeline"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success!",
    "confirm": "Are you sure?",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "search": "Search",
    "filter": "Filter",
    "noData": "No data available"
  },
  "settings": {
    "title": "Settings",
    "profile": "Profile",
    "language": "Language",
    "selectLanguage": "Select Language",
    "english": "English",
    "vietnamese": "Tiếng Việt",
    "apiKeys": "API Keys",
    "googleDrive": "Google Drive",
    "elevenlabs": "ElevenLabs",
    "claude": "Claude AI"
  }
}
```

**File**: `frontend/src/i18n/vi.json`

```json
{
  "app": {
    "name": "VideoAutoStudio",
    "description": "Nền tảng Tạo Video Tự động"
  },
  "sidebar": {
    "dashboard": "Bảng điều khiển",
    "driveVideos": "Video Drive",
    "templates": "Mẫu",
    "scripts": "Kịch bản",
    "voiceover": "Lồng tiếng",
    "projects": "Dự án",
    "settings": "Cài đặt",
    "logout": "Đăng xuất"
  },
  "auth": {
    "login": "Đăng nhập",
    "register": "Đăng ký",
    "username": "Tên người dùng",
    "email": "Email",
    "password": "Mật khẩu",
    "confirmPassword": "Xác nhận mật khẩu",
    "forgotPassword": "Quên mật khẩu?",
    "dontHaveAccount": "Chưa có tài khoản?",
    "alreadyHaveAccount": "Đã có tài khoản?",
    "loginButton": "Đăng nhập",
    "registerButton": "Đăng ký"
  },
  "dashboard": {
    "welcome": "Chào mừng trở lại, {{name}}!",
    "stats": {
      "totalProjects": "Tổng số dự án",
      "videosImported": "Video đã nhập",
      "scriptsGenerated": "Kịch bản đã tạo",
      "voiceoversCreated": "Lồng tiếng đã tạo"
    },
    "recentProjects": "Dự án gần đây",
    "quickActions": "Thao tác nhanh"
  },
  "drive": {
    "connectDrive": "Kết nối Google Drive",
    "disconnectDrive": "Ngắt kết nối",
    "browseFolders": "Duyệt thư mục",
    "importVideo": "Nhập video",
    "importing": "Đang nhập...",
    "importSuccess": "Nhập video thành công!",
    "importFailed": "Không thể nhập video",
    "noVideosFound": "Không tìm thấy video trong thư mục này",
    "selectFolder": "Chọn thư mục để xem video"
  },
  "templates": {
    "title": "Mẫu",
    "gallery": "Thư viện mẫu",
    "uploadTemplate": "Tải lên mẫu",
    "preview": "Xem trước",
    "useTemplate": "Sử dụng mẫu này",
    "variables": "Biến mẫu",
    "categories": {
      "all": "Tất cả",
      "business": "Kinh doanh",
      "lifestyle": "Phong cách sống",
      "gaming": "Trò chơi",
      "education": "Giáo dục"
    }
  },
  "scripts": {
    "title": "Tạo kịch bản",
    "generate": "Tạo kịch bản",
    "regenerate": "Tạo lại",
    "language": "Ngôn ngữ",
    "tone": "Giọng điệu",
    "template": "Mẫu",
    "customPrompt": "Lệnh tùy chỉnh",
    "scriptContent": "Nội dung kịch bản",
    "saveScript": "Lưu kịch bản",
    "copyToClipboard": "Sao chép vào clipboard",
    "tones": {
      "professional": "Chuyên nghiệp",
      "casual": "Thân thiện",
      "funny": "Hài hước",
      "inspirational": "Truyền cảm hứng",
      "educational": "Giáo dục"
    }
  },
  "voiceover": {
    "title": "Lồng tiếng",
    "selectScript": "Chọn kịch bản",
    "selectVoice": "Chọn giọng nói",
    "generateVoiceover": "Tạo lồng tiếng",
    "generating": "Đang tạo lồng tiếng...",
    "speed": "Tốc độ",
    "preview": "Xem trước",
    "download": "Tải xuống",
    "delete": "Xóa",
    "voices": {
      "english": "Giọng tiếng Anh",
      "vietnamese": "Giọng tiếng Việt"
    }
  },
  "projects": {
    "title": "Dự án",
    "newProject": "Dự án mới",
    "editProject": "Sửa dự án",
    "deleteProject": "Xóa dự án",
    "projectName": "Tên dự án",
    "description": "Mô tả",
    "status": {
      "draft": "Nháp",
      "processing": "Đang xử lý",
      "completed": "Hoàn thành"
    },
    "selectVideos": "Chọn video",
    "addAudio": "Thêm âm thanh",
    "processVideo": "Xử lý video",
    "processing": "Đang xử lý video...",
    "preview": "Xem trước",
    "download": "Tải xuống",
    "timeline": "Dòng thời gian"
  },
  "common": {
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "edit": "Sửa",
    "loading": "Đang tải...",
    "error": "Đã xảy ra lỗi",
    "success": "Thành công!",
    "confirm": "Bạn có chắc chắn?",
    "close": "Đóng",
    "back": "Quay lại",
    "next": "Tiếp theo",
    "search": "Tìm kiếm",
    "filter": "Lọc",
    "noData": "Không có dữ liệu"
  },
  "settings": {
    "title": "Cài đặt",
    "profile": "Hồ sơ",
    "language": "Ngôn ngữ",
    "selectLanguage": "Chọn ngôn ngữ",
    "english": "English",
    "vietnamese": "Tiếng Việt",
    "apiKeys": "API Keys",
    "googleDrive": "Google Drive",
    "elevenlabs": "ElevenLabs",
    "claude": "Claude AI"
  }
}
```

### 7.3 Language Switcher Component

**File**: `frontend/src/components/common/LanguageSwitcher.jsx`

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();
    
    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
        
        // Save preference to user settings (optional, if logged in)
        localStorage.setItem('videoautostudio_language', newLang);
        
        // Update document language attribute
        document.documentElement.lang = newLang;
    };
    
    return (
        <button 
            className="language-switcher"
            onClick={toggleLanguage}
            title={t('settings.selectLanguage')}
        >
            <Globe size={20} />
            <span>{i18n.language === 'en' ? 'VI' : 'EN'}</span>
        </button>
    );
};

export default LanguageSwitcher;
```

**Placement**: Add to `Topbar.jsx` or `Sidebar.jsx`

### 7.4 Using Translations in Components

**Example: LoginPage.jsx**

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { login } from '../services/api';

const LoginPage = () => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            // Redirect to dashboard
        } catch (error) {
            toast.error(t('auth.loginFailed'));
        }
    };
    
    return (
        <div className="login-page">
            <h1>{t('auth.login')}</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder={t('auth.username')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">{t('auth.loginButton')}</button>
            </form>
            <p>
                {t('auth.dontHaveAccount')}{' '}
                <a href="/register">{t('auth.register')}</a>
            </p>
        </div>
    );
};
```

### 7.5 Date & Number Formatting

**Using Intl API**

```javascript
// Format date based on language
export const formatDate = (date, language) => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
};

// Format number based on language
export const formatNumber = (number, language) => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale).format(number);
};

// Format currency (if needed)
export const formatCurrency = (amount, language) => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const currency = language === 'vi' ? 'VND' : 'USD';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
};
```

**Usage in Components**

```jsx
const DashboardPage = () => {
    const { i18n } = useTranslation();
    const [stats, setStats] = useState({});
    
    return (
        <div>
            <p>{formatDate(new Date(), i18n.language)}</p>
            <p>{formatNumber(stats.totalProjects, i18n.language)} projects</p>
        </div>
    );
};
```

### 7.6 Language-Specific Content

**Backend: Store Language Preference**

```sql
-- Already in users table: language_preference VARCHAR(5) DEFAULT 'en'
-- Update user preference
UPDATE users SET language_preference = 'vi' WHERE id = $1;
```

**Frontend: Send Language in API Requests**

```javascript
// In api.js, add language header
api.interceptors.request.use(config => {
    const language = localStorage.getItem('videoautostudio_language') || 'en';
    config.headers['Accept-Language'] = language;
    return config;
});
```

**Backend: Use Language for AI Generation**

```javascript
// In scripts route, get language from user preference or request
const language = req.body.language || req.user.language_preference || 'en';

// Pass to AI service
const script = await aiService.generateScript(prompt, { language });
```

### 7.7 RTL Support (Not needed for EN/VI)

Vietnamese and English are both LTR (Left-to-Right) languages, so no RTL support is needed. If adding Arabic/Hebrew in future, add RTL support with CSS:

```css
[dir="rtl"] {
    direction: rtl;
    text-align: right;
}
```

### 7.8 Testing i18n

**Checklist**
- [ ] All text in app is translatable (no hardcoded strings)
- [ ] Language switcher changes all UI text immediately
- [ ] Language preference persists after page reload
- [ ] Date/number formatting changes with language
- [ ] AI-generated content respects language selection
- [ ] Voiceover page shows correct voices for language
- [ ] Error messages are translated
- [ ] Placeholder text is translated

**Manual Test**
1. Load app → Should show English (or browser language)
2. Click language switcher → Should switch to Vietnamese
3. Navigate to different pages → All text should be in Vietnamese
4. Reload page → Should remember Vietnamese
5. Generate script → Should generate in Vietnamese
6. Check voiceover page → Should show Vietnamese voices

## Acceptance Criteria

- [ ] User can switch between EN and VI using language switcher
- [ ] All UI text is translated to Vietnamese
- [ ] Language preference persists in localStorage
- [ ] Date/number formatting adapts to selected language
- [ ] AI script generation respects language selection
- [ ] Voiceover page shows language-appropriate voices
- [ ] User language preference saved to database (if logged in)
- [ ] No hardcoded strings in components (all use `t()`)

## Technical Debt / Notes

- Translation keys should be organized by page/feature (currently flat structure)
- Consider using a translation management platform (Crowdin, Lokalise) for larger teams
- Some translations may be long; test UI with longer Vietnamese text (VI text ~30% longer than EN)
- For dynamic content (user-generated), consider Google Translate API integration
- Voiceover names from ElevenLabs may not be translated; keep original names

## Next Phase

Proceed to [Phase 8: Polish & Deploy](PHASE_8_POLISH.md) to finalize the application, perform testing, and prepare for production deployment.
