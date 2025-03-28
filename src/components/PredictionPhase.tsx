import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { Player } from '../models/types';

const PredictionPhase: React.FC = () => {
  const { 
    game, 
    currentRound, 
    updatePrediction,
    submitPredictions
  } = useGameContext();

  const [predictions, setPredictions] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentBettingPlayerIndex, setCurrentBettingPlayerIndex] = useState<number>(0);
  
  // Ordine pentru a plasa pariurile
  const [bettingOrder, setBettingOrder] = useState<Player[]>([]);

  useEffect(() => {
    if (game && currentRound && game.players.length > 0) {
      // Reset la începutul rundei
      setPredictions({});
      setError(null);
      
      // Determinăm dealer-ul (ultimul jucător din listă)
      const dealerIndex = (currentRound.dealerIndex);
      
      // Calculăm ordinea de pariere: primul jucător este la dreapta dealer-ului
      const orderedPlayers = [...game.players];
      const firstBettingIndex = (dealerIndex + 1) % game.players.length;
      
      // Reordonăm jucătorii începând cu cel din dreapta dealer-ului
      const reorderedPlayers = [
        ...orderedPlayers.slice(firstBettingIndex),
        ...orderedPlayers.slice(0, firstBettingIndex)
      ];
      
      setBettingOrder(reorderedPlayers);
      setCurrentBettingPlayerIndex(0);
    }
  }, [game, currentRound]);

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

  const handlePredictionSelect = (playerId: string, prediction: number) => {
    const updatedPredictions = { ...predictions, [playerId]: prediction };
    setPredictions(updatedPredictions);
    updatePrediction(playerId, prediction);
    
    // Trecem la următorul jucător
    if (currentBettingPlayerIndex < bettingOrder.length - 1) {
      setCurrentBettingPlayerIndex(currentBettingPlayerIndex + 1);
    }
  };

  const handleSubmit = () => {
    // Validăm că suma predicțiilor nu este egală cu numărul total de mâini
    const totalPredictions = Object.values(predictions).reduce((sum, val) => sum + val, 0);
    
    if (totalPredictions === currentRound.cardsPerPlayer) {
      setError(`Suma pariurilor (${totalPredictions}) nu poate fi egală cu numărul total de mâini (${currentRound.cardsPerPlayer})!`);
      return;
    }
    
    if (Object.keys(predictions).length !== game.players.length) {
      setError('Toți jucătorii trebuie să plaseze un pariu!');
      return;
    }
    
    setError(null);
    submitPredictions(predictions);
  };

  // Verificăm dacă jucătorul curent este dealer-ul (ultimul care pariază)
  const isDealer = (playerId: string) => {
    return playerId === game.players[currentRound.dealerIndex].id;
  };

  // Verificăm dacă un jucător poate paria în acest moment (respectăm ordinea)
  const canBet = (playerId: string) => {
    // Dacă jucătorul a pariat deja, nu mai poate paria din nou
    if (predictions[playerId] !== undefined) {
      return false;
    }

    // Verificăm dacă este rândul acestui jucător să parieze
    if (currentBettingPlayerIndex < bettingOrder.length) {
      return bettingOrder[currentBettingPlayerIndex].id === playerId;
    }

    return false;
  };

  // Calculăm ce numere nu sunt permise pentru dealer în funcție de pariurile deja plasate
  const getRestrictedNumbersForDealer = () => {
    if (Object.keys(predictions).length === game.players.length - 1) {
      const totalPredictions = Object.values(predictions).reduce((sum, val) => sum + val, 0);
      const restrictedNumber = currentRound.cardsPerPlayer - totalPredictions;
      return restrictedNumber >= 0 ? [restrictedNumber] : [];
    }
    return [];
  };

  // Calculează valorile posibile pentru pariu (0 până la numărul de mâini din rundă)
  const getPossibleBets = (playerId: string) => {
    const maxBet = currentRound.cardsPerPlayer;
    const possibleBets = Array.from({ length: maxBet + 1 }, (_, i) => i);
    
    // Pentru dealer, excludem valoarea restricționată
    if (isDealer(playerId)) {
      const restrictedNumbers = getRestrictedNumbersForDealer();
      return possibleBets.filter(bet => !restrictedNumbers.includes(bet));
    }
    
    return possibleBets;
  };

  // Determinăm jucătorul curent care trebuie să parieze
  const currentPlayer = currentBettingPlayerIndex < bettingOrder.length 
    ? bettingOrder[currentBettingPlayerIndex] 
    : null;

  // Calculează progresul predicțiilor
  const predictionProgress = (Object.keys(predictions).length / game.players.length) * 100;

  return (
    <div className="card bg-white dark:bg-dark-card-bg shadow-lg rounded-xl overflow-hidden slide-in-up">
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center p-2 mr-3 rounded-full bg-primary-light dark:bg-primary-light/10 text-primary-color">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  Runda {currentRound.roundNumber}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">Faza de predicții: {currentRound.cardsPerPlayer} mâini</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-color text-white font-medium text-lg">
                {currentRound.cardsPerPlayer}
              </div>
            </div>
          </div>
        </header>
        
        <div className="dealer-info mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="dealer-avatar relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-dark-card-bg rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">Dealer</p>
              <p className="text-neutral-800 dark:text-neutral-200 font-semibold">{game.players[currentRound.dealerIndex].name}</p>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="prediction-progress">
              <div className="text-right mb-1 text-sm text-neutral-600 dark:text-neutral-400">
                Predicții: {Object.keys(predictions).length}/{game.players.length}
              </div>
              <div className="w-36 h-2 bg-neutral-100 dark:bg-dark-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-color transition-all duration-300 ease-out"
                  style={{ width: `${predictionProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {currentPlayer && (
          <div className="current-player-info mb-6 p-4 bg-primary-light/30 dark:bg-primary-light/10 rounded-xl border border-primary-light dark:border-primary-color/20 fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: currentPlayer.color }}></div>
              </div>
              <div>
                <p className="text-primary-dark dark:text-primary-color font-medium">Este rândul lui <span className="font-bold">{currentPlayer.name}</span> să parieze</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Selectează numărul de mâini pe care crezi că le vei câștiga</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="players-list space-y-4 mb-6">
          {bettingOrder.map((player) => {
            const hasPredicted = predictions[player.id] !== undefined;
            const isCurrentPlayer = canBet(player.id);
            const isDealerPlayer = isDealer(player.id);
            
            return (
              <div 
                key={player.id} 
                className={`player-prediction relative p-4 rounded-xl border transition-all duration-300 ${
                  isCurrentPlayer 
                    ? 'bg-primary-light/40 dark:bg-primary-light/10 border-primary-color shadow-md transform scale-102' 
                    : hasPredicted 
                      ? 'bg-neutral-50 dark:bg-dark-surface border-neutral-200 dark:border-dark-border' 
                      : 'bg-white dark:bg-dark-surface border-neutral-200 dark:border-dark-border'
                } ${isDealerPlayer ? 'border-l-4 border-l-amber-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="player-identity flex items-center flex-1">
                    <div 
                      className="w-8 h-8 rounded-full mr-3 flex-shrink-0" 
                      style={{ backgroundColor: player.color }}
                    ></div>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{player.name}</span>
                    {isDealerPlayer && (
                      <span className="dealer-badge ml-2 text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-500 rounded-sm border border-amber-200 dark:border-amber-900/50 font-medium">
                        Dealer
                      </span>
                    )}
                  </div>
                  
                  {hasPredicted && (
                    <div className="prediction-value flex items-center">
                      <div className="py-1 px-2.5 bg-success-light dark:bg-success-light/20 text-success-dark dark:text-success rounded-md font-medium">
                        {predictions[player.id]}
                      </div>
                    </div>
                  )}
                </div>
                
                {isCurrentPlayer && (
                  <div className="bet-buttons mt-4 grid grid-cols-9 sm:grid-cols-11 gap-2 fade-in">
                    {getPossibleBets(player.id).map((betValue) => (
                      <button
                        key={betValue}
                        className="bet-button w-8 h-8 flex items-center justify-center rounded-md transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-color focus:ring-offset-2 dark:focus:ring-offset-dark-card-bg"
                        style={{
                          backgroundColor: isDealerPlayer && getRestrictedNumbersForDealer().includes(betValue) 
                            ? '#f3f4f6' // restricted color
                            : 'var(--primary-color)',
                          color: isDealerPlayer && getRestrictedNumbersForDealer().includes(betValue)
                            ? '#9ca3af' // text color for restricted
                            : 'white',
                          opacity: isDealerPlayer && getRestrictedNumbersForDealer().includes(betValue) ? '0.5' : '1',
                          cursor: isDealerPlayer && getRestrictedNumbersForDealer().includes(betValue) ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => {
                          if (!(isDealerPlayer && getRestrictedNumbersForDealer().includes(betValue))) {
                            handlePredictionSelect(player.id, betValue);
                          }
                        }}
                        disabled={isDealerPlayer && getRestrictedNumbersForDealer().includes(betValue)}
                      >
                        {betValue}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      
        {error && (
          <div className="error-message p-4 mb-6 bg-error-light dark:bg-error-light/10 text-error-dark dark:text-error rounded-lg border border-error/30 fade-in">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
      
        <div className="flex items-center justify-between">
          <div className="md:hidden">
            <div className="prediction-progress">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                Predicții: {Object.keys(predictions).length}/{game.players.length}
              </div>
              <div className="w-28 h-2 bg-neutral-100 dark:bg-dark-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-color transition-all duration-300 ease-out"
                  style={{ width: `${predictionProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <button
            className={`btn btn-primary py-2.5 px-4 rounded-lg transition-all ${
              Object.keys(predictions).length !== game.players.length
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-md'
            }`}
            onClick={handleSubmit}
            disabled={Object.keys(predictions).length !== game.players.length}
          >
            <div className="flex items-center">
              <span>Continuă cu jocul</span>
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

export default PredictionPhase; 