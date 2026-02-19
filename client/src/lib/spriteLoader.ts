import { GAME_ASSETS } from './gameAssets';

export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteAnimation {
  frames: SpriteFrame[];
  frameRate: number;
}

export class SpriteLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  private loaded: Map<string, boolean> = new Map();

  async loadImage(key: string, url: string): Promise<HTMLImageElement> {
    if (this.images.has(key)) {
      return this.images.get(key)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.images.set(key, img);
        this.loaded.set(key, true);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async loadAll(): Promise<void> {
    const promises: Promise<HTMLImageElement>[] = [];
    
    // Load character sprites
    promises.push(this.loadImage('tealc', GAME_ASSETS.sprites.tealc));
    promises.push(this.loadImage('oneill', GAME_ASSETS.sprites.oneill));
    promises.push(this.loadImage('carter', GAME_ASSETS.sprites.carter));
    promises.push(this.loadImage('jackson', GAME_ASSETS.sprites.jackson));
    
    // Load enemy sprites
    promises.push(this.loadImage('jaffa', GAME_ASSETS.sprites.jaffaEnemies));
    promises.push(this.loadImage('replicator', GAME_ASSETS.sprites.replicators));
    promises.push(this.loadImage('ori', GAME_ASSETS.sprites.oriSoldiers));
    
    // Load powerups
    promises.push(this.loadImage('powerups', GAME_ASSETS.sprites.powerups));
    
    await Promise.all(promises);
  }

  getImage(key: string): HTMLImageElement | null {
    return this.images.get(key) || null;
  }

  isLoaded(key: string): boolean {
    return this.loaded.get(key) || false;
  }

  drawSprite(
    ctx: CanvasRenderingContext2D,
    key: string,
    frame: SpriteFrame,
    x: number,
    y: number,
    width: number,
    height: number,
    flipX: boolean = false
  ): void {
    const img = this.getImage(key);
    if (!img || !this.isLoaded(key)) return;

    ctx.save();
    if (flipX) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, frame.x, frame.y, frame.width, frame.height, 0, 0, width, height);
    } else {
      ctx.drawImage(img, frame.x, frame.y, frame.width, frame.height, x, y, width, height);
    }
    ctx.restore();
  }
}

// Sprite frame definitions for animations
export const SPRITE_FRAMES = {
  // Character sprites (assuming 64x64 frames in horizontal strip)
  character: {
    idle: [{ x: 0, y: 0, width: 64, height: 64 }],
    walk: [
      { x: 64, y: 0, width: 64, height: 64 },
      { x: 128, y: 0, width: 64, height: 64 },
      { x: 192, y: 0, width: 64, height: 64 },
      { x: 256, y: 0, width: 64, height: 64 },
    ],
    shoot: [
      { x: 320, y: 0, width: 64, height: 64 },
      { x: 384, y: 0, width: 64, height: 64 },
    ],
    jump: [{ x: 448, y: 0, width: 64, height: 64 }],
  },
  
  // Enemy sprites (48x48 frames)
  jaffa: {
    idle: [{ x: 0, y: 0, width: 48, height: 48 }],
    walk: [
      { x: 48, y: 0, width: 48, height: 48 },
      { x: 96, y: 0, width: 48, height: 48 },
      { x: 144, y: 0, width: 48, height: 48 },
    ],
    attack: [
      { x: 192, y: 0, width: 48, height: 48 },
      { x: 240, y: 0, width: 48, height: 48 },
    ],
    death: [
      { x: 288, y: 0, width: 48, height: 48 },
      { x: 336, y: 0, width: 48, height: 48 },
      { x: 384, y: 0, width: 48, height: 48 },
    ],
  },
  
  // Replicator sprites
  replicator: {
    idle: [
      { x: 0, y: 0, width: 48, height: 48 },
      { x: 48, y: 0, width: 48, height: 48 },
    ],
    walk: [
      { x: 96, y: 0, width: 48, height: 48 },
      { x: 144, y: 0, width: 48, height: 48 },
      { x: 192, y: 0, width: 48, height: 48 },
      { x: 240, y: 0, width: 48, height: 48 },
    ],
    attack: [
      { x: 288, y: 0, width: 48, height: 48 },
      { x: 336, y: 0, width: 48, height: 48 },
      { x: 384, y: 0, width: 48, height: 48 },
    ],
    death: [
      { x: 432, y: 0, width: 48, height: 48 },
      { x: 480, y: 0, width: 48, height: 48 },
      { x: 528, y: 0, width: 48, height: 48 },
      { x: 576, y: 0, width: 48, height: 48 },
    ],
  },
  
  // Ori soldier sprites
  ori: {
    idle: [
      { x: 0, y: 0, width: 48, height: 48 },
      { x: 48, y: 0, width: 48, height: 48 },
    ],
    walk: [
      { x: 96, y: 0, width: 48, height: 48 },
      { x: 144, y: 0, width: 48, height: 48 },
      { x: 192, y: 0, width: 48, height: 48 },
      { x: 240, y: 0, width: 48, height: 48 },
    ],
    attack: [
      { x: 288, y: 0, width: 48, height: 48 },
      { x: 336, y: 0, width: 48, height: 48 },
      { x: 384, y: 0, width: 48, height: 48 },
    ],
    death: [
      { x: 432, y: 0, width: 48, height: 48 },
      { x: 480, y: 0, width: 48, height: 48 },
      { x: 528, y: 0, width: 48, height: 48 },
      { x: 576, y: 0, width: 48, height: 48 },
    ],
  },
  
  // Power-ups (32x32 frames)
  powerup: {
    health: { x: 0, y: 0, width: 32, height: 32 },
    shield: { x: 32, y: 0, width: 32, height: 32 },
    ammo: { x: 64, y: 0, width: 32, height: 32 },
    rapidfire: { x: 96, y: 0, width: 32, height: 32 },
    spread: { x: 128, y: 0, width: 32, height: 32 },
    energy: { x: 160, y: 0, width: 32, height: 32 },
  },
};
