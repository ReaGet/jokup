'use client'

import { useTranslation } from '../../utils/useTranslation'

// Menu Card Component - переиспользуемый компонент для карточек меню
function MenuCard({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left transition-all duration-150"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '18px',
        padding: '22px',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        cursor: 'pointer',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease',
        boxShadow: 'inset 0 0 0 transparent',
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
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
        className="block mb-1"
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#f9fafb'
        }}
      >
        {title}
      </span>
      <small 
        style={{
          color: '#c7d2fe',
          fontSize: '14px'
        }}
      >
        {description}
      </small>
    </button>
  )
}

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
      {/* Main Container Panel - согласно design-system.json screens.startScreen.container */}
      <div 
        className="w-full max-w-[1280px] flex flex-col md:grid md:grid-cols-[1.2fr_1fr] gap-12"
        style={{
          background: 'rgba(25, 15, 60, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: '28px',
          padding: 'clamp(36px, 5vw, 48px)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
        }}
      >
        {/* LEFT SIDE - BRAND SECTION */}
        <div className="flex flex-col justify-center gap-7">
          {/* Logo - согласно design-system.json components.logo */}
          <div className="flex items-center gap-5">
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
              className="m-0"
              style={{
                fontSize: 'clamp(38px, 8vw, 64px)',
                fontWeight: 900,
                letterSpacing: '1px',
                color: '#f9fafb'
              }}
            >
              Jokup
            </h1>
          </div>

          {/* Tagline - согласно design-system.json typography.scale.tagline */}
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

          {/* Description - согласно design-system.json typography.scale.body.large */}
          <p 
            className="m-0"
            style={{
              maxWidth: '520px',
              fontSize: '20px',
              lineHeight: 1.6,
              color: '#c7d2fe'
            }}
          >
            {t('ui.description')}
          </p>
        </div>

        {/* RIGHT SIDE - ACTIONS SECTION */}
        <div className="flex flex-col justify-center gap-8">
          {/* Start Game Button - согласно design-system.json components.button.primary */}
          <button
            onClick={onStartGame}
            className="w-full text-center cursor-pointer border-none transition-all duration-150"
            style={{
              padding: 'clamp(20px, 2.5vw, 28px)',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 900,
              boxShadow: '0 0 40px rgba(34, 211, 238, 0.45)',
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

          {/* Menu Grid - согласно design-system.json screens.startScreen.menuGrid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <MenuCard
              title={t('ui.settings')}
              description={t('ui.settingsDesc')}
              onClick={onOpenSettings}
            />
            <MenuCard
              title={t('ui.howToPlay')}
              description={t('ui.howToPlayDesc')}
            />
            <MenuCard
              title={t('ui.credits')}
              description={t('ui.creditsDesc')}
            />
            <MenuCard
              title={t('ui.accessibility')}
              description={t('ui.accessibilityDesc')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}


