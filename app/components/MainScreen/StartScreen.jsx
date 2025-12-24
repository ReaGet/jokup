'use client'

import { useTranslation } from '../../utils/useTranslation'

export default function StartScreen({ onStartGame, onOpenSettings }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Logo */}
      <div className="mb-16">
        <div 
          className="relative"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
          }}
        >
          {/* Speech Bubble Container */}
          <div className="relative">
            {/* Broken/Cracked Speech Bubble */}
            <svg
              width="400"
              height="200"
              viewBox="0 0 400 200"
              className="absolute inset-0"
              style={{ filter: 'drop-shadow(0 0 4px white)' }}
            >
              {/* Left side of bubble */}
              <path
                d="M 20 20 Q 20 10 30 10 L 180 10 Q 190 10 190 20 L 190 80 Q 190 90 180 90 L 30 90 Q 20 90 20 80 Z"
                fill="none"
                stroke="white"
                strokeWidth="4"
              />
              {/* Right side of bubble */}
              <path
                d="M 210 20 Q 210 10 220 10 L 370 10 Q 380 10 380 20 L 380 80 Q 380 90 370 90 L 220 90 Q 210 90 210 80 Z"
                fill="none"
                stroke="white"
                strokeWidth="4"
              />
              {/* Jagged crack line */}
              <path
                d="M 195 15 L 200 25 L 195 35 L 200 45 L 195 55 L 200 65 L 195 75 L 200 85"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Game Title Text */}
            <div className="relative px-12 py-8">
              <div className="flex items-center justify-center gap-2">
                <span 
                  className="text-6xl md:text-7xl font-black uppercase tracking-tighter"
                  style={{
                    color: '#22c55e',
                    textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(255, 255, 255, 0.3)',
                    fontFamily: 'Arial Black, sans-serif',
                    letterSpacing: '-2px'
                  }}
                >
                  jok
                </span>
                <span 
                  className="text-6xl md:text-7xl font-black uppercase tracking-tighter"
                  style={{
                    color: '#3b82f6',
                    textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(255, 255, 255, 0.3)',
                    fontFamily: 'Arial Black, sans-serif',
                    letterSpacing: '-2px'
                  }}
                >
                  up
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-6 w-full max-w-md px-4">
        <button
          onClick={onStartGame}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 rounded-lg text-2xl transition-all transform hover:scale-105 shadow-lg"
        >
          {t('ui.startGame')}
        </button>
        
        <button
          onClick={onOpenSettings}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-6 rounded-lg text-2xl transition-all transform hover:scale-105 border-2 border-gray-600 shadow-lg"
        >
          {t('ui.settings')}
        </button>
      </div>
    </div>
  )
}


