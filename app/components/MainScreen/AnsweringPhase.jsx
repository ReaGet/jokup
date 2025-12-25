'use client'

import UserVotingProgress from './UserVotingProgress'
import { useTranslation } from '../../utils/useTranslation'

export default function AnsweringPhase({ timeRemaining, playersCompleted, totalPlayers, currentPrompt, players = [], playerAnswerCounts = {} }) {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#1b0f3b,#0b0618_70%)] p-12 relative">
      <div className="text-center space-y-12 max-w-4xl w-full">
        {/* Timer */}
        <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-12 border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <p className="text-xl text-[#c7d2fe] mb-6 font-semibold">{t('ui.timeRemaining')}</p>
          <div className="text-9xl font-black text-[#22d3ee]">
            {timeRemaining}
          </div>
        </div>

        {/* Waiting Animation */}
        <div className="text-2xl text-[#c7d2fe] animate-pulse font-semibold">
          {t('ui.waitingForPlayersAnswer')}
        </div>
      </div>
      
      {/* User Voting Progress Tracker */}
      {players.length > 0 && (
        <UserVotingProgress 
          players={players} 
          playerAnswerCounts={playerAnswerCounts}
        />
      )}
    </div>
  )
}
