import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dailyPlayers: defineTable({
    date: v.string(),
    playerName: v.string(),
    dateHash: v.number(),
  })
    .index("by_date", ["date"]),

  gameStats: defineTable({
    date: v.string(),
    totalGames: v.number(),
    totalWins: v.number(),
    distribution: v.array(v.number()),
  })
    .index("by_date", ["date"]),

  playerGames: defineTable({
    date: v.string(),
    userId: v.string(),
    username: v.optional(v.string()),
    guesses: v.array(v.string()),
    won: v.boolean(),
    guessCount: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_date_user", ["date", "userId"])
    .index("by_date", ["date"]),

  playerStreaks: defineTable({
    userId: v.string(),
    username: v.string(),
    currentStreak: v.number(),
    maxStreak: v.number(),
    lastWinDate: v.optional(v.string()),
    totalWins: v.number(),
  })
    .index("by_user", ["userId"]),
});