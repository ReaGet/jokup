'use client'

import { useEffect, useState, useRef } from 'react'
import { useSocket } from '../../hooks/useSocket'
import JoinScreen from '../components/PlayerScreen/JoinScreen'
import Lobby from '../components/PlayerScreen/Lobby'
import GameIntro from '../components/PlayerScreen/GameIntro'
import PromptScreen from '../components/PlayerScreen/PromptScreen'
import VotingScreen from '../components/PlayerScreen/VotingScreen'
import ResultFeedback from '../components/PlayerScreen/ResultFeedback'
import Scoreboard from '../components/PlayerScreen/Scoreboard'

const GAME_STATES = {
  JOIN: 'JOIN',
  LOBBY: 'LOBBY',
  INTRO: 'INTRO',
  ANSWERING: 'ANSWERING',
  VOTING: 'VOTING',
  RESULT: 'RESULT',
  SCOREBOARD: 'SCOREBOARD',
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
  const isAutoRejoiningRef = useRef(false)

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

    socket.on('room-joined', ({ playerId: id, players: newPlayers, isVIP: vip, roomCode: code }) => {
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
      isAutoRejoiningRef.current = false
      
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
      setError('')

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
      setGameState('INTRO')
    })

    socket.on('prompt-assigned', ({ prompts: newPrompts, timer: t, round: r }) => {
      setPrompts(newPrompts)
      setTimer(t)
      setRound(r)
      setCurrentPromptIndex(0)
      setGameState('ANSWERING')
      setIsLastLash(false)
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
      // Ensure we properly update the match-up and reset voting state
      if (matchUp) {
        console.log('[PlayerScreen] Voting started for match-up:', matchUp.promptId || matchUp.prompt)
        setCurrentMatchUp(matchUp)
        setGameState('VOTING')
        setIsLastLash(false)
        // Clear any previous results when starting new voting
        setResults(null)
        if (t !== undefined) {
          setVotingTimer(t)
        }
      } else {
        console.warn('[PlayerScreen] voting-started event received but matchUp is null/undefined')
      }
    })

    socket.on('lastlash-voting-started', ({ prompt, answers, timer: t, votersCount: vc, totalPlayers: tp }) => {
      setCurrentMatchUp({ prompt, votersCount: vc, totalPlayers: tp })
      setLastLashAnswers(answers) // Answers already have playerId
      setIsLastLash(true)
      setGameState('VOTING')
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

    socket.on('results-revealed', ({ results: res, scores: newScores }) => {
      console.log('[PlayerScreen] Results revealed, transitioning to RESULT state')
      setResults(res)
      setScores(newScores)
      setGameState('RESULT')
    })

    socket.on('lastlash-results-revealed', ({ results: res, scores: newScores }) => {
      setResults(res)
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

    return () => {
      socket.off('room-joined')
      socket.off('room-rejoined')
      socket.off('player-joined')
      socket.off('error')
      socket.off('game-started')
      socket.off('prompt-assigned')
      socket.off('timer-update')
      socket.off('timer-expired')
      socket.off('answer-submitted')
      socket.off('voting-started')
      socket.off('lastlash-voting-started')
      socket.off('lastlash-voting-status')
      socket.off('vote-confirmed')
      socket.off('results-revealed')
      socket.off('lastlash-results-revealed')
      socket.off('scoreboard-updated')
      socket.off('game-ended')
    }
  }, [socket, prompts.length, playerName])

  const handleJoin = (code, name) => {
    setRoomCode(code)
    setPlayerName(name)
    setError('')
    setIsRejoining(false)
    setIsAutoRejoining(false) // Manual join, not auto rejoin
    isAutoRejoiningRef.current = false
    
    if (socket) {
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
      
      // Otherwise, use normal join
      // Server will automatically try to rejoin by name if game has started
      socket.emit('join-room', { roomCode: code.toUpperCase(), playerName: name.trim() })
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-2xl text-gray-300">Connecting to server...</div>
      </div>
    )
  }

  switch (gameState) {
    case GAME_STATES.JOIN:
      return <JoinScreen onJoin={handleJoin} isRejoining={isRejoining} isAutoRejoining={isAutoRejoining} error={error} onErrorClear={() => setError('')} />
    
    case GAME_STATES.LOBBY:
      return (
        <Lobby
          playerName={playerName}
          players={players.map(p => ({ ...p, isVIP: p.isVIP }))}
          isVIP={isVIP}
          onStartGame={handleStartGame}
        />
      )
    
    case GAME_STATES.INTRO:
      return <GameIntro />
    
    case GAME_STATES.ANSWERING:
      return (
        <PromptScreen
          prompts={prompts}
          timer={timer}
          onAnswerSubmit={handleAnswerSubmit}
        />
      )
    
    case GAME_STATES.VOTING:
      return (
        <VotingScreen
          currentMatchUp={currentMatchUp}
          isLastLash={isLastLash}
          lastLashAnswers={lastLashAnswers}
          onVote={handleVote}
          playerId={playerId}
          timer={votingTimer}
          timerExpired={votingTimer <= 0}
        />
      )
    
    case GAME_STATES.RESULT:
      return (
        <ResultFeedback
          results={results}
          playerId={playerId}
          isLastLash={isLastLash}
        />
      )
    
    case GAME_STATES.SCOREBOARD:
      return <Scoreboard scores={scores} playerId={playerId} round={round} />
    
    default:
      return <JoinScreen onJoin={handleJoin} isRejoining={isRejoining} isAutoRejoining={isAutoRejoining} error={error} onErrorClear={() => setError('')} />
  }
}
