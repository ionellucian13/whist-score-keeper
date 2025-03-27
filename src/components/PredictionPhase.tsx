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
    return <div>Loading...</div>;
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

  return (
    <div className="prediction-phase p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        Runda {currentRound.roundNumber}: {currentRound.cardsPerPlayer} mâini
      </h2>
      
      <p className="mb-4">
        Dealer: <span className="font-medium">{game.players[currentRound.dealerIndex].name}</span>
      </p>
      
      {currentPlayer && (
        <div className="mb-4 p-2 bg-yellow-100 rounded border border-yellow-300">
          <p className="font-medium">Este rândul lui {currentPlayer.name} să parieze</p>
        </div>
      )}
      
      <div className="players-list mb-4">
        {bettingOrder.map((player) => (
          <div 
            key={player.id} 
            className={`player-prediction mb-4 p-3 rounded border ${
              canBet(player.id) ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
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
              
              {predictions[player.id] !== undefined && (
                <div className="prediction-badge px-2 py-1 bg-green-100 text-green-800 rounded">
                  Pariu: {predictions[player.id]}
                </div>
              )}
            </div>
            
            {canBet(player.id) && (
              <div className="bet-buttons flex flex-wrap gap-2 mt-2">
                {getPossibleBets(player.id).map((betValue) => (
                  <button
                    key={betValue}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
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
        <div className="error-message p-2 mb-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleSubmit}
          disabled={Object.keys(predictions).length !== game.players.length}
        >
          Continuă cu jocul
        </button>
      </div>
    </div>
  );
};

export default PredictionPhase; 