const { v4: uuidv4 } = require('uuid');

// Generate 4-letter room code (uppercase, no ambiguous characters)
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O (ambiguous)

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }
  return code;
}

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> room data
  }

  createRoom() {
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (this.rooms.has(roomCode));

    const room = {
      roomCode,
      players: [],
      vip: null,
      gameState: 'LOBBY',
      createdAt: Date.now(),
      gameData: null,
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  joinRoom(roomCode, playerName, socketId) {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { error: 'Room not found' };
    }

    // Check if player name already exists
    if (room.players.some(p => p.name === playerName)) {
      return { error: 'Player name already taken' };
    }

    // Check if room is full (max 8 players)
    if (room.players.length >= 8) {
      return { error: 'Room is full' };
    }

    // Check if game has already started
    if (room.gameState !== 'LOBBY') {
      return { error: 'Game has already started' };
    }

    const player = {
      id: uuidv4(),
      name: playerName,
      socketId,
      score: 0,
      answers: {},
      votes: {},
    };

    room.players.push(player);

    // First player becomes VIP
    if (room.players.length === 1) {
      room.vip = player.id;
    }

    return { success: true, player, room, isVIP: player.id === room.vip };
  }

  leaveRoom(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);

    // If VIP left and there are still players, assign new VIP
    if (room.vip === playerId && room.players.length > 0) {
      room.vip = room.players[0].id;
    }

    // Clean up empty rooms
    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return null;
    }

    return room;
  }

  disconnectPlayer(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    // Find player and update socketId to null (don't remove from room)
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.socketId = null;
    }

    return room;
  }

  getPlayer(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room) return null;
    return room.players.find(p => p.id === playerId);
  }

  rejoinRoom(roomCode, playerId, socketId) {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { error: 'Room not found' };
    }

    // Find existing player by playerId
    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      return { error: 'Player not found. Please join as a new player.' };
    }

    // Update player's socketId to the new connection
    player.socketId = socketId;

    return { success: true, player, room, isVIP: player.id === room.vip };
  }

  rejoinRoomByName(roomCode, playerName, socketId) {
    const room = this.getRoom(roomCode);
    if (!room) {
      return { error: 'Room not found' };
    }

    // Normalize player name for comparison (trim whitespace)
    const normalizedName = playerName.trim();

    // Find existing player by name (case-sensitive but trimmed)
    const player = room.players.find(p => p.name.trim() === normalizedName);
    if (!player) {
      return { error: 'Player not found. Please join as a new player.' };
    }

    // Update player's socketId to the new connection
    player.socketId = socketId;

    return { success: true, player, room, isVIP: player.id === room.vip };
  }

  updateGameState(roomCode, newState, gameData = null) {
    const room = this.getRoom(roomCode);
    if (!room) return false;

    room.gameState = newState;
    if (gameData !== null) {
      room.gameData = gameData;
    }

    return true;
  }

  cleanupOldRooms(maxAge = 3600000) {
    // Remove rooms older than maxAge (default 1 hour)
    const now = Date.now();
    for (const [code, room] of this.rooms.entries()) {
      if (now - room.createdAt > maxAge && room.players.length === 0) {
        this.rooms.delete(code);
      }
    }
  }
}

module.exports = RoomManager;
