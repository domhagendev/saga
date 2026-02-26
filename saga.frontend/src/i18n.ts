import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import sv from './locales/sv.json'

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('saga-locale') || 'en',
  fallbackLocale: 'en',
  messages: { en, sv },
})
