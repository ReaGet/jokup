const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const RoomManager = require('./roomManager');
const GameEngine = require('./gameEngine');
const { GAME_STATES, ROUNDS, TIMERS, SCORING } = require('../utils/gameState');

const app = express();
const server = http.createServer(app);

// CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();
const gameEngine = new GameEngine(roomManager);

// Cleanup old rooms every 30 minutes
setInterval(() => {
  roomManager.cleanupOldRooms();
}, 30 * 60 * 1000);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create room (for main screen)
  socket.on('create-room', () => {
    const room = roomManager.createRoom();
    socket.join(room.roomCode);
    socket.roomCode = room.roomCode;
    socket.emit('room-created', { roomCode: room.roomCode });
  });

  // Join room
  socket.on('join-room', ({ roomCode, playerName }) => {
    if (!roomCode || !playerName) {
      socket.emit('error', { message: 'Room code and player name required' });
      return;
    }

    const result = roomManager.joinRoom(roomCode, playerName, socket.id);
    
    if (result.error) {
      // If game has already started, try to rejoin by name
      if (result.error === 'Game has already started') {
        const rejoinResult = roomManager.rejoinRoomByName(roomCode, playerName, socket.id);
        
        if (rejoinResult.error) {
          socket.emit('error', { message: rejoinResult.error });
          return;
        }

        const room = roomManager.getRoom(roomCode);
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.playerId = rejoinResult.player.id;

        // Prepare full game state for rejoining player
        const gameState = {
          playerId: rejoinResult.player.id,
          playerName: rejoinResult.player.name,
          roomCode,
          players: room.players.map(p => ({
            id: p.id,
            name: p.name,
            score: p.score,
            isVIP: p.id === room.vip,
          })),
          isVIP: rejoinResult.isVIP,
          gameState: room.gameState,
          round: room.gameData?.round || 1,
          scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score })),
        };

        // Add game-specific state based on current phase
        if (room.gameData) {
          const gameData = room.gameData;

          // If in ANSWERING phase, send prompts
          if (room.gameState === GAME_STATES.ANSWERING) {
            const playerPrompts = gameData.promptData?.playerPrompts?.[rejoinResult.player.id] || [];
            const defaultTimer = gameData.round === ROUNDS.ROUND_3 ? TIMERS.ROUND_3 : TIMERS.ROUND_1_2;
            gameState.prompts = playerPrompts;
            gameState.timer = defaultTimer;
          }

          // If in VOTING phase, send current match-up or last lash data
          if (room.gameState === GAME_STATES.VOTING) {
            if (gameData.round === ROUNDS.ROUND_3) {
              // Last Lash voting
              gameState.isLastLash = true;
              gameState.prompt = gameData.promptData?.prompt;
              gameState.lastLashAnswers = gameData.lastLashAnswers?.map((a, i) => ({
                answer: a.answer,
                index: i,
                playerId: a.playerId,
              })) || [];
              let timerRemaining = TIMERS.VOTING_TIMER;
              if (gameData.votingStartTime && gameData.votingDuration) {
                const elapsed = Math.floor((Date.now() - gameData.votingStartTime) / 1000);
                timerRemaining = Math.max(0, Math.floor(gameData.votingDuration / 1000) - elapsed);
              }
              gameState.votingTimer = timerRemaining;
            } else {
              // Regular match-up voting
              gameState.currentMatchUp = gameData.currentMatchUp;
              let timerRemaining = TIMERS.VOTING_TIMER;
              if (gameData.votingStartTime && gameData.votingDuration) {
                const elapsed = Math.floor((Date.now() - gameData.votingStartTime) / 1000);
                timerRemaining = Math.max(0, Math.floor(gameData.votingDuration / 1000) - elapsed);
              }
              gameState.votingTimer = timerRemaining;
            }
          }

          // If in REVEAL phase, send results
          if (room.gameState === GAME_STATES.REVEAL) {
            if (gameData.round === ROUNDS.ROUND_3) {
              gameState.isLastLash = true;
              gameState.results = {
                prompt: gameData.promptData?.prompt,
                entries: gameData.lastLashAnswers || [],
              };
            } else {
              gameState.results = {
                matchUpId: gameData.currentMatchUp?.promptId,
                prompt: gameData.currentMatchUp?.prompt,
                answerA: gameData.currentMatchUp?.answerA,
                answerB: gameData.currentMatchUp?.answerB,
                authorA: room.players.find(p => p.id === gameData.currentMatchUp?.players[0])?.name,
                authorB: room.players.find(p => p.id === gameData.currentMatchUp?.players[1])?.name,
                players: gameData.currentMatchUp?.players,
                voteCounts: gameData.currentMatchUp?.votes ? {
                  A: gameData.currentMatchUp.votes.filter(v => v === 'A').length,
                  B: gameData.currentMatchUp.votes.filter(v => v === 'B').length,
                } : { A: 0, B: 0 },
              };
            }
          }
        }

        // Send full state to rejoining player
        socket.emit('room-rejoined', gameState);

        // Notify all players in room that player rejoined
        io.to(roomCode).emit('player-joined', {
          players: room.players.map(p => ({
            id: p.id,
            name: p.name,
            score: p.score,
            isVIP: p.id === room.vip,
          })),
        });
        return;
      }
      
      socket.emit('error', { message: result.error });
      return;
    }

    const room = roomManager.getRoom(roomCode);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.playerId = result.player.id;

    // Send confirmation to joining player
    socket.emit('room-joined', {
      playerId: result.player.id,
      players: roomManager.getRoom(roomCode).players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
      })),
      isVIP: result.isVIP,
      roomCode,
    });

    // Notify all players in room (including main screen)
    io.to(roomCode).emit('player-joined', {
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isVIP: p.id === room.vip,
      })),
    });
  });

  // Rejoin room (for returning players)
  socket.on('rejoin-room', ({ roomCode, playerId }) => {
    if (!roomCode || !playerId) {
      socket.emit('error', { message: 'Room code and player ID required' });
      return;
    }

    const result = roomManager.rejoinRoom(roomCode, playerId, socket.id);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }

    const room = roomManager.getRoom(roomCode);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.playerId = result.player.id;

    // Prepare full game state for rejoining player
    const gameState = {
      playerId: result.player.id,
      playerName: result.player.name,
      roomCode,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isVIP: p.id === room.vip,
      })),
      isVIP: result.isVIP,
      gameState: room.gameState,
      round: room.gameData?.round || 1,
      scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score })),
    };

    // Add game-specific state based on current phase
    if (room.gameData) {
      const gameData = room.gameData;

      // If in ANSWERING phase, send prompts
      if (room.gameState === GAME_STATES.ANSWERING) {
        const playerPrompts = gameData.promptData?.playerPrompts?.[result.player.id] || [];
        // Timer will sync via timer-update events, send default based on round
        const defaultTimer = gameData.round === ROUNDS.ROUND_3 ? TIMERS.ROUND_3 : TIMERS.ROUND_1_2;
        gameState.prompts = playerPrompts;
        gameState.timer = defaultTimer;
      }

      // If in VOTING phase, send current match-up or last lash data
      if (room.gameState === GAME_STATES.VOTING) {
        if (gameData.round === ROUNDS.ROUND_3) {
          // Last Lash voting
          gameState.isLastLash = true;
          gameState.prompt = gameData.promptData?.prompt;
          gameState.lastLashAnswers = gameData.lastLashAnswers?.map((a, i) => ({
            answer: a.answer,
            index: i,
            playerId: a.playerId,
          })) || [];
          // Calculate remaining time from votingStartTime if available
          let timerRemaining = TIMERS.VOTING_TIMER;
          if (gameData.votingStartTime && gameData.votingDuration) {
            const elapsed = Math.floor((Date.now() - gameData.votingStartTime) / 1000);
            timerRemaining = Math.max(0, Math.floor(gameData.votingDuration / 1000) - elapsed);
          }
          gameState.votingTimer = timerRemaining;
        } else {
          // Regular match-up voting
          gameState.currentMatchUp = gameData.currentMatchUp;
          // Calculate remaining time from votingStartTime if available
          let timerRemaining = TIMERS.VOTING_TIMER;
          if (gameData.votingStartTime && gameData.votingDuration) {
            const elapsed = Math.floor((Date.now() - gameData.votingStartTime) / 1000);
            timerRemaining = Math.max(0, Math.floor(gameData.votingDuration / 1000) - elapsed);
          }
          gameState.votingTimer = timerRemaining;
        }
      }

      // If in REVEAL phase, send results
      if (room.gameState === GAME_STATES.REVEAL) {
        if (gameData.round === ROUNDS.ROUND_3) {
          gameState.isLastLash = true;
          gameState.results = {
            prompt: gameData.promptData?.prompt,
            entries: gameData.lastLashAnswers || [],
          };
        } else {
          gameState.results = {
            matchUpId: gameData.currentMatchUp?.promptId,
            prompt: gameData.currentMatchUp?.prompt,
            answerA: gameData.currentMatchUp?.answerA,
            answerB: gameData.currentMatchUp?.answerB,
            authorA: room.players.find(p => p.id === gameData.currentMatchUp?.players[0])?.name,
            authorB: room.players.find(p => p.id === gameData.currentMatchUp?.players[1])?.name,
            players: gameData.currentMatchUp?.players,
            voteCounts: gameData.currentMatchUp?.votes ? {
              A: gameData.currentMatchUp.votes.filter(v => v === 'A').length,
              B: gameData.currentMatchUp.votes.filter(v => v === 'B').length,
            } : { A: 0, B: 0 },
          };
        }
      }
    }

    // Send full state to rejoining player
    socket.emit('room-rejoined', gameState);

    // Notify all players in room that player rejoined (including main screen)
    io.to(roomCode).emit('player-joined', {
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        isVIP: p.id === room.vip,
      })),
    });
  });

  // Start game (VIP only)
  socket.on('start-game', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const player = roomManager.getPlayer(roomCode, socket.playerId);
    if (!player || room.vip !== player.id) {
      socket.emit('error', { message: 'Only VIP can start the game' });
      return;
    }

    if (room.players.length < 3) {
      socket.emit('error', { message: 'Need at least 3 players to start' });
      return;
    }

    // Start Round 1
    roomManager.updateGameState(roomCode, GAME_STATES.INTRO);
    io.to(roomCode).emit('game-started', { round: ROUNDS.ROUND_1 });

    // After intro, start answering phase
    setTimeout(() => {
      startRound(roomCode, ROUNDS.ROUND_1);
    }, 3000); // 3 second intro
  });

  // Submit answer
  socket.on('submit-answer', ({ roomCode, promptId, answer }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const player = roomManager.getPlayer(roomCode, socket.playerId);
    if (!player) {
      socket.emit('error', { message: 'Player not found' });
      return;
    }

    if (!room.gameData || room.gameState !== GAME_STATES.ANSWERING) {
      socket.emit('error', { message: 'Not accepting answers right now' });
      return;
    }

    // Validate prompt belongs to player for this round
    const assignedPrompts = room.gameData.promptData?.playerPrompts?.[player.id] || [];
    const ownsPrompt = assignedPrompts.some(p => p.id === promptId);
    if (!ownsPrompt) {
      socket.emit('error', { message: 'Prompt not assigned to player' });
      return;
    }

    // Store answer
    if (!player.answers) {
      player.answers = {};
    }
    player.answers[promptId] = answer;

    // Notify that answer was submitted
    socket.emit('answer-submitted', { promptId });
    
    // Broadcast to room (for main screen updates)
    io.to(roomCode).emit('answer-submitted', {
      playerId: player.id,
      promptId,
    });

    maybeAdvanceAfterAnswers(roomCode);
  });

  // Submit vote
  socket.on('submit-vote', ({ roomCode, matchUpId, vote }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const player = roomManager.getPlayer(roomCode, socket.playerId);
    if (!player) {
      socket.emit('error', { message: 'Player not found' });
      return;
    }

    const gameData = room.gameData;
    if (!gameData) {
      socket.emit('error', { message: 'No active game' });
      return;
    }

    // Handle Last Lash voting differently
    if (gameData.round === ROUNDS.ROUND_3) {
      // Check if voting timer has expired
      if (gameData.votingExpired || (gameData.votingStartTime && Date.now() > gameData.votingStartTime + gameData.votingDuration)) {
        socket.emit('error', { message: 'Voting time has expired' });
        return;
      }
      
      // vote is array of playerIds (indices) for Last Lash
      const votedPlayerIds = Array.isArray(vote) ? vote : [vote];
      handleLastLashVote(roomCode, player.id, votedPlayerIds);
      socket.emit('vote-confirmed', {});
      return;
    }

    // Regular match-up voting
    if (!gameData.currentMatchUp) {
      socket.emit('error', { message: 'No active match-up' });
      return;
    }

    // Check if voting timer has expired
    if (gameData.votingExpired || (gameData.votingStartTime && Date.now() > gameData.votingStartTime + gameData.votingDuration)) {
      socket.emit('error', { message: 'Voting time has expired' });
      return;
    }

    // Check if player is eligible to vote (not an author)
    if (gameData.currentMatchUp.players.includes(player.id)) {
      socket.emit('error', { message: 'You cannot vote on your own match-up' });
      return;
    }

    // Check if already voted
    if (!player.votes) {
      player.votes = {};
    }
    if (player.votes[matchUpId]) {
      socket.emit('error', { message: 'You have already voted' });
      return;
    }

    // Store vote
    if (!player.votes) {
      player.votes = {};
    }
    player.votes[matchUpId] = vote;

    // Add to match-up votes
    if (!gameData.currentMatchUp.votes) {
      gameData.currentMatchUp.votes = [];
    }
    gameData.currentMatchUp.votes.push(vote);

    // Broadcast vote update
    const voteCounts = {
      A: gameData.currentMatchUp.votes.filter(v => v === 'A').length,
      B: gameData.currentMatchUp.votes.filter(v => v === 'B').length,
    };

    io.to(roomCode).emit('vote-received', {
      matchUpId,
      voteCounts,
    });

    socket.emit('vote-confirmed', { matchUpId, vote });

    // Check if we've received all required votes
    const requiredVotes = gameData.currentMatchUp.requiredVotes || 2; // Default to 2 if not set
    if (gameData.currentMatchUp.votes.length >= requiredVotes) {
      // Stop the timer since we're advancing early
      gameEngine.stopTimer(roomCode);
      gameData.votingExpired = true;
      // Immediately reveal results
      revealMatchUpResults(roomCode);
      return; // Don't continue with normal flow
    }
  });

  // Reveal results manually (for testing or timeout)
  socket.on('reveal-results', ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (room.gameState === GAME_STATES.VOTING) {
      if (room.gameData.round === ROUNDS.ROUND_3) {
        revealLastLashResults(roomCode);
      } else {
        revealMatchUpResults(roomCode);
      }
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    if (socket.roomCode && socket.playerId) {
      const room = roomManager.getRoom(socket.roomCode);
      
      // If game has started, don't remove player, just disconnect them
      // This allows them to rejoin later
      if (room && room.gameState !== GAME_STATES.LOBBY) {
        roomManager.disconnectPlayer(socket.roomCode, socket.playerId);
        // Don't emit player-left event - player is still in the game, just disconnected
      } else {
        // If in lobby, remove player completely
        const updatedRoom = roomManager.leaveRoom(socket.roomCode, socket.playerId);
        if (updatedRoom) {
          io.to(socket.roomCode).emit('player-left', {
            players: updatedRoom.players.map(p => ({
              id: p.id,
              name: p.name,
              score: p.score,
              isVIP: p.id === updatedRoom.vip,
            })),
          });
        }
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to start a round
function startRound(roomCode, round) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  let promptData;
  let timerDuration;

  if (round === ROUNDS.ROUND_3) {
    // Last Lash - same prompt for all
    const lastLashData = gameEngine.assignLastLash(room);
    promptData = {
      playerPrompts: lastLashData.playerPrompts,
      isLastLash: true,
      prompt: lastLashData.prompt,
    };
    timerDuration = TIMERS.ROUND_3;
  } else {
    // Round 1 or 2
    promptData = gameEngine.assignPrompts(room, round);
    timerDuration = TIMERS.ROUND_1_2;
  }

  // Reset per-round player data
  room.players.forEach(player => {
    player.answers = {};
    player.votes = {};
  });

  const expectedAnswers = round === ROUNDS.ROUND_3
    ? room.players.length
    : (promptData.matchUps?.length || 0) * 2;

  // Store game data
  room.gameData = {
    round,
    promptData,
    matchUps: promptData.matchUps || [],
    currentMatchUpIndex: 0,
    answersComplete: false,
    expectedAnswers,
  };

  roomManager.updateGameState(roomCode, GAME_STATES.ANSWERING);

  // Send prompts to players
  room.players.forEach(player => {
    // Only send to connected players
    if (player.socketId) {
      const playerPrompts = promptData.playerPrompts[player.id] || [];
      io.to(player.socketId).emit('prompt-assigned', {
        prompts: playerPrompts,
        timer: timerDuration,
        round,
      });
    }
  });

  // Start timer
  gameEngine.startTimer(roomCode, timerDuration, io, () => {
    // Timer expired - collect empty answers for unanswered prompts
    const gameData = room.gameData;
    room.players.forEach(player => {
      const playerPrompts = gameData.promptData.playerPrompts[player.id];
      playerPrompts.forEach(prompt => {
        if (!player.answers || !player.answers[prompt.id]) {
          if (!player.answers) {
            player.answers = {};
          }
          player.answers[prompt.id] = ''; // Empty answer
        }
      });
    });

    // Move to voting phase
    if (round === ROUNDS.ROUND_3) {
      startLastLashVoting(roomCode);
    } else {
      startVoting(roomCode);
    }
  });

  // Broadcast answering phase started
  io.to(roomCode).emit('game-state-update', {
    state: GAME_STATES.ANSWERING,
    data: { round, timer: timerDuration },
  });
}

// Start voting phase for Round 1 & 2
function startVoting(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  if (room.gameData.answersComplete) {
    return;
  }
  room.gameData.answersComplete = true;

  gameEngine.stopTimer(roomCode);
  roomManager.updateGameState(roomCode, GAME_STATES.VOTING);

  const gameData = room.gameData;
  
  // Build match-ups with answers
  const matchUpsWithAnswers = gameData.matchUps.map(matchUp => {
    const player1 = room.players.find(p => p.id === matchUp.players[0]);
    const player2 = room.players.find(p => p.id === matchUp.players[1]);
    
    const answer1 = (player1.answers && player1.answers[matchUp.promptId]) || '';
    const answer2 = (player2.answers && player2.answers[matchUp.promptId]) || '';

    return {
      ...matchUp,
      answerA: answer1 || '(No answer)',
      answerB: answer2 || '(No answer)',
      votes: [],
    };
  });

  gameData.matchUps = matchUpsWithAnswers;
  gameData.currentMatchUpIndex = 0;

  // Start with first match-up
  showNextMatchUp(roomCode);
}

// Show next match-up for voting
function showNextMatchUp(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  const gameData = room.gameData;
  if (gameData.currentMatchUpIndex >= gameData.matchUps.length) {
    // All match-ups done, show scoreboard
    showScoreboard(roomCode);
    return;
  }

  gameData.currentMatchUp = gameData.matchUps[gameData.currentMatchUpIndex];
  gameData.currentMatchUp.votes = [];
  
  // Calculate eligible voters (total players minus the 2 in match-up)
  const eligibleVoters = room.players.length - 2;
  // Determine required votes: 1 if only 1 eligible, 2 if 2+ eligible
  gameData.currentMatchUp.requiredVotes = eligibleVoters === 1 ? 1 : 2;
  
  // Start voting timer
  gameData.votingStartTime = Date.now();
  gameData.votingDuration = TIMERS.VOTING_TIMER * 1000;
  gameData.votingExpired = false;

  // Start timer for voting
  gameEngine.startTimer(roomCode, TIMERS.VOTING_TIMER, io, () => {
    // Timer expired - reveal results
    gameData.votingExpired = true;
    revealMatchUpResults(roomCode);
  });

  io.to(roomCode).emit('voting-started', {
    matchUps: gameData.matchUps,
    currentMatchUpIndex: gameData.currentMatchUpIndex,
    currentMatchUp: gameData.currentMatchUp,
    round: gameData.round,
    timer: TIMERS.VOTING_TIMER,
  });
}

// Reveal results for current match-up
function revealMatchUpResults(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  // Stop voting timer
  gameEngine.stopTimer(roomCode);

  const gameData = room.gameData;
  const matchUp = gameData.currentMatchUp;
  
  if (!matchUp || !matchUp.votes) {
    showNextMatchUp(roomCode);
    return;
  }

  // Calculate scores
  const result = gameEngine.calculateMatchUpScores(
    matchUp,
    matchUp.votes,
    gameData.round
  );

  // Update player scores
  gameEngine.updateScores(room, result.scores);

  // Reveal authors
  const player1 = room.players.find(p => p.id === matchUp.players[0]);
  const player2 = room.players.find(p => p.id === matchUp.players[1]);

  const results = {
    matchUpId: matchUp.promptId,
    prompt: matchUp.prompt,
    answerA: matchUp.answerA,
    answerB: matchUp.answerB,
    authorA: player1.name,
    authorB: player2.name,
    players: matchUp.players, // Include player IDs for score lookup
    voteCounts: result.voteCounts,
    scores: result.scores,
    isJokUp: result.isJokUp,
    jokUpPlayer: result.jokUpPlayer,
    round: gameData.round,
  };

  roomManager.updateGameState(roomCode, GAME_STATES.REVEAL);

  io.to(roomCode).emit('results-revealed', {
    matchUpId: matchUp.promptId,
    results,
    scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score })),
  });

  // Move to next match-up after delay
  setTimeout(() => {
    gameData.currentMatchUpIndex++;
    showNextMatchUp(roomCode);
  }, 5000); // 5 second delay for reveal
}

// Show scoreboard
function showScoreboard(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  gameEngine.stopTimer(roomCode);
  roomManager.updateGameState(roomCode, GAME_STATES.SCOREBOARD);

  const scores = room.players
    .map(p => ({ id: p.id, name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);

  io.to(roomCode).emit('scoreboard-updated', {
    scores,
    round: room.gameData.round,
  });

  // After scoreboard, either start next round or end game
  setTimeout(() => {
    if (room.gameData.round === ROUNDS.ROUND_1) {
      startRound(roomCode, ROUNDS.ROUND_2);
    } else if (room.gameData.round === ROUNDS.ROUND_2) {
      startRound(roomCode, ROUNDS.ROUND_3);
    } else {
      // Game ended
      endGame(roomCode);
    }
  }, 5000); // 5 second scoreboard display
}

// Start Last Lash voting (free-for-all)
function startLastLashVoting(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  if (room.gameData.answersComplete) {
    return;
  }
  room.gameData.answersComplete = true;

  gameEngine.stopTimer(roomCode);
  roomManager.updateGameState(roomCode, GAME_STATES.VOTING);
  room.gameData.answersComplete = true;

  const gameData = room.gameData;
  
  // Collect all answers
  const allAnswers = room.players.map(player => {
    const answer = (player.answers && player.answers['lastlash-1']) || '';
    return {
      playerId: player.id,
      playerName: player.name,
      answer: answer || '(No answer)',
      votes: 0,
      originalAnswer: answer, // Keep original for reference
    };
  });

  gameData.lastLashAnswers = allAnswers;
  gameData.lastLashVotes = {}; // playerId -> votes received
  gameData.lastLashVoters = new Set(); // Track who has voted
  
  // Start voting timer
  gameData.votingStartTime = Date.now();
  gameData.votingDuration = TIMERS.VOTING_TIMER * 1000;
  gameData.votingExpired = false;

  // Start timer for Last Lash voting
  gameEngine.startTimer(roomCode, TIMERS.VOTING_TIMER, io, () => {
    // Timer expired - reveal results
    gameData.votingExpired = true;
    revealLastLashResults(roomCode);
  });

  io.to(roomCode).emit('lastlash-voting-started', {
    prompt: gameData.promptData.prompt,
    answers: allAnswers.map((a, i) => ({ 
      answer: a.answer,
      index: i,
      playerId: a.playerId, // Send playerId for voting, but don't show name
    })), // Anonymous answers but with IDs for voting
    round: gameData.round,
    isLastLash: true,
    timer: TIMERS.VOTING_TIMER,
  });
}

// Handle Last Lash vote
function handleLastLashVote(roomCode, voterId, votedPlayerIds) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  const gameData = room.gameData;
  if (!gameData.lastLashVotes) {
    gameData.lastLashVotes = {};
  }
  if (!gameData.lastLashVoters) {
    gameData.lastLashVoters = new Set();
  }

  // Check if already voted
  if (gameData.lastLashVoters.has(voterId)) {
    return;
  }

  gameData.lastLashVoters.add(voterId);

  // Each player gets 3 votes max, cannot vote for themselves
  const voter = room.players.find(p => p.id === voterId);
  if (!voter) return;

  // votedPlayerIds are indices into lastLashAnswers array
  votedPlayerIds.slice(0, 3).forEach(answerIndex => {
    if (answerIndex >= 0 && answerIndex < gameData.lastLashAnswers.length) {
      const answer = gameData.lastLashAnswers[answerIndex];
      // Don't allow voting for own answer
      if (answer.playerId !== voterId) {
        gameData.lastLashVotes[answer.playerId] = (gameData.lastLashVotes[answer.playerId] || 0) + 1;
      }
    }
  });

  // Update answer vote counts
  gameData.lastLashAnswers.forEach(answer => {
    answer.votes = gameData.lastLashVotes[answer.playerId] || 0;
  });

  // Broadcast updated vote counts (still anonymous)
  io.to(roomCode).emit('lastlash-votes-updated', {
    voteCounts: gameData.lastLashAnswers.map(a => ({ votes: a.votes })),
  });

  // Note: Timer will auto-reveal when expired, no need to check for all votes
}

// Reveal Last Lash results
function revealLastLashResults(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  // Stop voting timer
  gameEngine.stopTimer(roomCode);

  const gameData = room.gameData;
  
  // Calculate scores with multiplier
  const multiplier = SCORING.ROUND_3_MULTIPLIER || 2; // Round 3 multiplier
  gameData.lastLashAnswers.forEach(answer => {
    const points = Math.round(answer.votes * 100 * multiplier);
    const player = room.players.find(p => p.id === answer.playerId);
    if (player) {
      player.score += points;
    }
  });

  // Sort by votes
  const sortedAnswers = [...gameData.lastLashAnswers].sort((a, b) => b.votes - a.votes);

  roomManager.updateGameState(roomCode, GAME_STATES.REVEAL);

  io.to(roomCode).emit('lastlash-results-revealed', {
    prompt: gameData.promptData.prompt,
    results: sortedAnswers,
    scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score })),
    round: gameData.round,
    isLastLash: true,
  });

  // Show final scoreboard
  setTimeout(() => {
    showScoreboard(roomCode);
  }, 5000);
}

// End game
function endGame(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  gameEngine.stopTimer(roomCode);
  roomManager.updateGameState(roomCode, GAME_STATES.FINAL_WINNER);

  const winner = gameEngine.getWinner(room);
  const finalScores = room.players
    .map(p => ({ id: p.id, name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);

  io.to(roomCode).emit('game-ended', {
    finalScores,
    winner: { id: winner.id, name: winner.name, score: winner.score },
  });
}

function maybeAdvanceAfterAnswers(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (!room || !room.gameData || room.gameData.answersComplete) return;

  const { round, promptData, expectedAnswers } = room.gameData;
  let answersCount = 0;

  if (round === ROUNDS.ROUND_3) {
    room.players.forEach(player => {
      if (player.answers && typeof player.answers['lastlash-1'] !== 'undefined') {
        answersCount += 1;
      }
    });
    if (answersCount >= expectedAnswers) {
      startLastLashVoting(roomCode);
    }
    return;
  }

  promptData.matchUps.forEach(matchUp => {
    const [p1, p2] = matchUp.players;
    const player1 = room.players.find(p => p.id === p1);
    const player2 = room.players.find(p => p.id === p2);
    if (player1?.answers && typeof player1.answers[matchUp.promptId] !== 'undefined') {
      answersCount += 1;
    }
    if (player2?.answers && typeof player2.answers[matchUp.promptId] !== 'undefined') {
      answersCount += 1;
    }
  });

  if (answersCount >= expectedAnswers) {
    startVoting(roomCode);
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
