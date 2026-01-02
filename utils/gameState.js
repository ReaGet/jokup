// Game state constants

const GAME_STATES = {
  LOBBY: 'LOBBY',
  INTRO: 'INTRO',
  ANSWERING: 'ANSWERING',
  VOTING: 'VOTING',
  REVEAL: 'REVEAL',
  SCOREBOARD: 'SCOREBOARD',
  FINAL_WINNER: 'FINAL_WINNER',
  GAME_ENDED: 'GAME_ENDED',
};

const ROUNDS = {
  ROUND_1: 1,
  ROUND_2: 2,
  ROUND_3: 3, // Last Lash
};

const TIMERS = {
  ROUND_1_2: 90, // 90 seconds for rounds 1 and 2
  ROUND_3: 45,   // 45 seconds for Last Lash
  VOTING_TIMER: 30, // 30 seconds for voting phase
};

const SCORING = {
  BASE_POINTS_PER_VOTE: 100,
  JOKUP_BONUS: 500, // Unanimous win bonus
  ROUND_2_MULTIPLIER: 1.5,
  ROUND_3_MULTIPLIER: 2,
  LAST_LASH_FIRST_PLACE: 300,
  LAST_LASH_SECOND_PLACE: 200,
  LAST_LASH_THIRD_PLACE: 100,
};

module.exports = {
  GAME_STATES,
  ROUNDS,
  TIMERS,
  SCORING,
};
