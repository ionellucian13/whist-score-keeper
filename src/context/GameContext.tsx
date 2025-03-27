import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameType, Player, PlayerStatistics, GameEndState } from '../types';
import { updatePlayerStats } from '../utils/gameUtils';

interface GameContextType {
  players: Player[];
  gameType: GameType | null;
  currentRound: number;
  isGameComplete: boolean;
  playerStats: Record<string, PlayerStatistics>;
  gameEndState: GameEndState;
  setPlayers: (players: Player[]) => void;
  setGameType: (type: GameType) => void;
  setCurrentRound: (round: number) => void;
  completeGame: () => void;
  resetGame: () => void;
  continueWithSamePlayers: () => void;
  handleGameTypeSelection: (type: GameType) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStatistics>>({});
  const [gameEndState, setGameEndState] = useState<GameEndState>({
    showStats: false,
    playerStats: {},
    continuationChoice: null,
    selectedGameType: null,
  });

  // Load player stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      setPlayerStats(JSON.parse(savedStats));
    }
  }, []);

  // Save player stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
  }, [playerStats]);

  const completeGame = () => {
    setIsGameComplete(true);
    const updatedStats = updatePlayerStats(playerStats, players);
    setPlayerStats(updatedStats);
    setGameEndState({
      ...gameEndState,
      showStats: true,
      playerStats: updatedStats,
    });
  };

  const resetGame = () => {
    setPlayers([]);
    setGameType(null);
    setCurrentRound(1);
    setIsGameComplete(false);
    setGameEndState({
      showStats: false,
      playerStats: playerStats,
      continuationChoice: null,
      selectedGameType: null,
    });
  };

  const continueWithSamePlayers = () => {
    const resetPlayers = players.map(player => ({
      ...player,
      score: 0,
      rounds: [],
    }));
    setPlayers(resetPlayers);
    setCurrentRound(1);
    setIsGameComplete(false);
  };

  const handleGameTypeSelection = (type: GameType) => {
    setGameType(type);
    setGameEndState({
      ...gameEndState,
      selectedGameType: type,
    });
  };

  return (
    <GameContext.Provider
      value={{
        players,
        gameType,
        currentRound,
        isGameComplete,
        playerStats,
        gameEndState,
        setPlayers,
        setGameType,
        setCurrentRound,
        completeGame,
        resetGame,
        continueWithSamePlayers,
        handleGameTypeSelection,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 