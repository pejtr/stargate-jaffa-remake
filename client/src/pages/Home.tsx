import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Stargate background decoration */}
      <div 
        className="absolute inset-0 opacity-10 bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://files.manuscdn.com/user_upload_by_module/session_file/310419663032296198/KeapQXQJhBjIDwDk.png)',
          backgroundSize: '800px 800px',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <div className="relative z-10">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 pixel-font animate-pulse">
            STARGATE
          </h1>
          <h2 className="text-5xl font-bold text-yellow-400 pixel-font">
            ZASTŘEL SI SVÉHO JAFFU 2
          </h2>
          <p className="text-xl text-gray-400 italic">Contra-Style Run & Gun Shooter</p>
        </div>

        <div className="space-y-4 mt-12">
          <Button
            onClick={() => setLocation('/mode-select')}
            className="w-64 h-16 text-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 pixel-font"
          >
          START GAME
        </Button>
        <Button
          onClick={() => setLocation('/highscores')}
          variant="outline"
          className="border-yellow-500 text-yellow-400 hover:bg-yellow-900/30 text-lg px-8"
        >
          🏆 HIGHSCORES
        </Button>
          
          <div className="text-gray-400 text-sm space-y-1">
            <p>🎮 2 Game Modes: Contra & Defense</p>
            <p>🔫 4 Playable Characters</p>
            <p>👾 1-4 Players Co-op</p>
          </div>
        </div>

        <div className="mt-16 text-gray-500 text-sm">
          <p>Based on the original "Zastřel si svého Jaffu" (2003)</p>
          <p className="mt-2">© Stargate SG-1 Fan Game - Not for commercial use</p>
        </div>
      </div>
      </div>
    </div>
  );
}
