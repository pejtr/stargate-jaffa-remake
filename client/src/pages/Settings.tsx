import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [volume, setVolume] = useState(70);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  useEffect(() => {
    const savedVolume = localStorage.getItem('gameVolume');
    const savedDifficulty = localStorage.getItem('gameDifficulty');
    if (savedVolume) setVolume(parseInt(savedVolume));
    if (savedDifficulty) setDifficulty(savedDifficulty as 'easy' | 'normal' | 'hard');
  }, []);

  const saveSettings = () => {
    localStorage.setItem('gameVolume', volume.toString());
    localStorage.setItem('gameDifficulty', difficulty);
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 bg-slate-800/50 p-8 rounded-lg border-2 border-purple-500">
        <h1 className="text-4xl font-bold text-center text-yellow-400 pixel-font">SETTINGS</h1>

        <div className="space-y-6">
          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-white text-xl pixel-font">Volume: {volume}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-white text-xl pixel-font">Difficulty</label>
            <div className="flex gap-4">
              {(['easy', 'normal', 'hard'] as const).map((diff) => (
                <Button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  variant={difficulty === diff ? 'default' : 'outline'}
                  className={`flex-1 ${
                    difficulty === diff
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'border-purple-500 text-purple-400 hover:bg-purple-900/30'
                  }`}
                >
                  {diff.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Controls Info */}
          <div className="space-y-2 bg-slate-900/50 p-4 rounded">
            <h3 className="text-yellow-400 text-lg pixel-font">CONTROLS</h3>
            <div className="text-gray-300 space-y-1 text-sm">
              <p><span className="text-white">Player 1:</span> WASD = Move, SPACE = Shoot, CTRL/ALT = Switch Weapon, SHIFT = Shield</p>
              <p><span className="text-white">Player 2:</span> IJKL = Move, ENTER = Shoot</p>
              <p><span className="text-white">General:</span> R = Restart, ESC = Pause/Menu</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={saveSettings}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white pixel-font"
          >
            SAVE & RETURN
          </Button>
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="flex-1 border-red-500 text-red-400 hover:bg-red-900/30"
          >
            CANCEL
          </Button>
        </div>
      </div>
    </div>
  );
}
