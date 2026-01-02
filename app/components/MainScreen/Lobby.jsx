'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { PlayerAvatar } from '../../utils/avatarUtils'
import { useTranslation } from '../../utils/useTranslation'

// Player card component
function PlayerCard({ player, index, totalPlayers, radius }) {
  // Calculate angle for circular positioning
  const angle = (index * 360) / totalPlayers - 90 // Start from top
  const angleRad = (angle * Math.PI) / 180
  
  // Calculate position using CSS calc with viewport units for responsiveness
  const xOffset = radius * Math.cos(angleRad)
  const yOffset = radius * Math.sin(angleRad)
  
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `calc(50% + ${xOffset}px)`,
        top: `calc(50% + ${yOffset}px)`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Player Card Container */}
      <div className="relative">
        {/* Avatar */}
        <div className="mb-2 relative">
          <PlayerAvatar playerId={player.id} isVIP={player.isVIP} />
          
          {/* VIP Badge - according to design system components.badge.vip */}
          {player.isVIP && (
            <div 
              className="absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-[18px] flex items-center gap-0.5 z-10"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
                color: '#0b0618',
                border: '2px solid #0b0618',
                boxShadow: '0 0 25px rgba(34, 211, 238, 0.5)',
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 900
              }}
            >
              <span>⭐</span>
              <span>VIP</span>
            </div>
          )}
        </div>
        
        {/* Name Banner - according to design system screens.lobby.playerCard.nameBanner */}
        <div 
          className="px-3 py-1 rounded-[18px]"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 25px rgba(34, 211, 238, 0.35)'
          }}
        >
          <div 
            className="text-sm font-bold uppercase tracking-wider whitespace-nowrap"
            style={{
              color: '#f9fafb',
              fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            {player.name}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Lobby({ roomCode, players, waitingForVIP }) {
  const { t } = useTranslation()
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [joinUrl, setJoinUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && roomCode) {
      setJoinUrl(`${window.location.origin}/player?code=${roomCode}`)
    }
  }, [roomCode])
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // Calculate radius for circular layout
  const radius = useMemo(() => {
    // Responsive radius based on screen size
    const baseRadius = Math.min(dimensions.width, dimensions.height) * 0.25
    return Math.max(baseRadius, 200) // Minimum radius
  }, [dimensions])

  // Copy room code to clipboard
  const handleCopyCode = async () => {
    if (!roomCode) return
    
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = roomCode
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        // According to design system: colorPalette.background.main
        background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)'
      }}
    >
      {/* Top Right Corner - Join Audience Section */}
      <div className="absolute top-6 right-6 text-right z-10">
        <div 
          className="text-sm mb-2"
          style={{
            color: '#22d3ee',
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: 600
          }}
        >
          {t('ui.joinAudience')}
        </div>
        {/* Room Code with Copy Button - according to design system */}
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="text-2xl font-bold px-4 py-2 rounded-[18px] flex-1"
            style={{
              background: 'rgba(25, 15, 60, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              color: '#f9fafb',
              fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
            }}
          >
            {roomCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3 py-2 rounded-[18px] border-none cursor-pointer transition-all duration-150 flex items-center justify-center"
            style={{
              background: copied 
                ? 'linear-gradient(135deg, #22d3ee, #8b5cf6)' 
                : 'rgba(25, 15, 60, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              color: '#f9fafb',
              fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)',
              minWidth: '44px',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.borderColor = '#22d3ee'
                e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.5)'
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'
                e.currentTarget.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.35)'
              }
            }}
            title={copied ? t('ui.copied') : t('ui.copyCode')}
          >
            {copied ? (
              <span style={{ fontSize: '18px' }}>✓</span>
            ) : (
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
        {/* QR Code - according to design system */}
        {joinUrl && (
          <div 
            className="p-2 rounded-[18px] mb-2 inline-block"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              boxShadow: '0 0 25px rgba(34, 211, 238, 0.35)'
            }}
          >
            <QRCodeSVG value={joinUrl} size={120} />
          </div>
        )}
        <div 
          className="text-xs mb-1"
          style={{
            color: '#c7d2fe',
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          {t('ui.scanToJoin')}
        </div>
        <div 
          className="text-xs"
          style={{
            color: '#c7d2fe',
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          jokup.tv
        </div>
      </div>

      {/* Central Game Title - according to design system */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 0.6))'
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
            style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))' }}
          >
            {/* Left side of bubble */}
            <path
              d="M 20 20 Q 20 10 30 10 L 180 10 Q 190 10 190 20 L 190 80 Q 190 90 180 90 L 30 90 Q 20 90 20 80 Z"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="4"
            />
            {/* Right side of bubble */}
            <path
              d="M 210 20 Q 210 10 220 10 L 370 10 Q 380 10 380 20 L 380 80 Q 380 90 370 90 L 220 90 Q 210 90 210 80 Z"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="4"
            />
            {/* Jagged crack line */}
            <path
              d="M 195 15 L 200 25 L 195 35 L 200 45 L 195 55 L 200 65 L 195 75 L 200 85"
              fill="none"
              stroke="rgba(139, 92, 246, 0.6)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Game Title Text - according to design system typography.h1 */}
          <div className="relative px-12 py-8">
            <div className="flex items-center justify-center gap-2">
              <span 
                className="text-6xl md:text-7xl font-black uppercase"
                style={{
                  color: '#8b5cf6',
                  textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8), 0 0 20px rgba(139, 92, 246, 0.6)',
                  fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                  letterSpacing: '1px',
                  fontWeight: 900
                }}
              >
                jok
              </span>
              <span 
                className="text-6xl md:text-7xl font-black uppercase"
                style={{
                  color: '#22d3ee',
                  textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8), 0 0 20px rgba(34, 211, 238, 0.6)',
                  fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                  letterSpacing: '1px',
                  fontWeight: 900
                }}
              >
                up
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Players in Circular Formation */}
      <div className="relative w-full h-screen">
        {players.length === 0 ? (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 mt-32">
            <div 
              className="text-xl"
              style={{
                color: '#c7d2fe',
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 600,
                lineHeight: 1.6
              }}
            >
              {t('ui.waitingForPlayers')}
            </div>
          </div>
        ) : (
          players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              index={index}
              totalPlayers={players.length}
              radius={radius}
            />
          ))
        )}
      </div>

      {/* Waiting for VIP Message - according to design system screens.lobby.waitingMessage */}
      {waitingForVIP && players.length > 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div 
            className="px-6 py-3 rounded-[18px] animate-pulse"
            style={{
              background: 'rgba(25, 15, 60, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(34, 211, 238, 0.5)',
              boxShadow: '0 0 40px rgba(34, 211, 238, 0.45)'
            }}
          >
            <div 
              className="text-lg font-bold"
              style={{
                color: '#22d3ee',
                fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 900
              }}
            >
              {t('ui.waitingForVIP')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
