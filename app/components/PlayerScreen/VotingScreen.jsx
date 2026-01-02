'use client'

import { useEffect, useState } from 'react'
import SettingsButton from './SettingsButton'

export default function VotingScreen({ currentMatchUp, isLastLash, lastLashAnswers, onVote, playerId, timer, timerExpired, isVisitor = false, isVIP, onOpenSettings }) {
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
  // Visitors can't vote
  const canVote = !isVisitor && !isAuthor

  const handleVote = (vote) => {
    if (voted || !canVote || timeRemaining <= 0 || timerExpired) return
    onVote(vote)
    setVoted(true)
  }

  const handleLastLashVote = (answerIndex) => {
    if (voted || !canVote || timeRemaining <= 0 || timerExpired) return
    
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
    // Filter out own answer (only for players, visitors see all)
    const filteredAnswers = isVisitor 
      ? lastLashAnswers 
      : lastLashAnswers.filter((answer, index) => answer.playerId !== playerId)
    const selectedCount = Object.keys(rankings).length
    const placeLabels = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd' }
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 md:p-9 lg:p-12" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <SettingsButton onClick={onOpenSettings} isVIP={isVIP} />
        <div className="w-full max-w-2xl space-y-7">
          {/* Timer */}
          <div className="text-center rounded-[28px] p-6 md:p-8 border" style={{ 
            background: 'rgba(25, 15, 60, 0.75)', 
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
          }}>
            <div className="text-sm mb-2" style={{ color: '#c7d2fe' }}>Time Remaining</div>
            <div className={`text-6xl font-black ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : ''}`} style={{ 
              color: timeRemaining <= 10 ? undefined : '#22d3ee',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}>
              {timeRemaining}
            </div>
          </div>
          
          <div className="text-center rounded-[28px] p-6 md:p-8 border" style={{ 
            background: 'rgba(25, 15, 60, 0.75)', 
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
          }}>
            <h2 className="text-3xl font-black mb-4" style={{ color: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>The Last Lash</h2>
            <p className="text-lg mb-2" style={{ color: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>{currentMatchUp?.prompt || 'Vote for your favorites!'}</p>
            {!isVisitor && (
              <p className="text-sm mt-2" style={{ color: '#c7d2fe', fontFamily: 'Inter, system-ui, sans-serif' }}>
                Click on your top {requiredSelections} answer{requiredSelections > 1 ? 's' : ''}: 1st click = 1st place{requiredSelections > 1 ? `, 2nd click = 2nd place${requiredSelections > 2 ? ', 3rd click = 3rd place' : ''}` : ''}
              </p>
            )}
            {isVisitor && (
              <p className="text-sm mt-2" style={{ color: '#c7d2fe', fontFamily: 'Inter, system-ui, sans-serif' }}>
                Watching as visitor - players are voting
              </p>
            )}
            {selectedCount > 0 && (
              <p className="text-xs mt-2" style={{ color: '#22d3ee', fontFamily: 'Inter, system-ui, sans-serif' }}>
                Selected: {selectedCount} of {requiredSelections}
              </p>
            )}
            {totalPlayers > 0 && (
              <p className="text-xs mt-1" style={{ color: '#c7d2fe', fontFamily: 'Inter, system-ui, sans-serif' }}>
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
                    onClick={() => canVote && !voted && !isTimerExpired && handleLastLashVote(answerIndex)}
                    disabled={!canVote || voted || isTimerExpired || isSelected}
                    className={`w-full p-5 rounded-[18px] border text-left transition-all duration-150 ${
                      isTimerExpired || voted || !canVote
                        ? 'cursor-not-allowed'
                        : isSelected
                        ? ''
                        : 'hover:-translate-y-1'
                    }`}
                    style={{
                      background: isTimerExpired || voted 
                        ? 'rgba(255, 255, 255, 0.02)' 
                        : isSelected
                        ? place === 1
                          ? 'rgba(255, 215, 0, 0.2)'
                          : place === 2
                          ? 'rgba(192, 192, 192, 0.2)'
                          : 'rgba(205, 127, 50, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                      backdropFilter: 'blur(16px)',
                      borderColor: isTimerExpired || voted
                        ? 'rgba(139, 92, 246, 0.2)'
                        : isSelected
                        ? place === 1
                          ? '#ffd700'
                          : place === 2
                          ? '#c0c0c0'
                          : '#cd7f32'
                        : 'rgba(139, 92, 246, 0.35)',
                      color: isTimerExpired || voted ? '#c7d2fe' : '#f9fafb',
                      boxShadow: !isTimerExpired && !voted && !isSelected ? '0 0 25px rgba(34, 211, 238, 0.35)' : 'none',
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      if (canVote && !voted && !isTimerExpired && !isSelected) {
                        e.currentTarget.style.borderColor = '#22d3ee'
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canVote && !voted && !isTimerExpired && !isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg flex-1 font-semibold">{answer.answer}</span>
                      {isSelected && (
                        <span className="text-xl font-black ml-2">{placeLabels[place]}</span>
                      )}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          {isTimerExpired ? (
            <div className="w-full rounded-[18px] p-5 text-center border" style={{ 
              background: 'rgba(255, 0, 0, 0.1)', 
              borderColor: 'rgba(255, 0, 0, 0.5)',
              color: '#f9fafb',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}>
              <div className="font-semibold">Time's up! Voting has ended.</div>
              {selectedCount > 0 && !voted && (
                <p className="text-xs mt-2" style={{ color: '#c7d2fe' }}>Your {selectedCount} selected answer{selectedCount > 1 ? 's' : ''} {selectedCount === 1 ? 'has' : 'have'} been submitted.</p>
              )}
            </div>
          ) : voted ? (
            <div className="space-y-2">
              <div className="rounded-[18px] p-5 text-center border" style={{ 
                background: 'rgba(0, 255, 0, 0.1)', 
                borderColor: 'rgba(0, 255, 0, 0.5)',
                color: '#f9fafb',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                <div className="font-semibold">Votes submitted! Waiting for other players...</div>
              </div>
              {totalPlayers > 0 && (
                <div className="rounded-[18px] p-4 text-center border" style={{ 
                  background: 'rgba(34, 211, 238, 0.1)', 
                  borderColor: 'rgba(34, 211, 238, 0.35)',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                  <div className="text-sm mb-2" style={{ color: '#22d3ee' }}>
                    {votersCount} of {totalPlayers} players voted
                  </div>
                  <div className="w-full rounded-full h-2 mt-2" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(votersCount / totalPlayers) * 100}%`,
                        background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : !isVisitor && selectedCount < requiredSelections && (
            <div className="w-full rounded-[18px] p-5 text-center border" style={{ 
              background: 'rgba(34, 211, 238, 0.1)', 
              borderColor: 'rgba(34, 211, 238, 0.35)',
              color: '#22d3ee',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}>
              Select {requiredSelections - selectedCount} more answer{requiredSelections - selectedCount > 1 ? 's' : ''} to complete your vote
            </div>
          )}
          {isVisitor && (
            <div className="w-full rounded-[18px] p-5 text-center border" style={{ 
              background: 'rgba(34, 211, 238, 0.1)', 
              borderColor: 'rgba(34, 211, 238, 0.35)',
              color: '#22d3ee',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}>
              Watching as visitor - players are voting
            </div>
          )}
        </div>
      </div>
    )
  }

  // Regular match-up voting
  if (!currentMatchUp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 md:p-9 lg:p-12" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <div className="rounded-[28px] p-6 md:p-8 border text-center" style={{ 
          background: 'rgba(25, 15, 60, 0.75)', 
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(139, 92, 246, 0.35)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)',
          color: '#22d3ee',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div className="text-xl font-semibold">Loading match-up...</div>
        </div>
      </div>
    )
  }

  if (isAuthor && !isVisitor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 md:p-9 lg:p-12" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
        <div className="rounded-[28px] p-6 md:p-8 border text-center" style={{ 
          background: 'rgba(25, 15, 60, 0.75)', 
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(139, 92, 246, 0.35)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div className="text-xl font-semibold mb-2" style={{ color: '#22d3ee' }}>You're in this match-up!</div>
          <div className="mt-2" style={{ color: '#c7d2fe' }}>Waiting for others to vote...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 md:p-9 lg:p-12" style={{ background: 'radial-gradient(circle at top, #1b0f3b, #0b0618 70%)' }}>
      <SettingsButton onClick={onOpenSettings} isVIP={isVIP} />
      <div className="w-full max-w-2xl space-y-7">
        {/* Timer */}
        <div className="text-center rounded-[28px] p-6 md:p-8 border" style={{ 
          background: 'rgba(25, 15, 60, 0.75)', 
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(139, 92, 246, 0.35)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
        }}>
          <div className="text-sm mb-2" style={{ color: '#c7d2fe', fontFamily: 'Inter, system-ui, sans-serif' }}>Time Remaining</div>
          <div className={`text-6xl font-black ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : ''}`} style={{ 
            color: timeRemaining <= 10 ? undefined : '#22d3ee',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            {timeRemaining}
          </div>
        </div>

        {/* Prompt */}
        {currentMatchUp && (
          <div className="text-center rounded-[28px] p-6 md:p-8 border" style={{ 
            background: 'rgba(25, 15, 60, 0.75)', 
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)'
          }}>
            <h2 className="text-3xl font-black" style={{ color: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>{currentMatchUp.prompt}</h2>
          </div>
        )}

        {/* Voting Buttons */}
        {currentMatchUp && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleVote('A')}
              disabled={!canVote || voted || isTimerExpired}
              className={`p-7 rounded-[24px] border transition-all duration-150 ${
                !canVote || voted || isTimerExpired
                  ? 'cursor-not-allowed'
                  : 'hover:-translate-y-1'
              }`}
              style={{
                background: voted || isTimerExpired
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                borderColor: voted || isTimerExpired
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(34, 211, 238, 0.5)',
                boxShadow: voted || isTimerExpired ? 'none' : '0 0 25px rgba(34, 211, 238, 0.35)',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                if (canVote && !voted && !isTimerExpired) {
                  e.currentTarget.style.borderColor = '#22d3ee'
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.7)'
                }
              }}
              onMouseLeave={(e) => {
                if (canVote && !voted && !isTimerExpired) {
                  e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)'
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.35)'
                }
              }}
            >
              <div className="text-xl font-black mb-4" style={{ color: '#22d3ee' }}>Answer A</div>
              <div className="text-lg font-semibold" style={{ color: voted || isTimerExpired ? '#c7d2fe' : '#f9fafb' }}>{currentMatchUp.answerA}</div>
            </button>

            <button
              onClick={() => handleVote('B')}
              disabled={!canVote || voted || isTimerExpired}
              className={`p-7 rounded-[24px] border transition-all duration-150 ${
                !canVote || voted || isTimerExpired
                  ? 'cursor-not-allowed'
                  : 'hover:-translate-y-1'
              }`}
              style={{
                background: voted || isTimerExpired
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(16px)',
                borderColor: voted || isTimerExpired
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(139, 92, 246, 0.5)',
                boxShadow: voted || isTimerExpired ? 'none' : '0 0 25px rgba(139, 92, 246, 0.35)',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                if (!voted && !isTimerExpired) {
                  e.currentTarget.style.borderColor = '#22d3ee'
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.7)'
                }
              }}
              onMouseLeave={(e) => {
                if (!voted && !isTimerExpired) {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(139, 92, 246, 0.35)'
                }
              }}
            >
              <div className="text-xl font-black mb-4" style={{ color: '#8b5cf6' }}>Answer B</div>
              <div className="text-lg font-semibold" style={{ color: voted || isTimerExpired ? '#c7d2fe' : '#f9fafb' }}>{currentMatchUp.answerB}</div>
            </button>
          </div>
        )}

        {isTimerExpired ? (
          <div className="rounded-[18px] p-5 text-center border" style={{ 
            background: 'rgba(255, 0, 0, 0.1)', 
            borderColor: 'rgba(255, 0, 0, 0.5)',
            color: '#f9fafb',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            <div className="font-semibold">Time's up! Voting has ended.</div>
          </div>
        ) : voted ? (
          <div className="rounded-[18px] p-5 text-center border" style={{ 
            background: 'rgba(0, 255, 0, 0.1)', 
            borderColor: 'rgba(0, 255, 0, 0.5)',
            color: '#f9fafb',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            <div className="font-semibold">Vote submitted!</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
