import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  sessions: { en: 'Sessions', ar: 'الجلسات' },
  messages: { en: 'Messages', ar: 'الرسائل' },
  analytics: { en: 'Analytics', ar: 'التحليلات' },
  profile: { en: 'Profile', ar: 'الملف الشخصي' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  
  // Auth
  welcomeBack: { en: 'Welcome Back', ar: 'مرحباً بعودتك' },
  signIn: { en: 'Sign In', ar: 'تسجيل الدخول' },
  signUp: { en: 'Sign Up', ar: 'إنشاء حساب' },
  createAccount: { en: 'Create Account', ar: 'إنشاء حساب' },
  email: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  username: { en: 'Username', ar: 'اسم المستخدم' },
  confirmPassword: { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  currentPassword: { en: 'Current Password', ar: 'كلمة المرور الحالية' },
  newPassword: { en: 'New Password', ar: 'كلمة المرور الجديدة' },
  
  // Common
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  create: { en: 'Create', ar: 'إنشاء' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  
  // Sessions
  createSession: { en: 'Create Session', ar: 'إنشاء جلسة' },
  scanQR: { en: 'Scan QR Code', ar: 'مسح رمز الاستجابة السريعة' },
  reconnect: { en: 'Reconnect', ar: 'إعادة الاتصال' },
  
  // Messages
  sendMessage: { en: 'Send Message', ar: 'إرسال رسالة' },
  phoneNumber: { en: 'Phone Number', ar: 'رقم الهاتف' },
  message: { en: 'Message', ar: 'الرسالة' },
  
  // Validation
  required: { en: 'This field is required', ar: 'هذا الحقل مطلوب' },
  invalidEmail: { en: 'Please enter a valid email address', ar: 'يرجى إدخال بريد إلكتروني صحيح' },
  passwordTooShort: { en: 'Password must be at least 6 characters', ar: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
  passwordsNotMatch: { en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة' },
  invalidPhone: { en: 'Please enter a valid phone number', ar: 'يرجى إدخال رقم هاتف صحيح' },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'ar' : 'en');
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'ar';

  const value = {
    language,
    toggleLanguage,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};