import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const THEMES = {
  mlb: [
    "JUDGE", "BETTS", "FREEM", "ALTUV", "SOTO",
    "WANDO", "TROUT", "ALONS", "MARTE", "HAYES",
    "PAULS", "WRIGH", "MULLI", "GORDO", "LINDO",
    "MUNOZ", "BRYCE", "STANT", "MACHA", "BELLI",
    "NOLAN", "TATIS", "ACUNA", "ALVAE", "GUERR",
    "ROBER", "COLES", "MARIS", "SMITH", "YOUNG",
    "WALKR", "LEWIS", "CLARK", "COXAN", "ELLIS",
    "EVANS", "PEREZ", "MORRI", "DAVIS", "KINGS",
    "RINGS", "AWAYS", "HOME1", "AWAY2", "PITCH",
    "BALLS", "STIKS", "BATS", "HELME", "CLEAT",
    "JERSE", "SLIDE", "STEAL", "SCORE", "HITTR",
  ],
  sports: [
    "GOALS", "TEAMS", "SCORE", "WINKS", "DRAWS",
    "LEAGU", "PLAYOF", "SEASON", "TITLE", "CHAMP",
    "MVP", "COACH", "REFER", "FOULS", "OFFSID",
    "PENAL", "TIED", "RANK", "STATS", "RECORD",
    "TRAIN", "FIT", "SWIM", "BIKER", "SKATE",
    "SURF", "RUN", "JUMP", "THROW", "CATCH",
  ],
  foods: [
    "PIZZA", "SUSHI", "TACOS", "BURRO", "NAAN",
    "RICE", "PASTA", "BREAD", "CHEES", "STEAK",
    "SALAD", "SOUP", "FRIES", "WAFFL", "PANCA",
    "OATME", "YOGURT", "APPLES", "BANAN", "GRAPE",
    "LEMON", "MANGO", "PEACH", "PLUM", "MELON",
  ],
  animals: [
    "TIGER", "LIONS", "EAGLE", "SHARK", "WHALE",
    "DOLPH", "HORSE", "ZEBRA", "PANDA", "KOALA",
    "GIRAFF", "RHINO", "HIPPO", "CROCO", "SNAKE",
    "LIZARD", "FROG", "TURTL", "WHISK", "RABBIT",
    "SQUIR", "FOX", "WOLF", "BEAR", "DEER",
  ],
};

const THEME_NAMES: Record<string, string> = {
  mlb: "MLB",
  sports: "Sports",
  foods: "Foods",
  animals: "Animals",
};

const THEME_ORDER = ["mlb", "sports", "foods", "animals"];

function getDailyWordForDateAndTheme(date: string, theme: string): string {
  const words = THEMES[theme as keyof typeof THEMES] || THEMES.mlb;
  let hash = 0;
  const combined = date + theme;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash = hash & hash;
  }
  return words[Math.abs(hash) % words.length];
}

export const getThemes = query({
  args: {},
  handler: async () => {
    return THEME_ORDER.map(theme => ({
      id: theme,
      name: THEME_NAMES[theme],
    }));
  },
});

export const getDailyPlayer = query({
  args: { date: v.string(), theme: v.optional(v.string()) },
  handler: async (ctx, { date, theme }) => {
    const currentTheme = theme || "mlb";
    const word = getDailyWordForDateAndTheme(date, currentTheme);
    return { playerName: word, theme: currentTheme };
  },
});

export const ensureDailyPlayer = mutation({
  args: { date: v.string(), theme: v.optional(v.string()) },
  handler: async (ctx, { date, theme }) => {
    const currentTheme = theme || "mlb";
    const themePrefix = currentTheme + "_";
    const recordDate = themePrefix + date;
    
    const existing = await ctx.db
      .query("dailyPlayers")
      .withIndex("by_date", (q) => q.eq("date", recordDate))
      .first();
    
    if (existing) {
      return { playerName: existing.playerName, theme: currentTheme };
    }
    
    const word = getDailyWordForDateAndTheme(date, currentTheme);
    await ctx.db.insert("dailyPlayers", {
      date: recordDate,
      playerName: word,
      dateHash: new Date(date).getTime(),
    });
    
    return { playerName: word, theme: currentTheme };
  },
});

export const getStats = query({
  args: { date: v.optional(v.string()), theme: v.optional(v.string()) },
  handler: async (ctx, { date, theme }) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const currentTheme = theme || "mlb";
    const themePrefix = currentTheme + "_";
    const recordDate = themePrefix + targetDate;
    
    const stats = await ctx.db
      .query("gameStats")
      .withIndex("by_date", (q) => q.eq("date", recordDate))
      .first();
    
    if (!stats) {
      return {
        totalGames: 0,
        totalWins: 0,
        winRate: 0,
        distribution: [0, 0, 0, 0, 0, 0],
      };
    }
    
    return {
      totalGames: stats.totalGames,
      totalWins: stats.totalWins,
      winRate: stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0,
      distribution: stats.distribution,
    };
  },
});

export const getLeaderboard = query({
  args: { date: v.optional(v.string()), theme: v.optional(v.string()) },
  handler: async (ctx, { date, theme }) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const currentTheme = theme || "mlb";
    const themePrefix = currentTheme + "_";
    const recordDate = themePrefix + targetDate;
    
    const games = await ctx.db
      .query("playerGames")
      .withIndex("by_date", (q) => q.eq("date", recordDate))
      .collect();
    
    const winners = games
      .filter(g => g.won && g.guessCount !== undefined)
      .sort((a, b) => {
        const countA = a.guessCount || 99;
        const countB = b.guessCount || 99;
        if (countA !== countB) {
          return countA - countB;
        }
        return (a.completedAt || 0) - (b.completedAt || 0);
      })
      .slice(0, 10);
    
    return winners.map((g, idx) => ({
      rank: idx + 1,
      username: g.username || 'Anonymous',
      guesses: g.guessCount || 0,
    }));
  },
});

export const submitGame = mutation({
  args: {
    date: v.string(),
    userId: v.string(),
    username: v.string(),
    guesses: v.array(v.string()),
    won: v.boolean(),
    theme: v.optional(v.string()),
  },
  handler: async (ctx, { date, userId, username, guesses, won, theme }) => {
    const currentTheme = theme || "mlb";
    const themePrefix = currentTheme + "_";
    const recordDate = themePrefix + date;
    
    const existing = await ctx.db
      .query("playerGames")
      .withIndex("by_date_user", (q) => q.eq("date", recordDate).eq("userId", userId))
      .first();
    
    if (existing) {
      return { alreadyPlayed: true };
    }
    
    const guessCount = guesses.length;
    
    await ctx.db.insert("playerGames", {
      date: recordDate,
      userId,
      username,
      guesses,
      won,
      guessCount,
      createdAt: Date.now(),
      completedAt: Date.now(),
    });
    
    const stats = await ctx.db
      .query("gameStats")
      .withIndex("by_date", (q) => q.eq("date", recordDate))
      .first();
    
    if (!stats) {
      const dist = [0, 0, 0, 0, 0, 0];
      if (won && guessCount >= 1 && guessCount <= 6) {
        dist[guessCount - 1] = 1;
      }
      await ctx.db.insert("gameStats", {
        date: recordDate,
        totalGames: 1,
        totalWins: won ? 1 : 0,
        distribution: dist,
      });
    } else {
      const dist = [...stats.distribution];
      if (won && guessCount >= 1 && guessCount <= 6) {
        dist[guessCount - 1] = (dist[guessCount - 1] || 0) + 1;
      }
      
      await ctx.db.patch(stats._id, {
        totalGames: stats.totalGames + 1,
        totalWins: stats.totalWins + (won ? 1 : 0),
        distribution: dist,
      });
    }
    
    return { success: true, guessCount };
  },
});

export const checkIfPlayed = query({
  args: { date: v.string(), userId: v.string(), theme: v.optional(v.string()) },
  handler: async (ctx, { date, userId, theme }) => {
    const currentTheme = theme || "mlb";
    const themePrefix = currentTheme + "_";
    const recordDate = themePrefix + date;
    
    const existing = await ctx.db
      .query("playerGames")
      .withIndex("by_date_user", (q) => q.eq("date", recordDate).eq("userId", userId))
      .first();
    
    return existing 
      ? { played: true, won: existing.won, guesses: existing.guesses } 
      : { played: false };
  },
});
