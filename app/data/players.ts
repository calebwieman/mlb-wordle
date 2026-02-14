// Popular MLB players with 5-letter last names
export const MLB_PLAYERS = [
  "JUDGE", "BETTS", "FREEM", "SOTO", "WANDO",
  "TROUT", "ALONS", "BOONE", "MARTE", "HAYES",
  "COERE", "HOSME", "GALLO", "PAULS", "WRIGHT",
  "MULLI", "GORDO", "LINDO", "MUNOZ", "SHEFF",
  "BRYCE", "STANT", "MACHA", "BELLI", "DEGRO",
  "NOLAN", "TATIS", "ACUNA", "ALVAE", "GUERR",
  "VLADG", "BOBBA", "WANDE", "ROBER", "CROSB",
  "BUxTO", "SPRIN", "MOUNT", "COLES", "GIMEN",
  "CHISH", "RITTE", "MCKEN", "WATSO", "BENIN",
  "MARIS", "BERGG", "BLAKE", "BRITO", "DEJON",
  "DEVIS", "DIAZL", "EFLIN", "GRAVE", "HADER",
  "HANIG", "HOSEL", "KEPLE", "KIKUC", "KNEBL",
  "LOCKE", "MARTI", "MEYER", "MILEY", "MOORE",
  "PEREZ", "PISCO", "POLAN", "PRESI", "QUANR",
  "RAISE", "RIzzo", "RODEO", "ROMIN", "SCHEB",
  "SEGUR", "SEWAL", "SHAWT", "SMITH", "SNIDER",
  "STANT", "STOTT", "SWANS", "TANAK", "TAYLO",
  "TELLA", "TOMLI", "TUCKE", "TURBI", "URQUI",
  "VARGA", "VENBL", "WALKR", "WARDE", "WELLS",
  "WENDL", "YELLC", "YOUNG", "ZUNIN"
];

// Get a random player for today (seeded by date)
export function getDailyPlayer(): string {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Simple hash function for consistent daily word
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % MLB_PLAYERS.length;
  return MLB_PLAYERS[index];
}

// Validate if a guess is a valid 5-letter word (for demo purposes, we'll be lenient)
export function isValidGuess(guess: string): boolean {
  return guess.length === 5 && /^[A-Z]+$/.test(guess);
}
