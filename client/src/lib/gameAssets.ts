// Game asset URLs from CDN
export const GAME_ASSETS = {
  sprites: {
    tealc: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/nwtqUgJpvLYNpomf.png',
    oneill: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/grEhcliXKFSodJDz.png',
    carter: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/VjfzCJgUzLgCuiVR.png',
    jackson: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/YwbbivLHytufZFpT.png',
    enemies: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/ocmEDBpBkqNmOYJF.png',
  },
  backgrounds: {
    level1: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/qjxwxyRxxOVyWNbS.png',
  },
  tilesets: {
    platforms: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/AmkdvyshiHrWvgXq.png',
  },
} as const;

// Character stats
export const CHARACTER_STATS = {
  tealc: {
    name: "Teal'c",
    health: 5,
    speed: 3,
    weapon: 'staff',
    special: 'High damage',
  },
  oneill: {
    name: "Jack O'Neill",
    health: 4,
    speed: 4,
    weapon: 'p90',
    special: 'Balanced',
  },
  carter: {
    name: 'Samantha Carter',
    health: 3,
    speed: 5,
    weapon: 'zat',
    special: 'Tech gadgets',
  },
  jackson: {
    name: 'Daniel Jackson',
    health: 4,
    speed: 4,
    weapon: 'ancient',
    special: 'Fast reload',
  },
} as const;

export type CharacterType = keyof typeof CHARACTER_STATS;
