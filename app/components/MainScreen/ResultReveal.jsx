'use client'

import { useEffect, useState } from 'react'

export default function ResultReveal({ results, isLastLash }) {
  const [showVotes, setShowVotes] = useState(false)
  const [showAuthors, setShowAuthors] = useState(false)
  const [animatedVotes, setAnimatedVotes] = useState({ A: 0, B: 0 })

  useEffect(() => {
    if (isLastLash) return
    const timer = setTimeout(() => {
      setShowVotes(true)
      const targetA = results.voteCounts.A || 0
      const targetB = results.voteCounts.B || 0
      const steps = 20
      let currentA = 0
      let currentB = 0
      const interval = setInterval(() => {
        currentA = Math.min(currentA + Math.ceil(targetA / steps), targetA)
        currentB = Math.min(currentB + Math.ceil(targetB / steps), targetB)
        setAnimatedVotes({ A: currentA, B: currentB })
        if (currentA >= targetA && currentB >= targetB) {
          clearInterval(interval)
          setTimeout(() => setShowAuthors(true), 1000)
        }
      }, 50)
      return () => clearInterval(interval)
    }, 1000)

    return () => clearTimeout(timer)
  }, [results, isLastLash])

  if (isLastLash) {
    const [showFirstPlace, setShowFirstPlace] = useState(false)
    const [showSecondPlace, setShowSecondPlace] = useState(false)
    const [showThirdPlace, setShowThirdPlace] = useState(false)
    const [showAllScores, setShowAllScores] = useState(false)
    
    const entries = results?.entries || []
    
    useEffect(() => {
      // Show all answers first
      const timer1 = setTimeout(() => {
        setShowFirstPlace(true)
      }, 500)
      
      // Show second place after delay
      const timer2 = setTimeout(() => {
        setShowSecondPlace(true)
      }, 2000)
      
      // Show third place after delay
      const timer3 = setTimeout(() => {
        setShowThirdPlace(true)
      }, 3500)
      
      // Show all scores after all places are shown
      const timer4 = setTimeout(() => {
        setShowAllScores(true)
      }, 5000)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
      }
    }, [])
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <div className="max-w-5xl w-full space-y-[28px]">
          <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-[48px] border border-[rgba(139,92,246,0.35)] text-center shadow-[0_0_40px_rgba(139,92,246,0.35)]">
            <h2 className="text-[38px] font-black mb-2 text-[#f9fafb]">Last Lash Results</h2>
            <p className="text-[20px] text-[#c7d2fe]">{results?.prompt}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[28px]">
            {entries.map((entry, idx) => {
              const placeCounts = entry.placeCounts || { first: 0, second: 0, third: 0 }
              const totalPoints = entry.totalPoints || 0
              
              return (
                <div
                  key={entry.playerId || idx}
                  className={`bg-[rgba(255,255,255,0.04)] backdrop-blur-[16px] rounded-[18px] p-[22px] border transition-all duration-[0.15s] ease-in-out hover:translate-y-[-2px] hover:border-[#22d3ee] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] ${
                    showAllScores && totalPoints > 0 
                      ? 'border-[#22d3ee] shadow-[0_0_25px_rgba(34,211,238,0.35)]' 
                      : 'border-[rgba(139,92,246,0.35)] shadow-[0_0_25px_rgba(139,92,246,0.35)]'
                  }`}
                >
                  <div className="text-[18px] text-[#c7d2fe] mb-2 font-semibold">{entry.playerName}</div>
                  <div className="text-[20px] text-[#f9fafb] min-h-[80px]">{entry.answer}</div>
                  
                  {/* Show places progressively */}
                  <div className="mt-3 space-y-2">
                    {showFirstPlace && placeCounts.first > 0 && (
                      <div className="text-[22px] font-black text-[#22d3ee] animate-fade-in">
                        🥇 {placeCounts.first} first place{placeCounts.first > 1 ? 's' : ''}
                      </div>
                    )}
                    {showSecondPlace && placeCounts.second > 0 && (
                      <div className="text-[22px] font-black text-[#c7d2fe] animate-fade-in">
                        🥈 {placeCounts.second} second place{placeCounts.second > 1 ? 's' : ''}
                      </div>
                    )}
                    {showThirdPlace && placeCounts.third > 0 && (
                      <div className="text-[22px] font-black text-[#8b5cf6] animate-fade-in">
                        🥉 {placeCounts.third} third place{placeCounts.third > 1 ? 's' : ''}
                      </div>
                    )}
                    {showAllScores && (
                      <div className="text-[30px] font-black text-[#22d3ee] mt-2 animate-fade-in">
                        {totalPoints} points
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
      <div className="max-w-5xl w-full space-y-[48px]">
        {/* Prompt */}
        <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-[48px] border border-[rgba(139,92,246,0.35)] text-center shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <h2 className="text-[38px] font-black text-[#f9fafb]">{results.prompt}</h2>
        </div>

        {/* Answers with Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[28px]">
          {/* Answer A */}
          <div className={`bg-[rgba(255,255,255,0.04)] backdrop-blur-[16px] rounded-[18px] p-[22px] border transition-all duration-[0.15s] ease-in-out hover:translate-y-[-2px] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] ${
            results.voteCounts.A > results.voteCounts.B 
              ? 'border-[#22d3ee] scale-105 shadow-[0_0_25px_rgba(34,211,238,0.35)]' 
              : 'border-[rgba(139,92,246,0.35)] shadow-[0_0_25px_rgba(139,92,246,0.35)]'
          }`}>
            <div className="text-[22px] font-black text-[#22d3ee] mb-4">Answer A</div>
            <div className="text-[20px] text-[#f9fafb] mb-4 min-h-[100px] flex items-center justify-center">
              {results.answerA}
            </div>
            {showVotes && (
              <div className="text-[38px] font-black text-[#22d3ee] text-center mb-2">
                {animatedVotes.A} votes
              </div>
            )}
            {showAuthors && (
              <div className="text-center mt-4">
                <div className="text-[18px] text-[#c7d2fe]">Written by</div>
                <div className="text-[22px] font-black text-[#22d3ee]">{results.authorA}</div>
                {results.scores && results.scores[results.players?.[0]] && (
                  <div className="text-[20px] text-[#22d3ee] mt-2 font-black">
                    +{results.scores[results.players[0]]} points
                  </div>
                )}
              </div>
            )}
            {results.isJokUp && results.jokUpPlayer === results.authorA && (
              <div className="text-center mt-4 text-[30px] font-black text-[#22d3ee] animate-pulse">
                JOKUP! 🎉
              </div>
            )}
          </div>

          {/* Answer B */}
          <div className={`bg-[rgba(255,255,255,0.04)] backdrop-blur-[16px] rounded-[18px] p-[22px] border transition-all duration-[0.15s] ease-in-out hover:translate-y-[-2px] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] ${
            results.voteCounts.B > results.voteCounts.A 
              ? 'border-[#22d3ee] scale-105 shadow-[0_0_25px_rgba(34,211,238,0.35)]' 
              : 'border-[rgba(139,92,246,0.35)] shadow-[0_0_25px_rgba(139,92,246,0.35)]'
          }`}>
            <div className="text-[22px] font-black text-[#8b5cf6] mb-4">Answer B</div>
            <div className="text-[20px] text-[#f9fafb] mb-4 min-h-[100px] flex items-center justify-center">
              {results.answerB}
            </div>
            {showVotes && (
              <div className="text-[38px] font-black text-[#8b5cf6] text-center mb-2">
                {animatedVotes.B} votes
              </div>
            )}
            {showAuthors && (
              <div className="text-center mt-4">
                <div className="text-[18px] text-[#c7d2fe]">Written by</div>
                <div className="text-[22px] font-black text-[#8b5cf6]">{results.authorB}</div>
                {results.scores && results.scores[results.players?.[1]] && (
                  <div className="text-[20px] text-[#22d3ee] mt-2 font-black">
                    +{results.scores[results.players[1]]} points
                  </div>
                )}
              </div>
            )}
            {results.isJokUp && results.jokUpPlayer === results.authorB && (
              <div className="text-center mt-4 text-[30px] font-black text-[#22d3ee] animate-pulse">
                JOKUP! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
