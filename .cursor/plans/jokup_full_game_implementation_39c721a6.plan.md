---
name: Jokup Full Game Implementation
overview: Build a complete multiplayer party game system with real-time synchronization between main screen (TV/Host) and player phones, implementing all 3 rounds, voting, scoring, and winner announcement.
todos:
  - id: setup-backend
    content: Create Express + Socket.io server with room management and game engine structure
    status: pending
  - id: prompts-data
    content: Create prompts.js with hardcoded prompt arrays for all 3 rounds
    status: pending
  - id: room-manager
    content: "Implement roomManager.js: room creation, player joining, VIP system, room cleanup"
    status: pending
  - id: game-engine
    content: "Implement gameEngine.js: state machine, prompt assignment, match-up generation, voting logic, scoring"
    status: pending
  - id: socket-events
    content: Wire up Socket.io events for all game phases (join, start, answer, vote, reveal, scoreboard)
    status: pending
  - id: nextjs-setup
    content: Set up Next.js app with Tailwind CSS, App Router, and configuration files
    status: pending
  - id: socket-hook
    content: Create useSocket hook for client-side Socket.io connection
    status: pending
  - id: main-screen-components
    content: Build all MainScreen components (Lobby, Intro, Answering, Voting, Reveal, Scoreboard, Winner)
    status: pending
  - id: player-screen-components
    content: Build all PlayerScreen components (Join, Lobby, Prompts, Voting, Results, Scoreboard)
    status: pending
  - id: nextjs-pages
    content: Create Next.js pages (app/page.js and app/player/page.js) with Socket.io integration
    status: pending
  - id: real-time-sync
    content: Connect frontend components to Socket.io events for real-time game state synchronization
    status: pending
  - id: styling-animations
    content: Apply Tailwind styling and add animations (vote accumulation, author reveal, transitions)
    status: pending
  - id: timer-system
    content: Implement synchronized countdown timers (server-side with client updates)
    status: pending
  - id: edge-cases
    content: "Handle edge cases: partial answers, timer expiration, disconnections, odd player counts"
    status: pending
---

# Jokup - Complete Game Implementation Plan

## Architecture Overview

**Backend**: Node.js + Express + Socket.io for real-time game state management

**Frontend**: Next.js (latest) + Tailwind CSS with two views (main screen + player phones)

**Real-time**: WebSocket connections for synchronized gameplay

## File Structure

```
jokup/
├── server/
│   ├── index.js              # Express + Socket.io server
│   ├── gameEngine.js         # Core game logic (rounds, prompts, scoring)
│   ├── roomManager.js        # Room creation, player management, VIP system
│   └── prompts.js            # Hardcoded prompt arrays (Round 1, 2, Last Lash)
├── app/                      # Next.js App Router
│   ├── page.js               # Main screen (TV/Host) route - "/"
│   ├── player/
│   │   └── page.js           # Player phone route - "/player"
│   ├── layout.js             # Root layout with metadata
│   ├── globals.css           # Global styles + Tailwind imports
│   └── components/
│       ├── MainScreen/       # TV/Host view components
│       │   ├── Lobby.jsx
│       │   ├── GameIntro.jsx
│       │   ├── AnsweringPhase.jsx
│       │   ├── VotingPhase.jsx
│       │   ├── ResultReveal.jsx
│       │   ├── Scoreboard.jsx
│       │   └── FinalWinner.jsx
│       └── PlayerScreen/     # Phone view components
│           ├── JoinScreen.jsx
│           ├── Lobby.jsx
│           ├── PromptScreen.jsx
│           ├── VotingScreen.jsx
│           ├── ResultFeedback.jsx
│           └── Scoreboard.jsx
├── hooks/
│   └── useSocket.js          # Socket.io connection hook (client-side)
├── utils/
│   └── gameState.js          # Game state constants
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration for Tailwind
├── package.json              # Root package.json (server deps + scripts)
└── README.md
```

## Implementation Details

### 1. Backend - Server Setup (`server/index.js`)

- Express server on port 3001
- Socket.io server with CORS enabled for Next.js frontend (port 3000)
- Serve static files if needed
- Initialize room manager and game engine
- Handle Socket.io connections and events

### 2. Backend - Room Management (`server/roomManager.js`)

- Generate unique 4-letter room codes (uppercase, no ambiguous characters)
- Track rooms: `{ roomCode, players: [], vip, gameState, createdAt }`
- Player management: join, leave, VIP assignment (first player becomes VIP)
- Room cleanup on empty/disconnect
- Validate room codes and player names

### 3. Backend - Game Engine (`server/gameEngine.js`)

- Game state machine: `LOBBY → INTRO → ANSWERING → VOTING → REVEAL → SCOREBOARD → (repeat rounds) → FINAL_WINNER`
- Prompt assignment logic:
  - Round 1 & 2: Each player gets 2 prompts
  - Each prompt shared with exactly 1 other player (create match-ups)
  - Algorithm ensures all players get 2 prompts and all prompts have 2 players
  - Round 3: All players get same single prompt (Last Lash)
- Answer collection and storage per player/prompt
- Match-up generation for voting phase
- Voting system with eligibility checks (authors can't vote on own match-up)
- Score calculation:
  - Base: 100 points per vote
  - JokUp bonus: 500 points for unanimous win
  - Round multipliers: Round 2 (x1.5), Round 3 (x2)
- Timer management (70-90s for Rounds 1-2, 30-45s for Round 3)
- Handle partial submissions (player submits 1 of 2 prompts)

### 4. Backend - Prompts (`server/prompts.js`)

- Three arrays: `round1Prompts`, `round2Prompts`, `lastLashPrompts`
- Each array contains prompt strings
- Random selection without replacement per round
- Ensure enough prompts for max players (8 players × 2 prompts = 16 prompts needed per round)

### 5. Frontend - Socket Hook (`hooks/useSocket.js`)

- Custom React hook for Socket.io connection (client-side only)
- Uses `socket.io-client` package
- Must be used in client components (`'use client'` directive)
- Auto-reconnect logic
- Event listeners for game state updates
- Return socket instance and connection status
- Handle connection errors gracefully

### 6. Frontend - Next.js Configuration

- `next.config.js`: Configure Next.js settings
- `tailwind.config.js`: Configure Tailwind with content paths for `app/` directory
- `postcss.config.js`: PostCSS config for Tailwind processing
- `app/layout.js`: Root layout with metadata, font imports, Tailwind CSS
- `app/globals.css`: Import Tailwind directives

### 7. Frontend - Main Screen (`app/components/MainScreen/`)

- All components use `'use client'` directive for Socket.io
- **Lobby.jsx**: Room code display (large, prominent), player list, "Waiting for VIP" message
- **GameIntro.jsx**: Intro animation, game explanation text, transitions
- **AnsweringPhase.jsx**: Large countdown timer, animated "Waiting for players..." indicators, completion count
- **VotingPhase.jsx**: Display prompt + anonymous answers A & B, voting status, fun transitions
- **ResultReveal.jsx**: Step-by-step reveal (votes animate in one by one, author reveal with flip animation, points display)
- **Scoreboard.jsx**: Animated scoreboard between rounds, players sorted by score, character highlights
- **FinalWinner.jsx**: Winner celebration animation, final rankings, music/effects indication

### 8. Frontend - Player Screen (`app/components/PlayerScreen/`)

- All components use `'use client'` directive for Socket.io
- **JoinScreen.jsx**: Room code input, player name input, join button, validation
- **Lobby.jsx**: "You joined as NAME", player list, VIP sees "Start Game" button, others see "Waiting for VIP"
- **PromptScreen.jsx**: Prompt display, text input, countdown timer, submit button (handles 2 prompts sequentially)
- **VotingScreen.jsx**: Prompt + two voting buttons (A/B), confirmation message, cannot vote on own match-up
- **ResultFeedback.jsx**: Vote count earned, JokUp status, points earned, personal feedback
- **Scoreboard.jsx**: Personal score and rank display

### 9. Frontend - Next.js Pages

- `app/page.js`: Main Screen view (TV/Host) at `/` - uses `'use client'`, initializes Socket.io
- `app/player/page.js`: Player Phone view at `/player` - uses `'use client'`, initializes Socket.io
- Both pages use `useSocket` hook and render appropriate components based on game state
- Game state synchronization through Socket.io events

### 10. Real-time Events (Socket.io)

**Client → Server:**

- `join-room`: { roomCode, playerName }
- `start-game`: { roomCode }
- `submit-answer`: { roomCode, playerId, promptId, answer, round }
- `submit-vote`: { roomCode, playerId, matchUpId, vote }

**Server → Client:**

- `room-joined`: { playerId, players, isVIP, roomCode }
- `player-joined`: { players }
- `player-left`: { players }
- `game-started`: { round, prompts }
- `game-state-update`: { state, data }
- `prompt-assigned`: { prompts, timer, round }
- `timer-update`: { timeRemaining }
- `answer-submitted`: { playerId, promptId }
- `voting-started`: { matchUps, currentMatchUpIndex }
- `vote-received`: { matchUpId, voteCounts }
- `results-revealed`: { matchUpId, results, scores }
- `scoreboard-updated`: { scores, round }
- `game-ended`: { finalScores, winner }

## Key Implementation Features

1. **Prompt Assignment Algorithm**: Ensure each prompt is shared by exactly 2 players, all players get 2 prompts (handle edge cases for odd numbers)
2. **Match-up Generation**: Pair answers by promptId for voting phase, track match-up order
3. **Voting Eligibility**: Filter out authors from voting on their own match-ups, track who can vote
4. **Timer Synchronization**: Server-side timer broadcasts countdown to all clients every second
5. **Answer Submission**: Handle partial submissions (1 of 2 prompts answered), store answers per prompt
6. **Vote Animation**: Smooth vote accumulation animation on main screen (votes appear one by one)
7. **Author Reveal**: Flip animation showing answer authors after vote tally
8. **Score Calculation**: Real-time score updates with multipliers, JokUp bonuses
9. **Responsive Design**: Mobile-first for player screens, large display optimized for main screen
10. **Next.js Client Components**: All Socket.io components must use `'use client'` directive

## Styling Approach (Tailwind CSS + Next.js)

- Configure Tailwind in `tailwind.config.js` with Next.js content paths (`app/**/*.{js,ts,jsx,tsx}`)
- Modern, colorful design matching party game aesthetic
- Large, readable fonts for main screen (TV display)
- Touch-friendly buttons for mobile (player screens)
- Smooth transitions and animations (CSS transitions + Tailwind animate)
- Dark theme with vibrant accents
- Loading states and visual feedback
- Use Next.js `'use client'` directive for all Socket.io components
- Responsive breakpoints for different screen sizes

## Package Dependencies

**Root package.json:**

- `express`, `socket.io`, `cors`, `uuid` (server dependencies)
- `nodemon`, `concurrently` (dev dependencies)
- Scripts: `dev` (runs server + Next.js), `server`, `build`, `start`

**Next.js dependencies (to be added):**

- `next` (latest)
- `react`, `react-dom`
- `socket.io-client`
- `tailwindcss`, `postcss`, `autoprefixer`

## Development Workflow

1. Run `npm run dev` to start both Express server (port 3001) and Next.js dev server (port 3000)
2. Open `http://localhost:3000` for main screen
3. Open `http://localhost:3000/player` for player phone view
4. Test with multiple browser tabs/windows

## Testing Considerations

- Multiple browser tabs/windows to simulate main screen + players
- Test room code generation uniqueness
- Test VIP assignment and game start
- Test prompt assignment edge cases (odd number of players, 3 players minimum)
- Test voting eligibility logic
- Test timer expiration handling
- Test disconnection/reconnection scenarios
- Test partial answer submissions
- Test Last Lash round (all players same prompt, multiple votes)