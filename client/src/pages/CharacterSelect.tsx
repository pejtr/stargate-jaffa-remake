import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHARACTER_STATS, type CharacterType } from "@/lib/gameAssets";
import { useState } from "react";
import { useLocation } from "wouter";

export default function CharacterSelect() {
  const [, setLocation] = useLocation();
  const gameMode = sessionStorage.getItem('gameMode') || 'contra';
  const maxPlayers = gameMode === 'contra' ? 2 : 1;
  
  const [player1, setPlayer1] = useState<CharacterType | null>(null);
  const [player2, setPlayer2] = useState<CharacterType | null>(null);

  const handleSelectCharacter = (character: CharacterType) => {
    if (!player1) {
      setPlayer1(character);
    } else if (gameMode === 'contra' && !player2) {
      setPlayer2(character);
    }
  };

  const handleStart = () => {
    if (!player1) return;
    sessionStorage.setItem('selectedCharacter', player1);
    if (player2) {
      sessionStorage.setItem('player2Character', player2);
    } else {
      sessionStorage.removeItem('player2Character');
    }
    setLocation('/game');
  };

  const handleReset = () => {
    setPlayer1(null);
    setPlayer2(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Stargate background decoration */}
      <div 
        className="absolute inset-0 opacity-5 bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/KeapQXQJhBjIDwDk.png)',
          backgroundSize: '1200px 1200px',
          animation: 'spin 60s linear infinite',
        }}
      />
      <div className="relative z-10 w-full max-w-7xl">
      <div className="text-center mb-12">
        <div className="mb-4">
          <span className={`text-sm px-4 py-2 rounded-full font-bold ${
            gameMode === 'contra' 
              ? 'bg-blue-600 text-white' 
              : 'bg-purple-600 text-white'
          }`}>
            {gameMode === 'contra' ? '🎮 CONTRA MODE' : '🛡️ DEFENSE MODE'}
          </span>
        </div>
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4 pixel-font">
          STARGATE
        </h1>
        <h2 className="text-4xl font-bold text-yellow-400 pixel-font">
          ZASTŘEL SI SVÉHO JAFFU 2
        </h2>
        <p className="text-xl text-gray-300 mt-4">Select Your Character{maxPlayers > 1 ? 's' : ''}</p>
        
        {gameMode === 'contra' && (
          <div className="mt-4 flex gap-8 justify-center">
            <div className={`text-lg ${player1 ? 'text-green-400' : 'text-gray-500'}`}>
              Player 1: {player1 ? CHARACTER_STATS[player1].name : '???'}
            </div>
            <div className={`text-lg ${player2 ? 'text-green-400' : 'text-gray-500'}`}>
              Player 2: {player2 ? CHARACTER_STATS[player2].name : 'Optional'}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
        {(Object.keys(CHARACTER_STATS) as CharacterType[]).map((char) => {
          const stats = CHARACTER_STATS[char];
          const isSelected = player1 === char || player2 === char;
          const canSelect = !player1 || (gameMode === 'contra' && !player2 && player1 !== char);

          return (
            <Card
              key={char}
              className={`border-2 transition-all ${
                isSelected 
                  ? 'bg-green-800/50 border-green-400 scale-105' 
                  : canSelect
                  ? 'bg-slate-800/50 border-blue-500/30 hover:border-blue-400 hover:scale-105 cursor-pointer'
                  : 'bg-slate-800/20 border-gray-700 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => canSelect && handleSelectCharacter(char)}
            >
              <CardHeader>
                <CardTitle className="text-2xl text-blue-300">{stats.name}</CardTitle>
                <CardDescription className="text-yellow-400">{stats.special}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Health:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded ${
                          i < stats.health ? 'bg-red-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Speed:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded ${
                          i < stats.speed ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Weapon:</span>
                  <span className="text-blue-300 uppercase text-sm">{stats.weapon}</span>
                </div>
                {isSelected && (
                  <div className="mt-2 text-center text-green-400 font-bold text-sm">
                    ✓ SELECTED
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center flex gap-4 justify-center">
        {player1 && (
          <>
            <Button
              onClick={handleStart}
              className="bg-green-600 hover:bg-green-700 text-lg px-8"
            >
              START GAME
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-gray-500 text-gray-300 hover:bg-gray-800"
            >
              Reset Selection
            </Button>
          </>
        )}
        <Button
          variant="outline"
          onClick={() => setLocation('/mode-select')}
          className="border-gray-500 text-gray-300 hover:bg-gray-800"
        >
          ← Change Mode
        </Button>
        <Button
          variant="outline"
          onClick={() => setLocation('/')}
          className="border-gray-500 text-gray-300 hover:bg-gray-800"
        >
          Main Menu
        </Button>
      </div>
      </div>
    </div>
  );
}
