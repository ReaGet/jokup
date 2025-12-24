// Prompts for all rounds with language support

const prompts = {
  en: {
    round1Prompts: [
      "A terrible idea for a new holiday",
      "The worst superpower to have",
      "Something you should never say at a funeral",
      "A bad name for a restaurant",
      "The worst thing to find in your sandwich",
      "A terrible password",
      "Something you shouldn't do on a first date",
      "The worst thing to yell during a job interview",
      "A bad name for a band",
      "Something you should never Google",
      "The worst thing to say to your boss",
      "A terrible invention",
      "Something you shouldn't do in public",
      "The worst thing to hear from your doctor",
      "A bad name for a pet",
      "Something you should never do at a wedding",
      "The worst thing to find in your bed",
      "A terrible movie title",
      "Something you shouldn't say to a police officer",
      "The worst thing to text your ex",
      "An awful slogan for toothpaste",
      "The last thing you want to hear on a plane",
      "A cursed flavor of ice cream",
      "A terrible name for a theme park",
      "The worst surprise in a piñata",
      "A board game that should never exist",
      "The worst thing to whisper in a quiet room",
      "A rejected name for a superhero sidekick",
      "The worst thing to find in your locker",
      "A terrible idea for a magic trick",
    ],
    round2Prompts: [
      "A terrible name for a perfume",
      "The worst thing to say to your in-laws",
      "Something you shouldn't do at a library",
      "A bad name for a street",
      "The worst thing to hear from your dentist",
      "Something you should never do at a funeral",
      "A terrible name for a boat",
      "The worst thing to find in your coffee",
      "Something you shouldn't say during a presentation",
      "A bad name for a company",
      "The worst thing to hear from your mechanic",
      "Something you should never do at a museum",
      "A terrible name for a child",
      "The worst thing to say to a judge",
      "Something you shouldn't do at a hospital",
      "A bad name for a planet",
      "The worst thing to find in your soup",
      "Something you should never say to your teacher",
      "A terrible name for a store",
      "The worst thing to hear from your barber",
      "A disastrous idea for a dating app",
      "The worst slogan for bottled water",
      "Something you should never admit on live TV",
      "A cursed fortune cookie message",
      "The worst thing to put on a resume",
      "A terrible name for a podcast",
      "The worst food to bring to a potluck",
      "A bad idea for a theme wedding",
      "Something you shouldn't engrave on a trophy",
      "The worst thing to yell in a movie theater",
    ],
    lastLashPrompts: [
      "Complete this sentence: The best thing about being an adult is...",
      "Complete this sentence: If I were president, my first act would be...",
      "Complete this sentence: The worst part of my morning routine is...",
      "Complete this sentence: My biggest fear is...",
      "Complete this sentence: If animals could talk, they would say...",
      "Complete this sentence: The most useless superpower would be...",
      "Complete this sentence: If I could time travel, I would...",
      "Complete this sentence: The weirdest thing I've ever eaten is...",
      "Complete this sentence: My secret talent is...",
      "Complete this sentence: If I were invisible for a day, I would...",
      "Finish the headline: Florida Man shocks world by...",
      "Complete this sentence: The best prank is...",
      "Complete this sentence: My villain origin story starts when...",
      "Complete this sentence: I instantly lose respect when someone...",
      "Complete this sentence: The universe is trying to tell me to stop...",
    ],
  },
  ru: {
    round1Prompts: [
      "Ужасная идея для нового праздника",
      "Самая плохая суперсила",
      "То, что никогда нельзя говорить на похоронах",
      "Плохое название для ресторана",
      "Самое худшее, что можно найти в бутерброде",
      "Ужасный пароль",
      "То, чего не стоит делать на первом свидании",
      "Самое худшее, что можно крикнуть на собеседовании",
      "Плохое название для группы",
      "То, что никогда не стоит гуглить",
      "Самое худшее, что можно сказать боссу",
      "Ужасное изобретение",
      "То, чего не стоит делать на публике",
      "Самое худшее, что можно услышать от врача",
      "Плохое имя для питомца",
      "То, чего никогда не стоит делать на свадьбе",
      "Самое худшее, что можно найти в своей кровати",
      "Ужасное название фильма",
      "То, чего не стоит говорить полицейскому",
      "Самое худшее, что можно написать бывшему",
      "Ужасный слоган для зубной пасты",
      "Последнее, что хочется услышать в самолете",
      "Проклятый вкус мороженого",
      "Ужасное название для парка развлечений",
      "Самое худшее сюрприз в пиньяте",
      "Настольная игра, которой не должно существовать",
      "Самое худшее, что можно прошептать в тихой комнате",
      "Отклоненное имя для помощника супергероя",
      "Самое худшее, что можно найти в своем шкафчике",
      "Ужасная идея для фокуса",
    ],
    round2Prompts: [
      "Ужасное название для духов",
      "Самое худшее, что можно сказать родственникам супруга",
      "То, чего не стоит делать в библиотеке",
      "Плохое название для улицы",
      "Самое худшее, что можно услышать от стоматолога",
      "То, чего никогда не стоит делать на похоронах",
      "Ужасное название для лодки",
      "Самое худшее, что можно найти в кофе",
      "То, чего не стоит говорить во время презентации",
      "Плохое название для компании",
      "Самое худшее, что можно услышать от механика",
      "То, чего никогда не стоит делать в музее",
      "Ужасное имя для ребенка",
      "Самое худшее, что можно сказать судье",
      "То, чего не стоит делать в больнице",
      "Плохое название для планеты",
      "Самое худшее, что можно найти в супе",
      "То, чего никогда не стоит говорить учителю",
      "Ужасное название для магазина",
      "Самое худшее, что можно услышать от парикмахера",
      "Катастрофическая идея для приложения знакомств",
      "Самый худший слоган для бутилированной воды",
      "То, чего никогда не стоит признавать в прямом эфире",
      "Проклятое сообщение в печенье с предсказанием",
      "Самое худшее, что можно написать в резюме",
      "Ужасное название для подкаста",
      "Самая худшая еда для общего стола",
      "Плохая идея для тематической свадьбы",
      "То, чего не стоит гравировать на трофее",
      "Самое худшее, что можно крикнуть в кинотеатре",
    ],
    lastLashPrompts: [
      "Завершите предложение: Лучшее в том, чтобы быть взрослым - это...",
      "Завершите предложение: Если бы я был президентом, мой первый шаг был бы...",
      "Завершите предложение: Худшая часть моего утреннего ритуала - это...",
      "Завершите предложение: Мой самый большой страх - это...",
      "Завершите предложение: Если бы животные могли говорить, они бы сказали...",
      "Завершите предложение: Самая бесполезная суперсила была бы...",
      "Завершите предложение: Если бы я мог путешествовать во времени, я бы...",
      "Завершите предложение: Самая странная вещь, которую я когда-либо ел - это...",
      "Завершите предложение: Мой секретный талант - это...",
      "Завершите предложение: Если бы я был невидимым на день, я бы...",
      "Завершите заголовок: Житель Флориды шокировал мир тем, что...",
      "Завершите предложение: Лучшая шутка - это...",
      "Завершите предложение: История происхождения моего злодея начинается, когда...",
      "Завершите предложение: Я мгновенно теряю уважение, когда кто-то...",
      "Завершите предложение: Вселенная пытается сказать мне, чтобы я перестал...",
    ],
  },
};

// Helper function to shuffle and select prompts
function selectPrompts(promptArray, count) {
  const shuffled = [...promptArray].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get prompts for a specific language and round
function getPrompts(language, round) {
  const lang = language || 'en';
  const langPrompts = prompts[lang] || prompts.en;
  
  if (round === 1) {
    return langPrompts.round1Prompts;
  } else if (round === 2) {
    return langPrompts.round2Prompts;
  } else if (round === 3) {
    return langPrompts.lastLashPrompts;
  }
  
  return langPrompts.round1Prompts; // Default fallback
}

// Legacy exports for backward compatibility
const round1Prompts = prompts.en.round1Prompts;
const round2Prompts = prompts.en.round2Prompts;
const lastLashPrompts = prompts.en.lastLashPrompts;

module.exports = {
  prompts,
  getPrompts,
  round1Prompts,
  round2Prompts,
  lastLashPrompts,
  selectPrompts,
};
