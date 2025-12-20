'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '../hooks/useSocket'
import Lobby from './components/MainScreen/Lobby'
import GameIntro from './components/MainScreen/GameIntro'
import AnsweringPhase from './components/MainScreen/AnsweringPhase'
import VotingPhase from './components/MainScreen/VotingPhase'
import ResultReveal from './components/MainScreen/ResultReveal'
import Scoreboard from './components/MainScreen/Scoreboard'
import FinalWinner from './components/MainScreen/FinalWinner'

const GAME_STATES = {
  LOBBY: 'LOBBY',
  INTRO: 'INTRO',
  ANSWERING: 'ANSWERING',
  VOTING: 'VOTING',
  REVEAL: 'REVEAL',
  SCOREBOARD: 'SCOREBOARD',
  FINAL_WINNER: 'FINAL_WINNER',
}

export default function MainScreen() {
  const { socket, connected } = useSocket()
  const [gameState, setGameState] = useState('LOBBY')
  const [roomCode, setRoomCode] = useState('')
  const [players, setPlayers] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(90)
  const [votingTimer, setVotingTimer] = useState(30)
  const [playersCompleted, setPlayersCompleted] = useState(0)
  const [currentMatchUp, setCurrentMatchUp] = useState(null)
  const [voteCounts, setVoteCounts] = useState(null)
  const [results, setResults] = useState(null)
  const [scores, setScores] = useState([])
  const [round, setRound] = useState(1)
  const [finalScores, setFinalScores] = useState(null)
  const [winner, setWinner] = useState(null)
  const [isLastLash, setIsLastLash] = useState(false)
  const [lastLashAnswers, setLastLashAnswers] = useState([])
  const [playerAnswerCounts, setPlayerAnswerCounts] = useState({})

  useEffect(() => {
    if (!socket) return

    // Create or get room
    socket.emit('create-room')
    socket.on('room-created', ({ roomCode: code }) => {
      setRoomCode(code)
      setGameState('LOBBY')
    })

    // Also listen for initial room state if reconnecting
    socket.on('room-state', ({ roomCode: code, players: newPlayers, gameState: state }) => {
      setRoomCode(code)
      setPlayers(newPlayers)
      setGameState(state)
    })

    socket.on('player-joined', ({ players: newPlayers }) => {
      setPlayers(newPlayers)
    })

    // Update players list when someone joins
    socket.on('player-left', ({ players: newPlayers }) => {
      setPlayers(newPlayers)
    })

    socket.on('game-started', ({ round: r }) => {
      setRound(r)
      setGameState('INTRO')
    })

    socket.on('game-state-update', ({ state, data }) => {
      setGameState(state)
      if (data?.round) setRound(data.round)
      if (data?.timer) setTimeRemaining(data.timer)
      if (state === GAME_STATES.ANSWERING) {
        setPlayersCompleted(0)
        setVoteCounts(null)
        setResults(null)
        // Reset player answer counts when starting a new answering phase
        setPlayerAnswerCounts({})
      }
    })

    socket.on('timer-update', ({ timeRemaining: time }) => {
      // Update both timers - components will use the appropriate one
      setTimeRemaining(time)
      setVotingTimer(time)
    })

    socket.on('answer-submitted', ({ playerId }) => {
      setPlayersCompleted((prev) => prev + 1)
      // Track per-player answer count
      setPlayerAnswerCounts((prev) => ({
        ...prev,
        [playerId]: (prev[playerId] || 0) + 1
      }))
    })

    socket.on('voting-started', ({ currentMatchUp: matchUp, round: r, timer: t }) => {
      setIsLastLash(false)
      setCurrentMatchUp(matchUp)
      setVoteCounts({ A: 0, B: 0 })
      setRound(r || round)
      setResults(null)
      setGameState('VOTING')
      if (t !== undefined) {
        setVotingTimer(t)
      }
    })

    socket.on('lastlash-voting-started', ({ prompt, answers, round: r, timer: t }) => {
      setIsLastLash(true)
      setCurrentMatchUp({ prompt })
      setLastLashAnswers(answers)
      setVoteCounts(answers.map(() => ({ votes: 0 })))
      setRound(r || 3)
      setResults(null)
      setGameState('VOTING')
      if (t !== undefined) {
        setVotingTimer(t)
      }
    })

    socket.on('vote-received', ({ voteCounts: counts }) => {
      setVoteCounts(counts)
    })

    socket.on('lastlash-votes-updated', ({ voteCounts: counts }) => {
      setVoteCounts(counts)
    })

    socket.on('results-revealed', ({ results: res, scores: newScores }) => {
      setIsLastLash(false)
      setResults(res)
      setScores(newScores)
      setGameState('REVEAL')
    })

    socket.on('lastlash-results-revealed', ({ prompt, results: res, scores: newScores, round: r }) => {
      setIsLastLash(true)
      setResults({ prompt, entries: res })
      setScores(newScores)
      setRound(r || 3)
      setGameState('REVEAL')
    })

    socket.on('scoreboard-updated', ({ scores: newScores, round: r }) => {
      setScores(newScores)
      setRound(r)
      setGameState('SCOREBOARD')
      setPlayersCompleted(0)
    })

    socket.on('game-ended', ({ finalScores: fs, winner: w }) => {
      setFinalScores(fs)
      setWinner(w)
      setGameState('FINAL_WINNER')
    })

    socket.on('error', ({ message }) => {
      console.error('Socket error:', message)
    })

    return () => {
      socket.off('room-created')
      socket.off('player-joined')
      socket.off('game-started')
      socket.off('game-state-update')
      socket.off('timer-update')
      socket.off('answer-submitted')
      socket.off('voting-started')
      socket.off('lastlash-voting-started')
      socket.off('vote-received')
      socket.off('lastlash-votes-updated')
      socket.off('results-revealed')
      socket.off('lastlash-results-revealed')
      socket.off('scoreboard-updated')
      socket.off('game-ended')
      socket.off('error')
    }
  }, [socket])

  // Auto-create room on mount
  useEffect(() => {
    if (socket && connected && !roomCode) {
      socket.emit('create-room')
    }
  }, [socket, connected, roomCode])

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-2xl text-gray-300">Connecting to server...</div>
      </div>
    )
  }

  switch (gameState) {
    case GAME_STATES.LOBBY:
      return <Lobby roomCode={roomCode} players={players} waitingForVIP={players.length > 0 && !players.find(p => p.isVIP)} />
    
    case GAME_STATES.INTRO:
      return <GameIntro onComplete={() => setGameState('ANSWERING')} />
    
    case GAME_STATES.ANSWERING:
      return (
        <AnsweringPhase
          timeRemaining={timeRemaining}
          playersCompleted={playersCompleted}
          totalPlayers={players.length}
          players={players}
          playerAnswerCounts={playerAnswerCounts}
        />
      )
    
    case GAME_STATES.VOTING:
      return (
        <VotingPhase
          currentMatchUp={currentMatchUp}
          voteCounts={voteCounts}
          isLastLash={isLastLash}
          lastLashAnswers={lastLashAnswers}
          timeRemaining={votingTimer}
        />
      )
    
    case GAME_STATES.REVEAL:
      return <ResultReveal results={results} isLastLash={isLastLash} />
    
    case GAME_STATES.SCOREBOARD:
      return <Scoreboard scores={scores} round={round} />
    
    case GAME_STATES.FINAL_WINNER:
      return <FinalWinner finalScores={finalScores} winner={winner} />
    
    default:
      return <Lobby roomCode={roomCode} players={players} waitingForVIP={true} />
  }
}
