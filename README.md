# 🎮 Jokup - Comedy Prompt Battle Game

A real-time multiplayer party game where players compete with funny answers to prompts.

## Features

- 🎯 3-8 players (with optional audience)
- 📱 Phone-based player interface
- 🖥️ Main screen display (TV/Host)
- 🎲 3 rounds of comedy battles
- 🏆 Scoring and winner announcements

## Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Start development server:
```bash
npm run dev
```

3. Open:
   - Main screen: http://localhost:3000
   - Player phones: http://localhost:3000/player

## How to Play

1. Main screen shows a 4-letter room code
2. Players go to jokup.tv (or localhost:3000/player) and enter the code
3. First player becomes VIP and can start the game
4. Players receive prompts and write funny answers
5. Answers are matched up and everyone votes
6. Points are awarded based on votes
7. After 3 rounds, the winner is announced!

## Tech Stack

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: React
- **Real-time**: WebSocket (Socket.io)






