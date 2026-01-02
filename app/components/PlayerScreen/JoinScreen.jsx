'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from '../../utils/useTranslation'

const STORAGE_KEY = 'jokup_player_state'

export default function JoinScreen({ onJoin, isRejoining = false, isAutoRejoining = false, error: serverError = '', onErrorClear }) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [isVisitor, setIsVisitor] = useState(false)
  const [error, setError] = useState('')

  // Load saved values from localStorage and URL params on mount
  useEffect(() => {
    // First, try to get code from URL
    const codeFromUrl = searchParams?.get('code')
    
    try {
      const savedState = localStorage.getItem(STORAGE_KEY)
      if (savedState) {
        const { roomCode: savedRoomCode, playerName: savedPlayerName } = JSON.parse(savedState)
        // Prefer URL code over saved code
        if (codeFromUrl) {
          setRoomCode(codeFromUrl.toUpperCase())
        } else if (savedRoomCode) {
          setRoomCode(savedRoomCode)
        }
        if (savedPlayerName) {
          setPlayerName(savedPlayerName)
        }
      } else if (codeFromUrl) {
        // No saved state, but we have code from URL
        setRoomCode(codeFromUrl.toUpperCase())
      }
    } catch (err) {
      console.error('Error loading saved state:', err)
      // Still try to use URL code if available
      if (codeFromUrl) {
        setRoomCode(codeFromUrl.toUpperCase())
      }
    }
  }, [searchParams])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!roomCode || roomCode.length !== 4) {
      setError(t('ui.pleaseEnterValidCode'))
      return
    }

    // Only validate name if not joining as visitor
    if (!isVisitor) {
      if (!playerName || playerName.trim().length === 0) {
        setError(t('ui.pleaseEnterName'))
        return
      }

      if (playerName.length > 20) {
        setError(t('ui.nameMaxLength'))
        return
      }
    }

    onJoin(roomCode.toUpperCase(), isVisitor ? null : playerName.trim(), isVisitor)
  }

  // Clear local error when server error is cleared
  useEffect(() => {
    if (!serverError && error) {
      setError('')
    }
  }, [serverError, error])

  // Display server error if present, otherwise show local validation error
  // Don't show error if it's from automatic rejoin on page load
  const displayError = (isAutoRejoining ? '' : serverError) || error

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-12"
      style={{
        background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)'
      }}
    >
      <div 
        className="w-full max-w-md rounded-[28px] p-12 md:p-12 border border-[rgba(139,92,246,0.35)]"
        style={{
          background: 'rgba(25, 15, 60, 0.75)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
        }}
      >
        <div className="text-center mb-12">
          <h1 
            className="text-[38px] md:text-[64px] font-black mb-4 tracking-[1px] bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(139, 92, 246, 0.6)'
            }}
          >
            JOKUP
          </h1>
          <p className="text-[#c7d2fe] text-lg">{t('ui.enterRoomCode')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label className="block text-[#c7d2fe] mb-2 font-semibold text-lg">
              {t('ui.roomCode')}
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase().slice(0, 4))
                // Clear local validation error when user starts typing
                if (error && !serverError) {
                  setError('')
                }
                // Clear server error when user starts typing
                if (serverError && onErrorClear) {
                  onErrorClear()
                }
              }}
              className="w-full px-4 py-3 rounded-[18px] text-[#f9fafb] text-2xl text-center font-bold tracking-widest uppercase focus:outline-none transition-all duration-150"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(139, 92, 246, 0.35)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#22d3ee'
                e.target.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.35)'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="ABCD"
              maxLength={4}
            />
          </div>

          {/* Join as Visitor Checkbox */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isVisitor}
                onChange={(e) => {
                  setIsVisitor(e.target.checked)
                  // Clear errors when toggling
                  if (error && onErrorClear) {
                    onErrorClear()
                  }
                  setError('')
                }}
                className="w-5 h-5 rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.35)] text-[#8b5cf6] focus:ring-2 focus:ring-[#22d3ee] focus:ring-offset-0 cursor-pointer accent-[#8b5cf6]"
              />
              <span className="text-[#c7d2fe] font-semibold text-lg">
                {t('ui.joinAsVisitor')}
              </span>
            </label>
          </div>

          {/* Name field - hidden when joining as visitor */}
          {!isVisitor && (
            <div>
              <label className="block text-[#c7d2fe] mb-2 font-semibold text-lg">
                {t('ui.yourName')}
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value)
                  // Clear local validation error when user starts typing
                  if (error && !serverError) {
                    setError('')
                  }
                  // Clear server error when user starts typing
                  if (serverError && onErrorClear) {
                    onErrorClear()
                  }
                }}
                className="w-full px-4 py-3 rounded-[18px] text-[#f9fafb] text-lg focus:outline-none transition-all duration-150"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(139, 92, 246, 0.35)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#22d3ee'
                  e.target.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.35)'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>
          )}

          {isRejoining && (
            <div 
              className="rounded-[18px] p-3 text-center text-[#22d3ee]"
              style={{
                background: 'rgba(34, 211, 238, 0.1)',
                border: '1px solid rgba(34, 211, 238, 0.35)',
                boxShadow: '0 0 25px rgba(34, 211, 238, 0.35)'
              }}
            >
              {t('ui.rejoiningGame')}
            </div>
          )}

          {displayError && (
            <div 
              className="rounded-[18px] p-3 text-center text-red-300"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.5)'
              }}
            >
              {displayError}
            </div>
          )}

          <button
            type="submit"
            disabled={isRejoining}
            className="w-full text-[#f9fafb] font-black py-7 rounded-[18px] text-[30px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isRejoining 
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(34, 211, 238, 0.5))'
                : 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
              boxShadow: '0 0 40px rgba(34, 211, 238, 0.45)'
            }}
            onMouseEnter={(e) => {
              if (!isRejoining) {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 0 60px rgba(34, 211, 238, 0.7)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.45)'
            }}
          >
            {isRejoining ? t('ui.rejoining') : t('ui.joinGame')}
          </button>
        </form>
      </div>
    </div>
  )
}
