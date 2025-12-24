const translations = {
  en: {
    ui: {
      startGame: 'Start game',
      settings: 'Settings',
      joinAudience: 'Join the audience!',
      waitingForPlayers: 'Waiting for players to join...',
      waitingForVIP: 'Waiting for VIP to start the game...',
      enterRoomCode: 'Enter room code to join',
      roomCode: 'Room Code',
      yourName: 'Your Name',
      joinGame: 'Join Game',
      rejoining: 'Rejoining...',
      rejoiningGame: 'Rejoining game...',
      pleaseEnterValidCode: 'Please enter a valid 4-letter room code',
      pleaseEnterName: 'Please enter your name',
      nameMaxLength: 'Name must be 20 characters or less',
      startingGame: 'Starting the game.. enjoy',
      timeRemaining: 'Time Remaining',
      waitingForPlayersAnswer: 'Waiting for players...',
      answerA: 'Answer A',
      answerB: 'Answer B',
      votes: 'votes',
      writtenBy: 'Written by',
      points: 'points',
      volume: 'Volume',
      language: 'Language',
      english: 'English',
      russian: 'Russian',
      scanToJoin: 'Scan to join',
    },
  },
  ru: {
    ui: {
      startGame: 'Начать игру',
      settings: 'Настройки',
      joinAudience: 'Присоединяйтесь к аудитории!',
      waitingForPlayers: 'Ожидание игроков...',
      waitingForVIP: 'Ожидание VIP для начала игры...',
      enterRoomCode: 'Введите код комнаты для присоединения',
      roomCode: 'Код комнаты',
      yourName: 'Ваше имя',
      joinGame: 'Присоединиться',
      rejoining: 'Переподключение...',
      rejoiningGame: 'Переподключение к игре...',
      pleaseEnterValidCode: 'Пожалуйста, введите действительный 4-буквенный код комнаты',
      pleaseEnterName: 'Пожалуйста, введите ваше имя',
      nameMaxLength: 'Имя должно быть не более 20 символов',
      startingGame: 'Начало игры.. наслаждайтесь',
      timeRemaining: 'Осталось времени',
      waitingForPlayersAnswer: 'Ожидание игроков...',
      answerA: 'Ответ A',
      answerB: 'Ответ B',
      votes: 'голосов',
      writtenBy: 'Написано',
      points: 'очков',
      volume: 'Громкость',
      language: 'Язык',
      english: 'Английский',
      russian: 'Русский',
      scanToJoin: 'Сканируйте для присоединения',
    },
  },
}

export function getTranslation(language, key) {
  const lang = language || 'en'
  const keys = key.split('.')
  let value = translations[lang]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Fallback to English if translation not found
      value = translations.en
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2]
        } else {
          return key // Return key if translation not found
        }
      }
      break
    }
  }

  return typeof value === 'string' ? value : key
}

export default translations


