'use client'

import { useTranslation } from '../../utils/useTranslation'

export default function StartScreen({ onStartGame, onOpenSettings }) {
  const { t } = useTranslation()

  return (
    <div 
      className="min-h-screen flex items-center justify-center max-md:py-5"
      style={{
        background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)',
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: 'clamp(20px, 3vw, 40px)'
      }}
    >
      {/* Main Container Panel */}
      <div 
        className="w-full max-w-[1280px] flex flex-col md:grid md:grid-cols-[1.2fr_1fr]"
        style={{
          background: 'rgba(25, 15, 60, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: '28px',
          padding: 'clamp(36px, 5vw, 48px)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)',
          gap: '48px'
        }}
      >
        {/* LEFT SIDE - BRAND */}
        <div 
          className="flex flex-col justify-center"
          style={{
            gap: '28px'
          }}
        >
          {/* Logo */}
          <div 
            className="flex items-center"
            style={{
              gap: '20px'
            }}
          >
            <div 
              className="flex items-center justify-center"
              style={{
                width: 'clamp(72px, 8vw, 96px)',
                height: 'clamp(72px, 8vw, 96px)',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
                fontSize: 'clamp(32px, 4vw, 44px)',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)'
              }}
            >
              😂
            </div>
            <h1 
              className="text-[clamp(38px,8vw,64px)] md:text-[48px] lg:text-[64px]"
              style={{
                fontWeight: 900,
                margin: 0,
                letterSpacing: '1px',
                color: '#f9fafb'
              }}
            >
              Jokup
            </h1>
          </div>

          {/* Tagline */}
          <div 
            style={{
              fontSize: '18px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#22d3ee'
            }}
          >
            {t('ui.tagline')}
          </div>

          {/* Description */}
          <p 
            style={{
              maxWidth: '520px',
              fontSize: '20px',
              lineHeight: 1.6,
              color: '#c7d2fe',
              margin: 0
            }}
          >
            {t('ui.description')}
          </p>
        </div>

        {/* RIGHT SIDE - ACTIONS */}
        <div 
          className="flex flex-col justify-center"
          style={{
            gap: '32px'
          }}
        >
          {/* Start Game Button */}
          <button
            onClick={onStartGame}
            className="w-full"
            style={{
              padding: 'clamp(20px, 2.5vw, 28px)',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 900,
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 40px rgba(34, 211, 238, 0.45)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              border: 'none',
              color: '#f9fafb',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 0 60px rgba(34, 211, 238, 0.7)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.45)'
            }}
          >
            {t('ui.startGame')}
          </button>

          {/* Menu Grid */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2"
            style={{
              gap: '20px'
            }}
          >
            {/* Settings */}
            <button
              onClick={onOpenSettings}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                cursor: 'pointer',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease',
                boxShadow: 'inset 0 0 0 transparent',
                textAlign: 'left',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = '#22d3ee'
                e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'
                e.currentTarget.style.boxShadow = 'inset 0 0 0 transparent'
              }}
            >
              <span 
                style={{
                  display: 'block',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#f9fafb',
                  marginBottom: '4px'
                }}
              >
                {t('ui.settings')}
              </span>
              <small 
                style={{
                  color: '#c7d2fe',
                  fontSize: '14px'
                }}
              >
                {t('ui.settingsDesc')}
              </small>
            </button>

            {/* How to Play */}
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                cursor: 'pointer',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease',
                boxShadow: 'inset 0 0 0 transparent',
                textAlign: 'left',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = '#22d3ee'
                e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'
                e.currentTarget.style.boxShadow = 'inset 0 0 0 transparent'
              }}
            >
              <span 
                style={{
                  display: 'block',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#f9fafb',
                  marginBottom: '4px'
                }}
              >
                {t('ui.howToPlay')}
              </span>
              <small 
                style={{
                  color: '#c7d2fe',
                  fontSize: '14px'
                }}
              >
                {t('ui.howToPlayDesc')}
              </small>
            </button>

            {/* Credits */}
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                cursor: 'pointer',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease',
                boxShadow: 'inset 0 0 0 transparent',
                textAlign: 'left',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = '#22d3ee'
                e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'
                e.currentTarget.style.boxShadow = 'inset 0 0 0 transparent'
              }}
            >
              <span 
                style={{
                  display: 'block',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#f9fafb',
                  marginBottom: '4px'
                }}
              >
                {t('ui.credits')}
              </span>
              <small 
                style={{
                  color: '#c7d2fe',
                  fontSize: '14px'
                }}
              >
                {t('ui.creditsDesc')}
              </small>
            </button>

            {/* Accessibility */}
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '18px',
                padding: '22px',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                cursor: 'pointer',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease',
                boxShadow: 'inset 0 0 0 transparent',
                textAlign: 'left',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = '#22d3ee'
                e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'
                e.currentTarget.style.boxShadow = 'inset 0 0 0 transparent'
              }}
            >
              <span 
                style={{
                  display: 'block',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#f9fafb',
                  marginBottom: '4px'
                }}
              >
                {t('ui.accessibility')}
              </span>
              <small 
                style={{
                  color: '#c7d2fe',
                  fontSize: '14px'
                }}
              >
                {t('ui.accessibilityDesc')}
              </small>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


