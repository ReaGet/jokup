'use client'

import { useEffect, useState, useRef } from 'react'
import { useSocket } from '../../hooks/useSocket'
import { TranslationProvider } from '../utils/useTranslation'
import JoinScreen from '../components/PlayerScreen/JoinScreen'
import Lobby from '../components/PlayerScreen/Lobby'
import GameIntro from '../components/PlayerScreen/GameIntro'
import PromptScreen from '../components/PlayerScreen/PromptScreen'
import VotingScreen from '../components/PlayerScreen/VotingScreen'
import ResultFeedback from '../components/PlayerScreen/ResultFeedback'
import Scoreboard from '../components/PlayerScreen/Scoreboard'
import GameEnded from '../components/PlayerScreen/GameEnded'
import VIPSettingsModal from '../components/PlayerScreen/VIPSettingsModal'
import VisitorBanner from '../components/PlayerScreen/VisitorBanner'
// Import MainScreen components for visitors
import AnsweringPhase from '../components/MainScreen/AnsweringPhase'
import VotingPhase from '../components/MainScreen/VotingPhase'
import ResultReveal from '../components/MainScreen/ResultReveal'
import MainScreenScoreboard from '../components/MainScreen/Scoreboard'

const GAME_STATES = {
  JOIN: 'JOIN',
  LOBBY: 'LOBBY',
  INTRO: 'INTRO',
  ANSWERING: 'ANSWERING',
  VOTING: 'VOTING',
  RESULT: 'RESULT',
  SCOREBOARD: 'SCOREBOARD',
  GAME_ENDED: 'GAME_ENDED',
}

const STORAGE_KEY = 'jokup_player_state'

export default function PlayerScreen() {
  const { socket, connected } = useSocket()
  const [gameState, setGameState] = useState('JOIN')
  const [playerId, setPlayerId] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [isVIP, setIsVIP] = useState(false)
  const [prompts, setPrompts] = useState([])
  const [timer, setTimer] = useState(90)
  const [votingTimer, setVotingTimer] = useState(30)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [currentMatchUp, setCurrentMatchUp] = useState(null)
  const [isLastLash, setIsLastLash] = useState(false)
  const [lastLashAnswers, setLastLashAnswers] = useState([])
  const [results, setResults] = useState(null)
  const [scores, setScores] = useState([])
  const [round, setRound] = useState(1)
  const [error, setError] = useState('')
  const [isRejoining, setIsRejoining] = useState(false)
  const [isAutoRejoining, setIsAutoRejoining] = useState(false)
  const [language, setLanguage] = useState('en')
  const [isVisitor, setIsVisitor] = useState(false)
  const [showVIPSettings, setShowVIPSettings] = useState(false)
  const isAutoRejoiningRef = useRef(false)
  const isVisitorRef = useRef(false)
  
  // Additional state for visitors to display MainScreen components
  const [voteCounts, setVoteCounts] = useState(null)
  const [playersCompleted, setPlayersCompleted] = useState(0)
  const [playerAnswerCounts, setPlayerAnswerCounts] = useState({})

  // Load saved state and attempt rejoin on mount
  useEffect(() => {
    if (!socket || !connected) return

    try {
      const savedState = localStorage.getItem(STORAGE_KEY)
      if (savedState) {
        const { playerId: savedPlayerId, roomCode: savedRoomCode, playerName: savedPlayerName } = JSON.parse(savedState)
        
        if (savedPlayerId && savedRoomCode) {
          setIsRejoining(true)
          setIsAutoRejoining(true) // Mark as automatic rejoin
          isAutoRejoiningRef.current = true // Update ref for error handler
          setRoomCode(savedRoomCode)
          setPlayerName(savedPlayerName || '')
          // Attempt to rejoin
          socket.emit('rejoin-room', { roomCode: savedRoomCode, playerId: savedPlayerId })
        }
      }
    } catch (err) {
      console.error('Error loading saved state:', err)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [socket, connected])

  useEffect(() => {
    if (!socket) return

    socket.on('room-joined', ({ playerId: id, players: newPlayers, isVIP: vip, roomCode: code, settings }) => {
      const joinedPlayer = newPlayers.find(p => p.id === id)
      const playerNameToSave = joinedPlayer?.name || playerName || ''
      
      setPlayerId(id)
      setPlayerName(playerNameToSave)
      setPlayers(newPlayers)
      setIsVIP(vip)
      setRoomCode(code)
      setGameState('LOBBY')
      setError('')
      setIsRejoining(false)
      setIsAutoRejoining(false) // Reset auto rejoin flag
      setIsVisitor(false)
      isVisitorRef.current = false
      isAutoRejoiningRef.current = false
      
      // Update language from room settings
      if (settings?.language) {
        setLanguage(settings.language)
      }
      
      // Save state to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          playerId: id,
          roomCode: code,
          playerName: playerNameToSave,
        }))
      } catch (err) {
        console.error('Error saving state:', err)
      }
    })

    socket.on('visitor-joined', (state) => {
      console.log('[PlayerScreen] visitor-joined received:', state)
      setRoomCode(state.roomCode)
      setIsVisitor(true)
      isVisitorRef.current = true
      setError('')
      setIsRejoining(false)
      setIsAutoRejoining(false)
      isAutoRejoiningRef.current = false
      
      // Initialize visitor-specific state
      setVoteCounts(null)
      setPlayersCompleted(0)
      setPlayerAnswerCounts({})
      
      // Update language from room settings
      if (state.settings?.language) {
        setLanguage(state.settings.language)
      }
      
      // Update players list for visitors
      if (state.players) {
        setPlayers(state.players)
      }

      // Visitors see all game phases
      if (state.gameState === 'LOBBY' || state.gameState === 'INTRO') {
        console.log('[PlayerScreen] Visitor in lobby/intro, gameState:', state.gameState)
        setGameState('LOBBY')
      } else if (state.gameState === 'ANSWERING') {
        setTimer(state.timer || 90)
        setPlayersCompleted(state.playersCompleted || 0)
        setPlayerAnswerCounts(state.playerAnswerCounts || {})
        setGameState('ANSWERING')
      } else if (state.gameState === 'VOTING') {
        if (state.isLastLash) {
          setIsLastLash(true)
          setCurrentMatchUp({ 
            prompt: state.prompt,
            votersCount: state.votersCount || 0,
            totalPlayers: state.totalPlayers || 0,
          })
          setLastLashAnswers(state.lastLashAnswers || [])
          setVoteCounts(state.voteCounts || [])
        } else {
          setIsLastLash(false)
          setCurrentMatchUp(state.currentMatchUp)
          setVoteCounts(state.voteCounts || { A: 0, B: 0 })
        }
        setVotingTimer(state.votingTimer || 30)
        setGameState('VOTING')
      } else if (state.gameState === 'REVEAL') {
        setResults(state.results)
        setIsLastLash(state.isLastLash || false)
        setGameState('RESULT')
      } else if (state.gameState === 'SCOREBOARD') {
        setScores(state.scores || [])
        setRound(state.round || 1)
        setGameState('SCOREBOARD')
      } else if (state.gameState === 'FINAL_WINNER') {
        setScores(state.scores || [])
        setRound('FINAL')
        setGameState('SCOREBOARD')
        if (state.winner) {
          setResults({ winner: state.winner, finalScores: state.scores })
        }
      }
    })

    socket.on('room-rejoined', (state) => {
      setPlayerId(state.playerId)
      setPlayerName(state.playerName)
      setRoomCode(state.roomCode)
      setPlayers(state.players || [])
      setIsVIP(state.isVIP || false)
      setScores(state.scores || [])
      setRound(state.round || 1)
      setIsRejoining(false)
      setIsAutoRejoining(false) // Reset auto rejoin flag
      setIsVisitor(false)
      isVisitorRef.current = false
      setError('')
      
      // Update language from room settings
      if (state.settings?.language) {
        setLanguage(state.settings.language)
      }

      // Update saved state
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          playerId: state.playerId,
          roomCode: state.roomCode,
          playerName: state.playerName,
        }))
      } catch (err) {
        console.error('Error saving state:', err)
      }

      // Restore game state based on current phase
      if (state.gameState === 'LOBBY') {
        setGameState('LOBBY')
      } else if (state.gameState === 'INTRO') {
        setGameState('INTRO')
      } else if (state.gameState === 'ANSWERING') {
        setPrompts(state.prompts || [])
        setTimer(state.timer || 90)
        setCurrentPromptIndex(0)
        setGameState('ANSWERING')
        setIsLastLash(false)
      } else if (state.gameState === 'VOTING') {
        if (state.isLastLash) {
          setIsLastLash(true)
          setCurrentMatchUp({ 
            prompt: state.prompt,
            votersCount: state.votersCount || 0,
            totalPlayers: state.totalPlayers || 0,
          })
          setLastLashAnswers(state.lastLashAnswers || [])
        } else {
          setIsLastLash(false)
          setCurrentMatchUp(state.currentMatchUp)
        }
        setVotingTimer(state.votingTimer || 30)
        setGameState('VOTING')
      } else if (state.gameState === 'REVEAL') {
        setResults(state.results)
        setIsLastLash(state.isLastLash || false)
        setGameState('RESULT')
      } else if (state.gameState === 'SCOREBOARD') {
        setGameState('SCOREBOARD')
      } else if (state.gameState === 'FINAL_WINNER') {
        setGameState('SCOREBOARD')
        setResults({ winner: state.winner, finalScores: state.scores })
      }
    })

    socket.on('room-settings-updated', ({ settings: roomSettings }) => {
      if (roomSettings?.language) {
        setLanguage(roomSettings.language)
      }
    })

    socket.on('player-joined', ({ players: newPlayers }) => {
      setPlayers(newPlayers)
    })

    socket.on('error', ({ message }) => {
      // Don't show error if it's from automatic rejoin on page load
      if (!isAutoRejoiningRef.current) {
        setError(message)
      } else {
        // Silently clear error for auto rejoin failures
        setError('')
      }
      setIsRejoining(false)
      setIsAutoRejoining(false) // Reset auto rejoin flag
      isAutoRejoiningRef.current = false
      
      // If rejoin failed, clear saved state to allow new join
      if (message.includes('Player not found') || message.includes('Room not found')) {
        localStorage.removeItem(STORAGE_KEY)
      }
    })

    socket.on('game-started', ({ round: r }) => {
      setRound(r)
      // Visitors now see INTRO phase
      if (!isVisitorRef.current) {
        setGameState('INTRO')
      } else {
        // Visitors also see intro
        setGameState('INTRO')
      }
    })
    
    // Listen for answering phase start (for visitors)
    socket.on('answering-started', ({ timer: t }) => {
      if (isVisitorRef.current) {
        setTimer(t || 90)
        setPlayersCompleted(0)
        setPlayerAnswerCounts({})
        setGameState('ANSWERING')
      }
    })

    socket.on('prompt-assigned', ({ prompts: newPrompts, timer: t, round: r }) => {
      // Visitors don't receive prompts, skip this
      if (isVisitorRef.current) return
      
      setPrompts(newPrompts)
      setTimer(t)
      setRound(r)
      setCurrentPromptIndex(0)
      setGameState('ANSWERING')
      setIsLastLash(false)
    })

    socket.on('answer-submitted', ({ playerId }) => {
      // For visitors, track answer submissions to show progress
      if (isVisitorRef.current) {
        setPlayersCompleted((prev) => prev + 1)
        setPlayerAnswerCounts((prev) => ({
          ...prev,
          [playerId]: (prev[playerId] || 0) + 1
        }))
      }
    })

    socket.on('timer-update', ({ timeRemaining: time }) => {
      // Update both timers - components will use the appropriate one
      setTimer(time)
      setVotingTimer(time)
    })

    socket.on('timer-expired', () => {
      // Timer expired, answers will be auto-submitted
    })

    socket.on('answer-submitted', ({ promptId }) => {
      // Move to next prompt if available
      setCurrentPromptIndex((prev) => {
        if (prev < prompts.length - 1) {
          return prev + 1
        }
        return prev
      })
    })

    socket.on('voting-started', ({ currentMatchUp: matchUp, timer: t }) => {
      console.log('[PlayerScreen] voting-started received. isVisitor:', isVisitorRef.current, 'matchUp:', matchUp)
      // Ensure we properly update the match-up and reset voting state
      if (matchUp) {
        console.log('[PlayerScreen] Voting started for match-up:', matchUp.promptId || matchUp.prompt)
        setCurrentMatchUp(matchUp)
        setGameState('VOTING')
        setIsLastLash(false)
        // Clear any previous results when starting new voting
        setResults(null)
        // Initialize vote counts for visitors
        if (isVisitorRef.current) {
          setVoteCounts({ A: 0, B: 0 })
        }
        if (t !== undefined) {
          setVotingTimer(t)
        }
      } else {
        console.warn('[PlayerScreen] voting-started event received but matchUp is null/undefined')
      }
    })

    socket.on('lastlash-voting-started', ({ prompt, answers, timer: t, votersCount: vc, totalPlayers: tp }) => {
      console.log('[PlayerScreen] lastlash-voting-started received. isVisitor:', isVisitorRef.current)
      setCurrentMatchUp({ prompt, votersCount: vc, totalPlayers: tp })
      setLastLashAnswers(answers) // Answers already have playerId
      setIsLastLash(true)
      setGameState('VOTING')
      // Initialize vote counts for visitors
      if (isVisitorRef.current) {
        setVoteCounts(answers.map(() => ({ votes: 0 })))
      }
      if (t !== undefined) {
        setVotingTimer(t)
      }
    })

    socket.on('lastlash-voting-status', ({ votersCount: vc, totalPlayers: tp, hasVoted }) => {
      // Update voting status
      setCurrentMatchUp(prev => ({
        ...prev,
        votersCount: vc,
        totalPlayers: tp,
      }))
    })

    socket.on('vote-confirmed', ({ matchUpId, vote }) => {
      // Vote was confirmed
      console.log('[PlayerScreen] Vote confirmed:', { matchUpId, vote })
    })
    
    // Listen for vote updates (for visitors and players to see live vote counts)
    socket.on('vote-received', ({ voteCounts: counts }) => {
      if (isVisitorRef.current) {
        setVoteCounts(counts)
      }
    })
    
    socket.on('lastlash-votes-updated', ({ voteCounts: counts }) => {
      if (isVisitorRef.current) {
        setVoteCounts(counts)
      }
    })

    socket.on('results-revealed', ({ results: res, scores: newScores }) => {
      console.log('[PlayerScreen] Results revealed, transitioning to RESULT state')
      setResults(res)
      setScores(newScores)
      setGameState('RESULT')
    })

    socket.on('lastlash-results-revealed', ({ prompt, results: res, scores: newScores }) => {
      setResults({ prompt, entries: res })
      setScores(newScores)
      setIsLastLash(true)
      setGameState('RESULT')
    })

    socket.on('scoreboard-updated', ({ scores: newScores, round: r }) => {
      setScores(newScores)
      setRound(r)
      setGameState('SCOREBOARD')
    })

    socket.on('game-ended', ({ finalScores: fs, winner: w }) => {
      setScores(fs || [])
      setRound('FINAL')
      setGameState('SCOREBOARD')
      if (w) {
        setResults({ winner: w, finalScores: fs })
      }
      
      // Clear saved state when game ends
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (err) {
        console.error('Error clearing state:', err)
      }
    })

    socket.on('game-ended-by-vip', () => {
      // Set game state to GAME_ENDED instead of resetting to JOIN
      setGameState('GAME_ENDED')
      
      // Clear saved state
      try {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem('jokup_host_settings')
      } catch (err) {
        console.error('Error clearing state:', err)
      }
    })

    return () => {
      socket.off('room-joined')
      socket.off('visitor-joined')
      socket.off('room-rejoined')
      socket.off('room-settings-updated')
      socket.off('player-joined')
      socket.off('error')
      socket.off('game-started')
      socket.off('answering-started')
      socket.off('prompt-assigned')
      socket.off('timer-update')
      socket.off('timer-expired')
      socket.off('answer-submitted')
      socket.off('voting-started')
      socket.off('lastlash-voting-started')
      socket.off('lastlash-voting-status')
      socket.off('vote-confirmed')
      socket.off('vote-received')
      socket.off('lastlash-votes-updated')
      socket.off('results-revealed')
      socket.off('lastlash-results-revealed')
      socket.off('scoreboard-updated')
      socket.off('game-ended')
      socket.off('game-ended-by-vip')
    }
  }, [socket, prompts.length, playerName])

  const handleEndGame = () => {
    // Reset to JOIN screen
    setGameState('JOIN')
  }

  const handleJoinNewGame = () => {
    // Reset all state and show join screen
    setGameState('JOIN')
    setPlayerId(null)
    setPlayerName('')
    setRoomCode('')
    setPlayers([])
    setIsVIP(false)
    setPrompts([])
    setTimer(90)
    setVotingTimer(30)
    setCurrentPromptIndex(0)
    setCurrentMatchUp(null)
    setIsLastLash(false)
    setLastLashAnswers([])
    setResults(null)
    setScores([])
    setRound(1)
    setError('')
    setIsRejoining(false)
    setIsAutoRejoining(false)
    setIsVisitor(false)
    isVisitorRef.current = false
    setShowVIPSettings(false)
  }

  const handleJoin = (code, name, isVisitor = false) => {
    setRoomCode(code)
    setPlayerName(name || '')
    setError('')
    setIsRejoining(false)
    setIsAutoRejoining(false) // Manual join, not auto rejoin
    isAutoRejoiningRef.current = false
    
    if (socket) {
      // Visitors can't rejoin - they always join fresh
      if (!isVisitor) {
        // Check if we have saved state for this room
        try {
          const savedState = localStorage.getItem(STORAGE_KEY)
          if (savedState) {
            const saved = JSON.parse(savedState)
            // If saved roomCode matches and we have playerId, use rejoin
            if (saved.roomCode === code.toUpperCase() && saved.playerId) {
              socket.emit('rejoin-room', { roomCode: code.toUpperCase(), playerId: saved.playerId })
              setIsRejoining(true)
              return
            }
          }
        } catch (err) {
          console.error('Error checking saved state:', err)
        }
      }
      
      // Otherwise, use normal join
      // Server will automatically try to rejoin by name if game has started (for players only)
      socket.emit('join-room', { roomCode: code.toUpperCase(), playerName: name ? name.trim() : null, isVisitor })
    }
  }

  const handleStartGame = () => {
    if (socket) {
      socket.emit('start-game', { roomCode })
    }
  }

  const handleAnswerSubmit = (promptId, answer) => {
    if (socket) {
      socket.emit('submit-answer', { roomCode, promptId, answer })
    }
  }

  const handleVote = (vote) => {
    if (socket) {
      if (isLastLash) {
        // Last Lash voting - vote is array of player IDs
        socket.emit('submit-vote', { roomCode, matchUpId: 'lastlash', vote })
      } else {
        socket.emit('submit-vote', { roomCode, matchUpId: currentMatchUp?.promptId || 'matchup', vote })
      }
    }
  }

  if (!connected) {
    return (
      <TranslationProvider language={language}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="text-2xl text-gray-300">Connecting to server...</div>
        </div>
      </TranslationProvider>
    )
  }

  return (
    <TranslationProvider language={language}>
      <VIPSettingsModal
        isOpen={showVIPSettings}
        onClose={() => setShowVIPSettings(false)}
        socket={socket}
        roomCode={roomCode}
        onEndGame={handleEndGame}
      />
      {(() => {
        switch (gameState) {
          case GAME_STATES.JOIN:
            return <JoinScreen onJoin={handleJoin} isRejoining={isRejoining} isAutoRejoining={isAutoRejoining} error={error} onErrorClear={() => setError('')} />
          
          case GAME_STATES.LOBBY:
            // Show waiting message for visitors
            if (isVisitor) {
              return (
                <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#1b0f3b,#0b0618_70%)] p-12">
                  <VisitorBanner />
                  <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-8 border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)] text-center">
                    <div className="mb-6">
                      <div className="text-4xl mb-4">👀</div>
                      <h2 className="text-2xl font-semibold mb-2 text-[#c7d2fe]">You are watching as a visitor</h2>
                    </div>
                    <div className="space-y-3 text-[#c7d2fe]">
                      <p className="text-lg animate-pulse">Waiting for game to start...</p>
                      <p className="text-sm opacity-75">You will see all game phases</p>
                    </div>
                  </div>
                </div>
              )
            }
            return (
              <Lobby
                playerName={playerName}
                players={players.map(p => ({ ...p, isVIP: p.isVIP }))}
                isVIP={isVIP}
                onStartGame={handleStartGame}
              />
            )
          
          case GAME_STATES.INTRO:
            if (isVisitor) {
              return (
                <>
                  <VisitorBanner />
                  <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#1b0f3b,#0b0618_70%)] p-12 pt-28">
                    <div className="bg-[rgba(25,15,60,0.75)] backdrop-blur-[16px] rounded-[28px] p-8 border border-[rgba(139,92,246,0.35)] shadow-[0_0_40px_rgba(139,92,246,0.35)] text-center">
                      <div className="mb-6">
                        <div className="text-4xl mb-4">🎮</div>
                        <h2 className="text-2xl font-semibold mb-2 text-[#c7d2fe]">Game is starting...</h2>
                      </div>
                      <div className="space-y-3 text-[#c7d2fe]">
                        <p className="text-lg animate-pulse">Get ready!</p>
                      </div>
                    </div>
                  </div>
                </>
              )
            }
            return <GameIntro isVIP={isVIP} onOpenSettings={() => setShowVIPSettings(true)} />
          
          case GAME_STATES.ANSWERING:
            // Visitors see the main screen answering phase
            if (isVisitor) {
              return (
                <>
                  <VisitorBanner />
                  <div className="pt-20">
                    <AnsweringPhase
                      timeRemaining={timer}
                      playersCompleted={playersCompleted}
                      totalPlayers={players.length}
                      players={players}
                      playerAnswerCounts={playerAnswerCounts}
                    />
                  </div>
                </>
              )
            }
            return (
              <PromptScreen
                prompts={prompts}
                timer={timer}
                onAnswerSubmit={handleAnswerSubmit}
                isVIP={isVIP}
                onOpenSettings={() => setShowVIPSettings(true)}
              />
            )
          
          case GAME_STATES.VOTING:
            // Visitors see the main screen voting phase
            if (isVisitor) {
              return (
                <>
                  <VisitorBanner />
                  <div className="pt-20">
                    <VotingPhase
                      currentMatchUp={currentMatchUp}
                      voteCounts={voteCounts}
                      isLastLash={isLastLash}
                      lastLashAnswers={lastLashAnswers}
                      timeRemaining={votingTimer}
                    />
                  </div>
                </>
              )
            }
            return (
              <VotingScreen
                currentMatchUp={currentMatchUp}
                isLastLash={isLastLash}
                lastLashAnswers={lastLashAnswers}
                onVote={handleVote}
                playerId={playerId}
                timer={votingTimer}
                timerExpired={votingTimer <= 0}
                isVisitor={isVisitor}
                isVIP={isVIP}
                onOpenSettings={() => setShowVIPSettings(true)}
              />
            )
          
          case GAME_STATES.RESULT:
            // Visitors see the main screen result reveal
            if (isVisitor) {
              return (
                <>
                  <VisitorBanner />
                  <div className="pt-20">
                    <ResultReveal results={results} isLastLash={isLastLash} />
                  </div>
                </>
              )
            }
            return (
              <ResultFeedback
                results={results}
                playerId={playerId}
                isLastLash={isLastLash}
                isVIP={isVIP}
                onOpenSettings={() => setShowVIPSettings(true)}
              />
            )
          
          case GAME_STATES.SCOREBOARD:
            // Visitors see the main screen scoreboard
            if (isVisitor) {
              return (
                <>
                  <VisitorBanner />
                  <div className="pt-20">
                    <MainScreenScoreboard scores={scores} round={round} />
                  </div>
                </>
              )
            }
            return <Scoreboard scores={scores} playerId={playerId} round={round} isVIP={isVIP} onOpenSettings={() => setShowVIPSettings(true)} />
          
          case GAME_STATES.GAME_ENDED:
            return <GameEnded onJoinNewGame={handleJoinNewGame} />
          
          default:
            return <JoinScreen onJoin={handleJoin} isRejoining={isRejoining} isAutoRejoining={isAutoRejoining} error={error} onErrorClear={() => setError('')} />
        }
      })()}
    </TranslationProvider>
  )
}
