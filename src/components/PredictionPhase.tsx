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
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  
  // Ordine pentru a plasa pariurile
  const [bettingOrder, setBettingOrder] = useState<Player[]>([]);

  useEffect(() => {
    if (game && currentRound && game.players.length > 0) {
      // Reset la începutul rundei
      setPredictions({});
      setError(null);
      setEditingPlayerId(null);
      
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
    return <div>Loading...</div>;
  }

  const handlePredictionSelect = (playerId: string, prediction: number) => {
    const updatedPredictions = { ...predictions, [playerId]: prediction };
    setPredictions(updatedPredictions);
    updatePrediction(playerId, prediction);
    
    // Dacă suntem în modul de editare, revenim la modul normal
    if (editingPlayerId === playerId) {
      setEditingPlayerId(null);
      return;
    }
    
    // Trecem la următorul jucător doar dacă nu suntem în modul de editare
    if (currentBettingPlayerIndex < bettingOrder.length - 1) {
      setCurrentBettingPlayerIndex(currentBettingPlayerIndex + 1);
    }
  };

  const handleEditPrediction = (playerId: string) => {
    setEditingPlayerId(playerId);
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
    // Dacă suntem în modul de editare, doar jucătorul editat poate paria
    if (editingPlayerId) {
      return editingPlayerId === playerId;
    }

    // Dacă jucătorul a pariat deja și nu suntem în modul de editare, nu poate paria
    if (predictions[playerId] !== undefined && !editingPlayerId) {
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

  return (
    <div className="prediction-phase">
      {/* Banner distinctiv pentru faza de predicție */}
      <div className="bg-purple-600 text-white p-4 rounded-t-lg shadow-lg mb-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Faza de Predicție</h2>
              <p className="text-sm opacity-90">Runda {currentRound.roundNumber}: {currentRound.cardsPerPlayer} mâini</p>
            </div>
            <div className="bg-purple-700 px-4 py-2 rounded-full text-sm font-medium">
              Dealer: <span className="font-bold">{game.players[currentRound.dealerIndex].name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 bg-white rounded-lg shadow">
        {currentPlayer && !editingPlayerId && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse"></div>
              <p className="font-medium text-purple-800">Este rândul lui {currentPlayer.name} să parieze</p>
            </div>
          </div>
        )}
        
        {editingPlayerId && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
              <p className="font-medium text-blue-800">Modifică pariul pentru {game.players.find(p => p.id === editingPlayerId)?.name}</p>
            </div>
          </div>
        )}
        
        <div className="players-list mb-4">
          {bettingOrder.map((player) => (
            <div 
              key={player.id} 
              className={`player-prediction mb-4 p-4 rounded-lg border transition-all duration-200 ${
                canBet(player.id) 
                  ? 'border-purple-400 bg-purple-50 shadow-sm' 
                  : predictions[player.id] !== undefined 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
              } ${isDealer(player.id) ? 'border-red-400' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: player.color }}
                  ></span>
                  <span className="font-medium">{player.name}</span>
                  {isDealer(player.id) && (
                    <span className="ml-2 text-sm text-red-600">(Dealer)</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {predictions[player.id] !== undefined && (
                    <div className="prediction-badge px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Pariu: {predictions[player.id]}
                    </div>
                  )}
                  {predictions[player.id] !== undefined && !editingPlayerId && (
                    <button
                      onClick={() => handleEditPrediction(player.id)}
                      className="p-1.5 text-purple-600 hover:text-purple-800 transition-colors bg-purple-100 rounded-full hover:bg-purple-200"
                      title="Modifică pariul"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {canBet(player.id) && (
                <div className="bet-buttons flex flex-wrap gap-2 mt-2">
                  {getPossibleBets(player.id).map((betValue) => (
                    <button
                      key={betValue}
                      className={`px-4 py-2 rounded-full transition-all duration-200 ${
                        predictions[player.id] === betValue
                          ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                          : 'bg-purple-500 text-white hover:bg-purple-600 shadow-sm'
                      }`}
                      onClick={() => handlePredictionSelect(player.id, betValue)}
                    >
                      {betValue}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
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
        
        <div className="flex justify-end">
          <button
            className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
            onClick={handleSubmit}
            disabled={Object.keys(predictions).length !== game.players.length || editingPlayerId !== null}
          >
            Continuă cu jocul
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionPhase; 