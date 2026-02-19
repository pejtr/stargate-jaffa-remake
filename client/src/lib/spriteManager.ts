import { GAME_ASSETS, type CharacterType } from './gameAssets';

// ─── Sprite Manager ──────────────────────────────────────────────
// Manages loading and rendering of sprite sheets

export interface SpriteFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SpriteAnimation {
  frames: SpriteFrame[];
  frameDuration: number; // milliseconds per frame
}

// Sprite sheet definitions based on generated assets
export const SPRITE_SHEETS = {
  // Player sprites - each character has different animations
  players: {
    tealc: {
      idle: { frames: [{ x: 0, y: 0, w: 48, h: 64 }], frameDuration: 200 },
      walk: { 
        frames: [
          { x: 48, y: 0, w: 48, h: 64 },
          { x: 96, y: 0, w: 48, h: 64 },
          { x: 144, y: 0, w: 48, h: 64 },
          { x: 192, y: 0, w: 48, h: 64 },
        ], 
        frameDuration: 100 
      },
      shoot: { frames: [{ x: 240, y: 0, w: 64, h: 64 }], frameDuration: 100 },
      jump: { frames: [{ x: 304, y: 0, w: 48, h: 64 }], frameDuration: 200 },
    },
    oneill: {
      idle: { frames: [{ x: 0, y: 0, w: 40, h: 56 }], frameDuration: 200 },
      walk: { 
        frames: [
          { x: 40, y: 0, w: 40, h: 56 },
          { x: 80, y: 0, w: 40, h: 56 },
          { x: 120, y: 0, w: 40, h: 56 },
          { x: 160, y: 0, w: 40, h: 56 },
        ], 
        frameDuration: 100 
      },
      shoot: { frames: [{ x: 200, y: 0, w: 48, h: 56 }], frameDuration: 100 },
      jump: { frames: [{ x: 248, y: 0, w: 40, h: 56 }], frameDuration: 200 },
    },
    carter: {
      idle: { frames: [{ x: 0, y: 0, w: 40, h: 56 }], frameDuration: 200 },
      walk: { 
        frames: [
          { x: 40, y: 0, w: 40, h: 56 },
          { x: 80, y: 0, w: 40, h: 56 },
          { x: 120, y: 0, w: 40, h: 56 },
          { x: 160, y: 0, w: 40, h: 56 },
        ], 
        frameDuration: 100 
      },
      shoot: { frames: [{ x: 200, y: 0, w: 48, h: 56 }], frameDuration: 100 },
      jump: { frames: [{ x: 248, y: 0, w: 40, h: 56 }], frameDuration: 200 },
    },
    jackson: {
      idle: { frames: [{ x: 0, y: 0, w: 40, h: 56 }], frameDuration: 200 },
      walk: { 
        frames: [
          { x: 40, y: 0, w: 40, h: 56 },
          { x: 80, y: 0, w: 40, h: 56 },
          { x: 120, y: 0, w: 40, h: 56 },
          { x: 160, y: 0, w: 40, h: 56 },
        ], 
        frameDuration: 100 
      },
      shoot: { frames: [{ x: 200, y: 0, w: 48, h: 56 }], frameDuration: 100 },
      jump: { frames: [{ x: 248, y: 0, w: 40, h: 56 }], frameDuration: 200 },
    },
  },
  
  // Enemy sprites
  enemies: {
    jaffa: {
      idle: { frames: [{ x: 0, y: 0, w: 64, h: 80 }], frameDuration: 200 },
      walk: { 
        frames: [
          { x: 64, y: 0, w: 64, h: 80 },
          { x: 128, y: 0, w: 64, h: 80 },
        ], 
        frameDuration: 150 
      },
      shoot: { frames: [{ x: 192, y: 0, w: 80, h: 80 }], frameDuration: 100 },
    },
    elite: {
      idle: { frames: [{ x: 0, y: 80, w: 64, h: 80 }], frameDuration: 200 },
      walk: { 
        frames: [
          { x: 64, y: 80, w: 64, h: 80 },
          { x: 128, y: 80, w: 64, h: 80 },
        ], 
        frameDuration: 150 
      },
      shoot: { frames: [{ x: 192, y: 80, w: 80, h: 80 }], frameDuration: 100 },
    },
    kull: {
      idle: { frames: [{ x: 0, y: 160, w: 80, h: 96 }], frameDuration: 200 },
      walk: { 
        frames: [
          { x: 80, y: 160, w: 80, h: 96 },
          { x: 160, y: 160, w: 80, h: 96 },
        ], 
        frameDuration: 200 
      },
      shoot: { frames: [{ x: 240, y: 160, w: 96, h: 96 }], frameDuration: 100 },
    },
  },
};

class SpriteManager {
  private images: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  // Load a sprite sheet
  public loadSprite(key: string, url: string): Promise<HTMLImageElement> {
    if (this.images.has(key)) {
      return Promise.resolve(this.images.get(key)!);
    }

    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        this.loadingPromises.delete(key);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(key);
        reject(new Error(`Failed to load sprite: ${url}`));
      };
      img.src = url;
    });

    this.loadingPromises.set(key, promise);
    return promise;
  }

  // Get loaded sprite
  public getSprite(key: string): HTMLImageElement | null {
    return this.images.get(key) || null;
  }

  // Draw a sprite frame
  public drawSprite(
    ctx: CanvasRenderingContext2D,
    spriteKey: string,
    frame: SpriteFrame,
    x: number,
    y: number,
    width: number,
    height: number,
    flipH: boolean = false
  ): void {
    const img = this.getSprite(spriteKey);
    if (!img) return;

    ctx.save();
    
    if (flipH) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        frame.x, frame.y, frame.w, frame.h,
        0, 0, width, height
      );
    } else {
      ctx.drawImage(
        img,
        frame.x, frame.y, frame.w, frame.h,
        x, y, width, height
      );
    }
    
    ctx.restore();
  }

  // Get current frame from animation
  public getAnimationFrame(
    animation: SpriteAnimation,
    animTime: number
  ): SpriteFrame {
    const frameIndex = Math.floor(animTime / animation.frameDuration) % animation.frames.length;
    return animation.frames[frameIndex];
  }

  // Preload all game sprites
  public async preloadAll(): Promise<void> {
    const promises: Promise<HTMLImageElement>[] = [];

    // Load player sprites
    promises.push(this.loadSprite('tealc', GAME_ASSETS.sprites.tealc));
    promises.push(this.loadSprite('oneill', GAME_ASSETS.sprites.oneill));
    promises.push(this.loadSprite('carter', GAME_ASSETS.sprites.carter));
    promises.push(this.loadSprite('jackson', GAME_ASSETS.sprites.jackson));

    // Load enemy sprites
    promises.push(this.loadSprite('jaffaEnemies', GAME_ASSETS.sprites.jaffaEnemies));

    // Load backgrounds
    promises.push(this.loadSprite('level1Egypt', GAME_ASSETS.backgrounds.level1Egypt));
    promises.push(this.loadSprite('level2Goauld', GAME_ASSETS.backgrounds.level2Goauld));
    promises.push(this.loadSprite('level3Antarctica', GAME_ASSETS.backgrounds.level3Antarctica));

    await Promise.all(promises);
  }
}

// Singleton instance
export const spriteManager = new SpriteManager();
