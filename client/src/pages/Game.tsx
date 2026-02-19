import { Button } from "@/components/ui/button";
import { ContraEngine } from "@/lib/contraEngine";
import { DefenseEngine } from "@/lib/defenseEngine";
import { initAudio, startMusic, stopMusic } from "@/lib/audioEngine";
import type { CharacterType } from "@/lib/gameAssets";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contraRef = useRef<ContraEngine | null>(null);
  const defenseRef = useRef<DefenseEngine | null>(null);
  const [, setLocation] = useLocation();
  const gameMode = sessionStorage.getItem('gameMode') || 'contra';
  const selectedChar = (sessionStorage.getItem('selectedCharacter') || 'oneill') as CharacterType;

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1280;
    canvas.height = 720;

    // Clean up previous
    contraRef.current?.stop();
    defenseRef.current?.stop();
    contraRef.current = null;
    defenseRef.current = null;

    initAudio();

    if (gameMode === 'contra') {
      const engine = new ContraEngine(canvas);
      engine.addPlayer(selectedChar);
      contraRef.current = engine;
      engine.start();
      startMusic();
    } else {
      const engine = new DefenseEngine(canvas);
      engine.addPlayer(selectedChar);
      defenseRef.current = engine;
      engine.start();
      startMusic();
    }
  }, [gameMode, selectedChar]);

  useEffect(() => {
    initGame();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopMusic();
        setLocation('/character-select');
      }
      if (e.key === 'r' || e.key === 'R') {
        // Restart
        if (gameMode === 'contra' && contraRef.current) {
          contraRef.current.reset();
          contraRef.current.addPlayer(selectedChar);
        } else if (defenseRef.current) {
          defenseRef.current.reset();
          defenseRef.current.addPlayer(selectedChar);
        }
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      contraRef.current?.stop();
      defenseRef.current?.stop();
      stopMusic();
      window.removeEventListener('keydown', handleKey);
    };
  }, [initGame, setLocation, gameMode, selectedChar]);

  const handleRestart = () => {
    if (gameMode === 'contra' && contraRef.current) {
      contraRef.current.reset();
      contraRef.current.addPlayer(selectedChar);
    } else if (defenseRef.current) {
      defenseRef.current.reset();
      defenseRef.current.addPlayer(selectedChar);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="relative w-full max-w-[1280px]">
        <canvas
          ref={canvasRef}
          className="w-full border-2 border-blue-500/50 shadow-2xl shadow-blue-500/30"
          style={{ imageRendering: 'pixelated', cursor: gameMode === 'defense' ? 'none' : 'default', aspectRatio: '16/9' }}
        />
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          onClick={handleRestart}
          className="bg-blue-600 hover:bg-blue-700 pixel-font text-xs"
        >
          RESTART (R)
        </Button>
        <Button
          onClick={() => { stopMusic(); setLocation('/character-select'); }}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800 pixel-font text-xs"
        >
          CHARACTER
        </Button>
        <Button
          onClick={() => { stopMusic(); setLocation('/mode-select'); }}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800 pixel-font text-xs"
        >
          MODE
        </Button>
        <Button
          onClick={() => { stopMusic(); setLocation('/'); }}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800 pixel-font text-xs"
        >
          MENU
        </Button>
      </div>

      <div className="mt-3 text-gray-500 text-xs text-center pixel-font space-x-6">
        {gameMode === 'contra' ? (
          <>
            <span>A/D: MOVE</span>
            <span>W: JUMP</span>
            <span>CTRL: SHOOT</span>
            <span>↑↓: AIM</span>
            <span>R: RESTART</span>
            <span>ESC: EXIT</span>
          </>
        ) : (
          <>
            <span>MOUSE: AIM</span>
            <span>CLICK/CTRL: SHOOT</span>
            <span>R: RESTART</span>
            <span>ESC: EXIT</span>
          </>
        )}
      </div>
    </div>
  );
}
