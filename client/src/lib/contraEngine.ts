import type { CharacterType } from './gameAssets';

export interface Vector2D {
  x: number;
  y: number;
}

export interface ContraPlayer {
  character: CharacterType;
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  lives: number;
  facing: 'left' | 'right';
  isJumping: boolean;
  isOnGround: boolean;
  score: number;
  invincible: boolean;
  invincibleTimer: number;
}

export interface ContraEnemy {
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  type: 'jaffa' | 'elite' | 'kull';
  health: number;
  facing: 'left' | 'right';
  shootTimer: number;
  points: number;
  active: boolean;
}

export interface Bullet {
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  damage: number;
  owner: 'player' | 'enemy';
  active: boolean;
}

export interface ContraGameState {
  players: ContraPlayer[];
  enemies: ContraEnemy[];
  bullets: Bullet[];
  cameraX: number;
  score: number;
  level: number;
  gameOver: boolean;
  wave: number;
}

export class ContraEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: ContraGameState;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private keys: Set<string> = new Set();
  
  // Game constants
  private readonly GRAVITY = 0.6;
  private readonly JUMP_FORCE = -15;
  private readonly MOVE_SPEED = 5;
  private readonly GROUND_Y = 550;
  private readonly LEVEL_WIDTH = 3000;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;

    this.state = this.createInitialState();
    this.setupEventListeners();
  }

  private createInitialState(): ContraGameState {
    return {
      players: [],
      enemies: [],
      bullets: [],
      cameraX: 0,
      score: 0,
      level: 1,
      gameOver: false,
      wave: 1,
    };
  }

  public addPlayer(character: CharacterType): void {
    const playerIndex = this.state.players.length;
    const player: ContraPlayer = {
      character,
      position: { x: 100 + playerIndex * 60, y: this.GROUND_Y - 48 },
      velocity: { x: 0, y: 0 },
      width: 32,
      height: 48,
      health: 3,
      maxHealth: 3,
      lives: 3,
      facing: 'right',
      isJumping: false,
      isOnGround: true,
      score: 0,
      invincible: false,
      invincibleTimer: 0,
    };
    this.state.players.push(player);
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      
      if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'control'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  public start(): void {
    this.lastTime = performance.now();
    
    // Spawn initial enemies
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy(300 + i * 200);
    }
    
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
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.state.gameOver) {
      this.update(deltaTime);
    }
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update players
    this.state.players.forEach((player, index) => {
      this.updatePlayer(player, index, deltaTime);
    });

    // Update camera to follow first player
    if (this.state.players.length > 0) {
      const player = this.state.players[0];
      this.state.cameraX = Math.max(0, Math.min(
        player.position.x - this.canvas.width / 3,
        this.LEVEL_WIDTH - this.canvas.width
      ));
    }

    // Update enemies
    this.state.enemies.forEach((enemy) => {
      if (!enemy.active) return;
      this.updateEnemy(enemy, deltaTime);
    });

    // Update bullets
    this.state.bullets = this.state.bullets.filter((bullet) => {
      if (!bullet.active) return false;
      bullet.position.x += bullet.velocity.x;
      bullet.position.y += bullet.velocity.y;

      // Remove if off screen
      if (
        bullet.position.x < this.state.cameraX - 100 ||
        bullet.position.x > this.state.cameraX + this.canvas.width + 100 ||
        bullet.position.y < -100 ||
        bullet.position.y > this.canvas.height + 100
      ) {
        bullet.active = false;
      }

      return bullet.active;
    });

    // Check collisions
    this.checkCollisions();

    // Spawn more enemies if needed
    const activeEnemies = this.state.enemies.filter(e => e.active).length;
    if (activeEnemies < 3) {
      this.spawnEnemy(this.state.cameraX + this.canvas.width + 100);
    }
  }

  private updatePlayer(player: ContraPlayer, playerIndex: number, deltaTime: number): void {
    const keyPrefix = playerIndex === 0 ? '' : '2';
    const leftKey = playerIndex === 0 ? 'a' : 'arrowleft';
    const rightKey = playerIndex === 0 ? 'd' : 'arrowright';
    const jumpKey = playerIndex === 0 ? 'w' : 'arrowup';
    const shootKey = 'control';

    // Handle input
    if (this.keys.has(leftKey)) {
      player.velocity.x = -this.MOVE_SPEED;
      player.facing = 'left';
    } else if (this.keys.has(rightKey)) {
      player.velocity.x = this.MOVE_SPEED;
      player.facing = 'right';
    } else {
      player.velocity.x = 0;
    }

    // Jump
    if (this.keys.has(jumpKey) && player.isOnGround) {
      player.velocity.y = this.JUMP_FORCE;
      player.isJumping = true;
      player.isOnGround = false;
    }

    // Shoot
    if (this.keys.has(shootKey)) {
      this.playerShoot(player);
      this.keys.delete(shootKey); // Prevent holding
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
    player.position.x = Math.max(this.state.cameraX, Math.min(this.LEVEL_WIDTH - player.width, player.position.x));

    // Update invincibility
    if (player.invincible) {
      player.invincibleTimer -= deltaTime;
      if (player.invincibleTimer <= 0) {
        player.invincible = false;
      }
    }
  }

  private updateEnemy(enemy: ContraEnemy, deltaTime: number): void {
    // Simple AI: move towards player and shoot
    if (this.state.players.length > 0) {
      const player = this.state.players[0];
      const dx = player.position.x - enemy.position.x;
      
      if (Math.abs(dx) > 150) {
        enemy.velocity.x = dx > 0 ? 1.5 : -1.5;
        enemy.facing = dx > 0 ? 'right' : 'left';
      } else {
        enemy.velocity.x = 0;
      }

      // Shoot timer
      enemy.shootTimer -= deltaTime;
      if (enemy.shootTimer <= 0 && Math.abs(dx) < 400) {
        this.enemyShoot(enemy);
        enemy.shootTimer = 2 + Math.random();
      }
    }

    enemy.position.x += enemy.velocity.x;

    // Apply gravity
    if (enemy.position.y < this.GROUND_Y - enemy.height) {
      enemy.velocity.y += this.GRAVITY;
      enemy.position.y += enemy.velocity.y;
    } else {
      enemy.position.y = this.GROUND_Y - enemy.height;
      enemy.velocity.y = 0;
    }
  }

  private playerShoot(player: ContraPlayer): void {
    const bullet: Bullet = {
      position: { 
        x: player.position.x + (player.facing === 'right' ? player.width : 0), 
        y: player.position.y + player.height / 2 
      },
      velocity: { x: player.facing === 'right' ? 12 : -12, y: 0 },
      width: 8,
      height: 4,
      damage: 1,
      owner: 'player',
      active: true,
    };
    this.state.bullets.push(bullet);
  }

  private enemyShoot(enemy: ContraEnemy): void {
    const bullet: Bullet = {
      position: { 
        x: enemy.position.x + enemy.width / 2, 
        y: enemy.position.y + enemy.height / 2 
      },
      velocity: { x: enemy.facing === 'right' ? 8 : -8, y: 0 },
      width: 8,
      height: 4,
      damage: 1,
      owner: 'enemy',
      active: true,
    };
    this.state.bullets.push(bullet);
  }

  private spawnEnemy(x: number): void {
    const types: ('jaffa' | 'elite' | 'kull')[] = ['jaffa', 'elite', 'kull'];
    const type = types[Math.floor(Math.random() * Math.min(types.length, 1 + this.state.wave))];
    
    const enemyData = {
      jaffa: { health: 1, points: 10, width: 32, height: 48 },
      elite: { health: 2, points: 25, width: 32, height: 48 },
      kull: { health: 5, points: 100, width: 48, height: 64 },
    };

    const data = enemyData[type];
    const enemy: ContraEnemy = {
      type,
      position: { x, y: this.GROUND_Y - data.height },
      velocity: { x: 0, y: 0 },
      width: data.width,
      height: data.height,
      health: data.health,
      facing: 'left',
      shootTimer: 2,
      points: data.points,
      active: true,
    };
    this.state.enemies.push(enemy);
  }

  private checkCollisions(): void {
    // Bullet vs Enemy
    this.state.bullets.forEach((bullet) => {
      if (bullet.owner !== 'player' || !bullet.active) return;
      
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
      if (bullet.owner !== 'enemy' || !bullet.active) return;
      
      this.state.players.forEach((player) => {
        if (player.invincible) return;
        
        if (this.checkAABB(bullet, player)) {
          bullet.active = false;
          player.health -= bullet.damage;
          player.invincible = true;
          player.invincibleTimer = 2;
          
          if (player.health <= 0) {
            player.lives--;
            if (player.lives > 0) {
              player.health = player.maxHealth;
              player.position.x = this.state.cameraX + 100;
            } else {
              this.state.gameOver = true;
            }
          }
        }
      });
    });
  }

  private checkAABB(a: any, b: any): boolean {
    return (
      a.position.x < b.position.x + b.width &&
      a.position.x + a.width > b.position.x &&
      a.position.y < b.position.y + b.height &&
      a.position.y + a.height > b.position.y
    );
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#8b7355';
    this.ctx.fillRect(0, this.GROUND_Y, this.canvas.width, this.canvas.height - this.GROUND_Y);

    // Save context for camera
    this.ctx.save();
    this.ctx.translate(-this.state.cameraX, 0);

    // Draw players
    this.state.players.forEach((player) => {
      if (player.invincible && Math.floor(player.invincibleTimer * 10) % 2 === 0) return;
      
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillRect(player.position.x, player.position.y, player.width, player.height);
      
      // Draw facing direction
      this.ctx.fillStyle = '#ffffff';
      const eyeX = player.position.x + (player.facing === 'right' ? player.width - 8 : 8);
      this.ctx.fillRect(eyeX, player.position.y + 10, 4, 4);
    });

    // Draw enemies
    this.state.enemies.forEach((enemy) => {
      if (!enemy.active) return;
      
      const color = enemy.type === 'jaffa' ? '#ff0000' : enemy.type === 'elite' ? '#ff6600' : '#cc00cc';
      this.ctx.fillStyle = color;
      this.ctx.fillRect(enemy.position.x, enemy.position.y, enemy.width, enemy.height);
    });

    // Draw bullets
    this.state.bullets.forEach((bullet) => {
      if (!bullet.active) return;
      this.ctx.fillStyle = bullet.owner === 'player' ? '#ffff00' : '#ff00ff';
      this.ctx.fillRect(bullet.position.x, bullet.position.y, bullet.width, bullet.height);
    });

    this.ctx.restore();

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

  public getState(): ContraGameState {
    return this.state;
  }

  public reset(): void {
    this.state = this.createInitialState();
  }
}
