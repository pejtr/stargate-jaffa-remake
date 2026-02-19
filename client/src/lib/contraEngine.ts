import { GAME_ASSETS, CHARACTER_STATS, type CharacterType } from './gameAssets';
import { playShoot, playHit, playExplosion, playPowerUp, playDamage, playJump, playBossSpawn, playBossDeath, playShieldActivate, playShieldDeactivate } from './audioEngine';

// ─── Types ───────────────────────────────────────────────────────
interface Vec2 { x: number; y: number }

interface ContraPlayer {
  pos: Vec2;
  vel: Vec2;
  w: number; h: number;
  facing: 1 | -1;
  onGround: boolean;
  lives: number;
  hp: number;
  maxHp: number;
  invTimer: number;
  animFrame: number;
  animTimer: number;
  character: CharacterType;
  currentWeapon: 0 | 1; // 0 = melee, 1 = ranged
  shootCooldown: number;
  shieldActive: boolean;
  shieldEnergy: number;
  maxShieldEnergy: number;
  shieldRecharge: number;
  shieldSoundPlayed: boolean;
}

interface Enemy {
  pos: Vec2;
  vel: Vec2;
  w: number; h: number;
  type: 'jaffa' | 'elite' | 'kull' | 'replicator' | 'ori';
  hp: number;
  maxHp: number;
  active: boolean;
  facing: 1 | -1;
  animFrame: number;
  animTimer: number;
  shootTimer: number;
  hitFlash: number;
  points: number;
}

interface Bullet {
  pos: Vec2;
  vel: Vec2;
  w: number; h: number;
  dmg: number;
  owner: 'player' | 'enemy';
  active: boolean;
  trail: Vec2[];
  type?: 'staff' | 'p90' | 'knife';
}

interface Platform {
  x: number; y: number; w: number; h: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

interface Explosion {
  x: number; y: number;
  radius: number; maxRadius: number;
  life: number; maxLife: number;
}

interface PowerUp {
  pos: Vec2;
  type: 'health' | 'shield' | 'ammo' | 'rapidfire' | 'spread' | 'energy';
  active: boolean;
  bobTimer: number;
}

// ─── Constants ───────────────────────────────────────────────────
const COLORS = {
  sky: '#0a0a1e',
  ground: '#3a2a1a',
  platform: '#6b5a3a',
  jaffa: '#cc8833',
  elite: '#dd6622',
  kull: '#445566',
  kullGlow: '#6688ff',
  gold: '#ffd700',
  text: '#ffffff',
  health: '#ff3333',
  healthBg: '#441111',
  shield: '#4488ff',
};

const LEVEL_DATA = {
  1: {
    length: 3000,
    platforms: [
      // Ground level
      { x: 0, y: 650, w: 3000, h: 70 },
      // Platforms
      { x: 300, y: 550, w: 200, h: 20 },
      { x: 600, y: 450, w: 250, h: 20 },
      { x: 1000, y: 500, w: 200, h: 20 },
      { x: 1300, y: 400, w: 300, h: 20 },
      { x: 1700, y: 500, w: 200, h: 20 },
      { x: 2000, y: 450, w: 250, h: 20 },
      { x: 2400, y: 550, w: 200, h: 20 },
    ],
    enemies: [
      { x: 400, type: 'jaffa' as const },
      { x: 700, type: 'jaffa' as const },
      { x: 900, type: 'elite' as const },
      { x: 1200, type: 'jaffa' as const },
      { x: 1400, type: 'elite' as const },
      { x: 1600, type: 'jaffa' as const },
      { x: 1800, type: 'kull' as const },
      { x: 2100, type: 'elite' as const },
      { x: 2300, type: 'jaffa' as const },
      { x: 2500, type: 'elite' as const },
    ],
    bossX: 2800,
  },
  2: {
    length: 3500,
    platforms: [
      // Ground
      { x: 0, y: 650, w: 3500, h: 70 },
      // Goa'uld ship interior - more platforms
      { x: 200, y: 500, w: 300, h: 20 },
      { x: 600, y: 400, w: 200, h: 20 },
      { x: 900, y: 350, w: 250, h: 20 },
      { x: 1200, y: 450, w: 300, h: 20 },
      { x: 1600, y: 350, w: 200, h: 20 },
      { x: 1900, y: 500, w: 250, h: 20 },
      { x: 2200, y: 400, w: 300, h: 20 },
      { x: 2600, y: 500, w: 200, h: 20 },
      { x: 2900, y: 450, w: 300, h: 20 },
    ],
    enemies: [
      { x: 350, type: 'elite' as const },
      { x: 550, type: 'jaffa' as const },
      { x: 800, type: 'elite' as const },
      { x: 1000, type: 'kull' as const },
      { x: 1300, type: 'elite' as const },
      { x: 1500, type: 'jaffa' as const },
      { x: 1700, type: 'kull' as const },
      { x: 2000, type: 'elite' as const },
      { x: 2300, type: 'kull' as const },
      { x: 2500, type: 'elite' as const },
      { x: 2700, type: 'jaffa' as const },
      { x: 3000, type: 'kull' as const },
    ],
    bossX: 3300,
  },
  3: {
    length: 4000,
    platforms: [
      // Ground - ice platforms
      { x: 0, y: 650, w: 4000, h: 70 },
      // Antarctica - icy platforms
      { x: 250, y: 550, w: 250, h: 20 },
      { x: 600, y: 450, w: 200, h: 20 },
      { x: 900, y: 400, w: 300, h: 20 },
      { x: 1300, y: 350, w: 200, h: 20 },
      { x: 1600, y: 450, w: 250, h: 20 },
      { x: 1950, y: 500, w: 200, h: 20 },
      { x: 2250, y: 400, w: 300, h: 20 },
      { x: 2650, y: 350, w: 200, h: 20 },
      { x: 2950, y: 500, w: 250, h: 20 },
      { x: 3300, y: 450, w: 300, h: 20 },
    ],
    enemies: [
      { x: 400, type: 'replicator' as const },
      { x: 650, type: 'replicator' as const },
      { x: 950, type: 'ori' as const },
      { x: 1200, type: 'replicator' as const },
      { x: 1450, type: 'ori' as const },
      { x: 1700, type: 'replicator' as const },
      { x: 2000, type: 'ori' as const },
      { x: 2300, type: 'replicator' as const },
      { x: 2550, type: 'ori' as const },
      { x: 2800, type: 'replicator' as const },
      { x: 3050, type: 'ori' as const },
      { x: 3350, type: 'replicator' as const },
      { x: 3600, type: 'ori' as const },
    ],
    bossX: 3800,
  },
};

// ─── Engine ──────────────────────────────────────────────────────
export class ContraEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private W: number;
  private H: number;

  private players: ContraPlayer[] = [];
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private platforms: Platform[] = [];
  private particles: Particle[] = [];
  private explosions: Explosion[] = [];
  private powerups: PowerUp[] = [];

  private cameraX = 0;
  private score = 0;
  private currentLevel = 1;
  private spawnedEnemyIndex = 0;
  private bossSpawned = false;
  private boss: Enemy | null = null;
  private gameOver = false;
  private victory = false;

  private keys = new Set<string>();
  private lastTime = 0;
  private rafId: number | null = null;

  // Background
  private bgImage: HTMLImageElement | null = null;
  private bgLoaded = false;

  // Constants
  private readonly SPEED = 3;
  private readonly JUMP = -12;
  private readonly GRAVITY = 0.5;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.W = canvas.width;
    this.H = canvas.height;

    // Load background
    this.bgImage = new Image();
    this.bgImage.crossOrigin = 'anonymous';
    this.bgImage.onload = () => { this.bgLoaded = true; };
    this.bgImage.src = GAME_ASSETS.backgrounds.level1Egypt;

    this.loadLevel(1);
    this.setupInput();
  }

  private loadLevel(level: number): void {
    this.currentLevel = level;
    const data = LEVEL_DATA[level as 1 | 2];
    this.platforms = data.platforms.map(p => ({ ...p }));
    this.spawnedEnemyIndex = 0;
    this.bossSpawned = false;
    this.boss = null;
  }

  private setupInput(): void {
    const onKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key.toLowerCase());
      
      // Weapon switching
      if (e.key === 'Control' || e.key === 'Alt') {
        this.players.forEach(p => {
          p.currentWeapon = e.key === 'Control' ? 0 : 1;
        });
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    (this as any)._cleanup = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }

  // ─── Public API ──────────────────────────────────────────────
  public addPlayer(char: CharacterType, playerIndex: number = 0): void {
    if (this.players.length >= 2) return;

    const stats = CHARACTER_STATS[char];
    this.players.push({
      pos: { x: 100 + playerIndex * 50, y: 500 },
      vel: { x: 0, y: 0 },
      w: 24, h: 32,
      facing: 1,
      onGround: false,
      lives: stats.health,
      hp: stats.health * 20,
      maxHp: stats.health * 20,
      invTimer: 0,
      animFrame: 0,
      animTimer: 0,
      character: char,
      currentWeapon: 1, // Start with ranged
      shootCooldown: 0,
      shieldActive: false,
      shieldEnergy: 100,
      maxShieldEnergy: 100,
      shieldRecharge: 0,
      shieldSoundPlayed: false,
    });
  }

  public start(): void {
    this.lastTime = performance.now();
    this.loop();
  }

  public stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    (this as any)._cleanup?.();
  }

  public reset(): void {
    this.players = [];
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.explosions = [];
    this.cameraX = 0;
    this.score = 0;
    this.gameOver = false;
    this.victory = false;
    this.loadLevel(1);
  }

  public getState() {
    return { score: this.score, gameOver: this.gameOver, victory: this.victory };
  }

  // ─── Loop ────────────────────────────────────────────────────
  private loop = (): void => {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    if (!this.gameOver) this.update(dt);
    this.render();

    this.rafId = requestAnimationFrame(this.loop);
  };

  // ─── Update ──────────────────────────────────────────────────
  private update(dt: number): void {
    const levelData = LEVEL_DATA[this.currentLevel as 1 | 2 | 3];

    // Spawn enemies
    while (
      this.spawnedEnemyIndex < levelData.enemies.length &&
      levelData.enemies[this.spawnedEnemyIndex].x < this.cameraX + this.W + 100
    ) {
      const sp = levelData.enemies[this.spawnedEnemyIndex];
      this.spawnEnemy(sp.x, sp.type);
      this.spawnedEnemyIndex++;
    }

    // Boss spawn
    if (!this.bossSpawned && this.cameraX > levelData.bossX - this.W) {
      this.spawnBoss();
      this.bossSpawned = true;
      playBossSpawn();
    }

    // Players
    this.players.forEach((p, i) => this.updatePlayer(p, i, dt));

    // Camera follows first player
    if (this.players.length > 0) {
      const p = this.players[0];
      const targetCam = p.pos.x - this.W / 3;
      this.cameraX += (targetCam - this.cameraX) * 0.08;
      this.cameraX = Math.max(0, Math.min(levelData.length - this.W, this.cameraX));
    }

    // Enemies
    this.enemies.forEach(e => { if (e.active) this.updateEnemy(e, dt); });
    if (this.boss && this.boss.active) this.updateBoss(this.boss, dt);

    // Bullets
    this.bullets = this.bullets.filter(b => {
      if (!b.active) return false;
      b.pos.x += b.vel.x;
      b.pos.y += b.vel.y;
      b.trail.push({ x: b.pos.x, y: b.pos.y });
      if (b.trail.length > 6) b.trail.shift();
      if (b.pos.x < this.cameraX - 200 || b.pos.x > this.cameraX + this.W + 200 ||
          b.pos.y < -200 || b.pos.y > this.H + 200) {
        return false;
      }
      return true;
    });

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.15;
      p.life -= dt;
      return p.life > 0;
    });

    // Explosions
    this.explosions = this.explosions.filter(e => {
      e.life -= dt;
      e.radius += (e.maxRadius - e.radius) * 0.2;
      return e.life > 0;
    });

    // Power-ups
    this.updatePowerUps(dt);

    // Collisions
    this.checkCollisions();

    // Check victory
    if (this.boss && !this.boss.active && this.currentLevel === 3) {
      this.victory = true;
      this.gameOver = true;
    } else if (this.boss && !this.boss.active && this.currentLevel === 1) {
      // Load level 2
      this.loadLevel(2);
      this.players.forEach(p => {
        p.pos.x = 100;
        p.pos.y = 500;
      });
    } else if (this.boss && !this.boss.active && this.currentLevel === 2) {
      // Load level 3
      this.loadLevel(3);
      this.players.forEach(p => {
        p.pos.x = 100;
        p.pos.y = 500;
      });
    }
  }

  private updatePlayer(p: ContraPlayer, idx: number, dt: number): void {
    // Player 1: WASD + Space, Player 2: IJKL + Enter
    const controls = idx === 0 
      ? { left: 'a', right: 'd', up: 'w', down: 's', shoot: ' ', shield: 'shift' }
      : { left: 'j', right: 'l', up: 'i', down: 'k', shoot: 'enter', shield: 'shift' };

    const left = this.keys.has(controls.left);
    const right = this.keys.has(controls.right);
    const up = this.keys.has(controls.up);
    const shoot = this.keys.has(controls.shoot);
    const shield = this.keys.has(controls.shield);

    // Shield
    if (shield && p.shieldEnergy > 0) {
      if (!p.shieldActive && !p.shieldSoundPlayed) {
        playShieldActivate();
        p.shieldSoundPlayed = true;
      }
      p.shieldActive = true;
      p.shieldEnergy -= dt * 30;
      if (p.shieldEnergy < 0) p.shieldEnergy = 0;
      p.shieldRecharge = 2; // 2s cooldown after deactivation
    } else {
      if (p.shieldActive && p.shieldSoundPlayed) {
        playShieldDeactivate();
      }
      p.shieldActive = false;
      p.shieldSoundPlayed = false;
      if (p.shieldRecharge > 0) {
        p.shieldRecharge -= dt;
      } else if (p.shieldEnergy < p.maxShieldEnergy) {
        p.shieldEnergy += dt * 15;
        if (p.shieldEnergy > p.maxShieldEnergy) p.shieldEnergy = p.maxShieldEnergy;
      }
    }

    // Movement
    if (left) { p.vel.x = -this.SPEED; p.facing = -1; }
    else if (right) { p.vel.x = this.SPEED; p.facing = 1; }
    else { p.vel.x *= 0.7; if (Math.abs(p.vel.x) < 0.3) p.vel.x = 0; }

    // Jump
    if (up && p.onGround) {
      p.vel.y = this.JUMP;
      p.onGround = false;
      playJump();
    }

    // Gravity
    p.vel.y += this.GRAVITY;
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;

    // Platform collisions
    p.onGround = false;
    this.platforms.forEach(plat => {
      if (p.pos.x + p.w > plat.x && p.pos.x < plat.x + plat.w) {
        if (p.vel.y >= 0 && p.pos.y + p.h > plat.y && p.pos.y + p.h < plat.y + plat.h + 12) {
          p.pos.y = plat.y - p.h;
          p.vel.y = 0;
          p.onGround = true;
        }
      }
    });

    // Screen bounds
    const levelData = LEVEL_DATA[this.currentLevel as 1 | 2 | 3];
    p.pos.x = Math.max(this.cameraX, Math.min(levelData.length - p.w, p.pos.x));
    if (p.pos.y > this.H + 50) {
      p.lives--;
      if (p.lives <= 0) { this.gameOver = true; return; }
      p.hp = p.maxHp;
      p.pos.x = this.cameraX + 100;
      p.pos.y = 100;
      p.vel.y = 0;
      p.invTimer = 3;
    }

    // Invincibility
    if (p.invTimer > 0) p.invTimer -= dt;

    // Shoot
    p.shootCooldown -= dt;
    if (shoot && p.shootCooldown <= 0) {
      this.playerShoot(p);
      const cd = p.currentWeapon === 0 ? 0.4 : 0.15; // Melee slower, ranged faster
      p.shootCooldown = cd;
    }

    // Animation
    p.animTimer += dt;
    if (p.animTimer > 0.15) {
      p.animTimer = 0;
      p.animFrame = (p.animFrame + 1) % 4;
    }
  }

  private playerShoot(p: ContraPlayer): void {
    const cx = p.pos.x + p.w / 2;
    const cy = p.pos.y + p.h / 3;

    playShoot();

    if (p.currentWeapon === 0) {
      // Melee (knife/fist)
      const isTealc = p.character === 'tealc';
      const range = isTealc ? 40 : 35;
      const dmg = isTealc ? 25 : 20;
      
      // Check melee hit
      this.enemies.forEach(e => {
        if (!e.active) return;
        const dx = e.pos.x - cx;
        const dy = e.pos.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < range && Math.sign(dx) === p.facing) {
          e.hp -= dmg;
          e.hitFlash = 0.2;
          playHit();
          if (e.hp <= 0) {
            e.active = false;
            this.score += e.points;
            this.createExplosion(e.pos.x, e.pos.y, 40);
          }
        }
      });

      // Melee effect particles
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: cx + p.facing * 30,
          y: cy,
          vx: p.facing * (4 + Math.random() * 4),
          vy: (Math.random() - 0.5) * 4,
          life: 0.2, maxLife: 0.2,
          color: isTealc ? '#ffaa00' : '#cccccc',
          size: 3 + Math.random() * 3,
        });
      }

    } else {
      // Ranged weapon
      const isTealc = p.character === 'tealc';
      const speed = isTealc ? 10 : 14;
      const dmg = isTealc ? 15 : 8;
      const type = isTealc ? 'staff' : 'p90';

      this.bullets.push({
        pos: { x: cx, y: cy },
        vel: { x: p.facing * speed, y: 0 },
        w: 8, h: 4,
        dmg,
        owner: 'player',
        active: true,
        trail: [],
        type,
      });
    }
  }

  private spawnEnemy(x: number, type: 'jaffa' | 'elite' | 'kull' | 'replicator' | 'ori'): void {
    const data = {
      jaffa: { hp: 30, pts: 100 },
      elite: { hp: 50, pts: 250 },
      kull: { hp: 100, pts: 500 },
      replicator: { hp: 40, pts: 300 },
      ori: { hp: 70, pts: 400 },
    }[type];

    this.enemies.push({
      pos: { x, y: 600 },
      vel: { x: 0, y: 0 },
      w: 24, h: 32,
      type,
      hp: data.hp,
      maxHp: data.hp,
      active: true,
      facing: -1,
      animFrame: 0,
      animTimer: 0,
      shootTimer: 2 + Math.random() * 2,
      hitFlash: 0,
      points: data.pts,
    });
  }

  private spawnBoss(): void {
    const levelData = LEVEL_DATA[this.currentLevel as 1 | 2 | 3];
    
    // Different boss for each level
    const bossData = {
      1: { type: 'jaffa' as const, hp: 500, w: 48, h: 64, pts: 5000 }, // Apophis
      2: { type: 'kull' as const, hp: 800, w: 56, h: 72, pts: 10000 }, // Anubis
      3: { type: 'replicator' as const, hp: 1000, w: 52, h: 68, pts: 15000 }, // Replicator Carter
    }[this.currentLevel as 1 | 2 | 3];
    
    this.boss = {
      pos: { x: levelData.bossX, y: 550 },
      vel: { x: 0, y: 0 },
      w: bossData.w, h: bossData.h,
      type: bossData.type,
      hp: bossData.hp,
      maxHp: bossData.hp,
      active: true,
      facing: -1,
      animFrame: 0,
      animTimer: 0,
      shootTimer: 1,
      hitFlash: 0,
      points: bossData.pts,
    };
  }

  private updateEnemy(e: Enemy, dt: number): void {
    // Simple AI: move toward player, shoot occasionally
    if (this.players.length === 0) return;
    const target = this.players[0];
    const dx = target.pos.x - e.pos.x;
    e.facing = dx > 0 ? 1 : -1;

    if (Math.abs(dx) > 150) {
      e.vel.x = e.facing * 1.2;
    } else {
      e.vel.x = 0;
    }

    e.pos.x += e.vel.x;

    // Shoot
    e.shootTimer -= dt;
    if (e.shootTimer <= 0 && Math.abs(dx) < 400) {
      this.enemyShoot(e);
      e.shootTimer = 2 + Math.random() * 2;
    }

    // Animation
    e.animTimer += dt;
    if (e.animTimer > 0.2) {
      e.animTimer = 0;
      e.animFrame = (e.animFrame + 1) % 4;
    }

    if (e.hitFlash > 0) e.hitFlash -= dt;
  }

  private updateBoss(e: Enemy, dt: number): void {
    // Boss AI: unique patterns for each boss
    if (this.players.length === 0) return;
    const target = this.players[0];
    const dx = target.pos.x - e.pos.x;
    e.facing = dx > 0 ? 1 : -1;

    // Apophis (Level 1): Fast movement, rapid fire
    if (this.currentLevel === 1) {
      if (Math.abs(dx) > 200) {
        e.vel.x = e.facing * 3;
      } else {
        e.vel.x = 0;
      }
      e.pos.x += e.vel.x;
      e.shootTimer -= dt;
      if (e.shootTimer <= 0) {
        this.enemyShoot(e);
        e.shootTimer = 0.6; // Rapid fire
      }
    }
    // Anubis (Level 2): Teleport, triple shot
    else if (this.currentLevel === 2) {
      if (Math.abs(dx) > 300) {
        e.vel.x = e.facing * 2.5;
      } else {
        e.vel.x = 0;
      }
      e.pos.x += e.vel.x;
      e.shootTimer -= dt;
      if (e.shootTimer <= 0) {
        // Triple shot
        this.enemyShoot(e);
        const cx = e.pos.x + e.w / 2;
        const cy = e.pos.y + e.h / 3;
        this.bullets.push({
          pos: { x: cx, y: cy },
          vel: { x: e.facing * 6, y: -2 },
          w: 8, h: 6, dmg: 15, owner: 'enemy', active: true, trail: [],
        });
        this.bullets.push({
          pos: { x: cx, y: cy },
          vel: { x: e.facing * 6, y: 2 },
          w: 8, h: 6, dmg: 15, owner: 'enemy', active: true, trail: [],
        });
        e.shootTimer = 1.2;
      }
    }
    // Replicator Carter (Level 3): Erratic movement, spread shot
    else if (this.currentLevel === 3) {
      e.vel.x = Math.sin(Date.now() / 500) * 4;
      e.pos.x += e.vel.x;
      e.shootTimer -= dt;
      if (e.shootTimer <= 0) {
        // 5-way spread shot
        const cx = e.pos.x + e.w / 2;
        const cy = e.pos.y + e.h / 3;
        for (let i = -2; i <= 2; i++) {
          this.bullets.push({
            pos: { x: cx, y: cy },
            vel: { x: e.facing * 5, y: i * 1.5 },
            w: 8, h: 6, dmg: 12, owner: 'enemy', active: true, trail: [],
          });
        }
        e.shootTimer = 1.5;
      }
    }

    e.animTimer += dt;
    if (e.animTimer > 0.15) {
      e.animTimer = 0;
      e.animFrame = (e.animFrame + 1) % 4;
    }

    if (e.hitFlash > 0) e.hitFlash -= dt;
  }

  private enemyShoot(e: Enemy): void {
    const cx = e.pos.x + e.w / 2;
    const cy = e.pos.y + e.h / 3;

    this.bullets.push({
      pos: { x: cx, y: cy },
      vel: { x: e.facing * 6, y: 0 },
      w: 8, h: 6,
      dmg: 10,
      owner: 'enemy',
      active: true,
      trail: [],
    });
  }

  private checkCollisions(): void {
    // Player bullets vs enemies
    this.bullets.forEach(b => {
      if (!b.active || b.owner !== 'player') return;
      
      this.enemies.forEach(e => {
        if (!e.active) return;
        if (b.pos.x < e.pos.x + e.w && b.pos.x + b.w > e.pos.x &&
            b.pos.y < e.pos.y + e.h && b.pos.y + b.h > e.pos.y) {
          e.hp -= b.dmg;
          e.hitFlash = 0.15;
          b.active = false;
          playHit();

          if (e.hp <= 0) {
            e.active = false;
            this.score += e.points;
            this.createExplosion(e.pos.x, e.pos.y, 45);
            // 20% chance to drop power-up
            if (Math.random() < 0.2) {
              this.spawnPowerUp(e.pos.x + e.w / 2, e.pos.y + e.h / 2);
            }
          }
        }
      });

      // Boss
      if (this.boss && this.boss.active) {
        const e = this.boss;
        if (b.pos.x < e.pos.x + e.w && b.pos.x + b.w > e.pos.x &&
            b.pos.y < e.pos.y + e.h && b.pos.y + b.h > e.pos.y) {
          e.hp -= b.dmg;
          e.hitFlash = 0.15;
          b.active = false;
          playHit();

          if (e.hp <= 0) {
            e.active = false;
            this.score += e.points;
            this.createExplosion(e.pos.x, e.pos.y, 80);
            playBossDeath();
          }
        }
      }
    });

    // Enemy bullets vs players
    this.bullets.forEach(b => {
      if (!b.active || b.owner !== 'enemy') return;

      this.players.forEach(p => {
        if (p.invTimer > 0) return;
        if (b.pos.x < p.pos.x + p.w && b.pos.x + b.w > p.pos.x &&
            b.pos.y < p.pos.y + p.h && b.pos.y + b.h > p.pos.y) {
          
          if (p.shieldActive) {
            // Shield absorbs hit
            b.active = false;
            for (let i = 0; i < 8; i++) {
              this.particles.push({
                x: b.pos.x, y: b.pos.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 0.3, maxLife: 0.3,
                color: COLORS.shield, size: 3,
              });
            }
          } else {
            p.hp -= b.dmg;
            b.active = false;
            playDamage();

            if (p.hp <= 0) {
              p.lives--;
              if (p.lives <= 0) {
                this.gameOver = true;
              } else {
                p.hp = p.maxHp;
                p.invTimer = 3;
              }
            }
          }
        }
      });
    });
  }

  private createExplosion(x: number, y: number, radius: number): void {
    playExplosion();
    this.explosions.push({
      x, y,
      radius: 5, maxRadius: radius,
      life: 0.4, maxLife: 0.4,
    });

    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 4,
        life: 0.5 + Math.random() * 0.5, maxLife: 1,
        color: '#ff8800', size: 3 + Math.random() * 5,
      });
    }
  }

  // ─── Render ──────────────────────────────────────────────────
  private render(): void {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, '#050510');
    grad.addColorStop(0.5, '#0a0a2e');
    grad.addColorStop(1, '#1a1040');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);

    // Parallax background
    if (this.bgLoaded && this.bgImage) {
      ctx.globalAlpha = 0.3;
      const bgX = -this.cameraX * 0.3;
      ctx.drawImage(this.bgImage, bgX, 0, this.W * 1.5, this.H * 0.8);
      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Platforms
    this.platforms.forEach(plat => {
      ctx.fillStyle = COLORS.platform;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = '#4a3a2a';
      ctx.fillRect(plat.x, plat.y, plat.w, 3);
    });

    // Players
    this.players.forEach(p => this.drawPlayer(p));

    // Enemies
    this.enemies.forEach(e => { if (e.active) this.drawEnemy(e); });
    if (this.boss && this.boss.active) this.drawBoss(this.boss);

    // Bullets
    this.bullets.forEach(b => {
      if (!b.active) return;
      ctx.fillStyle = b.owner === 'player' ? '#ffff00' : '#ff6600';
      ctx.fillRect(b.pos.x - b.w / 2, b.pos.y - b.h / 2, b.w, b.h);
      // Trail
      b.trail.forEach((t, i) => {
        ctx.globalAlpha = i / b.trail.length * 0.5;
        ctx.fillRect(t.x - 2, t.y - 2, 4, 4);
      });
      ctx.globalAlpha = 1;
    });

    // Explosions
    this.explosions.forEach(ex => {
      const alpha = ex.life / ex.maxLife;
      const grad = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, ex.radius);
      grad.addColorStop(0, `rgba(255,255,200,${alpha})`);
      grad.addColorStop(0.3, `rgba(255,150,50,${alpha * 0.8})`);
      grad.addColorStop(0.7, `rgba(255,50,0,${alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(100,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // Power-ups
    this.renderPowerUps();

    ctx.restore();

    // HUD
    this.drawHUD();

    if (this.gameOver) {
      this.drawGameOver();
    }
  }

  private drawPlayer(p: ContraPlayer): void {
    const ctx = this.ctx;
    
    // Shield effect
    if (p.shieldActive) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = COLORS.shield;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.pos.x + p.w / 2, p.pos.y + p.h / 2, p.w, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Invincibility flash
    if (p.invTimer > 0 && Math.floor(p.invTimer * 10) % 2 === 0) return;

    // Body
    const colors = {
      tealc: { body: '#8b7355', armor: '#997722' },
      oneill: { body: '#4a4a4a', armor: '#2a2a2a' },
      carter: { body: '#4a4a4a', armor: '#2a2a2a' },
      jackson: { body: '#4a4a4a', armor: '#2a2a2a' },
    }[p.character];

    ctx.fillStyle = colors.body;
    ctx.fillRect(p.pos.x + 8, p.pos.y + 8, 8, 16);

    // Armor
    ctx.fillStyle = colors.armor;
    ctx.fillRect(p.pos.x + 6, p.pos.y + 8, 12, 4);

    // Head
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(p.pos.x + 8, p.pos.y, 8, 8);

    // Weapon indicator
    const weaponColor = p.currentWeapon === 0 ? '#cccccc' : '#ffaa00';
    ctx.fillStyle = weaponColor;
    ctx.fillRect(p.pos.x + (p.facing === 1 ? 16 : 0), p.pos.y + 12, 8, 3);
  }

  private drawEnemy(e: Enemy): void {
    const ctx = this.ctx;

    if (e.hitFlash > 0) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(e.pos.x, e.pos.y, e.w, e.h);
      ctx.globalAlpha = 1;
    }

    const colors = {
      jaffa: { body: COLORS.jaffa, armor: '#997722' },
      elite: { body: COLORS.elite, armor: '#bb4411' },
      kull: { body: COLORS.kull, armor: '#334455' },
      replicator: { body: '#8899aa', armor: '#4466ff' },
      ori: { body: '#ffffff', armor: '#ffd700' },
    }[e.type];

    ctx.fillStyle = colors.body;
    ctx.fillRect(e.pos.x + 8, e.pos.y + 8, 8, 16);
    ctx.fillStyle = colors.armor;
    ctx.fillRect(e.pos.x + 6, e.pos.y + 8, 12, 4);
    ctx.fillStyle = '#bb9933';
    ctx.fillRect(e.pos.x + 8, e.pos.y, 8, 8);

    // Health bar
    if (e.hp < e.maxHp) {
      ctx.fillStyle = COLORS.healthBg;
      ctx.fillRect(e.pos.x, e.pos.y - 8, e.w, 4);
      ctx.fillStyle = COLORS.health;
      ctx.fillRect(e.pos.x, e.pos.y - 8, e.w * (e.hp / e.maxHp), 4);
    }
  }

  private drawBoss(e: Enemy): void {
    const ctx = this.ctx;

    if (e.hitFlash > 0) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(e.pos.x, e.pos.y, e.w, e.h);
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = COLORS.kull;
    ctx.fillRect(e.pos.x + 12, e.pos.y + 16, 24, 40);
    ctx.fillStyle = '#334455';
    ctx.fillRect(e.pos.x + 8, e.pos.y + 16, 32, 8);
    ctx.fillStyle = '#556677';
    ctx.fillRect(e.pos.x + 12, e.pos.y, 24, 16);
    
    // Glow
    ctx.fillStyle = COLORS.kullGlow;
    ctx.fillRect(e.pos.x + 16, e.pos.y + 6, 16, 6);

    // Boss health bar
    ctx.fillStyle = COLORS.healthBg;
    ctx.fillRect(e.pos.x, e.pos.y - 16, e.w, 6);
    ctx.fillStyle = COLORS.health;
    ctx.fillRect(e.pos.x, e.pos.y - 16, e.w * (e.hp / e.maxHp), 6);
  }

  private drawHUD(): void {
    const ctx = this.ctx;

    // HUD background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, this.W, 60);
    ctx.fillStyle = 'rgba(100,0,200,0.3)';
    ctx.fillRect(0, 58, this.W, 2);

    // Score
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillText('SCORE', 20, 22);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillText(String(this.score).padStart(8, '0'), 20, 46);

    // Level
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillText('LEVEL', 280, 22);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillText(`${this.currentLevel}/3`, 280, 46);

    // Players
    this.players.forEach((p, i) => {
      const x = 500 + i * 350;
      ctx.fillStyle = COLORS.gold;
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillText(`P${i + 1}`, x, 22);
      
      // Lives
      ctx.fillStyle = COLORS.health;
      for (let j = 0; j < p.lives; j++) {
        ctx.fillRect(x + j * 16, 28, 12, 12);
      }

      // HP bar
      ctx.fillStyle = COLORS.healthBg;
      ctx.fillRect(x, 44, 100, 8);
      ctx.fillStyle = COLORS.health;
      ctx.fillRect(x, 44, 100 * (p.hp / p.maxHp), 8);

      // Shield bar
      ctx.fillStyle = 'rgba(68,136,255,0.3)';
      ctx.fillRect(x + 110, 44, 60, 8);
      ctx.fillStyle = COLORS.shield;
      ctx.fillRect(x + 110, 44, 60 * (p.shieldEnergy / p.maxShieldEnergy), 8);

      // Weapon indicator
      ctx.fillStyle = '#888';
      ctx.font = '8px "Press Start 2P", monospace';
      const weaponName = p.currentWeapon === 0 
        ? (p.character === 'tealc' ? 'FIST' : 'KNIFE')
        : (p.character === 'tealc' ? 'STAFF' : 'P90');
      ctx.fillText(weaponName, x + 180, 50);
    });

    // Controls hint
    ctx.fillStyle = '#666';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SPACE:SHOOT | CTRL:MELEE | ALT:RANGED | SHIFT:SHIELD', this.W - 20, 50);
    ctx.textAlign = 'left';
  }

  private drawGameOver(): void {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.textAlign = 'center';

    if (this.victory) {
      ctx.fillStyle = COLORS.gold;
      ctx.font = 'bold 48px "Press Start 2P", monospace';
      ctx.fillText('VICTORY!', this.W / 2, this.H / 2 - 40);
      ctx.fillStyle = COLORS.text;
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText('MISSION COMPLETE', this.W / 2, this.H / 2 + 10);
    } else {
      ctx.fillStyle = COLORS.health;
      ctx.font = 'bold 48px "Press Start 2P", monospace';
      ctx.fillText('GAME OVER', this.W / 2, this.H / 2 - 40);
    }

    ctx.fillStyle = COLORS.text;
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillText(`FINAL SCORE: ${this.score}`, this.W / 2, this.H / 2 + 50);

    ctx.fillStyle = '#888';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText('PRESS R TO RESTART', this.W / 2, this.H / 2 + 120);

    ctx.textAlign = 'left';
  }

  private spawnPowerUp(x: number, y: number): void {
    const types: PowerUp['type'][] = ['health', 'shield', 'ammo', 'rapidfire', 'spread', 'energy'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerups.push({
      pos: { x, y },
      type,
      active: true,
      bobTimer: 0,
    });
  }

  private updatePowerUps(dt: number): void {
    this.powerups = this.powerups.filter(p => {
      if (!p.active) return false;
      p.bobTimer += dt * 3;
      // Check collision with players
      this.players.forEach(player => {
        if (p.pos.x > player.pos.x && p.pos.x < player.pos.x + player.w &&
            p.pos.y > player.pos.y && p.pos.y < player.pos.y + player.h) {
          p.active = false;
          playPowerUp();
          this.applyPowerUp(player, p.type);
        }
      });
      return p.active;
    });
  }

  private applyPowerUp(player: ContraPlayer, type: PowerUp['type']): void {
    switch (type) {
      case 'health':
        player.hp = Math.min(player.maxHp, player.hp + 30);
        break;
      case 'shield':
        player.shieldEnergy = player.maxShieldEnergy;
        break;
      case 'ammo':
        // Just visual feedback for now
        break;
      case 'rapidfire':
      case 'spread':
      case 'energy':
        // TODO: Implement temporary buffs
        break;
    }
  }

  private renderPowerUps(): void {
    const ctx = this.ctx;
    const colors = {
      health: '#ff3333',
      shield: '#4488ff',
      ammo: '#ffdd33',
      rapidfire: '#33ff66',
      spread: '#ff8833',
      energy: '#aa33ff',
    };
    this.powerups.forEach(p => {
      if (!p.active) return;
      const bob = Math.sin(p.bobTimer) * 5;
      ctx.fillStyle = colors[p.type];
      ctx.fillRect(p.pos.x - 8, p.pos.y - 8 + bob, 16, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.pos.x - 8, p.pos.y - 8 + bob, 16, 16);
    });
  }
}
