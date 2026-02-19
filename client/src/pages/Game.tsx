import { Button } from "@/components/ui/button";
import { GameEngine } from "@/lib/gameEngine";
import type { CharacterType } from "@/lib/gameAssets";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [, setLocation] = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameMode = sessionStorage.getItem('gameMode') || 'contra';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 1280;
    canvas.height = 720;

    // Get selected character
    const selectedChar = (sessionStorage.getItem('selectedCharacter') || 'oneill') as CharacterType;

    // Initialize game engine
    const engine = new GameEngine(canvas);
    engine.addPlayer(selectedChar);
    engineRef.current = engine;

    // Spawn some test enemies
    setTimeout(() => {
      engine.spawnEnemy('jaffa');
    }, 2000);

    setTimeout(() => {
      engine.spawnEnemy('elite');
    }, 4000);

    setTimeout(() => {
      engine.spawnEnemy('kull');
    }, 6000);

    // Start game loop
    engine.start();
    setGameStarted(true);

    // Handle shoot on spacebar
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'j' || e.key === 'J') {
        engine.playerShoot();
      }
      if (e.key === 'p' || e.key === 'P') {
        engine.togglePause();
        setIsPaused((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setLocation('/character-select');
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      engine.stop();
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [setLocation]);

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      const selectedChar = (sessionStorage.getItem('selectedCharacter') || 'oneill') as CharacterType;
      engineRef.current.addPlayer(selectedChar);
      
      // Spawn enemies again
      setTimeout(() => engineRef.current?.spawnEnemy('jaffa'), 2000);
      setTimeout(() => engineRef.current?.spawnEnemy('elite'), 4000);
      setTimeout(() => engineRef.current?.spawnEnemy('kull'), 6000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-center">
        <div className="mb-2">
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${
            gameMode === 'contra' 
              ? 'bg-blue-600 text-white' 
              : 'bg-purple-600 text-white'
          }`}>
            {gameMode === 'contra' ? '🎮 CONTRA MODE' : '🛡️ DEFENSE MODE'}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-blue-400 pixel-font mb-2">
          STARGATE: ZASTŘEL SI SVÉHO JAFFU 2
        </h1>
        <div className="text-gray-300 space-x-4 text-sm">
          <span>WASD/Arrows: Move</span>
          <span>W/↑/Space: Jump</span>
          <span>J: Shoot</span>
          <span>P: Pause</span>
          <span>ESC: Exit</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-4 border-blue-500 rounded-lg shadow-2xl shadow-blue-500/50"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {isPaused && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h2 className="text-6xl font-bold text-white pixel-font mb-4">PAUSED</h2>
              <p className="text-xl text-gray-300">Press P to continue</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <Button
          onClick={handleRestart}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Restart
        </Button>
        <Button
          onClick={() => setLocation('/character-select')}
          variant="outline"
          className="border-gray-500 text-gray-300 hover:bg-gray-800"
        >
          Change Character
        </Button>
        <Button
          onClick={() => setLocation('/')}
          variant="outline"
          className="border-gray-500 text-gray-300 hover:bg-gray-800"
        >
          Main Menu
        </Button>
      </div>
    </div>
  );
}
