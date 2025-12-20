// Hardcoded prompts for all rounds

const round1Prompts = [
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
];

const round2Prompts = [
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
];

const lastLashPrompts = [
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
];

// Helper function to shuffle and select prompts
function selectPrompts(promptArray, count) {
  const shuffled = [...promptArray].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

module.exports = {
  round1Prompts,
  round2Prompts,
  lastLashPrompts,
  selectPrompts,
};
