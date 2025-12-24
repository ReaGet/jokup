'use client'

import UserVotingProgress from './UserVotingProgress'
import { useTranslation } from '../../utils/useTranslation'

export default function AnsweringPhase({ timeRemaining, playersCompleted, totalPlayers, currentPrompt, players = [], playerAnswerCounts = {} }) {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 relative">
      <div className="text-center space-y-12 max-w-4xl w-full">
        {/* Timer */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500">
          <p className="text-2xl text-gray-300 mb-4">{t('ui.timeRemaining')}</p>
          <div className="text-9xl font-bold text-yellow-400">
            {timeRemaining}
          </div>
        </div>

        {/* Waiting Animation */}
        <div className="text-3xl text-gray-300 animate-pulse">
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
