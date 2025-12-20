'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { PlayerAvatar } from '../../utils/avatarUtils'

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
          
          {/* VIP Badge */}
          {player.isVIP && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border-2 border-black z-10 shadow-lg">
              <span>⭐</span>
              <span>VIP</span>
            </div>
          )}
        </div>
        
        {/* Name Banner */}
        <div className="bg-black border-2 border-white px-3 py-1">
          <div className="text-white text-sm font-bold uppercase tracking-wider whitespace-nowrap">
            {player.name}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Lobby({ roomCode, players, waitingForVIP }) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  
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

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundColor: '#1a4d3a',
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(34, 197, 94, 0.1) 10px,
            rgba(34, 197, 94, 0.1) 20px
          )
        `
      }}
    >
      {/* Top Right Corner - Join Audience Section */}
      <div className="absolute top-6 right-6 text-right z-10">
        <div className="text-green-400 text-sm mb-1">Join the audience!</div>
        <div className="bg-black text-white text-2xl font-bold px-4 py-2 mb-1 border-2 border-white">
          {roomCode}
        </div>
        <div className="text-gray-400 text-xs">jokup.tv</div>
      </div>

      {/* Central Game Title */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div 
          className="relative"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
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
              style={{ filter: 'drop-shadow(0 0 4px white)' }}
            >
              {/* Left side of bubble */}
              <path
                d="M 20 20 Q 20 10 30 10 L 180 10 Q 190 10 190 20 L 190 80 Q 190 90 180 90 L 30 90 Q 20 90 20 80 Z"
                fill="none"
                stroke="white"
                strokeWidth="4"
              />
              {/* Right side of bubble */}
              <path
                d="M 210 20 Q 210 10 220 10 L 370 10 Q 380 10 380 20 L 380 80 Q 380 90 370 90 L 220 90 Q 210 90 210 80 Z"
                fill="none"
                stroke="white"
                strokeWidth="4"
              />
              {/* Jagged crack line */}
              <path
                d="M 195 15 L 200 25 L 195 35 L 200 45 L 195 55 L 200 65 L 195 75 L 200 85"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Game Title Text */}
            <div className="relative px-12 py-8">
              <div className="flex items-center justify-center gap-2">
                <span 
                  className="text-6xl md:text-7xl font-black uppercase tracking-tighter"
                  style={{
                    color: '#22c55e',
                    textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(255, 255, 255, 0.3)',
                    fontFamily: 'Arial Black, sans-serif',
                    letterSpacing: '-2px'
                  }}
                >
                  jok
                </span>
                <span 
                  className="text-6xl md:text-7xl font-black uppercase tracking-tighter"
                  style={{
                    color: '#3b82f6',
                    textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(255, 255, 255, 0.3)',
                    fontFamily: 'Arial Black, sans-serif',
                    letterSpacing: '-2px'
                  }}
                >
                  up
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players in Circular Formation */}
      <div className="relative w-full h-screen">
        {players.length === 0 ? (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 mt-32">
            <div className="text-gray-300 text-xl">Waiting for players to join...</div>
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

      {/* Waiting for VIP Message */}
      {waitingForVIP && players.length > 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/80 border-2 border-yellow-400 px-6 py-3 rounded-lg">
            <div className="text-yellow-400 text-lg font-bold animate-pulse">
              Waiting for VIP to start the game...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
