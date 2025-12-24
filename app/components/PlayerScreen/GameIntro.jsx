'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '../../utils/useTranslation'

export default function GameIntro() {
  const { t } = useTranslation()
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    setShowText(true)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className={`text-center space-y-8 transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
          {t('ui.startingGame')}
        </h1>
      </div>
    </div>
  )
}




