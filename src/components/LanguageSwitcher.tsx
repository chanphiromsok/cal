import { Trans, useLingui } from '@lingui/react/macro'
import { dynamicActivate, locales } from '../utils/i18n'
import { useState } from 'react'

export function LanguageSwitcher() {
  const { i18n } = useLingui()
  const [isLoading, setIsLoading] = useState(false)

  const handleLanguageChange = async (locale: string) => {
    if (locale === i18n.locale) return
    
    setIsLoading(true)
    try {
      await dynamicActivate(locale)
      // Save the selected locale to localStorage
      localStorage.setItem('locale', locale)
    } catch (error) {
      console.error('Failed to load locale:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      <label>
        <Trans>Language:</Trans>{' '}
        <select 
          value={i18n.locale} 
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={isLoading}
        >
          {Object.entries(locales).map(([locale, name]) => (
            <option key={locale} value={locale}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {isLoading && <span style={{ marginLeft: '0.5rem' }}>Loading...</span>}
    </div>
  )
}