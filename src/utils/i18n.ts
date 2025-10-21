import { i18n } from '@lingui/core'

export const locales = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
}

export const defaultLocale = 'en'

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivate(locale: string) {
  try {
    const catalog = await import(`../locales/${locale}/messages.po`)
    i18n.load(locale, catalog.messages)
    i18n.activate(locale)
  } catch (error) {
    console.warn(`Failed to load locale ${locale}, falling back to ${defaultLocale}`, error)
    if (locale !== defaultLocale) {
      const fallbackCatalog = await import(`../locales/${defaultLocale}/messages.po`)
      i18n.load(defaultLocale, fallbackCatalog.messages || fallbackCatalog.default || fallbackCatalog)
      i18n.activate(defaultLocale)
    }
  }
}