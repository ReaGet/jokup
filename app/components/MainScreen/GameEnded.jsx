'use client'

import { useTranslation } from '../../utils/useTranslation'

export default function GameEnded({ onStartNewGame }) {
  const { t } = useTranslation()

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-12"
      style={{
        background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)'
      }}
    >
      <div 
        className="w-full max-w-md rounded-[28px] p-12 md:p-12 border border-[rgba(139,92,246,0.35)] text-center"
        style={{
          background: 'rgba(25, 15, 60, 0.75)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
        }}
      >
        <div className="mb-12">
          <div 
            className="text-[64px] mb-6"
            style={{
              fontSize: 'clamp(48px, 8vw, 64px)'
            }}
          >
            🎮
          </div>
          <h1 
            className="text-[38px] md:text-[48px] font-black mb-4 tracking-[1px]"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(139, 92, 246, 0.6)'
            }}
          >
            {t('ui.gameEnded')}
          </h1>
          <p className="text-[#c7d2fe] text-lg">
            {t('ui.gameEndedDescription')}
          </p>
        </div>

        <button
          onClick={onStartNewGame}
          className="w-full text-[#f9fafb] font-black py-7 rounded-[18px] text-[30px] transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
            boxShadow: '0 0 40px rgba(34, 211, 238, 0.45)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)'
            e.target.style.boxShadow = '0 0 60px rgba(34, 211, 238, 0.7)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.45)'
          }}
        >
          {t('ui.startNewGame')}
        </button>
      </div>
    </div>
  )
}


