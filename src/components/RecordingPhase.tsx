import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { Player } from '../models/types';

const RecordingPhase: React.FC = () => {
  const { 
    game, 
    currentRound, 
    updateTrickWinner,
    submitTrickWinner
  } = useGameContext();

  const [currentTrickIndex, setCurrentTrickIndex] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [trickWinners, setTrickWinners] = useState<Record<number, string>>({});
  const [currentTrickCards, setCurrentTrickCards] = useState<Record<string, string>>({});
  const [currentTrickSuit, setCurrentTrickSuit] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  useEffect(() => {
    if (game && currentRound) {
      setCurrentTrickIndex(0);
      setCurrentPlayerIndex(0);
      setError(null);
      setTrickWinners({});
      setCurrentTrickCards({});
      setCurrentTrickSuit(null);
      setSelectedWinner(null);
    }
  }, [game, currentRound]);

  if (!game || !currentRound) {
    return <div>Loading...</div>;
  }

  const handleCardSelect = (playerId: string, card: string) => {
    if (isSubmitting) return;

    const suit = card.split(' ')[0];
    if (!currentTrickSuit) {
      setCurrentTrickSuit(suit);
    }

    setCurrentTrickCards(prev => ({
      ...prev,
      [playerId]: card
    }));

    if (currentPlayerIndex < game.players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      // Toți jucătorii au jucat, trebuie să determinăm câștigătorul
      const validWinners = game.players.filter(player => {
        const playerCard = currentTrickCards[player.id];
        if (!playerCard) return false;
        const playerSuit = playerCard.split(' ')[0];
        return playerSuit === currentTrickSuit;
      });

      if (validWinners.length === 0) {
        setError('Nu există câștigător valid pentru această mână!');
        return;
      }

      setSelectedWinner(validWinners[0].id);
      setShowConfirmation(true);
    }
  };

  const handleWinnerConfirm = async () => {
    if (!selectedWinner) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitTrickWinner(selectedWinner);
      setTrickWinners(prev => ({
        ...prev,
        [currentTrickIndex]: selectedWinner
      }));

      if (currentTrickIndex < currentRound.cardsPerPlayer - 1) {
        setCurrentTrickIndex(currentTrickIndex + 1);
        setCurrentPlayerIndex(0);
        setCurrentTrickCards({});
        setCurrentTrickSuit(null);
        setSelectedWinner(null);
      }
    } catch (err) {
      setError('A apărut o eroare la înregistrarea câștigătorului!');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handleWinnerCancel = () => {
    setShowConfirmation(false);
    setSelectedWinner(null);
  };

  const getCurrentPlayer = () => {
    return game.players[currentPlayerIndex];
  };

  const getPlayerCards = (playerId: string) => {
    return currentRound.playerCards[playerId] || [];
  };

  const isPlayerTurn = (playerId: string) => {
    return currentPlayerIndex < game.players.length && 
           game.players[currentPlayerIndex].id === playerId;
  };

  const hasPlayedCard = (playerId: string) => {
    return currentTrickCards[playerId] !== undefined;
  };

  const getCardColor = (card: string) => {
    const suit = card.split(' ')[0];
    switch (suit) {
      case 'Inimă':
        return 'text-red-600';
      case 'Caro':
        return 'text-blue-600';
      case 'Treflă':
        return 'text-green-600';
      case 'Pik':
        return 'text-black';
      default:
        return 'text-gray-700';
    }
  };

  const isCardValid = (card: string) => {
    if (!currentTrickSuit) return true;
    const cardSuit = card.split(' ')[0];
    return cardSuit === currentTrickSuit;
  };

  const isCardPlayable = (card: string) => {
    if (!currentTrickSuit) return true;
    const playerCards = getPlayerCards(getCurrentPlayer().id);
    return playerCards.some((c: string) => c.split(' ')[0] === currentTrickSuit) 
      ? card.split(' ')[0] === currentTrickSuit 
      : true;
  };

  return (
    <div className="recording-phase">
      {/* Banner distinctiv pentru faza de înregistrare */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg shadow-lg mb-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Faza de Înregistrare</h2>
              <p className="text-sm opacity-90">Runda {currentRound.roundNumber}: Mâna {currentTrickIndex + 1} din {currentRound.cardsPerPlayer}</p>
            </div>
            <div className="bg-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              Dealer: <span className="font-bold">{game.players[currentRound.dealerIndex].name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 bg-white rounded-lg shadow">
        {currentPlayerIndex < game.players.length && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
              <p className="font-medium text-blue-800">
                Este rândul lui {getCurrentPlayer().name} să joace
              </p>
            </div>
          </div>
        )}

        <div className="players-list mb-4">
          {game.players.map((player) => (
            <div 
              key={player.id}
              className={`player-section mb-4 p-4 rounded-lg border transition-all duration-200 ${
                isPlayerTurn(player.id)
                  ? 'border-blue-400 bg-blue-50 shadow-sm'
                  : hasPlayedCard(player.id)
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: player.color }}
                  ></span>
                  <span className="font-medium">{player.name}</span>
                </div>
                {hasPlayedCard(player.id) && (
                  <div className="text-sm font-medium text-green-800">
                    A jucat
                  </div>
                )}
              </div>

              <div className="cards-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {getPlayerCards(player.id).map((card: string, index: number) => (
                  <button
                    key={index}
                    className={`card-button p-2 rounded-lg text-center transition-all duration-200 ${
                      getCardColor(card)
                    } ${
                      hasPlayedCard(player.id)
                        ? 'opacity-50 cursor-not-allowed'
                        : isPlayerTurn(player.id) && isCardPlayable(card)
                          ? 'hover:bg-blue-100'
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => handleCardSelect(player.id, card)}
                    disabled={!isPlayerTurn(player.id) || hasPlayedCard(player.id) || !isCardPlayable(card)}
                  >
                    {card}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Confirmă câștigătorul</h3>
              <p className="mb-4">
                Câștigătorul mâinii este: <span className="font-bold">
                  {game.players.find(p => p.id === selectedWinner)?.name}
                </span>
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                  onClick={handleWinnerCancel}
                >
                  Anulează
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={handleWinnerConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Se salvează...' : 'Confirmă'}
                </button>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default RecordingPhase; 