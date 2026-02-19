import { GAME_ASSETS, CHARACTER_STATS, type CharacterType } from './gameAssets';

// ─── Types ───────────────────────────────────────────────────────
interface Vec2 { x: number; y: number }

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

interface Platform {
  x: number; y: number; w: number; h: number;
  type: 'stone' | 'metal' | 'sand';
}

interface ContraPlayer {
  character: CharacterType;
  pos: Vec2; vel: Vec2;
  w: number; h: number;
  hp: number; maxHp: number; lives: number;
  facing: 1 | -1;
  onGround: boolean;
  score: number;
  invTimer: number;
  shootCooldown: number;
  aimAngle: number; // 0=right, PI=left, -PI/2=up etc
  animFrame: number;
  animTimer: number;
  weaponType: 'default' | 'spread' | 'rapid' | 'laser';
  weaponTimer: number;
}

interface Enemy {
  pos: Vec2; vel: Vec2;
  w: number; h: number;
  hp: number; maxHp: number;
  type: 'jaffa' | 'elite' | 'kull' | 'boss';
  facing: 1 | -1;
  shootTimer: number;
  points: number;
  active: boolean;
  animFrame: number;
  animTimer: number;
  bossPhase?: number;
  bossAttackTimer?: number;
}

interface Bullet {
  pos: Vec2; vel: Vec2;
  w: number; h: number;
  dmg: number;
  owner: 'player' | 'enemy';
  active: boolean;
  color: string;
  trail: Vec2[];
}

interface PowerUp {
  pos: Vec2; w: number; h: number;
  type: 'spread' | 'rapid' | 'laser' | 'health' | 'life';
  active: boolean;
  animTimer: number;
}

interface Explosion {
  x: number; y: number;
  radius: number; maxRadius: number;
  life: number; maxLife: number;
}

// ─── Level Data ──────────────────────────────────────────────────
const LEVEL_1_PLATFORMS: Platform[] = [
  // Ground platforms with gaps
  { x: 0, y: 560, w: 600, h: 160, type: 'stone' },
  { x: 700, y: 560, w: 400, h: 160, type: 'stone' },
  { x: 1200, y: 560, w: 600, h: 160, type: 'stone' },
  { x: 1900, y: 560, w: 500, h: 160, type: 'stone' },
  { x: 2500, y: 560, w: 800, h: 160, type: 'stone' },
  { x: 3400, y: 560, w: 600, h: 160, type: 'stone' },
  // Elevated platforms
  { x: 300, y: 420, w: 200, h: 24, type: 'metal' },
  { x: 600, y: 340, w: 180, h: 24, type: 'metal' },
  { x: 900, y: 400, w: 200, h: 24, type: 'metal' },
  { x: 1400, y: 380, w: 250, h: 24, type: 'metal' },
  { x: 1700, y: 300, w: 180, h: 24, type: 'metal' },
  { x: 2000, y: 420, w: 200, h: 24, type: 'metal' },
  { x: 2300, y: 340, w: 250, h: 24, type: 'metal' },
  { x: 2700, y: 400, w: 200, h: 24, type: 'metal' },
  { x: 3000, y: 320, w: 200, h: 24, type: 'metal' },
  // High platforms
  { x: 500, y: 220, w: 150, h: 24, type: 'sand' },
  { x: 1100, y: 240, w: 180, h: 24, type: 'sand' },
  { x: 1600, y: 180, w: 150, h: 24, type: 'sand' },
  { x: 2500, y: 220, w: 200, h: 24, type: 'sand' },
  // Boss arena
  { x: 3600, y: 560, w: 800, h: 160, type: 'stone' },
  { x: 3700, y: 380, w: 150, h: 24, type: 'metal' },
  { x: 4050, y: 380, w: 150, h: 24, type: 'metal' },
  { x: 3850, y: 240, w: 200, h: 24, type: 'metal' },
];

const ENEMY_SPAWNS = [
  { x: 500, type: 'jaffa' as const },
  { x: 700, type: 'jaffa' as const },
  { x: 950, type: 'jaffa' as const },
  { x: 1100, type: 'elite' as const },
  { x: 1300, type: 'jaffa' as const },
  { x: 1500, type: 'jaffa' as const },
  { x: 1700, type: 'elite' as const },
  { x: 1900, type: 'jaffa' as const },
  { x: 2100, type: 'jaffa' as const },
  { x: 2300, type: 'elite' as const },
  { x: 2500, type: 'kull' as const },
  { x: 2700, type: 'jaffa' as const },
  { x: 2900, type: 'elite' as const },
  { x: 3100, type: 'jaffa' as const },
  { x: 3300, type: 'elite' as const },
];

const POWERUP_SPAWNS = [
  { x: 400, y: 400, type: 'spread' as const },
  { x: 950, y: 380, type: 'rapid' as const },
  { x: 1600, y: 160, type: 'laser' as const },
  { x: 2100, y: 400, type: 'health' as const },
  { x: 2700, y: 380, type: 'life' as const },
  { x: 3050, y: 300, type: 'health' as const },
];

// ─── Colors ──────────────────────────────────────────────────────
const COLORS = {
  sky: '#0f0a2e',
  skyGrad: '#1a0f3d',
  stars: '#ffffff',
  ground: '#5c4033',
  groundLight: '#8b6914',
  stone: '#6b5b4f',
  stoneLight: '#8b7b6f',
  stoneDark: '#4b3b2f',
  metal: '#556677',
  metalLight: '#7799aa',
  sand: '#c4a35a',
  sandLight: '#d4b36a',
  playerBullet: '#ffee00',
  enemyBullet: '#ff3366',
  jaffa: '#cc8833',
  jaffaArmor: '#997722',
  elite: '#dd6622',
  eliteArmor: '#bb4411',
  kull: '#334455',
  kullGlow: '#6688ff',
  boss: '#880044',
  bossGlow: '#ff0066',
  health: '#ff3333',
  healthBg: '#441111',
  shield: '#3388ff',
  text: '#ffffff',
  textShadow: '#000000',
  gold: '#ffd700',
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
  private particles: Particle[] = [];
  private explosions: Explosion[] = [];
  private powerUps: PowerUp[] = [];
  private platforms: Platform[] = [];
  
  private cameraX = 0;
  private score = 0;
  private gameOver = false;
  private victory = false;
  private bossSpawned = false;
  private bossDefeated = false;
  private wave = 1;
  private spawnedEnemyIndex = 0;
  
  private keys = new Set<string>();
  private lastTime = 0;
  private rafId: number | null = null;
  
  // Stars for parallax
  private stars: { x: number; y: number; size: number; brightness: number }[] = [];
  // Background image
  private bgImage: HTMLImageElement | null = null;
  private bgLoaded = false;

  // Constants
  private readonly GRAVITY = 0.65;
  private readonly JUMP = -14;
  private readonly SPEED = 4.5;
  private readonly LEVEL_W = 4400;
  private readonly BOSS_X = 3800;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.W = canvas.width;
    this.H = canvas.height;

    // Generate stars
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * this.LEVEL_W,
        y: Math.random() * 400,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random(),
      });
    }

    // Load background
    this.bgImage = new Image();
    this.bgImage.crossOrigin = 'anonymous';
    this.bgImage.onload = () => { this.bgLoaded = true; };
    this.bgImage.src = GAME_ASSETS.backgrounds.level1;

    // Copy platforms
    this.platforms = [...LEVEL_1_PLATFORMS];

    // Spawn power-ups
    POWERUP_SPAWNS.forEach(s => {
      this.powerUps.push({
        pos: { x: s.x, y: s.y },
        w: 24, h: 24,
        type: s.type,
        active: true,
        animTimer: Math.random() * Math.PI * 2,
      });
    });

    this.setupInput();
  }

  // ─── Input ───────────────────────────────────────────────────
  private setupInput(): void {
    const onDown = (e: KeyboardEvent) => {
      this.keys.add(e.key.toLowerCase());
      if (['w','a','s','d',' ','arrowup','arrowdown','arrowleft','arrowright','control'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    (this as any)._cleanup = () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }

  // ─── Public API ──────────────────────────────────────────────
  public addPlayer(char: CharacterType): void {
    const stats = CHARACTER_STATS[char];
    const i = this.players.length;
    this.players.push({
      character: char,
      pos: { x: 80 + i * 50, y: 500 },
      vel: { x: 0, y: 0 },
      w: 28, h: 44,
      hp: stats.health, maxHp: stats.health,
      lives: 3,
      facing: 1,
      onGround: false,
      score: 0,
      invTimer: 2,
      shootCooldown: 0,
      aimAngle: 0,
      animFrame: 0, animTimer: 0,
      weaponType: 'default',
      weaponTimer: 0,
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
    this.powerUps = [];
    this.cameraX = 0;
    this.score = 0;
    this.gameOver = false;
    this.victory = false;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.spawnedEnemyIndex = 0;
    this.platforms = [...LEVEL_1_PLATFORMS];
    POWERUP_SPAWNS.forEach(s => {
      this.powerUps.push({
        pos: { x: s.x, y: s.y },
        w: 24, h: 24,
        type: s.type,
        active: true,
        animTimer: Math.random() * Math.PI * 2,
      });
    });
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
    // Spawn enemies as camera advances
    while (
      this.spawnedEnemyIndex < ENEMY_SPAWNS.length &&
      ENEMY_SPAWNS[this.spawnedEnemyIndex].x < this.cameraX + this.W + 100
    ) {
      const sp = ENEMY_SPAWNS[this.spawnedEnemyIndex];
      this.spawnEnemy(sp.x, sp.type);
      this.spawnedEnemyIndex++;
    }

    // Boss spawn
    if (!this.bossSpawned && this.cameraX > this.BOSS_X - this.W) {
      this.spawnBoss();
      this.bossSpawned = true;
    }

    // Players
    this.players.forEach((p, i) => this.updatePlayer(p, i, dt));

    // Camera follows first player
    if (this.players.length > 0) {
      const p = this.players[0];
      const targetCam = p.pos.x - this.W / 3;
      this.cameraX += (targetCam - this.cameraX) * 0.08;
      this.cameraX = Math.max(0, Math.min(this.LEVEL_W - this.W, this.cameraX));
    }

    // Enemies
    this.enemies.forEach(e => { if (e.active) this.updateEnemy(e, dt); });

    // Bullets
    this.bullets = this.bullets.filter(b => {
      if (!b.active) return false;
      b.pos.x += b.vel.x;
      b.pos.y += b.vel.y;
      // Trail
      b.trail.push({ x: b.pos.x, y: b.pos.y });
      if (b.trail.length > 6) b.trail.shift();
      // Off screen
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

    // Power-up animation
    this.powerUps.forEach(pu => { pu.animTimer += dt * 3; });

    // Collisions
    this.checkCollisions();
  }

  private updatePlayer(p: ContraPlayer, idx: number, dt: number): void {
    const left = idx === 0 ? (this.keys.has('a') || this.keys.has('arrowleft')) : false;
    const right = idx === 0 ? (this.keys.has('d') || this.keys.has('arrowright')) : false;
    const up = idx === 0 ? (this.keys.has('w') || this.keys.has('arrowup')) : false;
    const down = idx === 0 ? (this.keys.has('s') || this.keys.has('arrowdown')) : false;
    const shoot = this.keys.has('control');

    // Movement
    if (left) { p.vel.x = -this.SPEED; p.facing = -1; }
    else if (right) { p.vel.x = this.SPEED; p.facing = 1; }
    else { p.vel.x *= 0.7; if (Math.abs(p.vel.x) < 0.3) p.vel.x = 0; }

    // Jump
    if (up && p.onGround) {
      p.vel.y = this.JUMP;
      p.onGround = false;
    }

    // Aim angle
    if (up && !left && !right) p.aimAngle = -Math.PI / 2;
    else if (up && right) p.aimAngle = -Math.PI / 4;
    else if (up && left) p.aimAngle = -3 * Math.PI / 4;
    else if (down && !p.onGround && right) p.aimAngle = Math.PI / 4;
    else if (down && !p.onGround && left) p.aimAngle = 3 * Math.PI / 4;
    else if (down && !p.onGround) p.aimAngle = Math.PI / 2;
    else p.aimAngle = p.facing === 1 ? 0 : Math.PI;

    // Gravity
    p.vel.y += this.GRAVITY;
    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;

    // Platform collisions
    p.onGround = false;
    this.platforms.forEach(plat => {
      if (p.pos.x + p.w > plat.x && p.pos.x < plat.x + plat.w) {
        // Landing on top
        if (p.vel.y >= 0 && p.pos.y + p.h > plat.y && p.pos.y + p.h < plat.y + plat.h + 12) {
          p.pos.y = plat.y - p.h;
          p.vel.y = 0;
          p.onGround = true;
        }
      }
    });

    // Screen bounds
    p.pos.x = Math.max(this.cameraX, Math.min(this.LEVEL_W - p.w, p.pos.x));
    if (p.pos.y > this.H + 50) {
      // Fell off
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
      const cd = p.weaponType === 'rapid' ? 0.08 : p.weaponType === 'laser' ? 0.15 : 0.2;
      p.shootCooldown = cd;
    }

    // Weapon timer
    if (p.weaponTimer > 0) {
      p.weaponTimer -= dt;
      if (p.weaponTimer <= 0) p.weaponType = 'default';
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
    const speed = 12;

    if (p.weaponType === 'spread') {
      for (let a = -0.3; a <= 0.3; a += 0.3) {
        const angle = p.aimAngle + a;
        this.bullets.push({
          pos: { x: cx, y: cy },
          vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
          w: 6, h: 4, dmg: 1, owner: 'player', active: true,
          color: '#ffee00', trail: [],
        });
      }
    } else if (p.weaponType === 'laser') {
      this.bullets.push({
        pos: { x: cx, y: cy },
        vel: { x: Math.cos(p.aimAngle) * speed * 1.5, y: Math.sin(p.aimAngle) * speed * 1.5 },
        w: 16, h: 3, dmg: 3, owner: 'player', active: true,
        color: '#00ffff', trail: [],
      });
    } else {
      this.bullets.push({
        pos: { x: cx, y: cy },
        vel: { x: Math.cos(p.aimAngle) * speed, y: Math.sin(p.aimAngle) * speed },
        w: 8, h: 4, dmg: 1, owner: 'player', active: true,
        color: COLORS.playerBullet, trail: [],
      });
    }

    // Muzzle flash particles
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: cx + Math.cos(p.aimAngle) * 15,
        y: cy + Math.sin(p.aimAngle) * 15,
        vx: Math.cos(p.aimAngle) * (3 + Math.random() * 3) + (Math.random() - 0.5) * 2,
        vy: Math.sin(p.aimAngle) * (3 + Math.random() * 3) + (Math.random() - 0.5) * 2,
        life: 0.15, maxLife: 0.15,
        color: '#ffaa00', size: 3 + Math.random() * 3,
      });
    }
  }

  private updateEnemy(e: Enemy, dt: number): void {
    if (e.type === 'boss') {
      this.updateBoss(e, dt);
      return;
    }

    const p = this.players[0];
    if (!p) return;

    const dx = p.pos.x - e.pos.x;
    const dist = Math.abs(dx);

    e.facing = dx > 0 ? 1 : -1;

    // Move towards player
    if (dist > 120) {
      const spd = e.type === 'kull' ? 1 : e.type === 'elite' ? 2 : 1.5;
      e.vel.x = e.facing * spd;
    } else {
      e.vel.x = 0;
    }

    // Gravity
    e.vel.y += this.GRAVITY;
    e.pos.x += e.vel.x;
    e.pos.y += e.vel.y;

    // Platform collisions
    this.platforms.forEach(plat => {
      if (e.pos.x + e.w > plat.x && e.pos.x < plat.x + plat.w) {
        if (e.vel.y >= 0 && e.pos.y + e.h > plat.y && e.pos.y + e.h < plat.y + plat.h + 12) {
          e.pos.y = plat.y - e.h;
          e.vel.y = 0;
        }
      }
    });

    // Shoot
    e.shootTimer -= dt;
    if (e.shootTimer <= 0 && dist < 500) {
      this.enemyShoot(e);
      e.shootTimer = e.type === 'elite' ? 1.5 : e.type === 'kull' ? 1 : 2.5;
      e.shootTimer += Math.random() * 0.5;
    }

    // Animation
    e.animTimer += dt;
    if (e.animTimer > 0.2) { e.animTimer = 0; e.animFrame = (e.animFrame + 1) % 4; }

    // Fall off
    if (e.pos.y > this.H + 100) e.active = false;
  }

  private updateBoss(e: Enemy, dt: number): void {
    const p = this.players[0];
    if (!p) return;

    e.bossAttackTimer = (e.bossAttackTimer || 0) - dt;
    const phase = e.bossPhase || 0;

    // Movement - hover and track player
    const targetX = p.pos.x;
    const dx = targetX - e.pos.x;
    e.vel.x = dx * 0.01;
    e.pos.x += e.vel.x;

    // Hover
    e.pos.y = 200 + Math.sin(performance.now() / 800) * 40;
    e.facing = dx > 0 ? 1 : -1;

    // Attack patterns based on HP
    if (e.bossAttackTimer! <= 0) {
      if (e.hp > e.maxHp * 0.6) {
        // Phase 1: Single shots
        this.enemyShoot(e);
        e.bossAttackTimer = 0.8;
      } else if (e.hp > e.maxHp * 0.3) {
        // Phase 2: Spread shots
        for (let a = -0.4; a <= 0.4; a += 0.2) {
          const angle = Math.atan2(p.pos.y - e.pos.y, p.pos.x - e.pos.x) + a;
          this.bullets.push({
            pos: { x: e.pos.x + e.w / 2, y: e.pos.y + e.h / 2 },
            vel: { x: Math.cos(angle) * 6, y: Math.sin(angle) * 6 },
            w: 10, h: 10, dmg: 1, owner: 'enemy', active: true,
            color: COLORS.bossGlow, trail: [],
          });
        }
        e.bossAttackTimer = 1.2;
      } else {
        // Phase 3: Rapid fire + tracking
        const angle = Math.atan2(p.pos.y - e.pos.y, p.pos.x - e.pos.x);
        this.bullets.push({
          pos: { x: e.pos.x + e.w / 2, y: e.pos.y + e.h / 2 },
          vel: { x: Math.cos(angle) * 8, y: Math.sin(angle) * 8 },
          w: 12, h: 12, dmg: 2, owner: 'enemy', active: true,
          color: '#ff0000', trail: [],
        });
        e.bossAttackTimer = 0.4;
      }
    }

    // Animation
    e.animTimer += dt;
    if (e.animTimer > 0.1) { e.animTimer = 0; e.animFrame = (e.animFrame + 1) % 4; }
  }

  private enemyShoot(e: Enemy): void {
    const p = this.players[0];
    if (!p) return;

    const angle = Math.atan2(p.pos.y - e.pos.y, p.pos.x - e.pos.x);
    const speed = e.type === 'kull' ? 7 : 5;

    this.bullets.push({
      pos: { x: e.pos.x + e.w / 2, y: e.pos.y + e.h / 3 },
      vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      w: 8, h: 8, dmg: 1, owner: 'enemy', active: true,
      color: e.type === 'kull' ? COLORS.kullGlow : COLORS.enemyBullet,
      trail: [],
    });
  }

  private spawnEnemy(x: number, type: 'jaffa' | 'elite' | 'kull'): void {
    const data = {
      jaffa: { hp: 2, pts: 100, w: 28, h: 44 },
      elite: { hp: 4, pts: 250, w: 28, h: 44 },
      kull: { hp: 10, pts: 500, w: 36, h: 52 },
    }[type];

    this.enemies.push({
      pos: { x, y: 100 },
      vel: { x: 0, y: 0 },
      w: data.w, h: data.h,
      hp: data.hp, maxHp: data.hp,
      type, facing: -1,
      shootTimer: 2 + Math.random() * 2,
      points: data.pts,
      active: true,
      animFrame: 0, animTimer: 0,
    });
  }

  private spawnBoss(): void {
    this.enemies.push({
      pos: { x: this.BOSS_X + 100, y: 200 },
      vel: { x: 0, y: 0 },
      w: 80, h: 80,
      hp: 50, maxHp: 50,
      type: 'boss', facing: -1,
      shootTimer: 0,
      points: 5000,
      active: true,
      animFrame: 0, animTimer: 0,
      bossPhase: 0,
      bossAttackTimer: 2,
    });
  }

  // ─── Collisions ──────────────────────────────────────────────
  private checkCollisions(): void {
    // Player bullets vs enemies
    this.bullets.forEach(b => {
      if (b.owner !== 'player' || !b.active) return;
      this.enemies.forEach(e => {
        if (!e.active) return;
        if (this.aabb(b, e)) {
          b.active = false;
          e.hp -= b.dmg;
          // Hit particles
          for (let i = 0; i < 6; i++) {
            this.particles.push({
              x: b.pos.x, y: b.pos.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6 - 2,
              life: 0.3, maxLife: 0.3,
              color: '#ffaa00', size: 3,
            });
          }
          if (e.hp <= 0) {
            e.active = false;
            this.score += e.points;
            this.spawnExplosion(e.pos.x + e.w / 2, e.pos.y + e.h / 2, e.type === 'boss' ? 120 : e.type === 'kull' ? 60 : 40);
            // Death particles
            const color = e.type === 'boss' ? COLORS.bossGlow : e.type === 'kull' ? COLORS.kullGlow : COLORS.jaffa;
            for (let i = 0; i < 20; i++) {
              this.particles.push({
                x: e.pos.x + e.w / 2, y: e.pos.y + e.h / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 3,
                life: 0.6 + Math.random() * 0.4, maxLife: 1,
                color, size: 2 + Math.random() * 4,
              });
            }
            if (e.type === 'boss') {
              this.victory = true;
              this.bossDefeated = true;
              // Big explosion
              for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                  this.spawnExplosion(
                    e.pos.x + e.w / 2 + (Math.random() - 0.5) * 100,
                    e.pos.y + e.h / 2 + (Math.random() - 0.5) * 100,
                    80
                  );
                }, i * 200);
              }
              setTimeout(() => { this.gameOver = true; }, 3000);
            }
          }
        }
      });
    });

    // Enemy bullets vs players
    this.bullets.forEach(b => {
      if (b.owner !== 'enemy' || !b.active) return;
      this.players.forEach(p => {
        if (p.invTimer > 0) return;
        if (this.aabb(b, p)) {
          b.active = false;
          p.hp -= b.dmg;
          p.invTimer = 1.5;
          // Hit flash
          for (let i = 0; i < 8; i++) {
            this.particles.push({
              x: p.pos.x + p.w / 2, y: p.pos.y + p.h / 2,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 0.3, maxLife: 0.3,
              color: '#ff0000', size: 4,
            });
          }
          if (p.hp <= 0) {
            p.lives--;
            if (p.lives <= 0) {
              this.gameOver = true;
            } else {
              p.hp = p.maxHp;
              p.invTimer = 3;
              p.pos.x = this.cameraX + 100;
              p.pos.y = 100;
              p.vel.y = 0;
            }
          }
        }
      });
    });

    // Players vs power-ups
    this.powerUps.forEach(pu => {
      if (!pu.active) return;
      this.players.forEach(p => {
        if (this.aabb(pu, p)) {
          pu.active = false;
          switch (pu.type) {
            case 'spread': p.weaponType = 'spread'; p.weaponTimer = 15; break;
            case 'rapid': p.weaponType = 'rapid'; p.weaponTimer = 10; break;
            case 'laser': p.weaponType = 'laser'; p.weaponTimer = 12; break;
            case 'health': p.hp = Math.min(p.hp + 2, p.maxHp); break;
            case 'life': p.lives++; break;
          }
          // Pickup particles
          for (let i = 0; i < 12; i++) {
            this.particles.push({
              x: pu.pos.x + pu.w / 2, y: pu.pos.y + pu.h / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 6,
              life: 0.5, maxLife: 0.5,
              color: COLORS.gold, size: 3,
            });
          }
        }
      });
    });
  }

  private aabb(a: any, b: any): boolean {
    return a.pos.x < b.pos.x + b.w && a.pos.x + a.w > b.pos.x &&
           a.pos.y < b.pos.y + b.h && a.pos.y + a.h > b.pos.y;
  }

  private spawnExplosion(x: number, y: number, radius: number): void {
    this.explosions.push({
      x, y, radius: 5, maxRadius: radius,
      life: 0.4, maxLife: 0.4,
    });
  }

  // ─── Render ──────────────────────────────────────────────────
  private render(): void {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, COLORS.sky);
    grad.addColorStop(0.6, COLORS.skyGrad);
    grad.addColorStop(1, '#2a1a4e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);

    // Stars (parallax)
    this.stars.forEach(s => {
      const sx = s.x - this.cameraX * 0.1;
      const wrapped = ((sx % this.W) + this.W) % this.W;
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(performance.now() / 1000 + s.brightness * 10));
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(wrapped, s.y, s.size, s.size);
    });

    // Background image (parallax)
    if (this.bgLoaded && this.bgImage) {
      const bgX = -this.cameraX * 0.3;
      ctx.globalAlpha = 0.6;
      ctx.drawImage(this.bgImage, bgX, 100, this.W * 1.5, 500);
      ctx.drawImage(this.bgImage, bgX + this.W * 1.5, 100, this.W * 1.5, 500);
      ctx.globalAlpha = 1;
    }

    // Camera transform
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Platforms
    this.platforms.forEach(pl => this.drawPlatform(pl));

    // Power-ups
    this.powerUps.forEach(pu => {
      if (!pu.active) return;
      this.drawPowerUp(pu);
    });

    // Enemies
    this.enemies.forEach(e => {
      if (!e.active) return;
      this.drawEnemy(e);
    });

    // Players
    this.players.forEach(p => this.drawPlayer(p));

    // Bullets
    this.bullets.forEach(b => {
      if (!b.active) return;
      this.drawBullet(b);
    });

    // Particles
    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // Explosions
    this.explosions.forEach(ex => {
      const alpha = ex.life / ex.maxLife;
      const grad = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, ex.radius);
      grad.addColorStop(0, `rgba(255,255,200,${alpha})`);
      grad.addColorStop(0.3, `rgba(255,150,50,${alpha * 0.8})`);
      grad.addColorStop(0.7, `rgba(255,50,0,${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(100,0,0,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    // HUD
    this.drawHUD();
  }

  private drawPlatform(pl: Platform): void {
    const ctx = this.ctx;
    const colors = {
      stone: { top: COLORS.stoneLight, mid: COLORS.stone, bot: COLORS.stoneDark },
      metal: { top: COLORS.metalLight, mid: COLORS.metal, bot: '#334455' },
      sand: { top: COLORS.sandLight, mid: COLORS.sand, bot: '#a48340' },
    }[pl.type];

    // Main body
    ctx.fillStyle = colors.mid;
    ctx.fillRect(pl.x, pl.y, pl.w, pl.h);

    // Top edge highlight
    ctx.fillStyle = colors.top;
    ctx.fillRect(pl.x, pl.y, pl.w, 4);

    // Bottom shadow
    ctx.fillStyle = colors.bot;
    ctx.fillRect(pl.x, pl.y + pl.h - 4, pl.w, 4);

    // Brick pattern for stone
    if (pl.type === 'stone' && pl.h > 30) {
      ctx.strokeStyle = colors.bot;
      ctx.lineWidth = 1;
      for (let y = pl.y + 20; y < pl.y + pl.h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(pl.x, y);
        ctx.lineTo(pl.x + pl.w, y);
        ctx.stroke();
      }
      for (let x = pl.x; x < pl.x + pl.w; x += 40) {
        const offset = ((x - pl.x) / 40 % 2) * 20;
        for (let y = pl.y; y < pl.y + pl.h; y += 40) {
          ctx.beginPath();
          ctx.moveTo(x + offset, y);
          ctx.lineTo(x + offset, y + 20);
          ctx.stroke();
        }
      }
    }

    // Metal rivets
    if (pl.type === 'metal') {
      ctx.fillStyle = '#99aabb';
      for (let x = pl.x + 10; x < pl.x + pl.w; x += 30) {
        ctx.beginPath();
        ctx.arc(x, pl.y + pl.h / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawPlayer(p: ContraPlayer): void {
    const ctx = this.ctx;
    if (p.invTimer > 0 && Math.floor(p.invTimer * 10) % 2 === 0) return;

    const x = p.pos.x;
    const y = p.pos.y;
    const f = p.facing;

    // Body color based on character
    const bodyColor = {
      tealc: '#3a3a4a',
      oneill: '#2a4a2a',
      carter: '#2a3a5a',
      jackson: '#4a3a2a',
    }[p.character];

    const skinColor = p.character === 'tealc' ? '#8b6914' : '#deb887';

    // Legs (animated)
    const legOffset = p.onGround && Math.abs(p.vel.x) > 0.5 ? Math.sin(p.animFrame * Math.PI / 2) * 6 : 0;
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x + 6, y + 30, 7, 14);
    ctx.fillRect(x + 15, y + 30, 7, 14);
    // Leg animation
    if (Math.abs(p.vel.x) > 0.5 && p.onGround) {
      ctx.fillRect(x + 6 + legOffset, y + 38, 7, 6);
      ctx.fillRect(x + 15 - legOffset, y + 38, 7, 6);
    }

    // Torso
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x + 4, y + 14, 20, 18);

    // Armor highlight
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x + 4, y + 14, 20, 3);

    // Head
    ctx.fillStyle = skinColor;
    ctx.fillRect(x + 8, y + 2, 12, 12);

    // Teal'c gold emblem
    if (p.character === 'tealc') {
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(x + 12, y + 2, 4, 3);
    }

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + (f === 1 ? 14 : 10), y + 6, 3, 3);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + (f === 1 ? 15 : 11), y + 7, 2, 2);

    // Weapon
    ctx.fillStyle = '#666';
    const gunX = x + p.w / 2 + Math.cos(p.aimAngle) * 12;
    const gunY = y + p.h / 3 + Math.sin(p.aimAngle) * 12;
    ctx.save();
    ctx.translate(gunX, gunY);
    ctx.rotate(p.aimAngle);
    ctx.fillRect(-2, -2, 16, 4);
    ctx.fillStyle = '#888';
    ctx.fillRect(10, -3, 6, 6);
    ctx.restore();

    // Weapon glow
    if (p.weaponType !== 'default') {
      const glowColor = p.weaponType === 'spread' ? '#ff6600' : p.weaponType === 'rapid' ? '#ffff00' : '#00ffff';
      ctx.fillStyle = glowColor;
      ctx.globalAlpha = 0.3 + Math.sin(performance.now() / 100) * 0.2;
      ctx.beginPath();
      ctx.arc(gunX + 8, gunY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  private drawEnemy(e: Enemy): void {
    const ctx = this.ctx;
    const x = e.pos.x;
    const y = e.pos.y;

    if (e.type === 'boss') {
      this.drawBoss(e);
      return;
    }

    // Colors based on type
    const colors = {
      jaffa: { body: COLORS.jaffa, armor: COLORS.jaffaArmor, helm: '#bb9933' },
      elite: { body: COLORS.elite, armor: COLORS.eliteArmor, helm: '#cc5511' },
      kull: { body: COLORS.kull, armor: '#223344', helm: '#445566' },
    }[e.type];

    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(x + 4, y + 14, 20, 18);

    // Armor plates
    ctx.fillStyle = colors.armor;
    ctx.fillRect(x + 2, y + 14, 24, 4);
    ctx.fillRect(x + 6, y + 26, 16, 4);

    // Legs
    ctx.fillStyle = colors.body;
    ctx.fillRect(x + 6, y + 30, 7, 14);
    ctx.fillRect(x + 15, y + 30, 7, 14);

    // Head/Helmet
    ctx.fillStyle = colors.helm;
    ctx.fillRect(x + 6, y, 16, 14);

    // Jaffa helmet detail (serpent guard)
    if (e.type === 'jaffa' || e.type === 'elite') {
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(x + 10, y - 4, 8, 6);
      ctx.fillRect(x + 12, y - 6, 4, 4);
    }

    // Kull visor
    if (e.type === 'kull') {
      ctx.fillStyle = COLORS.kullGlow;
      ctx.fillRect(x + 8, y + 4, 12, 4);
      // Glow effect
      ctx.globalAlpha = 0.3 + Math.sin(performance.now() / 200) * 0.2;
      ctx.fillStyle = COLORS.kullGlow;
      ctx.beginPath();
      ctx.arc(x + 14, y + 6, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Eyes
    if (e.type !== 'kull') {
      ctx.fillStyle = '#ff0';
      ctx.fillRect(x + (e.facing === 1 ? 16 : 8), y + 5, 3, 3);
    }

    // Staff weapon
    ctx.fillStyle = '#666';
    const gunDir = e.facing;
    ctx.fillRect(x + (gunDir === 1 ? 20 : -10), y + 16, 14, 3);
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(x + (gunDir === 1 ? 32 : -12), y + 14, 4, 7);

    // Health bar for tough enemies
    if (e.maxHp > 2 && e.hp < e.maxHp) {
      ctx.fillStyle = COLORS.healthBg;
      ctx.fillRect(x, y - 8, e.w, 4);
      ctx.fillStyle = COLORS.health;
      ctx.fillRect(x, y - 8, e.w * (e.hp / e.maxHp), 4);
    }
  }

  private drawBoss(e: Enemy): void {
    const ctx = this.ctx;
    const x = e.pos.x;
    const y = e.pos.y;
    const pulse = Math.sin(performance.now() / 200);

    // Glow aura
    ctx.globalAlpha = 0.2 + pulse * 0.1;
    ctx.fillStyle = COLORS.bossGlow;
    ctx.beginPath();
    ctx.arc(x + e.w / 2, y + e.h / 2, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Main body - Goa'uld sarcophagus/throne style
    ctx.fillStyle = COLORS.boss;
    ctx.fillRect(x + 10, y + 10, 60, 60);

    // Gold trim
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x + 8, y + 8, 64, 4);
    ctx.fillRect(x + 8, y + 66, 64, 4);
    ctx.fillRect(x + 8, y + 8, 4, 62);
    ctx.fillRect(x + 68, y + 8, 4, 62);

    // Eye of Ra
    ctx.fillStyle = COLORS.bossGlow;
    ctx.beginPath();
    ctx.arc(x + 40, y + 35, 12 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + 40, y + 35, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 40, y + 35, 3, 0, Math.PI * 2);
    ctx.fill();

    // Hieroglyphs
    ctx.fillStyle = COLORS.gold;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 16 + i * 14, y + 52, 8, 10);
    }
    ctx.globalAlpha = 1;

    // Health bar
    ctx.fillStyle = COLORS.healthBg;
    ctx.fillRect(x - 10, y - 20, 100, 8);
    ctx.fillStyle = e.hp > e.maxHp * 0.3 ? '#ff6600' : '#ff0000';
    ctx.fillRect(x - 10, y - 20, 100 * (e.hp / e.maxHp), 8);
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 10, y - 20, 100, 8);

    // Boss name
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('APOPHIS', x + e.w / 2, y - 24);
    ctx.textAlign = 'left';
  }

  private drawBullet(b: Bullet): void {
    const ctx = this.ctx;

    // Trail
    if (b.trail.length > 1) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.h;
      ctx.beginPath();
      ctx.moveTo(b.trail[0].x, b.trail[0].y);
      b.trail.forEach(t => ctx.lineTo(t.x, t.y));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Bullet body
    ctx.fillStyle = b.color;
    ctx.fillRect(b.pos.x - b.w / 2, b.pos.y - b.h / 2, b.w, b.h);

    // Glow
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.pos.x, b.pos.y, b.w, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private drawPowerUp(pu: PowerUp): void {
    const ctx = this.ctx;
    const bob = Math.sin(pu.animTimer) * 4;
    const x = pu.pos.x;
    const y = pu.pos.y + bob;

    // Glow
    ctx.globalAlpha = 0.3;
    const glowColor = {
      spread: '#ff6600', rapid: '#ffff00', laser: '#00ffff',
      health: '#ff0000', life: '#00ff00',
    }[pu.type];
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Box
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, 24, 24);
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 24, 24);

    // Icon
    ctx.fillStyle = glowColor;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    const icon = { spread: 'S', rapid: 'R', laser: 'L', health: '+', life: '♥' }[pu.type];
    ctx.fillText(icon, x + 12, y + 17);
    ctx.textAlign = 'left';
  }

  // ─── HUD ─────────────────────────────────────────────────────
  private drawHUD(): void {
    const ctx = this.ctx;

    // HUD background bar
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, this.W, 60);
    ctx.fillStyle = 'rgba(0,100,200,0.3)';
    ctx.fillRect(0, 58, this.W, 2);

    // Score
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillText('SCORE', 20, 22);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillText(String(this.score).padStart(8, '0'), 20, 46);

    // Player info
    if (this.players.length > 0) {
      const p = this.players[0];

      // Character name
      ctx.fillStyle = COLORS.gold;
      ctx.font = 'bold 14px "Press Start 2P", monospace';
      ctx.fillText(CHARACTER_STATS[p.character].name.toUpperCase(), 250, 22);

      // Health bar
      ctx.fillStyle = COLORS.healthBg;
      ctx.fillRect(250, 30, 150, 16);
      const hpRatio = p.hp / p.maxHp;
      ctx.fillStyle = hpRatio > 0.5 ? '#00cc00' : hpRatio > 0.25 ? '#cccc00' : '#cc0000';
      ctx.fillRect(250, 30, 150 * hpRatio, 16);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.strokeRect(250, 30, 150, 16);

      // Lives
      ctx.fillStyle = COLORS.health;
      ctx.font = '14px "Press Start 2P", monospace';
      for (let i = 0; i < p.lives; i++) {
        ctx.fillText('♥', 420 + i * 22, 46);
      }

      // Weapon indicator
      if (p.weaponType !== 'default') {
        const wColor = p.weaponType === 'spread' ? '#ff6600' : p.weaponType === 'rapid' ? '#ffff00' : '#00ffff';
        ctx.fillStyle = wColor;
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.fillText(p.weaponType.toUpperCase(), 530, 22);
        // Timer bar
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(530, 30, 80, 10);
        ctx.fillStyle = wColor;
        ctx.fillRect(530, 30, 80 * (p.weaponTimer / 15), 10);
      }
    }

    // Wave indicator
    ctx.fillStyle = COLORS.text;
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('LEVEL 1', this.W - 20, 22);
    ctx.fillStyle = '#888';
    ctx.fillText('CHULAK', this.W - 20, 42);
    ctx.textAlign = 'left';

    // Game over / Victory overlay
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, this.W, this.H);

      if (this.victory) {
        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 48px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', this.W / 2, this.H / 2 - 30);
        ctx.fillStyle = COLORS.text;
        ctx.font = '18px "Press Start 2P", monospace';
        ctx.fillText('APOPHIS DEFEATED', this.W / 2, this.H / 2 + 20);
        ctx.fillText(`FINAL SCORE: ${this.score}`, this.W / 2, this.H / 2 + 60);
      } else {
        ctx.fillStyle = COLORS.health;
        ctx.font = 'bold 48px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.W / 2, this.H / 2 - 30);
        ctx.fillStyle = COLORS.text;
        ctx.font = '18px "Press Start 2P", monospace';
        ctx.fillText(`FINAL SCORE: ${this.score}`, this.W / 2, this.H / 2 + 20);
      }

      ctx.fillStyle = '#888';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText('PRESS R TO RESTART', this.W / 2, this.H / 2 + 80);
      ctx.textAlign = 'left';
    }
  }
}
