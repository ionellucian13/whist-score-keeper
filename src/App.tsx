import React from 'react';
import { GameSetup } from './components/GameSetup';
import { Scoreboard } from './components/Scoreboard';
import { GameComplete } from './components/GameComplete';
import { useGame } from './context/GameContext';

function App() {
  const {
    players,
    gameType,
    isGameComplete,
    playerStats,
    resetGame,
    continueWithSamePlayers,
    handleGameTypeSelection,
  } = useGame();

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                {!players.length || !gameType ? (
                  <GameSetup />
                ) : (
                  <Scoreboard />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isGameComplete && (
        <GameComplete
          players={players}
          onContinueWithSamePlayers={continueWithSamePlayers}
          onStartNewGame={resetGame}
          onSelectGameType={handleGameTypeSelection}
          playerStats={playerStats}
        />
      )}
    </div>
  );
}

export default App; 