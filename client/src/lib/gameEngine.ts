import type { CharacterType } from './gameAssets';

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  active: boolean;
}

export interface Player extends GameObject {
  character: CharacterType;
  health: number;
  maxHealth: number;
  facing: 'left' | 'right';
  isJumping: boolean;
  isOnGround: boolean;
  currentWeapon: string;
  score: number;
  lives: number;
  invincible: boolean;
  invincibleTimer: number;
}

export interface Enemy extends GameObject {
  type: 'jaffa' | 'elite' | 'kull';
  health: number;
  maxHealth: number;
  facing: 'left' | 'right';
  shootTimer: number;
  points: number;
}

export interface Bullet extends GameObject {
  damage: number;
  owner: 'player' | 'enemy';
  direction: Vector2D;
}

export interface PowerUp extends GameObject {
  type: 'rapidFire' | 'shield' | 'spreadShot' | 'extraLife';
  duration?: number;
}

export interface GameState {
  players: Player[];
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  score: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  wave: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private keys: Set<string> = new Set();
  
  // Game constants
  private readonly GRAVITY = 0.5;
  private readonly JUMP_FORCE = -12;
  private readonly MOVE_SPEED = 5;
  private readonly GROUND_Y = 500;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;

    this.state = this.createInitialState();
    this.setupEventListeners();
  }

  private createInitialState(): GameState {
    return {
      players: [],
      enemies: [],
      bullets: [],
      powerUps: [],
      score: 0,
      level: 1,
      gameOver: false,
      paused: false,
      wave: 1,
    };
  }

  public addPlayer(character: CharacterType): void {
    const player: Player = {
      character,
      position: { x: 100, y: this.GROUND_Y - 48 },
      velocity: { x: 0, y: 0 },
      width: 32,
      height: 48,
      active: true,
      health: 4,
      maxHealth: 4,
      facing: 'right',
      isJumping: false,
      isOnGround: true,
      currentWeapon: 'default',
      score: 0,
      lives: 3,
      invincible: false,
      invincibleTimer: 0,
    };
    this.state.players.push(player);
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      
      // Prevent default for game keys
      if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  public start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    if (!this.state.paused && !this.state.gameOver) {
      this.update(deltaTime);
    }
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update players
    this.state.players.forEach((player) => {
      if (!player.active) return;
      this.updatePlayer(player, deltaTime);
    });

    // Update enemies
    this.state.enemies.forEach((enemy) => {
      if (!enemy.active) return;
      this.updateEnemy(enemy, deltaTime);
    });

    // Update bullets
    this.state.bullets = this.state.bullets.filter((bullet) => {
      if (!bullet.active) return false;
      this.updateBullet(bullet, deltaTime);
      return bullet.active;
    });

    // Check collisions
    this.checkCollisions();
  }

  private updatePlayer(player: Player, deltaTime: number): void {
    // Handle input
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      player.velocity.x = -this.MOVE_SPEED;
      player.facing = 'left';
    } else if (this.keys.has('d') || this.keys.has('arrowright')) {
      player.velocity.x = this.MOVE_SPEED;
      player.facing = 'right';
    } else {
      player.velocity.x = 0;
    }

    // Jump
    if ((this.keys.has('w') || this.keys.has('arrowup') || this.keys.has(' ')) && player.isOnGround) {
      player.velocity.y = this.JUMP_FORCE;
      player.isJumping = true;
      player.isOnGround = false;
    }

    // Apply gravity
    if (!player.isOnGround) {
      player.velocity.y += this.GRAVITY;
    }

    // Update position
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;

    // Ground collision
    if (player.position.y >= this.GROUND_Y - player.height) {
      player.position.y = this.GROUND_Y - player.height;
      player.velocity.y = 0;
      player.isOnGround = true;
      player.isJumping = false;
    }

    // Screen boundaries
    player.position.x = Math.max(0, Math.min(this.canvas.width - player.width, player.position.x));

    // Update invincibility
    if (player.invincible) {
      player.invincibleTimer -= deltaTime;
      if (player.invincibleTimer <= 0) {
        player.invincible = false;
      }
    }
  }

  private updateEnemy(enemy: Enemy, deltaTime: number): void {
    // Simple AI: move towards player and shoot
    if (this.state.players.length > 0) {
      const player = this.state.players[0];
      const dx = player.position.x - enemy.position.x;
      
      if (Math.abs(dx) > 100) {
        enemy.velocity.x = dx > 0 ? 1 : -1;
        enemy.facing = dx > 0 ? 'right' : 'left';
      } else {
        enemy.velocity.x = 0;
      }

      // Shoot timer
      enemy.shootTimer -= deltaTime;
      if (enemy.shootTimer <= 0) {
        this.enemyShoot(enemy);
        enemy.shootTimer = 2 + Math.random(); // Random interval
      }
    }

    enemy.position.x += enemy.velocity.x;
  }

  private updateBullet(bullet: Bullet, deltaTime: number): void {
    bullet.position.x += bullet.direction.x * 10;
    bullet.position.y += bullet.direction.y * 10;

    // Remove if off screen
    if (
      bullet.position.x < 0 ||
      bullet.position.x > this.canvas.width ||
      bullet.position.y < 0 ||
      bullet.position.y > this.canvas.height
    ) {
      bullet.active = false;
    }
  }

  private enemyShoot(enemy: Enemy): void {
    const bullet: Bullet = {
      position: { x: enemy.position.x + enemy.width / 2, y: enemy.position.y + enemy.height / 2 },
      velocity: { x: 0, y: 0 },
      width: 8,
      height: 8,
      active: true,
      damage: 1,
      owner: 'enemy',
      direction: { x: enemy.facing === 'right' ? 1 : -1, y: 0 },
    };
    this.state.bullets.push(bullet);
  }

  public playerShoot(): void {
    this.state.players.forEach((player) => {
      if (!player.active) return;
      
      const bullet: Bullet = {
        position: { x: player.position.x + player.width / 2, y: player.position.y + player.height / 2 },
        velocity: { x: 0, y: 0 },
        width: 8,
        height: 8,
        active: true,
        damage: 1,
        owner: 'player',
        direction: { x: player.facing === 'right' ? 1 : -1, y: 0 },
      };
      this.state.bullets.push(bullet);
    });
  }

  private checkCollisions(): void {
    // Bullet vs Enemy
    this.state.bullets.forEach((bullet) => {
      if (bullet.owner !== 'player') return;
      
      this.state.enemies.forEach((enemy) => {
        if (!enemy.active) return;
        
        if (this.checkAABB(bullet, enemy)) {
          bullet.active = false;
          enemy.health -= bullet.damage;
          
          if (enemy.health <= 0) {
            enemy.active = false;
            this.state.score += enemy.points;
          }
        }
      });
    });

    // Bullet vs Player
    this.state.bullets.forEach((bullet) => {
      if (bullet.owner !== 'enemy') return;
      
      this.state.players.forEach((player) => {
        if (!player.active || player.invincible) return;
        
        if (this.checkAABB(bullet, player)) {
          bullet.active = false;
          player.health -= bullet.damage;
          player.invincible = true;
          player.invincibleTimer = 2; // 2 seconds invincibility
          
          if (player.health <= 0) {
            player.lives--;
            if (player.lives > 0) {
              player.health = player.maxHealth;
            } else {
              player.active = false;
              this.state.gameOver = true;
            }
          }
        }
      });
    });
  }

  private checkAABB(a: GameObject, b: GameObject): boolean {
    return (
      a.position.x < b.position.x + b.width &&
      a.position.x + a.width > b.position.x &&
      a.position.y < b.position.y + b.height &&
      a.position.y + a.height > b.position.y
    );
  }

  public spawnEnemy(type: 'jaffa' | 'elite' | 'kull'): void {
    const enemyData = {
      jaffa: { health: 1, points: 10, width: 32, height: 48 },
      elite: { health: 2, points: 25, width: 32, height: 48 },
      kull: { health: 5, points: 100, width: 48, height: 64 },
    };

    const data = enemyData[type];
    const enemy: Enemy = {
      type,
      position: { x: this.canvas.width - 100, y: this.GROUND_Y - data.height },
      velocity: { x: 0, y: 0 },
      width: data.width,
      height: data.height,
      active: true,
      health: data.health,
      maxHealth: data.health,
      facing: 'left',
      shootTimer: 2,
      points: data.points,
    };
    this.state.enemies.push(enemy);
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#8b7355';
    this.ctx.fillRect(0, this.GROUND_Y, this.canvas.width, this.canvas.height - this.GROUND_Y);

    // Draw players
    this.state.players.forEach((player) => {
      if (!player.active) return;
      
      // Flicker if invincible
      if (player.invincible && Math.floor(player.invincibleTimer * 10) % 2 === 0) return;
      
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillRect(player.position.x, player.position.y, player.width, player.height);
    });

    // Draw enemies
    this.state.enemies.forEach((enemy) => {
      if (!enemy.active) return;
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(enemy.position.x, enemy.position.y, enemy.width, enemy.height);
    });

    // Draw bullets
    this.state.bullets.forEach((bullet) => {
      if (!bullet.active) return;
      this.ctx.fillStyle = bullet.owner === 'player' ? '#ffff00' : '#ff00ff';
      this.ctx.fillRect(bullet.position.x, bullet.position.y, bullet.width, bullet.height);
    });

    // Draw HUD
    this.drawHUD();
  }

  private drawHUD(): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px monospace';
    this.ctx.fillText(`SCORE: ${this.state.score}`, 10, 30);
    
    if (this.state.players.length > 0) {
      const player = this.state.players[0];
      this.ctx.fillText(`LIVES: ${player.lives}`, 10, 60);
      this.ctx.fillText(`HEALTH: ${player.health}/${player.maxHealth}`, 10, 90);
    }

    if (this.state.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '48px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = '24px monospace';
      this.ctx.fillText(`Final Score: ${this.state.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
      this.ctx.textAlign = 'left';
    }
  }

  public getState(): GameState {
    return this.state;
  }

  public togglePause(): void {
    this.state.paused = !this.state.paused;
  }

  public reset(): void {
    this.state = this.createInitialState();
  }
}
