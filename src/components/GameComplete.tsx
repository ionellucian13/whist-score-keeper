import React from 'react';
import { GameType, Player, PlayerStatistics } from '../types';
import { calculateFinalStandings } from '../utils/gameUtils';

interface GameCompleteProps {
  players: Player[];
  onContinueWithSamePlayers: () => void;
  onStartNewGame: () => void;
  onSelectGameType: (type: GameType) => void;
  playerStats: Record<string, PlayerStatistics>;
}

export const GameComplete: React.FC<GameCompleteProps> = ({
  players,
  onContinueWithSamePlayers,
  onStartNewGame,
  onSelectGameType,
  playerStats,
}) => {
  const [showGameTypes, setShowGameTypes] = React.useState(false);
  const [selectedContinuation, setSelectedContinuation] = React.useState<'same_players' | 'new_players' | null>(null);

  const sortedPlayers = React.useMemo(() => {
    return calculateFinalStandings(players);
  }, [players]);

  const handleContinuationChoice = (choice: 'same_players' | 'new_players') => {
    setSelectedContinuation(choice);
    setShowGameTypes(true);
  };

  const handleGameTypeSelection = (type: GameType) => {
    onSelectGameType(type);
    if (selectedContinuation === 'same_players') {
      onContinueWithSamePlayers();
    } else {
      onStartNewGame();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Final de joc</h2>
        
        {/* Clasament final */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Clasament final:</h3>
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{index + 1}.</span>
                  <span>{player.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-semibold">{player.score} puncte</span>
                  {playerStats[player.id] && (
                    <span className="text-gray-600">
                      Media: {playerStats[player.id].averageScore.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistici jucători */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Statistici generale:</h3>
          <div className="grid grid-cols-2 gap-4">
            {sortedPlayers.map((player) => {
              const stats = playerStats[player.id];
              return (
                <div key={player.id} className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold">{player.name}</h4>
                  <div className="text-sm">
                    <p>Jocuri totale: {stats?.totalGames || 1}</p>
                    <p>Victorii: {stats?.wins || 0}</p>
                    <p>Scor mediu: {stats?.averageScore.toFixed(1) || player.score}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Opțiuni de continuare */}
        {!showGameTypes ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleContinuationChoice('same_players')}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Joc nou cu aceiași jucători
            </button>
            <button
              onClick={() => handleContinuationChoice('new_players')}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            >
              Joc nou cu alți jucători
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold">Alege tipul de joc:</h3>
            <button
              onClick={() => handleGameTypeSelection('SHORT')}
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
            >
              Joc Scurt
            </button>
            <button
              onClick={() => handleGameTypeSelection('MEDIUM')}
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
            >
              Joc Mediu
            </button>
            <button
              onClick={() => handleGameTypeSelection('LONG')}
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
            >
              Joc Lung
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 