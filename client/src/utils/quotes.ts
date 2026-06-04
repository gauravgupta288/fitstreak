export interface Quote {
  text: string;
  author: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Definition of a really good workout: when you hate doing it, but you love finishing it.", author: "Unknown" },
  { text: "What hurts today makes you stronger tomorrow.", author: "Jay Cutler" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "The difference between who you are and who you want to be is what you do.", author: "Unknown" },
  { text: "If it doesn't challenge you, it doesn't change you.", author: "Fred Devito" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
];

export const getRandomQuote = (): Quote => {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
};
