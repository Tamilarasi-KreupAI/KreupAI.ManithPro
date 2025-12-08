// ============================================================
// I18N - Internationalization Configuration
// ============================================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ============================================
// Types
// ============================================
export type Locale = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh';

export interface TranslationValues {
  [key: string]: string | number | boolean;
}

export interface I18nConfig {
  defaultLocale: Locale;
  fallbackLocale: Locale;
  supportedLocales: Locale[];
  loadPath?: string;
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: TranslationValues) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatRelativeTime: (date: Date | string) => string;
  isLoading: boolean;
}

// ============================================
// Default Configuration
// ============================================
export const defaultI18nConfig: I18nConfig = {
  defaultLocale: 'en',
  fallbackLocale: 'en',
  supportedLocales: ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'],
};

// ============================================
// Locale Metadata
// ============================================
export const localeMetadata: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
};

// ============================================
// Translation Helper
// ============================================
type TranslationObject = {
  [key: string]: string | TranslationObject;
};

const getNestedValue = (obj: TranslationObject, path: string): string | undefined => {
  const keys = path.split('.');
  let current: TranslationObject | string = obj;

  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
};

const interpolate = (template: string, values: TranslationValues): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return values[key]?.toString() ?? `{{${key}}}`;
  });
};

// ============================================
// I18n Context
// ============================================
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// ============================================
// I18n Provider
// ============================================
export interface I18nProviderProps {
  children: React.ReactNode;
  config?: Partial<I18nConfig>;
  translations: Record<Locale, TranslationObject>;
  initialLocale?: Locale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  config = {},
  translations,
  initialLocale,
}) => {
  const mergedConfig = { ...defaultI18nConfig, ...config };

  const [locale, setLocaleState] = useState<Locale>(() => {
    // Check URL param
    if (typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('lang') as Locale;
      if (urlParam && mergedConfig.supportedLocales.includes(urlParam)) {
        return urlParam;
      }

      // Check localStorage
      const stored = localStorage.getItem('locale') as Locale;
      if (stored && mergedConfig.supportedLocales.includes(stored)) {
        return stored;
      }

      // Check browser language
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (mergedConfig.supportedLocales.includes(browserLang)) {
        return browserLang;
      }
    }

    return initialLocale || mergedConfig.defaultLocale;
  });

  const [isLoading, setIsLoading] = useState(false);

  const setLocale = useCallback((newLocale: Locale) => {
    if (mergedConfig.supportedLocales.includes(newLocale)) {
      setLocaleState(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale);
        document.documentElement.lang = newLocale;
      }
    }
  }, [mergedConfig.supportedLocales]);

  const t = useCallback((key: string, values?: TranslationValues): string => {
    const currentTranslations = translations[locale] || translations[mergedConfig.fallbackLocale];
    let translation = getNestedValue(currentTranslations, key);

    // Fallback to default locale if not found
    if (!translation && locale !== mergedConfig.fallbackLocale) {
      const fallbackTranslations = translations[mergedConfig.fallbackLocale];
      translation = getNestedValue(fallbackTranslations, key);
    }

    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    return values ? interpolate(translation, values) : translation;
  }, [locale, translations, mergedConfig.fallbackLocale]);

  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(locale, options).format(value);
  }, [locale]);

  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  }, [locale]);

  const formatCurrency = useCallback((value: number, currency = 'USD'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  }, [locale]);

  const formatRelativeTime = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    const diffWeeks = Math.round(diffDays / 7);
    const diffMonths = Math.round(diffDays / 30);
    const diffYears = Math.round(diffDays / 365);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffSecs) < 60) {
      return rtf.format(diffSecs, 'second');
    } else if (Math.abs(diffMins) < 60) {
      return rtf.format(diffMins, 'minute');
    } else if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour');
    } else if (Math.abs(diffDays) < 7) {
      return rtf.format(diffDays, 'day');
    } else if (Math.abs(diffWeeks) < 4) {
      return rtf.format(diffWeeks, 'week');
    } else if (Math.abs(diffMonths) < 12) {
      return rtf.format(diffMonths, 'month');
    } else {
      return rtf.format(diffYears, 'year');
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t,
    formatNumber,
    formatDate,
    formatCurrency,
    formatRelativeTime,
    isLoading,
  }), [locale, setLocale, t, formatNumber, formatDate, formatCurrency, formatRelativeTime, isLoading]);

  return React.createElement(I18nContext.Provider, { value }, children);
};

// ============================================
// useI18n Hook
// ============================================
export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// ============================================
// useTranslation Hook (alias)
// ============================================
export const useTranslation = () => {
  const { t, locale } = useI18n();
  return { t, locale };
};

// ============================================
// Trans Component (for complex translations)
// ============================================
export interface TransProps {
  i18nKey: string;
  values?: TranslationValues;
  components?: Record<string, React.ReactElement>;
  defaults?: string;
}

export const Trans: React.FC<TransProps> = ({
  i18nKey,
  values,
  components = {},
  defaults,
}) => {
  const { t } = useI18n();
  let translation = t(i18nKey, values);

  if (translation === i18nKey && defaults) {
    translation = defaults;
  }

  // Simple component interpolation: <0>text</0> becomes components['0'] wrapping text
  const parts = translation.split(/(<\d+>.*?<\/\d+>)/g);

  const elements = parts.map((part, index) => {
    const match = part.match(/<(\d+)>(.*?)<\/\1>/);
    if (match) {
      const componentIndex = match[1];
      const content = match[2];
      const component = components[componentIndex];
      if (component) {
        return React.cloneElement(component, { key: index }, content);
      }
      return content;
    }
    return part;
  });

  return React.createElement(React.Fragment, null, ...elements);
};

// ============================================
// Locale Selector Component
// ============================================
export interface LocaleSelectorProps {
  className?: string;
  showFlags?: boolean;
  showNativeNames?: boolean;
}

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({
  className,
  showFlags = true,
  showNativeNames = false,
}) => {
  const { locale, setLocale } = useI18n();
  const supportedLocales = defaultI18nConfig.supportedLocales;

  return React.createElement(
    'select',
    {
      value: locale,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setLocale(e.target.value as Locale),
      className,
      'aria-label': 'Select language',
    },
    supportedLocales.map((loc) => {
      const meta = localeMetadata[loc];
      const label = showFlags
        ? `${meta.flag} ${showNativeNames ? meta.nativeName : meta.name}`
        : showNativeNames ? meta.nativeName : meta.name;

      return React.createElement('option', { key: loc, value: loc }, label);
    })
  );
};

// ============================================
// RTL Support
// ============================================
const RTL_LOCALES: Locale[] = []; // Add RTL locales like 'ar', 'he' when supported

export const isRTL = (locale: Locale): boolean => {
  return RTL_LOCALES.includes(locale);
};

export const useDirection = (): 'ltr' | 'rtl' => {
  const { locale } = useI18n();
  return isRTL(locale) ? 'rtl' : 'ltr';
};
