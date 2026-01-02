'use client'

import { useTranslation } from '../../utils/useTranslation'

export default function VisitorBanner() {
  const { t } = useTranslation()
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[rgba(139,92,246,0.95)] backdrop-blur-[16px] py-4 px-6 border-b border-[rgba(139,92,246,0.35)] shadow-[0_4px_20px_rgba(139,92,246,0.5)]">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-xl font-bold text-white">
          👀 {t('ui.visitorMode') || 'Вы подключены как гость'}
        </p>
      </div>
    </div>
  )
}


