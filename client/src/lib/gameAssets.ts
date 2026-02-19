// Game asset URLs from CDN
export const GAME_ASSETS = {
  sprites: {
    tealc: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/nwtqUgJpvLYNpomf.png',
    oneill: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/grEhcliXKFSodJDz.png',
    carter: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/VjfzCJgUzLgCuiVR.png',
    jackson: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/YwbbivLHytufZFpT.png',
    jaffaEnemies: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/ocmEDBpBkqNmOYJF.png',
    replicators: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/FRjpFrogFcZeOxtP.png',
    oriSoldiers: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/UkTsBNtLAnqQJqrk.png',
    powerups: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/ktToxlSHwjXhTMwf.png',
  },
  backgrounds: {
    level1Egypt: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/qjxwxyRxxOVyWNbS.png',
    level2Goauld: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/qjxwxyRxxOVyWNbS.png', // TODO: Generate Goa'uld ship bg
    level3Antarctica: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/ndVeouJBVVnhdVDf.png',
    ancientOutpost: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/LAzYxAosqtNDumAI.png',
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
    meleeWeapon: 'fists',
    rangedWeapon: 'staff',
  },
  oneill: {
    name: "Jack O'Neill",
    health: 4,
    speed: 4,
    weapon: 'p90',
    special: 'Balanced',
    meleeWeapon: 'knife',
    rangedWeapon: 'p90',
  },
  carter: {
    name: 'Samantha Carter',
    health: 3,
    speed: 5,
    weapon: 'p90',
    special: 'Tech gadgets',
    meleeWeapon: 'knife',
    rangedWeapon: 'p90',
  },
  jackson: {
    name: 'Daniel Jackson',
    health: 4,
    speed: 4,
    weapon: 'p90',
    special: 'Fast reload',
    meleeWeapon: 'knife',
    rangedWeapon: 'p90',
  },
} as const;

export type CharacterType = keyof typeof CHARACTER_STATS;

// Power-up types
export type PowerUpType = 'health' | 'shield' | 'ammo' | 'rapidfire' | 'spread' | 'energy';

export const POWERUP_EFFECTS = {
  health: { duration: 0, value: 1 }, // Instant heal
  shield: { duration: 10000, value: 1 }, // 10 seconds shield
  ammo: { duration: 0, value: 50 }, // Instant ammo
  rapidfire: { duration: 15000, value: 2 }, // 15 seconds 2x fire rate
  spread: { duration: 15000, value: 3 }, // 15 seconds spread shot
  energy: { duration: 20000, value: 1.5 }, // 20 seconds 1.5x damage
} as const;

// Enemy types
export type EnemyType = 'jaffa' | 'elite' | 'kull' | 'replicator' | 'ori';

export const ENEMY_STATS = {
  jaffa: {
    health: 2,
    speed: 1.5,
    damage: 1,
    score: 100,
  },
  elite: {
    health: 4,
    speed: 2,
    damage: 2,
    score: 250,
  },
  kull: {
    health: 8,
    speed: 1,
    damage: 3,
    score: 500,
  },
  replicator: {
    health: 3,
    speed: 2.5,
    damage: 2,
    score: 300,
  },
  ori: {
    health: 6,
    speed: 1.5,
    damage: 3,
    score: 400,
  },
} as const;
