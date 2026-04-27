import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import he from './locales/he.json';

// Language configuration
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false, flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false, flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, flag: '🇸🇦' },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false, flag: '🇯🇵' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false, flag: '🇷🇺' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true, flag: '🇮🇱' }
];

// Region-specific energy units
export const energyUnits = {
  en: { energy: 'kWh', power: 'kW', currency: 'USD', decimal: '.', thousands: ',' },
  es: { energy: 'kWh', power: 'kW', currency: 'EUR', decimal: ',', thousands: '.' },
  zh: { energy: 'kWh', power: 'kW', currency: 'CNY', decimal: '.', thousands: ',' },
  hi: { energy: 'kWh', power: 'kW', currency: 'INR', decimal: '.', thousands: ',' },
  ar: { energy: 'kWh', power: 'kW', currency: 'SAR', decimal: '.', thousands: ',' },
  fr: { energy: 'kWh', power: 'kW', currency: 'EUR', decimal: ',', thousands: ' ' },
  de: { energy: 'kWh', power: 'kW', currency: 'EUR', decimal: ',', thousands: '.' },
  ja: { energy: 'kWh', power: 'kW', currency: 'JPY', decimal: '.', thousands: ',' },
  pt: { energy: 'kWh', power: 'kW', currency: 'BRL', decimal: ',', thousands: '.' },
  ru: { energy: 'kWh', power: 'kW', currency: 'RUB', decimal: ',', thousands: ' ' },
  he: { energy: 'kWh', power: 'kW', currency: 'ILS', decimal: '.', thousands: ',' }
};

// Resources object for i18next
const resources = {
  en: { translation: en },
  es: { translation: es },
  zh: { translation: zh },
  hi: { translation: hi },
  ar: { translation: ar },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  pt: { translation: pt },
  ru: { translation: ru },
  he: { translation: he }
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    react: {
      useSuspense: false,
    },

    // Load all namespaces
    ns: ['translation', 'common', 'energy', 'trading', 'dashboard'],
    defaultNS: 'translation',
  });

// Helper functions
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

export const isRTL = (language?: string): boolean => {
  const lang = language || getCurrentLanguage();
  return languages.find(l => l.code === lang)?.rtl || false;
};

export const getLanguageInfo = (code: string) => {
  return languages.find(l => l.code === code);
};

export const getEnergyUnits = (language?: string) => {
  const lang = language || getCurrentLanguage();
  return energyUnits[lang as keyof typeof energyUnits] || energyUnits.en;
};

export const changeLanguage = (language: string) => {
  return i18n.changeLanguage(language);
};

export const getSupportedLanguages = () => {
  return languages;
};

export const getRTLClass = (language?: string) => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

export const getTextAlign = (language?: string) => {
  return isRTL(language) ? 'right' : 'left';
};

export const getMarginStart = (language?: string) => {
  return isRTL(language) ? 'mr' : 'ml';
};

export const getMarginEnd = (language?: string) => {
  return isRTL(language) ? 'ml' : 'mr';
};

// Export i18n instance
export default i18n;
