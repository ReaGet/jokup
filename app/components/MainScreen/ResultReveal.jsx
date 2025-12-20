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
    const entries = results?.entries || []
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-5xl w-full space-y-6">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500 text-center">
            <h2 className="text-4xl font-bold mb-2">Last Lash Results</h2>
            <p className="text-xl text-gray-300">{results?.prompt}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry, idx) => (
              <div
                key={entry.playerId || idx}
                className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-500"
              >
                <div className="text-lg text-gray-400 mb-2">{entry.playerName}</div>
                <div className="text-xl text-gray-200 min-h-[80px]">{entry.answer}</div>
                <div className="text-3xl font-bold text-yellow-400 mt-3">{entry.votes || 0} votes</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-5xl w-full space-y-8">
        {/* Prompt */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500 text-center">
          <h2 className="text-4xl font-bold">{results.prompt}</h2>
        </div>

        {/* Answers with Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Answer A */}
          <div className={`bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 transition-all duration-500 ${
            results.voteCounts.A > results.voteCounts.B ? 'border-yellow-500 scale-105' : 'border-blue-500'
          }`}>
            <div className="text-2xl font-bold text-blue-400 mb-4">Answer A</div>
            <div className="text-xl text-gray-200 mb-4 min-h-[100px] flex items-center justify-center">
              {results.answerA}
            </div>
            {showVotes && (
              <div className="text-4xl font-bold text-blue-400 text-center mb-2">
                {animatedVotes.A} votes
              </div>
            )}
            {showAuthors && (
              <div className="text-center mt-4">
                <div className="text-lg text-gray-400">Written by</div>
                <div className="text-2xl font-bold text-blue-300">{results.authorA}</div>
                {results.scores && results.scores[results.players?.[0]] && (
                  <div className="text-xl text-yellow-400 mt-2">
                    +{results.scores[results.players[0]]} points
                  </div>
                )}
              </div>
            )}
            {results.isJokUp && results.jokUpPlayer === results.authorA && (
              <div className="text-center mt-4 text-3xl font-bold text-yellow-400 animate-pulse">
                JOKUP! 🎉
              </div>
            )}
          </div>

          {/* Answer B */}
          <div className={`bg-black/40 backdrop-blur-lg rounded-2xl p-8 border-2 transition-all duration-500 ${
            results.voteCounts.B > results.voteCounts.A ? 'border-yellow-500 scale-105' : 'border-pink-500'
          }`}>
            <div className="text-2xl font-bold text-pink-400 mb-4">Answer B</div>
            <div className="text-xl text-gray-200 mb-4 min-h-[100px] flex items-center justify-center">
              {results.answerB}
            </div>
            {showVotes && (
              <div className="text-4xl font-bold text-pink-400 text-center mb-2">
                {animatedVotes.B} votes
              </div>
            )}
            {showAuthors && (
              <div className="text-center mt-4">
                <div className="text-lg text-gray-400">Written by</div>
                <div className="text-2xl font-bold text-pink-300">{results.authorB}</div>
                {results.scores && results.scores[results.players?.[1]] && (
                  <div className="text-xl text-yellow-400 mt-2">
                    +{results.scores[results.players[1]]} points
                  </div>
                )}
              </div>
            )}
            {results.isJokUp && results.jokUpPlayer === results.authorB && (
              <div className="text-center mt-4 text-3xl font-bold text-yellow-400 animate-pulse">
                JOKUP! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
