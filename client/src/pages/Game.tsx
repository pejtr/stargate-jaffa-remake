import { Button } from "@/components/ui/button";
import { ContraEngine } from "@/lib/contraEngine";
import { DefenseEngine } from "@/lib/defenseEngine";
import type { CharacterType } from "@/lib/gameAssets";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contraEngineRef = useRef<ContraEngine | null>(null);
  const defenseEngineRef = useRef<DefenseEngine | null>(null);
  const [, setLocation] = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
  const gameMode = sessionStorage.getItem('gameMode') || 'contra';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 1280;
    canvas.height = 720;

    // Get selected character
    const selectedChar = (sessionStorage.getItem('selectedCharacter') || 'oneill') as CharacterType;

    if (gameMode === 'contra') {
      // Initialize Contra engine
      const engine = new ContraEngine(canvas);
      engine.addPlayer(selectedChar);
      contraEngineRef.current = engine;
      engine.start();
    } else {
      // Initialize Defense engine
      const engine = new DefenseEngine(canvas);
      engine.addPlayer(selectedChar);
      defenseEngineRef.current = engine;
      engine.start();
    }

    setGameStarted(true);

    // Handle ESC to exit
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLocation('/character-select');
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      contraEngineRef.current?.stop();
      defenseEngineRef.current?.stop();
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [setLocation, gameMode]);

  const handleRestart = () => {
    if (gameMode === 'contra' && contraEngineRef.current) {
      contraEngineRef.current.reset();
      const selectedChar = (sessionStorage.getItem('selectedCharacter') || 'oneill') as CharacterType;
      contraEngineRef.current.addPlayer(selectedChar);
    } else if (gameMode === 'defense' && defenseEngineRef.current) {
      defenseEngineRef.current.reset();
      const selectedChar = (sessionStorage.getItem('selectedCharacter') || 'oneill') as CharacterType;
      defenseEngineRef.current.addPlayer(selectedChar);
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
          {gameMode === 'contra' ? (
            <>
              <span>A/D or ←/→: Move</span>
              <span>W or ↑: Jump</span>
              <span>CTRL: Shoot</span>
              <span>ESC: Exit</span>
            </>
          ) : (
            <>
              <span>Mouse: Aim</span>
              <span>Click or CTRL: Shoot</span>
              <span>ESC: Exit</span>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-4 border-blue-500 rounded-lg shadow-2xl shadow-blue-500/50"
          style={{ imageRendering: 'pixelated', cursor: gameMode === 'defense' ? 'crosshair' : 'default' }}
        />
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
          onClick={() => setLocation('/mode-select')}
          variant="outline"
          className="border-gray-500 text-gray-300 hover:bg-gray-800"
        >
          Change Mode
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
