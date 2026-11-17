import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Cookies from 'js-cookie'
import ar from './locales/ar/translation.json'
import en from './locales/en/translation.json'

const lng = Cookies.get('i18next') === 'en' ? 'en' : 'ar'

i18n.use(initReactI18next).init({
    resources: { ar: { translation: ar }, en: { translation: en } },
    lng,
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
})

const applyDir = (l: string) => {
    document.documentElement.lang = l
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
}
applyDir(lng)
i18n.on('languageChanged', (l) => { Cookies.set('i18next', l, { expires: 365 }); applyDir(l) })

export default i18n
