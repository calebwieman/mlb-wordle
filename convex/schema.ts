import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dailyPlayers: defineTable({
    date: v.string(),
    playerName: v.string(),
    dateHash: v.number(),
  }).index("by_date", ["date"]),

  gameStats: defineTable({
    date: v.string(),
    totalGames: v.number(),
    totalWins: v.number(),
    distribution: v.array(v.number()), // [guess1, guess2, guess3, guess4, guess5, guess6]
  }).index("by_date", ["date"]),

  playerGames: defineTable({
    date: v.string(),
    userId: v.string(),
    guesses: v.array(v.string()),
    won: v.boolean(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_date_user", ["date", "userId"]),
});
