// Streak management utilities
const STREAK_KEY = 'mlb-wordle-streaks';

interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastWinDate: string | null;
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, bestStreak: 0, lastWinDate: null };
  }
  
  const data = localStorage.getItem(STREAK_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return { currentStreak: 0, bestStreak: 0, lastWinDate: null };
}

function getYesterday(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

export function updateStreak(won: boolean): { currentStreak: number; bestStreak: number } {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, bestStreak: 0 };
  }
  
  const today = new Date().toISOString().split('T')[0];
  const data = getStreakData();
  
  if (won) {
    // Check if last win was yesterday (consecutive)
    if (data.lastWinDate === getYesterday(today)) {
      data.currentStreak += 1;
    } else if (data.lastWinDate === today) {
      // Already counted today, don't increment again
    } else {
      // Streak was broken, start fresh
      data.currentStreak = 1;
    }
    
    data.lastWinDate = today;
    data.bestStreak = Math.max(data.bestStreak, data.currentStreak);
  }
  // If lost, we don't reset immediately - streak only breaks when a new day starts and they lose
  
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  return { currentStreak: data.currentStreak, bestStreak: data.bestStreak };
}

export function getStreakDisplay(): { currentStreak: number; bestStreak: number } {
  const data = getStreakData();
  const today = new Date().toISOString().split('T')[0];
  
  // Check if streak should be reset (lost yesterday and didn't play/win today)
  if (data.lastWinDate) {
    const yesterday = getYesterday(today);
    const lastWin = new Date(data.lastWinDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastWin.getTime()) / (1000 * 60 * 60 * 24));
    
    // If the last win was more than 1 day ago and it's not today, streak is broken
    if (diffDays > 1) {
      return { currentStreak: 0, bestStreak: data.bestStreak };
    }
  }
  
  return { currentStreak: data.currentStreak, bestStreak: data.bestStreak };
}
