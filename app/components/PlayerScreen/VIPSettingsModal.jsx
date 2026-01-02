'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../../utils/useTranslation'

const STORAGE_KEY = 'jokup_player_state'

export default function VIPSettingsModal({ isOpen, onClose, socket, roomCode, onEndGame }) {
  const { t, language } = useTranslation()
  const [enableVisitors, setEnableVisitors] = useState(false)

  // Load settings from localStorage and listen for room settings updates
  useEffect(() => {
    if (!socket) return

    // Load from localStorage first
    try {
      const savedSettings = localStorage.getItem('jokup_host_settings')
      if (savedSettings) {
        const { enableVisitors: savedEnableVisitors } = JSON.parse(savedSettings)
        if (savedEnableVisitors !== undefined) {
          setEnableVisitors(savedEnableVisitors)
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    }

    // Listen for room settings updates
    const handleSettingsUpdate = ({ settings: roomSettings }) => {
      if (roomSettings?.enableVisitors !== undefined) {
        setEnableVisitors(roomSettings.enableVisitors)
      }
    }

    socket.on('room-settings-updated', handleSettingsUpdate)

    return () => {
      socket.off('room-settings-updated', handleSettingsUpdate)
    }
  }, [socket])

  // Update settings when they change (auto-save)
  useEffect(() => {
    if (!isOpen || !socket || !roomCode) return

    const settings = {
      enableVisitors,
    }

    // Save to localStorage
    try {
      const existingSettings = localStorage.getItem('jokup_host_settings')
      const parsed = existingSettings ? JSON.parse(existingSettings) : {}
      localStorage.setItem('jokup_host_settings', JSON.stringify({
        ...parsed,
        ...settings,
      }))
    } catch (err) {
      console.error('Error saving settings:', err)
    }

    // Update room settings
    socket.emit('update-room-settings', {
      roomCode,
      settings,
    })
  }, [enableVisitors, isOpen, socket, roomCode])

  const handleEndGame = () => {
    if (socket && roomCode) {
      socket.emit('end-game-by-vip', { roomCode })
    }
    
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('jokup_host_settings')
    } catch (err) {
      console.error('Error clearing localStorage:', err)
    }

    // Call parent handler
    if (onEndGame) {
      onEndGame()
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-12 max-w-md w-full border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)]">
        <h2 className="text-[30px] font-black mb-8 text-[#f9fafb] text-center">
          {t('ui.settings')}
        </h2>

        <div className="space-y-8">
          {/* Enable Visitors Setting */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableVisitors}
                onChange={(e) => setEnableVisitors(e.target.checked)}
                className="w-5 h-5 rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.35)] text-[#8b5cf6] focus:ring-2 focus:ring-[#22d3ee] focus:ring-offset-0 cursor-pointer accent-[#8b5cf6]"
              />
              <span className="text-[#c7d2fe] font-semibold text-lg">
                {t('ui.visitorsEnabled')}
              </span>
            </label>
          </div>

          {/* End Game Button */}
          <div>
            <button
              onClick={handleEndGame}
              className="w-full px-7 py-[22px] bg-gradient-to-r from-red-600 to-red-500 hover:-translate-y-[2px] text-[#f9fafb] font-black rounded-[18px] transition-all duration-[150ms] ease shadow-[0_0_40px_rgba(239,68,68,0.45)] hover:shadow-[0_0_60px_rgba(239,68,68,0.7)]"
            >
              {language === 'ru' ? 'Завершить игру' : 'End Game'}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-7 py-[22px] bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] hover:-translate-y-[2px] text-[#f9fafb] font-black rounded-[18px] transition-all duration-[150ms] ease shadow-[0_0_40px_rgba(34,211,238,0.45)] hover:shadow-[0_0_60px_rgba(34,211,238,0.7)]"
          >
            {language === 'ru' ? 'Закрыть' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

