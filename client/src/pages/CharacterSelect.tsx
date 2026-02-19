import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHARACTER_STATS, type CharacterType } from "@/lib/gameAssets";
import { useLocation } from "wouter";

export default function CharacterSelect() {
  const [, setLocation] = useLocation();
  const gameMode = sessionStorage.getItem('gameMode') || 'contra';
  const maxPlayers = gameMode === 'contra' ? 2 : 4;

  const handleSelectCharacter = (character: CharacterType) => {
    // Store selected character in sessionStorage
    sessionStorage.setItem('selectedCharacter', character);
    setLocation('/game');
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
        <p className="text-xl text-gray-300 mt-4">Select Your Character</p>
        <p className="text-sm text-gray-400 mt-2">Max {maxPlayers} Player{maxPlayers > 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
        {(Object.keys(CHARACTER_STATS) as CharacterType[]).map((char) => {
          const stats = CHARACTER_STATS[char];
          return (
            <Card
              key={char}
              className="bg-slate-800/50 border-2 border-blue-500/30 hover:border-blue-400 transition-all hover:scale-105 cursor-pointer"
              onClick={() => handleSelectCharacter(char)}
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
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  SELECT
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center flex gap-4 justify-center">
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
