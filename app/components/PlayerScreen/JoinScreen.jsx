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

    if (!playerName || playerName.trim().length === 0) {
      setError(t('ui.pleaseEnterName'))
      return
    }

    if (playerName.length > 20) {
      setError(t('ui.nameMaxLength'))
      return
    }

    onJoin(roomCode.toUpperCase(), playerName.trim())
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            JOKUP
          </h1>
          <p className="text-gray-300">{t('ui.enterRoomCode')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
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
              className="w-full px-4 py-3 bg-gray-800 border-2 border-purple-500 rounded-lg text-white text-2xl text-center font-bold tracking-widest uppercase focus:outline-none focus:border-yellow-400"
              placeholder="ABCD"
              maxLength={4}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
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
              className="w-full px-4 py-3 bg-gray-800 border-2 border-purple-500 rounded-lg text-white text-lg focus:outline-none focus:border-yellow-400"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          {isRejoining && (
            <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg p-3 text-blue-300 text-center">
              {t('ui.rejoiningGame')}
            </div>
          )}

          {displayError && (
            <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-3 text-red-300 text-center">
              {displayError}
            </div>
          )}

          <button
            type="submit"
            disabled={isRejoining}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg text-xl transition-all transform hover:scale-105"
          >
            {isRejoining ? t('ui.rejoining') : t('ui.joinGame')}
          </button>
        </form>
      </div>
    </div>
  )
}
