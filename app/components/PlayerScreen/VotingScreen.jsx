'use client'

import { useEffect, useState } from 'react'

export default function VotingScreen({ currentMatchUp, isLastLash, lastLashAnswers, onVote, playerId, timer, timerExpired }) {
  const [voted, setVoted] = useState(false)
  const [rankings, setRankings] = useState({}) // { answerIndex: place (1, 2, or 3) }
  const [timeRemaining, setTimeRemaining] = useState(timer || 30)
  const votersCount = currentMatchUp?.votersCount || 0
  const totalPlayers = currentMatchUp?.totalPlayers || 0
  // Determine required selections: 2 for 3 players, 3 for more players
  const requiredSelections = totalPlayers === 3 ? 2 : 3

  useEffect(() => {
    // Reset voting state whenever a new match-up or phase arrives
    // Reset when promptId changes (new match-up) or when switching between regular/Last Lash voting
    setVoted(false)
    setRankings({})
    setTimeRemaining(timer || 30)
  }, [currentMatchUp?.promptId, isLastLash])

  useEffect(() => {
    // Only update timer if we haven't started voting yet
    // This prevents resetting the timer mid-voting
    if (timer !== undefined && !voted && Object.keys(rankings).length === 0) {
      setTimeRemaining(timer)
    }
  }, [timer, voted, rankings])

  useEffect(() => {
    if (timeRemaining <= 0 || timerExpired) {
      // If timer expired and user hasn't voted, submit whatever they selected
      if (!voted && isLastLash && Object.keys(rankings).length > 0) {
        const rankingsArray = Object.entries(rankings).map(([idx, place]) => ({
          answerIndex: parseInt(idx),
          place: place
        }))
        onVote(rankingsArray)
        setVoted(true)
      }
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, timerExpired, voted, isLastLash, rankings, onVote])

  // Check if player is author (can't vote on own match-up)
  const isAuthor = currentMatchUp && currentMatchUp.players && currentMatchUp.players.includes(playerId)

  const handleVote = (vote) => {
    if (voted || isAuthor || timeRemaining <= 0 || timerExpired) return
    onVote(vote)
    setVoted(true)
  }

  const handleLastLashVote = (answerIndex) => {
    if (voted || timeRemaining <= 0 || timerExpired) return
    
    // If already ranked, don't allow re-selection
    if (rankings[answerIndex]) return
    
    // Get current number of selected answers
    const currentSelections = Object.keys(rankings).length
    const nextPlace = currentSelections + 1
    
    // Assign place sequentially: 1st click = 1st place, 2nd click = 2nd place, etc.
    const newRankings = { ...rankings, [answerIndex]: nextPlace }
    setRankings(newRankings)
    
    // If this is the last required selection, automatically submit the vote
    if (nextPlace === requiredSelections) {
      // Create rankings array: [{ answerIndex: 0, place: 1 }, ...]
      const rankingsArray = Object.entries(newRankings).map(([idx, place]) => ({
        answerIndex: parseInt(idx),
        place: place
      }))
      
      // Send rankings to server
      onVote(rankingsArray)
      setVoted(true)
    }
  }
  
  const isTimerExpired = timeRemaining <= 0 || timerExpired

  if (isLastLash) {
    // Filter out own answer
    const filteredAnswers = lastLashAnswers.filter((answer, index) => answer.playerId !== playerId)
    const selectedCount = Object.keys(rankings).length
    const placeLabels = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd' }
    
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
            <p className="text-sm text-gray-400 mt-2">
              Click on your top {requiredSelections} answer{requiredSelections > 1 ? 's' : ''}: 1st click = 1st place{requiredSelections > 1 ? `, 2nd click = 2nd place${requiredSelections > 2 ? ', 3rd click = 3rd place' : ''}` : ''}
            </p>
            {selectedCount > 0 && (
              <p className="text-xs text-yellow-400 mt-2">
                Selected: {selectedCount} of {requiredSelections}
              </p>
            )}
            {totalPlayers > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {votersCount} of {totalPlayers} players voted
              </p>
            )}
          </div>

          <div className="space-y-3">
            {filteredAnswers.map((answer, originalIndex) => {
              // Find the original index in the full array
              const answerIndex = lastLashAnswers.findIndex(a => 
                a.playerId === answer.playerId && a.answer === answer.answer
              )
              const place = rankings[answerIndex]
              const isSelected = place !== undefined
              
              return (
                <div key={answerIndex} className="relative">
                  <button
                    onClick={() => !voted && !isTimerExpired && handleLastLashVote(answerIndex)}
                    disabled={voted || isTimerExpired || isSelected}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isTimerExpired || voted
                        ? 'bg-gray-700/50 border-gray-600 text-gray-500 cursor-not-allowed'
                        : isSelected
                        ? place === 1
                          ? 'bg-yellow-500/40 border-yellow-400'
                          : place === 2
                          ? 'bg-gray-400/40 border-gray-300'
                          : 'bg-orange-600/40 border-orange-500'
                        : 'bg-black/40 border-purple-500 hover:border-yellow-400 hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg flex-1">{answer.answer}</span>
                      {isSelected && (
                        <span className="text-xl font-bold ml-2">{placeLabels[place]}</span>
                      )}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          {isTimerExpired ? (
            <div className="w-full bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-center text-red-300">
              Time's up! Voting has ended.
              {selectedCount > 0 && !voted && (
                <p className="text-xs mt-2">Your {selectedCount} selected answer{selectedCount > 1 ? 's' : ''} {selectedCount === 1 ? 'has' : 'have'} been submitted.</p>
              )}
            </div>
          ) : voted ? (
            <div className="space-y-2">
              <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 text-center text-green-300">
                Votes submitted! Waiting for other players...
              </div>
              {totalPlayers > 0 && (
                <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg p-3 text-center">
                  <div className="text-sm text-blue-300">
                    {votersCount} of {totalPlayers} players voted
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(votersCount / totalPlayers) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : selectedCount < requiredSelections && (
            <div className="w-full bg-blue-500/20 border-2 border-blue-500 rounded-lg p-4 text-center text-blue-300">
              Select {requiredSelections - selectedCount} more answer{requiredSelections - selectedCount > 1 ? 's' : ''} to complete your vote
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
