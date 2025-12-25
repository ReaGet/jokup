'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { getTranslation } from './translations'

const TranslationContext = createContext({
  language: 'en',
  t: (key) => key,
})

export function TranslationProvider({ children, language = 'en' }) {
  const [currentLanguage, setCurrentLanguage] = useState(language)

  useEffect(() => {
    setCurrentLanguage(language)
  }, [language])

  const t = (key) => {
    return getTranslation(currentLanguage, key)
  }

  return (
    <TranslationContext.Provider value={{ language: currentLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    // Fallback if context is not available
    return {
      language: 'en',
      t: (key) => getTranslation('en', key),
    }
  }
  return context
}



