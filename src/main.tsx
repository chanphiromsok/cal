import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { Theme } from '@radix-ui/themes'
import './index.css'
import '@radix-ui/themes/styles.css'
import App from './App.tsx'
import './utils/i18n' // Initialize i18n with dynamic loading
import { dynamicActivate } from './utils/i18n'

dynamicActivate("en")
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme 
      appearance="light" 
      accentColor="blue" 
      grayColor="gray" 
      radius="medium"
      scaling="100%"
    >
      <I18nProvider i18n={i18n}>
        <App />
      </I18nProvider>
    </Theme>
  </StrictMode>,
)
