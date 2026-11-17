import i18n from '../i18n'

export const formatPrice = (n: number) =>
    `${new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US').format(n)} ${i18n.t('currency')}`

export const toDate = (s?: string) =>
    s ? new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: s.length > 10 ? 'short' : undefined, timeZone: 'Africa/Cairo' }).format(new Date(s)) : ''
