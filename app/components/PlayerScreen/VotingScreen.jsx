'use client'

import { useEffect, useState } from 'react'

export default function VotingScreen({ currentMatchUp, isLastLash, lastLashAnswers, onVote, playerId, timer, timerExpired }) {
  const [voted, setVoted] = useState(false)
  const [selectedVotes, setSelectedVotes] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(timer || 30)

  useEffect(() => {
    // Reset voting state whenever a new match-up or phase arrives
    // Reset when promptId changes (new match-up) or when switching between regular/Last Lash voting
    setVoted(false)
    setSelectedVotes([])
    setTimeRemaining(timer || 30)
  }, [currentMatchUp?.promptId, isLastLash, timer])

  useEffect(() => {
    if (timer !== undefined) {
      setTimeRemaining(timer)
    }
  }, [timer])

  useEffect(() => {
    if (timeRemaining <= 0 || timerExpired) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, timerExpired])

  // Check if player is author (can't vote on own match-up)
  const isAuthor = currentMatchUp && currentMatchUp.players && currentMatchUp.players.includes(playerId)

  const handleVote = (vote) => {
    if (voted || isAuthor || timeRemaining <= 0 || timerExpired) return
    onVote(vote)
    setVoted(true)
  }

  const handleLastLashVote = (answerIndex) => {
    if (voted || timeRemaining <= 0 || timerExpired) return
    if (selectedVotes.includes(answerIndex)) {
      // Deselect
      setSelectedVotes(selectedVotes.filter(i => i !== answerIndex))
    } else if (selectedVotes.length < 3) {
      // Select (max 3 votes)
      setSelectedVotes([...selectedVotes, answerIndex])
    }
  }

  const submitLastLashVotes = () => {
    if (selectedVotes.length === 0 || timeRemaining <= 0 || timerExpired) return
    // Send indices, server will handle player ID mapping
    onVote(selectedVotes)
    setVoted(true)
  }
  
  const isTimerExpired = timeRemaining <= 0 || timerExpired

  if (isLastLash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Timer */}
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500 text-center">
            <div className="text-sm text-gray-300 mb-2">Time Remaining</div>
            <div className={`text-6xl font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
              {timeRemaining}
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500 text-center">
            <h2 className="text-2xl font-bold mb-4">The Last Lash</h2>
            <p className="text-lg text-gray-300">{currentMatchUp?.prompt || 'Vote for your favorites!'}</p>
            <p className="text-sm text-gray-400 mt-2">Select up to 3 answers</p>
          </div>

          <div className="space-y-3">
            {lastLashAnswers.map((answer, index) => {
              const isSelected = selectedVotes.includes(index)
              const isOwnAnswer = answer.playerId === playerId
              return (
                <button
                  key={index}
                  onClick={() => !isOwnAnswer && handleLastLashVote(index)}
                  disabled={isOwnAnswer || voted || isTimerExpired}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isOwnAnswer || isTimerExpired
                      ? 'bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-yellow-500/30 border-yellow-400 transform scale-105'
                      : 'bg-black/40 border-purple-500 hover:border-yellow-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{answer.answer}</span>
                    {isSelected && <span className="text-yellow-400">✓</span>}
                    {isOwnAnswer && <span className="text-xs text-gray-500">(Your answer)</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {isTimerExpired ? (
            <div className="w-full bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-center text-red-300">
              Time's up! Voting has ended.
            </div>
          ) : !voted ? (
            <button
              onClick={submitLastLashVotes}
              disabled={selectedVotes.length === 0}
              className={`w-full py-4 rounded-lg text-xl font-bold transition-all ${
                selectedVotes.length > 0
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Votes ({selectedVotes.length}/3)
            </button>
          ) : (
            <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 text-center text-green-300">
              Votes submitted!
            </div>
          )}
        </div>
      </div>
    )
  }

  // Regular match-up voting
  if (!currentMatchUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500 text-center">
          <div className="text-xl text-yellow-400">Loading match-up...</div>
        </div>
      </div>
    )
  }

  if (isAuthor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500 text-center">
          <div className="text-xl text-yellow-400">You're in this match-up!</div>
          <div className="text-gray-300 mt-2">Waiting for others to vote...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Timer */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500 text-center">
          <div className="text-sm text-gray-300 mb-2">Time Remaining</div>
          <div className={`text-6xl font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
            {timeRemaining}
          </div>
        </div>

        {/* Prompt */}
        {currentMatchUp && (
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500 text-center">
            <h2 className="text-2xl font-bold">{currentMatchUp.prompt}</h2>
          </div>
        )}

        {/* Voting Buttons */}
        {currentMatchUp && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleVote('A')}
              disabled={voted || isTimerExpired}
              className={`p-8 rounded-2xl border-2 transition-all transform ${
                voted || isTimerExpired
                  ? 'bg-gray-700/50 border-gray-600 cursor-not-allowed'
                  : 'bg-blue-600/30 border-blue-500 hover:border-yellow-400 hover:scale-105'
              }`}
            >
              <div className="text-xl font-bold text-blue-400 mb-4">Answer A</div>
              <div className="text-lg text-gray-200">{currentMatchUp.answerA}</div>
            </button>

            <button
              onClick={() => handleVote('B')}
              disabled={voted || isTimerExpired}
              className={`p-8 rounded-2xl border-2 transition-all transform ${
                voted || isTimerExpired
                  ? 'bg-gray-700/50 border-gray-600 cursor-not-allowed'
                  : 'bg-pink-600/30 border-pink-500 hover:border-yellow-400 hover:scale-105'
              }`}
            >
              <div className="text-xl font-bold text-pink-400 mb-4">Answer B</div>
              <div className="text-lg text-gray-200">{currentMatchUp.answerB}</div>
            </button>
          </div>
        )}

        {isTimerExpired ? (
          <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-center text-red-300">
            Time's up! Voting has ended.
          </div>
        ) : voted ? (
          <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 text-center text-green-300">
            Vote submitted!
          </div>
        ) : null}
      </div>
    </div>
  )
}
