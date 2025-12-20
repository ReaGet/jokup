'use client'

import { useEffect, useState } from 'react'

export default function FinalWinner({ finalScores, winner }) {
  const [showWinner, setShowWinner] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowWinner(true), 500)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Winner Announcement */}
        <div className={`transition-all duration-1000 ${showWinner ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h1 className="text-7xl font-bold mb-8 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            🏆 WINNER 🏆
          </h1>
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-12 border-4 border-yellow-500 mb-8">
            <div className="text-6xl font-bold text-yellow-400 mb-4">{winner.name}</div>
            <div className="text-4xl text-gray-300">with {winner.score} points!</div>
          </div>
        </div>

        {/* Final Rankings */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500">
          <h2 className="text-3xl font-bold mb-6">Final Rankings</h2>
          <div className="space-y-3">
            {finalScores.map((player, index) => (
              <div
                key={player.id}
                className={`rounded-lg p-4 flex items-center justify-between ${
                  player.id === winner.id
                    ? 'bg-yellow-500/30 border-2 border-yellow-400'
                    : 'bg-purple-600/30 border border-purple-400'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${
                    player.id === winner.id ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="text-xl font-semibold">{player.name}</div>
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-2xl text-gray-400 mt-8">
          Thanks for playing Jokup!
        </div>
      </div>
    </div>
  )
}
