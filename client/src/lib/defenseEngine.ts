import type { CharacterType } from './gameAssets';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Wall {
  bricks: boolean[][]; // 4 columns x 10 rows
  health: number;
  maxHealth: number;
}

export interface DefenseEnemy {
  position: Vector2D;
  targetBrick: { col: number; row: number };
  speed: number;
  type: 'jaffa' | 'elite' | 'kull';
  active: boolean;
  points: number;
}

export interface DefensePlayer {
  character: CharacterType;
  score: number;
  kills: number;
  cursorPosition: Vector2D;
}

export interface DefenseGameState {
  wall: Wall;
  enemies: DefenseEnemy[];
  players: DefensePlayer[];
  wave: number;
  score: number;
  gameOver: boolean;
  victory: boolean;
  enemiesKilled: number;
  targetKills: number;
}

export class DefenseEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: DefenseGameState;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private mousePosition: Vector2D = { x: 0, y: 0 };
  
  // Game constants
  private readonly BRICK_WIDTH = 80;
  private readonly BRICK_HEIGHT = 40;
  private readonly WALL_START_X = 400;
  private readonly WALL_START_Y = 150;
  private readonly SPAWN_INTERVAL = 2000; // ms
  private lastSpawn: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;

    this.state = this.createInitialState();
    this.setupEventListeners();
  }

  private createInitialState(): DefenseGameState {
    // Create 4x10 brick wall
    const bricks: boolean[][] = [];
    for (let col = 0; col < 4; col++) {
      bricks[col] = [];
      for (let row = 0; row < 10; row++) {
        bricks[col][row] = true;
      }
    }

    return {
      wall: {
        bricks,
        health: 40,
        maxHealth: 40,
      },
      enemies: [],
      players: [],
      wave: 1,
      score: 0,
      gameOver: false,
      victory: false,
      enemiesKilled: 0,
      targetKills: 1000,
    };
  }

  public addPlayer(character: CharacterType): void {
    const player: DefensePlayer = {
      character,
      score: 0,
      kills: 0,
      cursorPosition: { x: 0, y: 0 },
    };
    this.state.players.push(player);
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    });

    this.canvas.addEventListener('click', (e) => {
      this.handleShoot();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Control') {
        this.handleShoot();
      }
    });
  }

  private handleShoot(): void {
    // Check if clicked on an enemy
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];
      if (!enemy.active) continue;

      const dx = this.mousePosition.x - enemy.position.x;
      const dy = this.mousePosition.y - enemy.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 30) {
        // Hit!
        enemy.active = false;
        this.state.score += enemy.points;
        this.state.enemiesKilled++;

        if (this.state.players.length > 0) {
          this.state.players[0].kills++;
          this.state.players[0].score += enemy.points;
        }

        // Check victory
        if (this.state.enemiesKilled >= this.state.targetKills) {
          this.state.victory = true;
          this.state.gameOver = true;
        }
        break;
      }
    }
  }

  public start(): void {
    this.lastTime = performance.now();
    this.lastSpawn = performance.now();
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
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (!this.state.gameOver) {
      this.update(deltaTime, currentTime);
    }
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number, currentTime: number): void {
    // Spawn enemies
    if (currentTime - this.lastSpawn > this.SPAWN_INTERVAL) {
      this.spawnEnemy();
      this.lastSpawn = currentTime;
    }

    // Update enemies
    this.state.enemies = this.state.enemies.filter((enemy) => {
      if (!enemy.active) return false;

      // Move towards target brick
      const targetX = this.WALL_START_X + enemy.targetBrick.col * this.BRICK_WIDTH + this.BRICK_WIDTH / 2;
      const targetY = this.WALL_START_Y + enemy.targetBrick.row * this.BRICK_HEIGHT;

      const dx = targetX - enemy.position.x;
      const dy = targetY - enemy.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        // Reached brick - destroy it
        if (this.state.wall.bricks[enemy.targetBrick.col][enemy.targetBrick.row]) {
          this.state.wall.bricks[enemy.targetBrick.col][enemy.targetBrick.row] = false;
          this.state.wall.health--;

          // Check game over
          if (this.state.wall.health <= 0) {
            this.state.gameOver = true;
          }

          // Check if column is destroyed
          let columnDestroyed = true;
          for (let row = 0; row < 10; row++) {
            if (this.state.wall.bricks[enemy.targetBrick.col][row]) {
              columnDestroyed = false;
              break;
            }
          }

          if (columnDestroyed) {
            // Count remaining columns
            let remainingColumns = 0;
            for (let col = 0; col < 4; col++) {
              for (let row = 0; row < 10; row++) {
                if (this.state.wall.bricks[col][row]) {
                  remainingColumns++;
                  break;
                }
              }
            }

            if (remainingColumns <= 1) {
              this.state.gameOver = true;
            }
          }
        }
        return false;
      }

      enemy.position.x += (dx / distance) * enemy.speed;
      enemy.position.y += (dy / distance) * enemy.speed;

      return true;
    });
  }

  private spawnEnemy(): void {
    // Random spawn position at top of screen
    const spawnX = Math.random() * this.canvas.width;
    const spawnY = -50;

    // Random target brick (only existing bricks)
    const availableBricks: { col: number; row: number }[] = [];
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 10; row++) {
        if (this.state.wall.bricks[col][row]) {
          availableBricks.push({ col, row });
        }
      }
    }

    if (availableBricks.length === 0) return;

    const targetBrick = availableBricks[Math.floor(Math.random() * availableBricks.length)];

    // Random enemy type based on wave
    let type: 'jaffa' | 'elite' | 'kull' = 'jaffa';
    const rand = Math.random();
    if (this.state.wave > 3 && rand < 0.3) {
      type = 'elite';
    } else if (this.state.wave > 5 && rand < 0.1) {
      type = 'kull';
    }

    const enemy: DefenseEnemy = {
      position: { x: spawnX, y: spawnY },
      targetBrick,
      speed: type === 'jaffa' ? 1 : type === 'elite' ? 1.5 : 2,
      type,
      active: true,
      points: type === 'jaffa' ? 10 : type === 'elite' ? 25 : 100,
    };

    this.state.enemies.push(enemy);
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a1e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw wall
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 10; row++) {
        if (this.state.wall.bricks[col][row]) {
          const x = this.WALL_START_X + col * this.BRICK_WIDTH;
          const y = this.WALL_START_Y + row * this.BRICK_HEIGHT;

          // Brick
          this.ctx.fillStyle = '#8b7355';
          this.ctx.fillRect(x, y, this.BRICK_WIDTH - 2, this.BRICK_HEIGHT - 2);

          // Border
          this.ctx.strokeStyle = '#654321';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x, y, this.BRICK_WIDTH - 2, this.BRICK_HEIGHT - 2);
        }
      }
    }

    // Draw enemies
    this.state.enemies.forEach((enemy) => {
      if (!enemy.active) return;

      const color = enemy.type === 'jaffa' ? '#ff6b6b' : enemy.type === 'elite' ? '#ff9f1c' : '#2ec4b6';
      
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(enemy.position.x, enemy.position.y, 20, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw face
      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      this.ctx.arc(enemy.position.x - 7, enemy.position.y - 5, 3, 0, Math.PI * 2);
      this.ctx.arc(enemy.position.x + 7, enemy.position.y - 5, 3, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw crosshair
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.mousePosition.x - 15, this.mousePosition.y);
    this.ctx.lineTo(this.mousePosition.x + 15, this.mousePosition.y);
    this.ctx.moveTo(this.mousePosition.x, this.mousePosition.y - 15);
    this.ctx.lineTo(this.mousePosition.x, this.mousePosition.y + 15);
    this.ctx.stroke();

    // Draw HUD
    this.drawHUD();
  }

  private drawHUD(): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px monospace';
    this.ctx.fillText(`SCORE: ${this.state.score}`, 10, 30);
    this.ctx.fillText(`KILLS: ${this.state.enemiesKilled}/${this.state.targetKills}`, 10, 60);
    this.ctx.fillText(`WALL: ${this.state.wall.health}/${this.state.wall.maxHealth}`, 10, 90);
    this.ctx.fillText(`WAVE: ${this.state.wave}`, 10, 120);

    if (this.state.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = this.state.victory ? '#00ff00' : '#ff0000';
      this.ctx.font = '48px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.state.victory ? 'VICTORY!' : 'GAME OVER',
        this.canvas.width / 2,
        this.canvas.height / 2
      );
      this.ctx.font = '24px monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(`Final Score: ${this.state.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
      this.ctx.textAlign = 'left';
    }
  }

  public getState(): DefenseGameState {
    return this.state;
  }

  public reset(): void {
    this.state = this.createInitialState();
    this.lastSpawn = performance.now();
  }
}
