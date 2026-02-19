import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHighscores, clearHighscores } from "@/lib/highscores";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Highscores() {
  const [, setLocation] = useLocation();
  const [contraScores, setContraScores] = useState(getHighscores('contra'));
  const [defenseScores, setDefenseScores] = useState(getHighscores('defense'));

  useEffect(() => {
    setContraScores(getHighscores('contra'));
    setDefenseScores(getHighscores('defense'));
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all highscores?')) {
      clearHighscores();
      setContraScores([]);
      setDefenseScores([]);
    }
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
      
      <div className="relative z-10 w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4 pixel-font">
            HIGHSCORES
          </h1>
          <h2 className="text-2xl font-bold text-yellow-400 pixel-font">
            HALL OF FAME
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contra Mode Scores */}
          <Card className="bg-slate-800/50 border-2 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-3xl text-blue-300 text-center pixel-font">
                🎮 CONTRA MODE
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contraScores.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No scores yet!</p>
              ) : (
                <div className="space-y-2">
                  {contraScores.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded ${
                        i === 0 ? 'bg-yellow-600/20 border border-yellow-500/50' :
                        i === 1 ? 'bg-gray-400/20 border border-gray-400/50' :
                        i === 2 ? 'bg-orange-600/20 border border-orange-500/50' :
                        'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-yellow-400 w-8">
                          {i + 1}
                        </span>
                        <div>
                          <div className="text-white font-bold">{entry.name}</div>
                          <div className="text-xs text-gray-400">
                            {entry.character.toUpperCase()} • {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">
                          {entry.score.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Defense Mode Scores */}
          <Card className="bg-slate-800/50 border-2 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-3xl text-purple-300 text-center pixel-font">
                🛡️ DEFENSE MODE
              </CardTitle>
            </CardHeader>
            <CardContent>
              {defenseScores.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No scores yet!</p>
              ) : (
                <div className="space-y-2">
                  {defenseScores.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded ${
                        i === 0 ? 'bg-yellow-600/20 border border-yellow-500/50' :
                        i === 1 ? 'bg-gray-400/20 border border-gray-400/50' :
                        i === 2 ? 'bg-orange-600/20 border border-orange-500/50' :
                        'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-yellow-400 w-8">
                          {i + 1}
                        </span>
                        <div>
                          <div className="text-white font-bold">{entry.name}</div>
                          <div className="text-xs text-gray-400">
                            {entry.character.toUpperCase()} • Wave {entry.wave || '?'} • {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">
                          {entry.score.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center flex gap-4 justify-center">
          <Button
            onClick={() => setLocation('/')}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
          >
            Main Menu
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-900/30"
          >
            Clear All Scores
          </Button>
        </div>
      </div>
    </div>
  );
}
