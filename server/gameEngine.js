const { GAME_STATES, ROUNDS, TIMERS, SCORING } = require('../utils/gameState');
const { selectPrompts, round1Prompts, round2Prompts, lastLashPrompts } = require('./prompts');

class GameEngine {
  constructor(roomManager) {
    this.roomManager = roomManager;
    this.timers = new Map(); // roomCode -> timer interval
  }

  // Assign prompts to players for Round 1 & 2
  // Each player gets exactly 2 prompts, each prompt is shared by exactly 2 players
  assignPrompts(room, round) {
    const players = [...room.players].sort(() => Math.random() - 0.5);
    const numPlayers = players.length;
    
    // Select prompts based on round
    const promptPool = round === ROUNDS.ROUND_1 ? round1Prompts : round2Prompts;
    // We need at least numPlayers prompts (each player gets 2, but prompts are shared)
    // For n players, we need n prompts (each shared by 2 players = 2n total assignments = 2 per player)
    const promptsNeeded = numPlayers;
    
    // Select unique prompts
    const selectedPrompts = selectPrompts(promptPool, promptsNeeded);
    
    const promptAssignments = [];
    const playerPromptMap = {}; // playerId -> [prompt1, prompt2]
    
    // Initialize player prompt arrays
    players.forEach(player => {
      playerPromptMap[player.id] = [];
    });
    
    // Simple pairing: assign each prompt to 2 consecutive players
    // This ensures each player gets 2 prompts
    for (let i = 0; i < selectedPrompts.length; i++) {
      const promptId = `prompt-${round}-${i}`;
      const prompt = {
        id: promptId,
        text: selectedPrompts[i],
        round,
      };
      
      // Assign to player i and player (i+1) mod numPlayers
      const player1Index = i % numPlayers;
      const player2Index = (i + 1) % numPlayers;
      
      const player1 = players[player1Index];
      const player2 = players[player2Index];
      
      // Add to both players' prompt lists
      playerPromptMap[player1.id].push(prompt);
      playerPromptMap[player2.id].push(prompt);
      
      promptAssignments.push({
        promptId,
        prompt: prompt.text,
        players: [player1.id, player2.id],
      });
    }
    
    return {
      playerPrompts: playerPromptMap,
      matchUps: promptAssignments,
    };
  }

  // Assign Last Lash prompt (same for all players)
  assignLastLash(room) {
    const selectedPrompts = selectPrompts(lastLashPrompts, 1);
    const prompt = {
      id: 'lastlash-1',
      text: selectedPrompts[0],
      round: ROUNDS.ROUND_3,
    };
    
    const playerPrompts = {};
    room.players.forEach(player => {
      playerPrompts[player.id] = [prompt];
    });
    
    return {
      playerPrompts,
      prompt: prompt.text,
    };
  }

  // Start timer for answering phase
  startTimer(roomCode, duration, io, onExpire) {
    this.stopTimer(roomCode);
    
    let timeRemaining = duration;
    
    const interval = setInterval(() => {
      timeRemaining--;
      
      // Broadcast timer update
      io.to(roomCode).emit('timer-update', { timeRemaining });
      
      if (timeRemaining <= 0) {
        clearInterval(interval);
        this.timers.delete(roomCode);
        if (onExpire) {
          onExpire();
        }
        io.to(roomCode).emit('timer-expired', { roomCode });
      }
    }, 1000);
    
    this.timers.set(roomCode, interval);
    
    // Send initial timer update
    io.to(roomCode).emit('timer-update', { timeRemaining });
  }

  stopTimer(roomCode) {
    const timer = this.timers.get(roomCode);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(roomCode);
    }
  }

  // Calculate scores for a match-up
  calculateMatchUpScores(matchUp, votes, round) {
    const scores = {};
    const voteCounts = { A: 0, B: 0 };
    
    votes.forEach(vote => {
      voteCounts[vote] = (voteCounts[vote] || 0) + 1;
    });
    
    const multiplier = round === ROUNDS.ROUND_2 ? SCORING.ROUND_2_MULTIPLIER : 
                      round === ROUNDS.ROUND_3 ? SCORING.ROUND_3_MULTIPLIER : 1;
    
    const basePointsA = voteCounts.A * SCORING.BASE_POINTS_PER_VOTE;
    const basePointsB = voteCounts.B * SCORING.BASE_POINTS_PER_VOTE;
    
    // Check for JokUp (unanimous win)
    const totalVotes = voteCounts.A + voteCounts.B;
    const isJokUpA = voteCounts.B === 0 && totalVotes > 0;
    const isJokUpB = voteCounts.A === 0 && totalVotes > 0;
    
    scores[matchUp.players[0]] = Math.round((basePointsA + (isJokUpA ? SCORING.JOKUP_BONUS : 0)) * multiplier);
    scores[matchUp.players[1]] = Math.round((basePointsB + (isJokUpB ? SCORING.JOKUP_BONUS : 0)) * multiplier);
    
    return {
      scores,
      voteCounts,
      isJokUp: isJokUpA || isJokUpB,
      jokUpPlayer: isJokUpA ? matchUp.players[0] : (isJokUpB ? matchUp.players[1] : null),
    };
  }

  // Update player scores
  updateScores(room, newScores) {
    room.players.forEach(player => {
      if (newScores[player.id]) {
        player.score += newScores[player.id];
      }
    });
  }

  // Get winner
  getWinner(room) {
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    return sortedPlayers[0];
  }
}

module.exports = GameEngine;
