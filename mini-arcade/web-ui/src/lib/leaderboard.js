// Key used for storing leaderboard data in localStorage
const LB_KEY = 'arcade_leaderboard';

// Loads the leaderboard array from localStorage
function loadLB() {
  try {
    return JSON.parse(localStorage.getItem(LB_KEY)) || [];
  } catch {
    return [];
  }
}

// Saves the leaderboard array to localStorage
function saveLB(lb) {
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(lb));
  } catch {}
}

// Returns the top 5 unique players with their highest scores, sorted descending as stated through project scope
export function getLeaderboard() {
  const raw = loadLB();
  const deduped = Object.values(
    raw.reduce((acc, entry) => {
      if (!acc[entry.name] || acc[entry.name].score < entry.score) {
        acc[entry.name] = { name: entry.name, score: entry.score };
      }
      return acc;
    }, {})
  );
  return deduped.sort((a, b) => b.score - a.score).slice(0, 5);
}

//Returns the highest score for a given player name
export function getHighScore(name) {
  if (!name) return 0;
  const raw = loadLB();
  return raw.filter(e => e.name === name).reduce((max, e) => Math.max(max, e.score), 0);
}

// Adds a new score entry for a player and saves it
export function saveScore(name, score) {
  if (!name || typeof score !== 'number') return;
  const raw = loadLB();
  raw.push({ name, score });
  saveLB(raw);
}
