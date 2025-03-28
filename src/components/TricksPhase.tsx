import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { checkConsecutiveRounds } from '../utils/gameUtils';
import { Player, Round } from '../models/types';

const TricksPhase: React.FC = () => {
  const { 
    game, 
    currentRound, 
    updateTricksWon, 
    submitRound, 
    undoLastAction,
    currentRoundPredictions
  } = useGameContext();
  
  const [tricks, setTricks] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [bonusMessages, setBonusMessages] = useState<string[]>([]);
  
  // Ordine pentru a afișa jucătorii (aceeași ca în faza de predicție)
  const [playerOrder, setPlayerOrder] = useState<Player[]>([]);
  
  // Inițializăm ordinea jucătorilor în același mod ca în PredictionPhase
  useEffect(() => {
    if (game && currentRound && game.players.length > 0) {
      // Determinăm dealer-ul
      const dealerIndex = currentRound.dealerIndex;
      
      // Calculăm ordinea jucătorilor: primul jucător este la dreapta dealer-ului
      const orderedPlayers = [...game.players];
      const firstPlayerIndex = (dealerIndex + 1) % game.players.length;
      
      // Reordonăm jucătorii începând cu cel din dreapta dealer-ului
      const reorderedPlayers = [
        ...orderedPlayers.slice(firstPlayerIndex),
        ...orderedPlayers.slice(0, firstPlayerIndex)
      ];
      
      setPlayerOrder(reorderedPlayers);
    }
  }, [game, currentRound]);

  // Verificăm dacă toate mâinile au fost distribuite/înregistrate
  const allTricksRecorded = (): boolean => {
    if (!currentRound) return false;
    
    // Obținem suma tuturor mâinilor câștigătoare înregistrate
    const totalTricksRecorded = Object.values(tricks).reduce((sum, val) => sum + val, 0);
    
    // Verificăm dacă toate mâinile au fost înregistrate
    return totalTricksRecorded === currentRound.cardsPerPlayer;
  };
  
  // Funcția pentru verificarea bonusurilor de consecvență
  const checkConsecutiveBonuses = () => {
    if (!game || !currentRound) return;
    
    const messages: string[] = [];
    
    // Creăm un joc temporar cu runda curentă
    const tempRound: Round = {
      ...currentRound,
      results: game.players.map(player => {
        const prediction = currentRoundPredictions.get(player.id) || 0;
        const tricksWon = tricks[player.id] || 0;
        const score = prediction === tricksWon ? 5 + tricksWon : -Math.abs(prediction - tricksWon);
        
        return {
          playerId: player.id,
          prediction,
          tricksWon,
          score,
          hasReceivedConsecutiveBonus: false
        };
      })
    };
    
    const tempGame = {
      ...game,
      rounds: [...game.rounds, tempRound]
    };
    
    // Verificăm bonusurile pentru fiecare jucător
    game.players.forEach(player => {
      const { message } = checkConsecutiveRounds(tempGame, player.id);
      if (message) {
        messages.push(message);
      }
    });
    
    setBonusMessages(messages);
  };

  // Inițializare valori
  useEffect(() => {
    if (game && game.players) {
      const initialTricks = game.players.reduce((acc, player) => {
        acc[player.id] = 0;
        return acc;
      }, {} as Record<string, number>);
      
      setTricks(initialTricks);
      setError(null);
    }
  }, [game]);
  
  // Recalculăm bonusurile când se schimbă mâinile câștigătoare
  useEffect(() => {
    if (game && tricks && currentRound) {
      if (Object.values(tricks).reduce((sum, val) => sum + val, 0) === currentRound.cardsPerPlayer) {
        checkConsecutiveBonuses();
      } else {
        setBonusMessages([]);
      }
    }
  }, [tricks, game, currentRound, checkConsecutiveBonuses]);

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

  // Verifică dacă jucătorul este dealer-ul
  const isDealer = (playerId: string) => {
    return playerId === game.players[currentRound.dealerIndex].id;
  };

  // Selectează numărul de mâini câștigate de un jucător
  const handleTricksSelect = (playerId: string, value: number) => {
    // Verificăm dacă noul total ar depăși numărul total de mâini disponibile
    const otherPlayersTricks = Object.entries(tricks)
      .filter(([id]) => id !== playerId)
      .reduce((sum, [_, val]) => sum + val, 0);
      
    if (value + otherPlayersTricks > currentRound.cardsPerPlayer) {
      setError(`Numărul total de mâini câștigătoare nu poate depăși ${currentRound.cardsPerPlayer}!`);
      return;
    }
    
    setError(null);
    const updatedTricks = { ...tricks, [playerId]: value };
    setTricks(updatedTricks);
    updateTricksWon(playerId, value);
  };

  // Submit pentru finalizarea rundei
  const handleSubmit = () => {
    // Verificăm dacă toate mâinile au fost distribuite corect
    const totalTricksRecorded = Object.values(tricks).reduce((sum, val) => sum + val, 0);
    
    if (totalTricksRecorded !== currentRound.cardsPerPlayer) {
      setError(`Numărul total de mâini câștigătoare trebuie să fie exact ${currentRound.cardsPerPlayer}!`);
      return;
    }
    
    setError(null);
    submitRound(tricks);
  };

  // Calculează câte mâini mai sunt de distribuit
  const getRemainingTricks = (): number => {
    const recordedTricks = Object.values(tricks).reduce((sum, val) => sum + val, 0);
    return currentRound.cardsPerPlayer - recordedTricks;
  };
  
  // Calculează valorile posibile pentru numărul de mâini câștigătoare 
  const getPossibleTricksValues = (playerId: string): number[] => {
    if (!currentRound) return [0];
    
    const maxPossible = currentRound.cardsPerPlayer;
    // Creează un array cu valorile de la 0 la maxPossible
    return Array.from({ length: maxPossible + 1 }, (_, i) => i);
  };
  
  // Găsești predicția jucătorului pentru runda curentă
  const getPlayerPrediction = (playerId: string): number | string => {
    if (!game || !currentRound) return '?';
    
    // În faza de înregistrare a mâinilor câștigătoare, obținem predicțiile din context
    const prediction = currentRoundPredictions.get(playerId);
    
    if (prediction !== undefined) {
      return prediction;
    }
    
    // Dacă nu găsim în context, încercăm să găsim în runde (pentru compatibilitate)
    const roundIndex = game.rounds.findIndex(r => r.roundNumber === currentRound.roundNumber);
    if (roundIndex < 0 || roundIndex >= game.rounds.length) return '?';
    
    return game.rounds[roundIndex].results.find(r => r.playerId === playerId)?.prediction || '?';
  };
  
  // Verifică dacă predicția a fost corectă
  const isPredictionCorrect = (playerId: string): boolean => {
    const prediction = getPlayerPrediction(playerId);
    const tricksWon = tricks[playerId] || 0;
    
    return prediction === tricksWon;
  };
  
  // Calculează progresul distribuirii mâinilor
  const getTricksProgress = (): number => {
    const totalTricksRecorded = Object.values(tricks).reduce((sum, val) => sum + val, 0);
    return (totalTricksRecorded / currentRound.cardsPerPlayer) * 100;
  };
  
  return (
    <div className="card bg-white dark:bg-dark-card-bg shadow-lg rounded-xl overflow-hidden slide-in-up">
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center p-2 mr-3 rounded-full bg-success-light dark:bg-success-light/10 text-success-dark dark:text-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  Runda {currentRound.roundNumber}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">Înregistrarea mâinilor câștigate: {currentRound.cardsPerPlayer} mâini</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-success-dark text-white font-medium text-lg">
                {currentRound.cardsPerPlayer}
              </div>
            </div>
          </div>
        </header>
        
        <div className="round-info mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-success-light/30 dark:bg-success-light/10 rounded-xl border border-success-light/70 dark:border-success-dark/20">
              <div className="flex items-center">
                <div className="dealer-avatar relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs">Dealer</p>
                  <p className="text-neutral-800 dark:text-neutral-200 font-medium">{game.players[currentRound.dealerIndex].name}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-primary-light/30 dark:bg-primary-light/10 rounded-xl border border-primary-light/70 dark:border-primary-dark/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs">Mâini rămase de distribuit</p>
                  <div className="flex items-center mt-1">
                    <span className="text-neutral-800 dark:text-neutral-200 font-bold text-lg">{getRemainingTricks()}</span>
                    <span className="text-neutral-600 dark:text-neutral-400 text-sm ml-1">/ {currentRound.cardsPerPlayer}</span>
                  </div>
                </div>
                
                <div className="tricks-progress">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-dark-surface border-4 border-primary-color">
                    <span className="text-primary-color font-bold text-lg">
                      {Math.round(getTricksProgress())}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {bonusMessages.length > 0 && (
          <div className="bonus-messages mb-6 space-y-2">
            {bonusMessages.map((message, index) => (
              <div 
                key={index} 
                className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800/30 flex items-center fade-in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{message}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="player-list space-y-4 mb-6">
          {playerOrder.map(player => {
            const prediction = getPlayerPrediction(player.id);
            const playerTricks = tricks[player.id] || 0;
            
            return (
              <div 
                key={player.id} 
                className={`player-tricks p-4 rounded-xl border transition-all hover:shadow-sm ${
                  isDealer(player.id) 
                    ? 'border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-800/50'
                    : 'border-neutral-200 dark:border-dark-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="player-info flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full mr-3 flex-shrink-0" 
                      style={{ backgroundColor: player.color }}
                    ></div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">{player.name}</span>
                        {isDealer(player.id) && (
                          <span className="dealer-badge ml-2 text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-500 rounded-sm border border-amber-200 dark:border-amber-900/50 font-medium">
                            Dealer
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Predicție: <span className="font-medium">{prediction}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 items-center sm:justify-end">
                    <div className={`prediction-status px-3 py-1 rounded-md text-sm mr-3 ${
                      isPredictionCorrect(player.id)
                        ? 'bg-success-light dark:bg-success-light/20 text-success-dark dark:text-success' 
                        : 'bg-neutral-100 dark:bg-dark-surface text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {isPredictionCorrect(player.id) 
                        ? 'Corect'
                        : playerTricks > 0 ? 'Incorect' : 'În desfășurare'
                      }
                    </div>
                    
                    <div className="tricks-selector flex items-center space-x-1.5">
                      {getPossibleTricksValues(player.id).map(value => (
                        <button
                          key={value}
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                            tricks[player.id] === value
                              ? 'bg-success-dark text-white font-medium shadow-sm'
                              : 'bg-neutral-100 dark:bg-dark-surface text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-dark-border'
                          }`}
                          onClick={() => handleTricksSelect(player.id, value)}
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
        
        {error && (
          <div className="error-message p-4 mb-6 bg-error-light dark:bg-error-light/10 text-error-dark dark:text-error rounded-lg border border-error/30 flex items-center fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            className="btn btn-secondary py-2 px-4 rounded-lg text-sm flex items-center justify-center"
            onClick={undoLastAction}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Înapoi la predicții
          </button>
          
          <button
            className={`btn btn-primary py-2.5 px-5 rounded-lg ${!allTricksRecorded() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
            onClick={handleSubmit}
            disabled={!allTricksRecorded()}
          >
            <div className="flex items-center">
              <span>Finalizează runda</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TricksPhase; 