import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function ModeSelect() {
  const [, setLocation] = useLocation();

  const handleSelectMode = (mode: 'contra' | 'defense') => {
    sessionStorage.setItem('gameMode', mode);
    setLocation('/character-select');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Stargate background decoration */}
      <div 
        className="absolute inset-0 opacity-5 bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/KeapQXQJhBjIDwDk.png)',
          backgroundSize: '1000px 1000px',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <div className="relative z-10 w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4 pixel-font">
            SELECT GAME MODE
          </h1>
          <p className="text-xl text-gray-300">Choose your battle style</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contra Mode */}
          <Card
            className="bg-slate-800/70 border-4 border-blue-500/50 hover:border-blue-400 transition-all hover:scale-105 cursor-pointer group"
            onClick={() => handleSelectMode('contra')}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-4xl text-blue-300 pixel-font">CONTRA MODE</CardTitle>
                <span className="text-sm bg-green-600 px-3 py-1 rounded-full text-white font-bold">MAIN GAME</span>
              </div>
              <CardDescription className="text-yellow-400 text-lg">Run & Gun Action Shooter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-slate-900/50 rounded-lg flex items-center justify-center border-2 border-blue-500/30">
                <div className="text-center text-gray-400">
                  <p className="text-6xl mb-2">🎮</p>
                  <p className="text-sm">Classic Side-Scrolling Action</p>
                </div>
              </div>
              
              <div className="space-y-2 text-gray-300">
                <p>✓ <strong className="text-blue-300">1-2 Players</strong> Local Co-op</p>
                <p>✓ <strong className="text-blue-300">Run & Gun</strong> Contra-style gameplay</p>
                <p>✓ <strong className="text-blue-300">8-Direction</strong> shooting</p>
                <p>✓ <strong className="text-blue-300">Multiple Levels</strong> with boss fights</p>
                <p>✓ <strong className="text-blue-300">Power-ups</strong> and weapon upgrades</p>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xl py-6 pixel-font group-hover:bg-blue-500">
                PLAY CONTRA MODE
              </Button>
            </CardContent>
          </Card>

          {/* Defense Mode */}
          <Card
            className="bg-slate-800/70 border-4 border-purple-500/50 hover:border-purple-400 transition-all hover:scale-105 cursor-pointer group"
            onClick={() => handleSelectMode('defense')}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-4xl text-purple-300 pixel-font">DEFENSE MODE</CardTitle>
                <span className="text-sm bg-purple-600 px-3 py-1 rounded-full text-white font-bold">DATADISK</span>
              </div>
              <CardDescription className="text-yellow-400 text-lg">Strategic Defense Shooter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-slate-900/50 rounded-lg flex items-center justify-center border-2 border-purple-500/30">
                <div className="text-center text-gray-400">
                  <p className="text-6xl mb-2">🛡️</p>
                  <p className="text-sm">Defend Your Position</p>
                </div>
              </div>
              
              <div className="space-y-2 text-gray-300">
                <p>✓ <strong className="text-purple-300">1-4 Players</strong> Cooperative defense</p>
                <p>✓ <strong className="text-purple-300">Wave-based</strong> enemy spawns</p>
                <p>✓ <strong className="text-purple-300">Strategic</strong> positioning</p>
                <p>✓ <strong className="text-purple-300">Original concept</strong> reimagined</p>
                <p>✓ <strong className="text-purple-300">Tower Defense</strong> elements</p>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-xl py-6 pixel-font group-hover:bg-purple-500">
                PLAY DEFENSE MODE
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="border-gray-500 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
          >
            ← Back to Main Menu
          </Button>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>💡 Tip: Try both modes for the complete Stargate experience!</p>
        </div>
      </div>
    </div>
  );
}
