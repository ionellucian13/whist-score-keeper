import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { calculateTotalRounds } from '../utils/gameUtils';
import { Player } from '../types';
import { RoundModal } from './RoundModal';

interface RoundModalProps {
  players: Player[];
  onComplete: (scores: Record<string, number>) => void;
  onCancel: () => void;
}

export const Scoreboard: React.FC = () => {
  const {
    players,
    gameType,
    currentRound,
    setCurrentRound,
    completeGame,
    setPlayers,
  } = useGame();
  
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [roundScores, setRoundScores] = useState<Record<string, number>>({});

  const totalRounds = useMemo(() => {
    if (!gameType || !players.length) return 0;
    return calculateTotalRounds(gameType, players.length);
  }, [gameType, players.length]);

  const handleRoundComplete = (scores: Record<string, number>) => {
    setShowRoundModal(false);
    setRoundScores({});
    
    // Update players with new scores
    const updatedPlayers = players.map(player => ({
      ...player,
      score: player.score + (scores[player.id] || 0),
      rounds: [...player.rounds, scores[player.id] || 0],
    }));
    
    setPlayers(updatedPlayers);
    
    if (currentRound === totalRounds) {
      // If this was the last round, complete the game
      completeGame();
    } else {
      // Otherwise, move to the next round
      setCurrentRound(currentRound + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Runda {currentRound}/{totalRounds}</h2>
        <button
          onClick={() => setShowRoundModal(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Adaugă Scor
        </button>
      </div>

      <div className="space-y-4">
        {players.map((player) => (
          <div key={player.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
            <span>{player.name}</span>
            <span className="font-semibold">{player.score} puncte</span>
          </div>
        ))}
      </div>

      {showRoundModal && (
        <RoundModal
          players={players}
          onComplete={handleRoundComplete}
          onCancel={() => setShowRoundModal(false)}
        />
      )}
    </div>
  );
}; 