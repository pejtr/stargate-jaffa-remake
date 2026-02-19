// ─── Highscore System with localStorage ─────────────────────

export interface HighscoreEntry {
  name: string;
  score: number;
  mode: 'contra' | 'defense';
  character: string;
  wave?: number;
  date: string;
}

const STORAGE_KEY = 'stargate_jaffa2_highscores';
const MAX_ENTRIES = 10;

export function getHighscores(mode?: 'contra' | 'defense'): HighscoreEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const all: HighscoreEntry[] = JSON.parse(data);
    const filtered = mode ? all.filter(e => e.mode === mode) : all;
    return filtered.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function addHighscore(entry: HighscoreEntry): number {
  try {
    const all = getAllHighscores();
    all.push(entry);
    all.sort((a, b) => b.score - a.score);
    // Keep top entries per mode
    const contra = all.filter(e => e.mode === 'contra').slice(0, MAX_ENTRIES);
    const defense = all.filter(e => e.mode === 'defense').slice(0, MAX_ENTRIES);
    const combined = [...contra, ...defense];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
    // Return rank (1-based)
    const modeScores = combined.filter(e => e.mode === entry.mode).sort((a, b) => b.score - a.score);
    return modeScores.findIndex(e => e.score === entry.score && e.date === entry.date) + 1;
  } catch {
    return -1;
  }
}

export function isHighscore(score: number, mode: 'contra' | 'defense'): boolean {
  const scores = getHighscores(mode);
  if (scores.length < MAX_ENTRIES) return score > 0;
  return score > scores[scores.length - 1].score;
}

function getAllHighscores(): HighscoreEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function clearHighscores(): void {
  localStorage.removeItem(STORAGE_KEY);
}
