'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '../../utils/useTranslation'

export default function GameIntro({ onComplete }) {
  const { t } = useTranslation()
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    setShowText(true)
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 5000) // 5 second intro

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
      <div className={`text-center space-y-8 transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-6xl md:text-8xl font-black mb-8 bg-clip-text text-transparent animate-pulse" style={{
          background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '1px'
        }}>
          {t('ui.startingGame')}
        </h1>
      </div>
    </div>
  )
}
