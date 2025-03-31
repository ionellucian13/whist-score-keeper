import React, { useState, useEffect, useCallback } from 'react';
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
  
  // Funcția pentru verificarea bonusurilor de consecvență, înfășurată în useCallback
  const checkConsecutiveBonuses = useCallback(() => {
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
  }, [game, currentRound, currentRoundPredictions, tricks]);

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
    return <div>Loading...</div>;
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
  
  // Partea asta cu return se execută doar când știm sigur că game și currentRound nu sunt null
  return (
    <div className="tricks-phase">
      {/* Banner distinctiv pentru faza de înregistrare pariuri */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg shadow-lg mb-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Faza de Înregistrare Pariuri</h2>
              <p className="text-sm opacity-90">Runda {currentRound.roundNumber}: {currentRound.cardsPerPlayer} mâini</p>
            </div>
            <div className="bg-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              Dealer: <span className="font-bold">{game.players[currentRound.dealerIndex].name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 bg-white rounded-lg shadow min-h-[calc(100vh-12rem)] flex flex-col">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-[pulse_2s_ease-in-out_infinite]"></div>
              <p className="text-blue-800">
                <span className="font-medium">Mâini rămase:</span> {getRemainingTricks()}
              </p>
            </div>
          </div>
        </div>

        {bonusMessages.length > 0 && (
          <div className="bonus-messages mb-4">
            {bonusMessages.map((message, index) => (
              <div key={index} className="p-2 mb-2 bg-yellow-100 text-yellow-800 rounded">
                {message}
              </div>
            ))}
          </div>
        )}

        <div className="players-list mb-4 flex-grow">
          {playerOrder.map(player => {
            const prediction = getPlayerPrediction(player.id);
            const playerTricks = tricks[player.id] || 0;
            
            return (
              <div 
                key={player.id} 
                className={`player-tricks mb-4 p-4 rounded-lg border transition-all duration-200 ${
                  isDealer(player.id) ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="player-info flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: player.color }}
                    ></span>
                    <span className="font-medium">{player.name}</span>
                    {isDealer(player.id) && (
                      <span className="ml-2 text-sm text-red-600">(Dealer)</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      Predicție: <span className="font-medium">{prediction}</span>
                    </span>
                    
                    {playerTricks > 0 && 
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isPredictionCorrect(player.id) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isPredictionCorrect(player.id) ? 'Corect ✓' : 'Incorect ✗'}
                      </span>
                    }
                  </div>
                </div>
                
                <div className="tricks-buttons flex flex-wrap gap-2">
                  {getPossibleTricksValues(player.id).map((value) => (
                    <button
                      key={value}
                      className={`px-4 py-2 rounded-full transition-all duration-200 ${
                        tricks[player.id] === value
                          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm'
                      }`}
                      onClick={() => handleTricksSelect(player.id, value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="error-message p-3 mb-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-auto">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
            onClick={handleSubmit}
            disabled={!allTricksRecorded()}
          >
            Finalizează runda
          </button>
        </div>
      </div>
    </div>
  );
};

export default TricksPhase; 