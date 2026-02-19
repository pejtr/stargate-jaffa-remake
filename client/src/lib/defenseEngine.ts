import { GAME_ASSETS, CHARACTER_STATS, type CharacterType } from './gameAssets';
import { playShoot, playHit, playExplosion, playBrickDestroy, playWaveStart } from './audioEngine';

// ─── Types ───────────────────────────────────────────────────────
interface Vec2 { x: number; y: number }

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

interface Brick {
  x: number; y: number; w: number; h: number;
  hp: number; maxHp: number;
  active: boolean;
  crackLevel: number; // 0-3
}

interface DefenseEnemy {
  pos: Vec2;
  targetBrick: number; // index
  speed: number;
  type: 'jaffa' | 'elite' | 'kull';
  active: boolean;
  points: number;
  hp: number;
  maxHp: number;
  animFrame: number;
  animTimer: number;
  facing: 1 | -1;
  angle: number; // approach angle
  hitFlash: number;
  size: number; // Scale multiplier
}

interface Crosshair {
  x: number; y: number;
}

interface Explosion {
  x: number; y: number;
  radius: number; maxRadius: number;
  life: number; maxLife: number;
}

// ─── Colors ──────────────────────────────────────────────────────
const COLORS = {
  sky: '#0a0a1e',
  brick: '#8b6914',
  brickLight: '#a47d1e',
  brickDark: '#5c4a10',
  brickCrack: '#3a2a08',
  mortar: '#4a3a10',
  jaffa: '#cc8833',
  jaffaArmor: '#997722',
  elite: '#dd6622',
  eliteArmor: '#bb4411',
  kull: '#445566',
  kullGlow: '#6688ff',
  crosshair: '#00ff44',
  crosshairHot: '#ff4400',
  gold: '#ffd700',
  text: '#ffffff',
  health: '#ff3333',
  healthBg: '#441111',
};

// ─── Engine ──────────────────────────────────────────────────────
export class DefenseEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private W: number;
  private H: number;

  private bricks: Brick[] = [];
  private enemies: DefenseEnemy[] = [];
  private particles: Particle[] = [];
  private explosions: Explosion[] = [];
  private crosshair: Crosshair = { x: 640, y: 360 };

  private score = 0;
  private kills = 0;
  private wave = 1;
  private waveTimer = 0;
  private enemiesInWave = 0;
  private enemiesSpawnedInWave = 0;
  private spawnTimer = 0;
  private gameOver = false;
  private victory = false;
  private totalBricks = 0;
  private destroyedBricks = 0;

  private lastTime = 0;
  private rafId: number | null = null;
  private character: CharacterType = 'oneill';

  // Background
  private bgImage: HTMLImageElement | null = null;
  private bgLoaded = false;
  private stargateImage: HTMLImageElement | null = null;
  private stargateLoaded = false;

  // Constants
  private readonly BRICK_W = 64;
  private readonly BRICK_H = 24;
  private readonly WALL_Y_START = 600; // Start from bottom

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.W = canvas.width;
    this.H = canvas.height;

    // Load background
    this.bgImage = new Image();
    this.bgImage.crossOrigin = 'anonymous';
    this.bgImage.onload = () => { this.bgLoaded = true; };
    this.bgImage.src = GAME_ASSETS.backgrounds.level1;

    // Load stargate
    this.stargateImage = new Image();
    this.stargateImage.crossOrigin = 'anonymous';
    this.stargateImage.onload = () => { this.stargateLoaded = true; };
    this.stargateImage.src = 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/KeapQXQJhBjIDwDk.png';

    this.initBricks();
    this.setupInput();
    this.startWave(1);
  }

  private initBricks(): void {
    this.bricks = [];
    const cols = Math.floor(this.W / this.BRICK_W);
    const rows = 5;

    for (let row = 0; row < rows; row++) {
      const y = this.WALL_Y_START + row * this.BRICK_H;
      // Offset every other row for brick pattern
      const offset = row % 2 === 0 ? 0 : this.BRICK_W / 2;
      const actualCols = row % 2 === 0 ? cols : cols - 1;

      for (let col = 0; col < actualCols; col++) {
        this.bricks.push({
          x: col * this.BRICK_W + offset,
          y,
          w: this.BRICK_W - 2,
          h: this.BRICK_H - 2,
          hp: 3,
          maxHp: 3,
          active: true,
          crackLevel: 0,
        });
      }
    }
    this.totalBricks = this.bricks.length;
    this.destroyedBricks = 0;
  }

  private setupInput(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.W / rect.width;
      const scaleY = this.H / rect.height;
      this.crosshair.x = (e.clientX - rect.left) * scaleX;
      this.crosshair.y = (e.clientY - rect.top) * scaleY;
    });

    this.canvas.addEventListener('click', () => this.handleShoot());
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        this.handleShoot();
      }
      if (e.key === 'r' || e.key === 'R') {
        if (this.gameOver) {
          this.reset();
          this.startWave(1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    (this as any)._cleanup = () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }

  private handleShoot(): void {
    if (this.gameOver) return;

    playShoot();

    let hit = false;
    // Check from front to back (last spawned first)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.active) continue;

      const dx = this.crosshair.x - e.pos.x;
      const dy = this.crosshair.y - e.pos.y;
      const hitRadius = e.size * (e.type === 'kull' ? 35 : 28);
      
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        e.hp--;
        e.hitFlash = 0.15;
        playHit();

        // Hit particles
        for (let j = 0; j < 8; j++) {
          this.particles.push({
            x: e.pos.x, y: e.pos.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 2,
            life: 0.3, maxLife: 0.3,
            color: '#ffaa00', size: 3 + Math.random() * 3,
          });
        }

        if (e.hp <= 0) {
          e.active = false;
          this.score += e.points;
          this.kills++;

          playExplosion();

          // Death explosion
          this.explosions.push({
            x: e.pos.x, y: e.pos.y,
            radius: 5, maxRadius: e.type === 'kull' ? 60 : 45,
            life: 0.4, maxLife: 0.4,
          });

          // Death particles
          const color = e.type === 'kull' ? COLORS.kullGlow : e.type === 'elite' ? COLORS.elite : COLORS.jaffa;
          for (let j = 0; j < 20; j++) {
            this.particles.push({
              x: e.pos.x, y: e.pos.y,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12 - 4,
              life: 0.5 + Math.random() * 0.5, maxLife: 1,
              color, size: 3 + Math.random() * 5,
            });
          }
        }

        hit = true;
        break;
      }
    }

    // Muzzle flash at crosshair
    if (!hit) {
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: this.crosshair.x, y: this.crosshair.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 0.15, maxLife: 0.15,
          color: '#ffff00', size: 2,
        });
      }
    }
  }

  private startWave(num: number): void {
    this.wave = num;
    this.enemiesInWave = 5 + num * 3;
    this.enemiesSpawnedInWave = 0;
    this.spawnTimer = 0;
    this.waveTimer = 3; // 3 second countdown
    playWaveStart();
  }

  // ─── Public API ──────────────────────────────────────────────
  public addPlayer(char: CharacterType): void {
    this.character = char;
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
    this.enemies = [];
    this.particles = [];
    this.explosions = [];
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.gameOver = false;
    this.victory = false;
    this.initBricks();
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
    // Wave countdown
    if (this.waveTimer > 0) {
      this.waveTimer -= dt;
      return;
    }

    // Spawn enemies
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemiesSpawnedInWave < this.enemiesInWave) {
      this.spawnEnemy();
      this.enemiesSpawnedInWave++;
      const baseInterval = Math.max(0.5, 2 - this.wave * 0.15);
      this.spawnTimer = baseInterval + Math.random() * baseInterval;
    }

    // Check if wave is complete
    const activeEnemies = this.enemies.filter(e => e.active).length;
    if (this.enemiesSpawnedInWave >= this.enemiesInWave && activeEnemies === 0) {
      if (this.wave >= 10) {
        this.victory = true;
        this.gameOver = true;
      } else {
        this.startWave(this.wave + 1);
      }
    }

    // Update enemies
    this.enemies.forEach(e => {
      if (!e.active) return;

      // Find target brick
      if (e.targetBrick < 0 || e.targetBrick >= this.bricks.length || !this.bricks[e.targetBrick].active) {
        // Find new target
        const activeBricks = this.bricks.map((b, i) => ({ b, i })).filter(x => x.b.active);
        if (activeBricks.length === 0) {
          this.gameOver = true;
          return;
        }
        const target = activeBricks[Math.floor(Math.random() * activeBricks.length)];
        e.targetBrick = target.i;
      }

      const brick = this.bricks[e.targetBrick];
      if (!brick || !brick.active) return;

      const targetX = brick.x + brick.w / 2;
      const targetY = brick.y;

      const dx = targetX - e.pos.x;
      const dy = targetY - e.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 15) {
        // Hit the brick!
        brick.hp--;
        brick.crackLevel = Math.min(3, brick.maxHp - brick.hp);
        
        if (brick.hp <= 0) {
          brick.active = false;
          this.destroyedBricks++;
          playBrickDestroy();

          // Brick destruction particles
          for (let i = 0; i < 12; i++) {
            this.particles.push({
              x: brick.x + brick.w / 2,
              y: brick.y + brick.h / 2,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8 - 2,
              life: 0.6, maxLife: 0.6,
              color: COLORS.brick, size: 4 + Math.random() * 5,
            });
          }

          // Check game over
          const activeBricks = this.bricks.filter(b => b.active).length;
          if (activeBricks <= 0) {
            this.gameOver = true;
          }
        }

        e.active = false;
        return;
      }

      // Move towards target
      e.pos.x += (dx / dist) * e.speed;
      e.pos.y += (dy / dist) * e.speed;
      e.angle = Math.atan2(dy, dx);
      e.facing = dx > 0 ? 1 : -1;

      // Animation
      e.animTimer += dt;
      if (e.animTimer > 0.2) { e.animTimer = 0; e.animFrame = (e.animFrame + 1) % 4; }

      // Hit flash
      if (e.hitFlash > 0) e.hitFlash -= dt;
    });

    // Particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.1;
      p.life -= dt;
      return p.life > 0;
    });

    // Explosions
    this.explosions = this.explosions.filter(ex => {
      ex.life -= dt;
      ex.radius += (ex.maxRadius - ex.radius) * 0.2;
      return ex.life > 0;
    });
  }

  private spawnEnemy(): void {
    // Spawn from top or sides
    const side = Math.random();
    let x: number, y: number;

    if (side < 0.6) {
      // From top
      x = 100 + Math.random() * (this.W - 200);
      y = -60;
    } else if (side < 0.8) {
      // From left
      x = -60;
      y = 50 + Math.random() * 300;
    } else {
      // From right
      x = this.W + 60;
      y = 50 + Math.random() * 300;
    }

    // Enemy type based on wave
    let type: 'jaffa' | 'elite' | 'kull' = 'jaffa';
    const rand = Math.random();
    if (this.wave >= 3 && rand < 0.25) type = 'elite';
    if (this.wave >= 5 && rand < 0.1) type = 'kull';

    const data = {
      jaffa: { speed: 1.2 + this.wave * 0.1, hp: 1, pts: 100, size: 1.2 },
      elite: { speed: 1.5 + this.wave * 0.1, hp: 2, pts: 250, size: 1.3 },
      kull: { speed: 0.8 + this.wave * 0.08, hp: 5, pts: 500, size: 1.5 },
    }[type];

    // Pick random active brick as target
    const activeBricks = this.bricks.map((b, i) => ({ b, i })).filter(x => x.b.active);
    if (activeBricks.length === 0) return;
    const target = activeBricks[Math.floor(Math.random() * activeBricks.length)];

    this.enemies.push({
      pos: { x, y },
      targetBrick: target.i,
      speed: data.speed,
      type,
      active: true,
      points: data.pts,
      hp: data.hp,
      maxHp: data.hp,
      animFrame: 0,
      animTimer: 0,
      facing: 1,
      angle: 0,
      hitFlash: 0,
      size: data.size,
    });
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

    // Background image
    if (this.bgLoaded && this.bgImage) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(this.bgImage, 0, 0, this.W, this.H * 0.8);
      ctx.globalAlpha = 1;
    }

    // Stargate in background (center top)
    if (this.stargateLoaded && this.stargateImage) {
      ctx.globalAlpha = 0.15;
      const sgSize = 300;
      ctx.drawImage(this.stargateImage, this.W / 2 - sgSize / 2, 50, sgSize, sgSize);
      ctx.globalAlpha = 1;
    }

    // Draw bricks (wall at bottom)
    this.bricks.forEach(brick => {
      if (!brick.active) return;
      this.drawBrick(brick);
    });

    // Draw enemies
    this.enemies.forEach(e => {
      if (!e.active) return;
      this.drawDefenseEnemy(e);
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

    // Crosshair
    this.drawCrosshair();

    // HUD
    this.drawHUD();

    // Wave announcement
    if (this.waveTimer > 0) {
      this.drawWaveAnnouncement();
    }

    // Game over
    if (this.gameOver) {
      this.drawGameOver();
    }
  }

  private drawBrick(brick: Brick): void {
    const ctx = this.ctx;
    const { x, y, w, h } = brick;

    // Main brick color
    ctx.fillStyle = COLORS.brick;
    ctx.fillRect(x, y, w, h);

    // Top highlight
    ctx.fillStyle = COLORS.brickLight;
    ctx.fillRect(x, y, w, 3);
    ctx.fillRect(x, y, 3, h);

    // Bottom shadow
    ctx.fillStyle = COLORS.brickDark;
    ctx.fillRect(x, y + h - 3, w, 3);
    ctx.fillRect(x + w - 3, y, 3, h);

    // Cracks based on damage
    if (brick.crackLevel > 0) {
      ctx.strokeStyle = COLORS.brickCrack;
      ctx.lineWidth = 1;
      
      if (brick.crackLevel >= 1) {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y);
        ctx.lineTo(x + w * 0.5, y + h * 0.6);
        ctx.stroke();
      }
      if (brick.crackLevel >= 2) {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.7, y + h);
        ctx.lineTo(x + w * 0.4, y + h * 0.3);
        ctx.lineTo(x + w * 0.6, y);
        ctx.stroke();
      }
      if (brick.crackLevel >= 3) {
        ctx.beginPath();
        ctx.moveTo(x, y + h * 0.5);
        ctx.lineTo(x + w, y + h * 0.5);
        ctx.stroke();
      }
    }
  }

  private drawDefenseEnemy(e: DefenseEnemy): void {
    const ctx = this.ctx;
    const { x, y } = e.pos;
    const s = e.size;

    // Hit flash
    if (e.hitFlash > 0) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 30 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const colors = {
      jaffa: { body: COLORS.jaffa, armor: COLORS.jaffaArmor, helm: '#bb9933' },
      elite: { body: COLORS.elite, armor: COLORS.eliteArmor, helm: '#cc5511' },
      kull: { body: COLORS.kull, armor: '#334455', helm: '#556677' },
    }[e.type];

    // Legs
    ctx.fillStyle = colors.body;
    const legAnim = Math.sin(e.animFrame * Math.PI / 2) * 4 * s;
    ctx.fillRect(x - 10 * s + legAnim, y + 18 * s, 8 * s, 14 * s);
    ctx.fillRect(x + 2 * s - legAnim, y + 18 * s, 8 * s, 14 * s);

    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(x - 12 * s, y - 6 * s, 24 * s, 24 * s);

    // Armor plates
    ctx.fillStyle = colors.armor;
    ctx.fillRect(x - 14 * s, y - 6 * s, 28 * s, 5 * s);
    ctx.fillRect(x - 10 * s, y + 10 * s, 20 * s, 5 * s);

    // Helmet
    ctx.fillStyle = colors.helm;
    ctx.fillRect(x - 10 * s, y - 24 * s, 20 * s, 18 * s);

    // Serpent guard crest
    if (e.type === 'jaffa' || e.type === 'elite') {
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(x - 4 * s, y - 32 * s, 8 * s, 10 * s);
      ctx.fillRect(x - 6 * s, y - 30 * s, 12 * s, 6 * s);
      // Eyes
      ctx.fillStyle = '#ff0';
      ctx.fillRect(x - 6 * s, y - 18 * s, 4 * s, 4 * s);
      ctx.fillRect(x + 2 * s, y - 18 * s, 4 * s, 4 * s);
    }

    // Kull visor glow
    if (e.type === 'kull') {
      ctx.fillStyle = COLORS.kullGlow;
      ctx.fillRect(x - 8 * s, y - 18 * s, 16 * s, 5 * s);
      ctx.globalAlpha = 0.3 + Math.sin(performance.now() / 150) * 0.2;
      ctx.fillStyle = COLORS.kullGlow;
      ctx.beginPath();
      ctx.arc(x, y - 15 * s, 14 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Staff weapon
    ctx.fillStyle = '#666';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(e.angle + Math.PI / 2);
    ctx.fillRect(-3 * s, 6 * s, 6 * s, 26 * s);
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(-4 * s, 30 * s, 8 * s, 8 * s);
    ctx.restore();

    // Health bar for tough enemies
    if (e.maxHp > 1 && e.hp < e.maxHp) {
      ctx.fillStyle = COLORS.healthBg;
      ctx.fillRect(x - 20 * s, y - 40 * s, 40 * s, 5);
      ctx.fillStyle = COLORS.health;
      ctx.fillRect(x - 20 * s, y - 40 * s, 40 * s * (e.hp / e.maxHp), 5);
    }
  }

  private drawCrosshair(): void {
    const ctx = this.ctx;
    const { x, y } = this.crosshair;

    // Check if hovering over enemy
    let onEnemy = false;
    for (const e of this.enemies) {
      if (!e.active) continue;
      const dx = x - e.pos.x;
      const dy = y - e.pos.y;
      if (dx * dx + dy * dy < 30 * 30 * e.size * e.size) { onEnemy = true; break; }
    }

    const color = onEnemy ? COLORS.crosshairHot : COLORS.crosshair;
    const size = onEnemy ? 20 : 16;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Outer circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();

    // Cross lines
    ctx.beginPath();
    ctx.moveTo(x - size - 6, y);
    ctx.lineTo(x - 6, y);
    ctx.moveTo(x + 6, y);
    ctx.lineTo(x + size + 6, y);
    ctx.moveTo(x, y - size - 6);
    ctx.lineTo(x, y - 6);
    ctx.moveTo(x, y + 6);
    ctx.lineTo(x, y + size + 6);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
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

    // Wave
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillText('WAVE', 280, 22);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillText(`${this.wave}/10`, 280, 46);

    // Kills
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillText('KILLS', 450, 22);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillText(String(this.kills), 450, 46);

    // Wall health
    const activeBricks = this.bricks.filter(b => b.active).length;
    const wallPercent = activeBricks / this.totalBricks;
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillText('WALL', 620, 22);
    ctx.fillStyle = COLORS.healthBg;
    ctx.fillRect(620, 30, 200, 16);
    ctx.fillStyle = wallPercent > 0.5 ? '#00cc00' : wallPercent > 0.25 ? '#cccc00' : '#cc0000';
    ctx.fillRect(620, 30, 200 * wallPercent, 16);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(620, 30, 200, 16);
    ctx.fillStyle = COLORS.text;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(`${activeBricks}/${this.totalBricks}`, 625, 44);

    // Character
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(CHARACTER_STATS[this.character].name.toUpperCase(), this.W - 20, 22);
    ctx.fillStyle = '#888';
    ctx.fillText('DEFENSE MODE', this.W - 20, 42);
    ctx.textAlign = 'left';

    // Enemies remaining in wave
    const remaining = this.enemiesInWave - this.enemiesSpawnedInWave + this.enemies.filter(e => e.active).length;
    ctx.fillStyle = '#888';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(`ENEMIES: ${remaining}`, 880, 22);
  }

  private drawWaveAnnouncement(): void {
    const ctx = this.ctx;
    const alpha = Math.min(1, this.waveTimer);

    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.5})`;
    ctx.fillRect(0, this.H / 2 - 60, this.W, 120);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 36px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`WAVE ${this.wave}`, this.W / 2, this.H / 2 - 10);

    ctx.fillStyle = COLORS.text;
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText(`${this.enemiesInWave} ENEMIES INCOMING`, this.W / 2, this.H / 2 + 30);

    if (this.wave === 1) {
      ctx.fillStyle = '#888';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText('SPACE OR CLICK TO SHOOT', this.W / 2, this.H / 2 + 55);
    }

    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
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
      ctx.fillText('ALL WAVES DEFEATED', this.W / 2, this.H / 2 + 10);
    } else {
      ctx.fillStyle = COLORS.health;
      ctx.font = 'bold 48px "Press Start 2P", monospace';
      ctx.fillText('GAME OVER', this.W / 2, this.H / 2 - 40);
      ctx.fillStyle = COLORS.text;
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText('THE WALL HAS FALLEN', this.W / 2, this.H / 2 + 10);
    }

    ctx.fillStyle = COLORS.text;
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillText(`FINAL SCORE: ${this.score}`, this.W / 2, this.H / 2 + 50);
    ctx.fillText(`KILLS: ${this.kills}`, this.W / 2, this.H / 2 + 80);

    ctx.fillStyle = '#888';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText('PRESS R TO RESTART', this.W / 2, this.H / 2 + 120);

    ctx.textAlign = 'left';
  }
}
