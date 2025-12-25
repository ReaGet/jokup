'use client'

import { useEffect, useState } from 'react'

export default function FinalWinner({ finalScores, winner }) {
  const [showWinner, setShowWinner] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowWinner(true), 500)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
      <div className="max-w-4xl w-full space-y-[48px] text-center">
        {/* Winner Announcement */}
        <div className={`transition-all duration-1000 ${showWinner ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h1 className="text-[64px] font-black mb-8 animate-pulse" style={{ background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            🏆 WINNER 🏆
          </h1>
          <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-[48px] border-2 border-[#22d3ee] mb-8 shadow-[0_0_60px_rgba(34,211,238,0.7)]">
            <div className="text-[64px] font-black text-[#22d3ee] mb-4">{winner.name}</div>
            <div className="text-[38px] text-[#c7d2fe]">with {winner.score} points!</div>
          </div>
        </div>

        {/* Final Rankings */}
        <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-[48px] border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <h2 className="text-[30px] font-black mb-6 text-[#f9fafb]">Final Rankings</h2>
          <div className="space-y-[20px]">
            {finalScores.map((player, index) => (
              <div
                key={player.id}
                className={`rounded-[18px] p-[22px] flex items-center justify-between transition-all duration-[0.15s] ease-in-out ${
                  player.id === winner.id
                    ? 'bg-[rgba(34,211,238,0.2)] border border-[#22d3ee] shadow-[0_0_25px_rgba(34,211,238,0.35)]'
                    : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.35)] hover:translate-y-[-2px] hover:border-[#22d3ee] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-[22px] font-black ${
                    player.id === winner.id ? 'text-[#22d3ee]' : 'text-[#c7d2fe]'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="text-[20px] font-semibold text-[#f9fafb]">{player.name}</div>
                </div>
                <div className="text-[22px] font-black text-[#22d3ee]">
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[20px] text-[#c7d2fe] mt-8">
          Thanks for playing Jokup!
        </div>
      </div>
    </div>
  )
}
