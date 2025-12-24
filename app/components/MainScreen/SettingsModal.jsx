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
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-purple-500 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          {t('ui.settings')}
        </h2>

        <div className="space-y-6">
          {/* Volume Setting */}
          <div>
            <label className="block text-gray-300 mb-3 font-semibold text-lg">
              {t('ui.volume')}: {volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Language Setting */}
          <div>
            <label className="block text-gray-300 mb-3 font-semibold text-lg">
              {t('ui.language')}
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-purple-500 rounded-lg text-white text-lg focus:outline-none focus:border-yellow-400"
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
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

