'use client'

import { useEffect, useRef, useState } from 'react'
import { PlayerAvatar } from '../../utils/avatarUtils'

// User card component for progress tracker
function UserCard({ player, answerCount }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Avatar */}
      <div className="mb-2 relative">
        <PlayerAvatar playerId={player.id} isVIP={player.isVIP} size="w-16 h-16" />
        
        {/* VIP Badge */}
        {player.isVIP && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[8px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5 border-2 border-black z-10 shadow-lg">
            <span>⭐</span>
            <span>VIP</span>
          </div>
        )}
      </div>
      
      {/* Name */}
      <div className="bg-black/80 border-2 border-white px-2 py-1 rounded">
        <div className="text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap">
          {player.name}
        </div>
      </div>
      
      {/* Answer count indicator */}
      {answerCount > 0 && (
        <div className="mt-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {answerCount}
        </div>
      )}
    </div>
  )
}

export default function UserVotingProgress({ players, playerAnswerCounts }) {
  const prevAnswerCountsRef = useRef({})
  const animationKeysRef = useRef({})
  const [animatingPlayers, setAnimatingPlayers] = useState(new Set())
  const [animationKeys, setAnimationKeys] = useState({})
  
  useEffect(() => {
    // Check for changes in answer counts and trigger animations
    const newAnimating = new Set()
    const newKeys = { ...animationKeysRef.current }
    
    players.forEach(player => {
      const prevCount = prevAnswerCountsRef.current[player.id] || 0
      const currentCount = playerAnswerCounts[player.id] || 0
      
      if (currentCount > prevCount) {
        // Player answered a prompt, trigger animation
        newAnimating.add(player.id)
        // Generate new key to force re-render and restart animation
        newKeys[player.id] = (newKeys[player.id] || 0) + 1
        
        // Remove from animating set after animation completes
        setTimeout(() => {
          setAnimatingPlayers(prev => {
            const updated = new Set(prev)
            updated.delete(player.id)
            return updated
          })
        }, 600) // Match animation duration
      }
    })
    
    if (newAnimating.size > 0) {
      setAnimatingPlayers(newAnimating)
      animationKeysRef.current = newKeys
      setAnimationKeys(newKeys)
    }
    
    // Update previous counts
    prevAnswerCountsRef.current = { ...playerAnswerCounts }
  }, [playerAnswerCounts, players])
  
  return (
    <>
      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes jumpUp {
          0% {
            transform: translateY(var(--start-y)) scale(1);
          }
          30% {
            transform: translateY(calc(var(--start-y) - 30px)) scale(1.15);
          }
          60% {
            transform: translateY(calc(var(--start-y) - 10px)) scale(1.05);
          }
          100% {
            transform: translateY(var(--end-y)) scale(1);
          }
        }
        
        .user-jump-animation {
          animation: jumpUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
      
      {/* User Progress Container */}
      {players && players.length > 0 && (
        <div className="absolute bottom-4 left-0 right-0 z-50">
          <div className="flex flex-wrap items-end justify-center gap-4 px-4">
            {players.map((player) => {
            const answerCount = playerAnswerCounts[player.id] || 0
            const prevCount = prevAnswerCountsRef.current[player.id] || 0
            const isAnimating = animatingPlayers.has(player.id)
            const translateY = answerCount * 100
            const prevTranslateY = prevCount * 100
            
            return (
              <div
                key={`${player.id}-${animationKeys[player.id] || 0}`}
                className={`relative flex flex-col items-center ${
                  isAnimating ? 'user-jump-animation' : 'transition-transform duration-300'
                }`}
                style={{
                  transform: `translateY(-${translateY}px)`,
                  '--start-y': `-${prevTranslateY}px`,
                  '--end-y': `-${translateY}px`,
                }}
              >
                <UserCard 
                  player={player} 
                  answerCount={answerCount}
                />
              </div>
            )
          })}
          </div>
        </div>
      )}
    </>
  )
}





