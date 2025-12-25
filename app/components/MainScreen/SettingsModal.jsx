'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../../utils/useTranslation'

const STORAGE_KEY = 'jokup_host_settings'

export default function SettingsModal({ isOpen, onClose, onSettingsChange, socket, roomCode }) {
  const { t, language } = useTranslation()
  const [volume, setVolume] = useState(50)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const onSettingsChangeRef = useRef(onSettingsChange)
  
  // Keep ref updated with latest callback
  useEffect(() => {
    onSettingsChangeRef.current = onSettingsChange
  }, [onSettingsChange])

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        const { volume: savedVolume, language: savedLanguage } = JSON.parse(savedSettings)
        if (savedVolume !== undefined) {
          setVolume(savedVolume)
        }
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage)
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }, [])

  // Save settings to localStorage and update room
  const handleSave = () => {
    const settings = {
      volume,
      language: selectedLanguage,
    }

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (err) {
      console.error('Error saving settings:', err)
    }

    // Update room settings if room exists
    if (socket && roomCode) {
      socket.emit('update-room-settings', {
        roomCode,
        settings,
      })
    }

    // Notify parent component
    if (onSettingsChangeRef.current) {
      onSettingsChangeRef.current(settings)
    }

    onClose()
  }

  // Update settings when they change (auto-save)
  useEffect(() => {
    if (!isOpen) return

    const settings = {
      volume,
      language: selectedLanguage,
    }

    // Save to localStorage immediately
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (err) {
      console.error('Error saving settings:', err)
    }

    // Update room settings if room exists
    if (socket && roomCode) {
      socket.emit('update-room-settings', {
        roomCode,
        settings,
      })
    }

    // Notify parent component
    if (onSettingsChangeRef.current) {
      onSettingsChangeRef.current(settings)
    }
  }, [volume, selectedLanguage, isOpen, socket, roomCode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-12 max-w-md w-full border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)]">
        <h2 className="text-[30px] font-black mb-8 text-[#f9fafb] text-center">
          {t('ui.settings')}
        </h2>

        <div className="space-y-8">
          {/* Volume Setting */}
          <div>
            <label className="block text-[#c7d2fe] mb-4 font-semibold text-lg">
              {t('ui.volume')}: {volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-3 bg-[rgba(255,255,255,0.04)] rounded-[18px] appearance-none cursor-pointer accent-[#8b5cf6]"
            />
          </div>

          {/* Language Setting */}
          <div>
            <label className="block text-[#c7d2fe] mb-4 font-semibold text-lg">
              {t('ui.language')}
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-[22px] bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.35)] rounded-[18px] text-[#f9fafb] text-lg focus:outline-none focus:border-[#22d3ee] focus:shadow-[0_0_25px_rgba(34,211,238,0.35)] transition-all duration-[150ms] ease"
            >
              <option value="en">{t('ui.english')}</option>
              <option value="ru">{t('ui.russian')}</option>
            </select>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-7 py-[22px] bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] hover:-translate-y-[2px] text-[#f9fafb] font-black rounded-[18px] transition-all duration-[150ms] ease shadow-[0_0_40px_rgba(34,211,238,0.45)] hover:shadow-[0_0_60px_rgba(34,211,238,0.7)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

