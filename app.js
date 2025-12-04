const { useState, useEffect } = React;
const { Trophy, TrendingUp, Calculator, History, Plus, Minus, RotateCcw, Undo, Play, X, Check, Delete } = lucide;

// [Copy the entire React component code from the artifact above]
// The component starts with: const LETTER_VALUES = { ... }
// And ends with: ReactDOM.render(<ScrabbleTracker />, document.getElementById('root'));


import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calculator, History, Plus, Minus, RotateCcw, Undo, Play, X, Check, Delete } from 'lucide-react';

const LETTER_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

const ACHIEVEMENTS = [
  { id: 'first-steps', name: 'First Steps', desc: 'Complete your first game', icon: '🎯' },
  { id: 'high-scorer', name: 'High Scorer', desc: 'Score over 100 in a single turn', icon: '🔥' },
  { id: 'word-master', name: 'Word Master', desc: 'Play a 7-letter word (Bingo)', icon: '📚' },
  { id: 'victory-streak', name: 'Victory Streak', desc: 'Win 3 games in a row', icon: '🏆' },
  { id: 'tile-master', name: 'Tile Master', desc: 'Use all premium squares in one game', icon: '💎' },
  { id: 'speed-demon', name: 'Speed Demon', desc: 'Complete a game in under 30 minutes', icon: '⚡' }
];

export default function ScrabbleTracker() {
  const [page, setPage] = useState('score');
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [customScore, setCustomScore] = useState('');
  const [gameStartTime, setGameStartTime] = useState(null);
  
  // New game setup
  const [setupPlayers, setSetupPlayers] = useState([
    { name: 'Player 1', color: COLORS[0] },
    { name: 'Player 2', color: COLORS[1] }
  ]);
  const [targetScore, setTargetScore] = useState(300);
  const [gameMode, setGameMode] = useState('Standard');
  
  // Word calculator
  const [currentWord, setCurrentWord] = useState('');
  
  // Statistics
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalTime: 0,
    highestScore: 0,
    avgScore: 0,
    gameHistory: [],
    unlockedAchievements: []
  });

  useEffect(() => {
    const saved = localStorage.getItem('scrabbleStats');
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scrabbleStats', JSON.stringify(stats));
  }, [stats]);

  const addScore = (points) => {
    if (players.length === 0) return;
    
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex].score += points;
    
    const move = {
      player: players[currentPlayerIndex].name,
      points,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMoveHistory([move, ...moveHistory]);
    setPlayers(newPlayers);
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    setCustomScore('');
    
    if (points > 100) {
      unlockAchievement('high-scorer');
    }
    
    checkGameEnd(newPlayers);
  };

  const undoLastMove = () => {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory[0];
    const newPlayers = [...players];
    const playerIndex = newPlayers.findIndex(p => p.name === lastMove.player);
    
    if (playerIndex !== -1) {
      newPlayers[playerIndex].score -= lastMove.points;
      setPlayers(newPlayers);
      setMoveHistory(moveHistory.slice(1));
      setCurrentPlayerIndex(playerIndex);
    }
  };

  const resetGame = () => {
    setPlayers(players.map(p => ({ ...p, score: 0 })));
    setMoveHistory([]);
    setCurrentPlayerIndex(0);
    setGameStartTime(Date.now());
  };

  const startNewGame = () => {
    const newPlayers = setupPlayers.map(p => ({ ...p, score: 0 }));
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setMoveHistory([]);
    setGameStartTime(Date.now());
    setPage('score');
  };

  const checkGameEnd = (currentPlayers) => {
    const winner = currentPlayers.find(p => p.score >= targetScore);
    if (winner) {
      const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
      const newGameHistory = {
        winner: winner.name,
        score: winner.score,
        date: new Date().toLocaleDateString(),
        duration: gameTime,
        players: currentPlayers.map(p => ({ name: p.name, score: p.score }))
      };
      
      setStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        totalTime: prev.totalTime + gameTime,
        highestScore: Math.max(prev.highestScore, winner.score),
        avgScore: Math.round((prev.avgScore * prev.gamesPlayed + winner.score) / (prev.gamesPlayed + 1)),
        gameHistory: [newGameHistory, ...prev.gameHistory]
      }));
      
      unlockAchievement('first-steps');
      if (gameTime < 1800) unlockAchievement('speed-demon');
      
      setTimeout(() => {
        alert(`🎉 ${winner.name} wins with ${winner.score} points!`);
      }, 100);
    }
  };

  const unlockAchievement = (id) => {
    setStats(prev => {
      if (!prev.unlockedAchievements.includes(id)) {
        return { ...prev, unlockedAchievements: [...prev.unlockedAchievements, id] };
      }
      return prev;
    });
  };

  const addPlayerSetup = () => {
    if (setupPlayers.length < 8) {
      setSetupPlayers([...setupPlayers, { 
        name: `Player ${setupPlayers.length + 1}`, 
        color: COLORS[setupPlayers.length % COLORS.length] 
      }]);
    }
  };

  const removePlayerSetup = (index) => {
    if (setupPlayers.length > 2) {
      setSetupPlayers(setupPlayers.filter((_, i) => i !== index));
    }
  };

  const calculateWordScore = () => {
    return currentWord.split('').reduce((sum, letter) => sum + (LETTER_VALUES[letter] || 0), 0);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center">Scrabble Tracker</h1>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {page === 'score' && (
          <div className="space-y-4">
            {players.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center shadow-md">
                <Trophy className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Active Game</h2>
                <p className="text-gray-600 mb-4">Start a new game to begin tracking scores</p>
                <button
                  onClick={() => setPage('new-game')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Start New Game
                </button>
              </div>
            ) : (
              <>
                {/* Players */}
                <div className="space-y-2">
                  {players.map((player, index) => (
                    <div
                      key={index}
                      className={`bg-white rounded-lg p-4 shadow-md ${
                        index === currentPlayerIndex ? 'ring-4 ring-green-400' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full"
                            style={{ backgroundColor: player.color }}
                          />
                          <div>
                            <div className="font-semibold text-lg">{player.name}</div>
                            {index === currentPlayerIndex && (
                              <div className="text-sm text-green-600 font-medium">Your Turn</div>
                            )}
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-800">{player.score}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score Buttons */}
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h3 className="font-semibold mb-3">Add Score</h3>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[10, 20, 50, 75, 100].map(points => (
                      <button
                        key={points}
                        onClick={() => addScore(points)}
                        className="bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700"
                      >
                        +{points}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customScore}
                      onChange={(e) => setCustomScore(e.target.value)}
                      placeholder="Custom"
                      className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2"
                    />
                    <button
                      onClick={() => customScore && addScore(parseInt(customScore))}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={undoLastMove}
                    className="bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-700"
                  >
                    <Undo className="w-5 h-5" /> Undo
                  </button>
                  <button
                    onClick={resetGame}
                    className="bg-red-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-700"
                  >
                    <RotateCcw className="w-5 h-5" /> Reset
                  </button>
                </div>

                {/* Move History */}
                {moveHistory.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <h3 className="font-semibold mb-3">Recent Moves</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {moveHistory.slice(0, 5).map((move, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{move.player}</span>
                          <span className="font-semibold text-green-600">+{move.points}</span>
                          <span className="text-gray-400 text-xs">{move.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {page === 'new-game' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold mb-4">New Game Setup</h2>
              
              {/* Players */}
              <div className="space-y-3 mb-4">
                <h3 className="font-semibold">Players</h3>
                {setupPlayers.map((player, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => {
                        const newPlayers = [...setupPlayers];
                        newPlayers[index].name = e.target.value;
                        setSetupPlayers(newPlayers);
                      }}
                      className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2"
                    />
                    <select
                      value={player.color}
                      onChange={(e) => {
                        const newPlayers = [...setupPlayers];
                        newPlayers[index].color = e.target.value;
                        setSetupPlayers(newPlayers);
                      }}
                      className="border-2 border-gray-300 rounded-lg px-2 py-2"
                    >
                      {COLORS.map(color => (
                        <option key={color} value={color} style={{ backgroundColor: color }}>
                          ⬤
                        </option>
                      ))}
                    </select>
                    {setupPlayers.length > 2 && (
                      <button
                        onClick={() => removePlayerSetup(index)}
                        className="text-red-600 p-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addPlayerSetup}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-gray-600 flex items-center justify-center gap-2 hover:border-green-600 hover:text-green-600"
                >
                  <Plus className="w-5 h-5" /> Add Player
                </button>
              </div>

              {/* Target Score */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Target Score</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 150, 200, 250, 300, 500].map(score => (
                    <button
                      key={score}
                      onClick={() => setTargetScore(score)}
                      className={`py-2 rounded-lg font-semibold ${
                        targetScore === score
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Mode */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Game Mode</h3>
                <div className="space-y-2">
                  {['Standard', 'Timed Challenge', 'Tournament'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setGameMode(mode)}
                      className={`w-full py-3 rounded-lg font-semibold ${
                        gameMode === mode
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startNewGame}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700"
              >
                <Play className="w-5 h-5" /> Start New Game
              </button>
            </div>
          </div>
        )}

        {page === 'calculator' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Word Score Calculator</h2>
              
              {/* Display */}
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="text-center text-2xl font-bold mb-2 min-h-8">
                  {currentWord || 'Enter a word'}
                </div>
                <div className="text-center text-4xl font-bold text-green-600">
                  {calculateWordScore()} points
                </div>
              </div>

              {/* Keyboard */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                  <button
                    key={letter}
                    onClick={() => setCurrentWord(currentWord + letter)}
                    className="bg-amber-100 border-2 border-amber-300 rounded p-2 flex flex-col items-center justify-center aspect-square hover:bg-amber-200"
                  >
                    <span className="font-bold text-sm">{letter}</span>
                    <span className="text-xs text-gray-600">{LETTER_VALUES[letter]}</span>
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCurrentWord(currentWord.slice(0, -1))}
                  className="bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-700"
                >
                  <Delete className="w-5 h-5" /> Backspace
                </button>
                <button
                  onClick={() => setCurrentWord('')}
                  className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
                >
                  Clear
                </button>
              </div>

              {currentWord.length >= 7 && (
                <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
                  <span className="text-yellow-800 font-semibold">🎉 Bingo! 7+ letter word!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {page === 'stats' && (
          <div className="space-y-4">
            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-4 shadow-md text-center">
                <div className="text-3xl font-bold text-green-600">{stats.gamesPlayed}</div>
                <div className="text-sm text-gray-600">Games Played</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md text-center">
                <div className="text-3xl font-bold text-blue-600">{formatTime(stats.totalTime)}</div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.highestScore}</div>
                <div className="text-sm text-gray-600">Highest Score</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.avgScore}</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold mb-3">Achievements</h2>
              <div className="space-y-2">
                {ACHIEVEMENTS.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg ${
                      stats.unlockedAchievements.includes(achievement.id)
                        ? 'bg-green-50 border-2 border-green-300'
                        : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{achievement.name}</div>
                        <div className="text-sm text-gray-600">{achievement.desc}</div>
                      </div>
                      {stats.unlockedAchievements.includes(achievement.id) && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game History */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold mb-3">Game History</h2>
              {stats.gameHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No games played yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.gameHistory.slice(0, 10).map((game, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">🏆 {game.winner}</span>
                        <span className="text-sm text-gray-600">{game.date}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Score: {game.score}</span>
                        <span>Time: {formatTime(game.duration)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setPage('score')}
            className={`flex flex-col items-center py-2 rounded-lg ${
              page === 'score' ? 'text-green-600 bg-green-50' : 'text-gray-600'
            }`}
          >
            <Trophy className="w-6 h-6" />
            <span className="text-xs mt-1">Score</span>
          </button>
          <button
            onClick={() => setPage('new-game')}
            className={`flex flex-col items-center py-2 rounded-lg ${
              page === 'new-game' ? 'text-green-600 bg-green-50' : 'text-gray-600'
            }`}
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs mt-1">New Game</span>
          </button>
          <button
            onClick={() => setPage('calculator')}
            className={`flex flex-col items-center py-2 rounded-lg ${
              page === 'calculator' ? 'text-green-600 bg-green-50' : 'text-gray-600'
            }`}
          >
            <Calculator className="w-6 h-6" />
            <span className="text-xs mt-1">Calculator</span>
          </button>
          <button
            onClick={() => setPage('stats')}
            className={`flex flex-col items-center py-2 rounded-lg ${
              page === 'stats' ? 'text-green-600 bg-green-50' : 'text-gray-600'
            }`}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs mt-1">Stats</span>
          </button>
        </div>
      </div>
    </div>
  );

}
