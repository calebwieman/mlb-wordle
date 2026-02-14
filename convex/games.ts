import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const MLB_PLAYERS = [
  "JUDGE", "BETTS", "FREEM", "ALTUV", "SOTO",
  "WANDO", "TROUT", "ALONS", "MARTE", "HAYES",
  "PAULS", "WRIGH", "MULLI", "GORDO", "LINDO",
  "MUNOZ", "BRYCE", "STANT", "MACHA", "BELLI",
  "NOLAN", "TATIS", "ACUNA", "ALVAE", "GUERR",
  "ROBER", "COLES", "MARIS", "SMITH", "YOUNG",
  "WALKR", "LEWIS", "CLARK", "COXAN", "ELLIS",
  "EVANS", "POPEZ", "PEREZ", "MORRI", "DAVIS",
];

function getDailyPlayerForDate(date: string): string {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash = hash & hash;
  }
  return MLB_PLAYERS[Math.abs(hash) % MLB_PLAYERS.length];
}

// Query just returns the word - client generates it deterministically
export const getDailyPlayer = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    // Return deterministically calculated player
    const playerName = getDailyPlayerForDate(date);
    return { playerName };
  },
});

// Mutation ensures daily player exists in DB
export const ensureDailyPlayer = mutation({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const existing = await ctx.db
      .query("dailyPlayers")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();
    
    if (existing) {
      return { playerName: existing.playerName };
    }
    
    const playerName = getDailyPlayerForDate(date);
    await ctx.db.insert("dailyPlayers", {
      date,
      playerName,
      dateHash: new Date(date).getTime(),
    });
    
    return { playerName };
  },
});

export const getStats = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, { date }) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const stats = await ctx.db
      .query("gameStats")
      .withIndex("by_date", (q) => q.eq("date", targetDate))
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

export const submitGame = mutation({
  args: {
    date: v.string(),
    userId: v.string(),
    guesses: v.array(v.string()),
    won: v.boolean(),
  },
  handler: async (ctx, { date, userId, guesses, won }) => {
    const existing = await ctx.db
      .query("playerGames")
      .withIndex("by_date_user", (q) => q.eq("date", date).eq("userId", userId))
      .first();
    
    if (existing) {
      return { alreadyPlayed: true };
    }
    
    await ctx.db.insert("playerGames", {
      date,
      userId,
      guesses,
      won,
      createdAt: Date.now(),
      completedAt: Date.now(),
    });
    
    const stats = await ctx.db
      .query("gameStats")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();
    
    const guessCount = guesses.length;
    
    if (!stats) {
      const dist = [0, 0, 0, 0, 0, 0];
      if (won && guessCount >= 1 && guessCount <= 6) {
        dist[guessCount - 1] = 1;
      }
      await ctx.db.insert("gameStats", {
        date,
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
  args: { date: v.string(), userId: v.string() },
  handler: async (ctx, { date, userId }) => {
    const existing = await ctx.db
      .query("playerGames")
      .withIndex("by_date_user", (q) => q.eq("date", date).eq("userId", userId))
      .first();
    
    return existing 
      ? { played: true, won: existing.won, guesses: existing.guesses } 
      : { played: false };
  },
});
