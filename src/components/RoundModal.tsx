import React, { useState } from 'react';
import { Player } from '../types';

interface RoundModalProps {
  players: Player[];
  onComplete: (scores: Record<string, number>) => void;
  onCancel: () => void;
}

export const RoundModal: React.FC<RoundModalProps> = ({ players, onComplete, onCancel }) => {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    players.forEach(player => {
      initial[player.id] = 0;
    });
    return initial;
  });

  const handleScoreChange = (playerId: string, value: string) => {
    const numericValue = parseInt(value) || 0;
    setScores(prev => ({
      ...prev,
      [playerId]: numericValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(scores);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Introduceți scorurile pentru această rundă</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between">
              <label htmlFor={player.id} className="font-medium">
                {player.name}
              </label>
              <input
                type="number"
                id={player.id}
                value={scores[player.id]}
                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                className="ml-4 p-2 border rounded w-24 text-right"
              />
            </div>
          ))}
          
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 