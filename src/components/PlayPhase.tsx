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
      <div className="flex-center h-48">
        <div className="animate-pulse flex space-x-3">
          <div className="h-3 w-3 bg-primary-color rounded-full"></div>
          <div className="h-3 w-3 bg-primary-color rounded-full animate-delay-100"></div>
          <div className="h-3 w-3 bg-primary-color rounded-full animate-delay-200"></div>
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
    <div className="card bg-app-surface shadow-app-elevation-3 animate-fade-in">
      <div className="p-6">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="inline-flex items-center justify-center p-2 mr-3 rounded-full bg-success-surface text-success-color shadow-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-app-text-primary flex items-center">
                  Runda {currentRound.roundNumber}
                  <span className="ml-2 px-2 py-0.5 bg-primary-surface text-primary-color text-sm rounded-full">
                    {currentRound.cardsPerPlayer} cărți
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-app-text-secondary mt-1">Înregistrează rezultatele obținute</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
              <div className="sm:hidden prediction-progress flex-1 mr-4">
                <div className="text-right mb-1 text-xs text-app-text-tertiary">
                  {Object.keys(results).length}/{game.players.length} jucători
                </div>
                <div className="h-2 bg-app-surface-hover rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success-color transition-all duration-300 ease-out"
                    style={{ width: `${resultsProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-success-color text-white font-medium text-lg shadow-2">
                {currentRound.cardsPerPlayer}
              </div>
            </div>
          </div>
        </header>

        <div className="dealer-info mb-5 p-3 rounded-lg bg-app-surface-hover border border-app-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="dealer-avatar relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-warning-400 to-warning-600 text-white shadow-md mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-app-surface rounded-full flex items-center justify-center shadow-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-app-text-tertiary text-xs">Dealer în această rundă</p>
                <p className="text-app-text-primary font-semibold">{game.players[currentRound.dealerIndex].name}</p>
              </div>
            </div>
            
            <div className="hidden sm:block prediction-progress w-36">
              <div className="text-right mb-1 text-xs text-app-text-tertiary">
                {Object.keys(results).length}/{game.players.length} jucători
              </div>
              <div className="h-2 bg-app-surface rounded-full overflow-hidden">
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
              const scoreValue = result !== "" 
                ? (result === prediction ? 5 + result * 2 : 0 - Math.abs(prediction - (result as number)) * 2)
                : null;
                
              return (
                <div 
                  key={player.id} 
                  className={`player-result p-4 rounded-xl border transition-all ${
                    result !== "" 
                      ? result === prediction 
                        ? 'border-success-color bg-success-surface/20' 
                        : 'border-error-color bg-error-surface/20'
                      : 'border-app-border bg-app-surface-hover'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="player-identity flex items-center mb-4 sm:mb-0">
                      <div 
                        className="w-11 h-11 rounded-full mr-3 flex-shrink-0 ring-2 ring-app-border dark:ring-opacity-30" 
                        style={{ backgroundColor: player.color }}
                      ></div>
                      <div>
                        <h3 className="font-semibold text-app-text-primary">{player.name}</h3>
                        <div className="flex items-center mt-1 flex-wrap gap-2">
                          <div className="badge badge-primary">
                            <span>Predicție: {prediction}</span>
                          </div>
                          
                          {scoreValue !== null && (
                            <div className={`badge ${
                              scoreValue > 0 
                                ? 'badge-success' 
                                : 'badge-error'
                            }`}>
                              <span>Scor: {scoreValue}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="result-selector">
                      <div className="text-center sm:text-right mb-2 text-sm text-app-text-secondary">
                        Tricuri câștigate:
                      </div>
                      <div className="result-buttons grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {Array.from({ length: maxTricks + 1 }, (_, i) => i).map((value) => (
                          <button
                            key={value}
                            className={`w-10 h-10 rounded-lg transition-all focus:outline-none text-base ${
                              results[player.id] === value
                                ? 'bg-success-color text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                                : 'bg-app-surface text-app-text-primary hover:bg-app-surface-hover active:bg-app-surface-active shadow-1'
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
          <div className="error-message p-4 mb-6 bg-error-surface text-error-color rounded-lg border border-error-border flex items-center animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="btn btn-success flex items-center px-6"
            disabled={Object.keys(results).length !== game.players.length}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Finalizează runda
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayPhase; 