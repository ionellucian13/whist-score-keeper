import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { Player } from '../models/types';

const PlayPhase: React.FC = () => {
  const { 
    game, 
    currentRound, 
    finishRound 
  } = useGameContext();

  const [results, setResults] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  if (!game || !currentRound) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary-color rounded-full"></div>
          <div className="h-3 w-3 bg-primary-color rounded-full"></div>
          <div className="h-3 w-3 bg-primary-color rounded-full"></div>
        </div>
      </div>
    );
  }

  const handleResultChange = (playerId: string, value: number) => {
    setResults(prev => ({
      ...prev,
      [playerId]: value
    }));
  };

  const handleSubmit = () => {
    // Verificăm că avem rezultate pentru toți jucătorii
    if (Object.keys(results).length !== game.players.length) {
      setError('Trebuie să introduci rezultatele pentru toți jucătorii!');
      return;
    }

    // Verificăm că suma rezultatelor este egală cu numărul total de mâini
    const totalResults = Object.values(results).reduce((sum, val) => sum + val, 0);
    if (totalResults !== currentRound.cardsPerPlayer) {
      setError(`Suma rezultatelor (${totalResults}) trebuie să fie egală cu numărul de mâini (${currentRound.cardsPerPlayer})!`);
      return;
    }

    setError(null);
    finishRound(results);
  };

  // Calculează progresul introducerii rezultatelor
  const resultsProgress = (Object.keys(results).length / game.players.length) * 100;

  // Calculează numărul maxim de tricuri pentru un jucător
  const maxTricks = currentRound.cardsPerPlayer;

  return (
    <div className="card bg-app-surface shadow-app-elevation-2 rounded-radius-xl overflow-hidden">
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center p-2 mr-3 rounded-full bg-success-surface text-success-color">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-app-text-primary">
                  Runda {currentRound.roundNumber}
                </h2>
                <p className="text-app-text-secondary">Înregistrează rezultatele: {currentRound.cardsPerPlayer} mâini</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-success-color text-white font-medium text-lg">
                {currentRound.cardsPerPlayer}
              </div>
            </div>
          </div>
        </header>

        <div className="dealer-info mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="dealer-avatar relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-warning-400 to-warning-600 text-white shadow-md mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-app-surface rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-app-text-tertiary text-sm">Dealer</p>
              <p className="text-app-text-primary font-semibold">{game.players[currentRound.dealerIndex].name}</p>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="prediction-progress">
              <div className="text-right mb-1 text-sm text-app-text-tertiary">
                Rezultate: {Object.keys(results).length}/{game.players.length}
              </div>
              <div className="w-36 h-2 bg-app-surface-hover rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success-color transition-all duration-300 ease-out"
                  style={{ width: `${resultsProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="info-card p-4 bg-info-surface text-info-color border border-info-border rounded-xl mb-6">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Înregistrează numărul de mâini câștigate</p>
              <p className="text-sm mt-1 opacity-80">Suma totală a mâinilor câștigate trebuie să fie egală cu numărul de mâini din rundă: {currentRound.cardsPerPlayer}</p>
            </div>
          </div>
        </div>

        <div className="players-results">
          <div className="grid grid-cols-1 gap-4 mb-6">
            {game.players.map((player: Player) => {
              const prediction = currentRound.predictions?.[player.id] || 0;
              const result = results[player.id] !== undefined ? results[player.id] : "";
              const score = result !== "" 
                ? (result === prediction ? 10 + result * 2 : 0 - Math.abs(prediction - (result as number)) * 2)
                : null;
                
              return (
                <div 
                  key={player.id} 
                  className="player-result p-4 rounded-xl border border-app-border bg-app-surface-hover"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="player-identity flex items-center mb-3 md:mb-0">
                      <div 
                        className="w-10 h-10 rounded-full mr-3 flex-shrink-0" 
                        style={{ backgroundColor: player.color }}
                      ></div>
                      <div>
                        <h3 className="font-medium text-app-text-primary">{player.name}</h3>
                        <div className="flex items-center mt-1">
                          <div className="prediction-badge px-2 py-0.5 rounded bg-primary-surface text-primary-color text-sm mr-3">
                            <span className="font-medium">Predicție: {prediction}</span>
                          </div>
                          
                          {score !== null && (
                            <div className={`score-badge px-2 py-0.5 rounded text-sm ${
                              score > 0 
                                ? 'bg-success-surface text-success-color' 
                                : 'bg-error-surface text-error-color'
                            }`}>
                              <span className="font-medium">Scor: {score}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="result-selector flex items-center">
                      <span className="text-app-text-secondary mr-3 whitespace-nowrap">Tricuri câștigate:</span>
                      <div className="result-buttons grid grid-cols-6 sm:grid-cols-8 gap-2">
                        {Array.from({ length: maxTricks + 1 }, (_, i) => i).map((value) => (
                          <button
                            key={value}
                            className={`btn-result w-8 h-8 rounded-lg transition-all focus:outline-none ${
                              results[player.id] === value
                                ? 'bg-success-color text-white' 
                                : 'bg-app-surface text-app-text-primary hover:bg-app-surface-hover active:bg-app-surface-active'
                            }`}
                            onClick={() => handleResultChange(player.id, value)}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {error && (
          <div className="error-message p-4 mb-6 bg-error-surface text-error-color rounded-lg border border-error-border flex items-center fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="md:hidden">
            <div className="result-progress">
              <div className="text-sm text-app-text-tertiary mb-1">
                Rezultate: {Object.keys(results).length}/{game.players.length}
              </div>
              <div className="w-28 h-2 bg-app-surface-hover rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success-color transition-all duration-300 ease-out"
                  style={{ width: `${resultsProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <button
            className={`btn btn-success py-2.5 px-4 rounded-lg transition-all ${
              Object.keys(results).length !== game.players.length
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-md'
            }`}
            onClick={handleSubmit}
            disabled={Object.keys(results).length !== game.players.length}
          >
            <div className="flex items-center">
              <span>Finalizează runda</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayPhase; 