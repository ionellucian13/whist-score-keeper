import { GameType, Player, PlayerStatistics } from '../types';

export const calculateTotalRounds = (gameType: GameType, numPlayers: number): number => {
  switch (gameType) {
    case 'SHORT':
      return numPlayers * 2;
    case 'MEDIUM':
      return numPlayers * 3 + 6;
    case 'LONG':
      return numPlayers * 4 + 8;
  }
};

export const calculateFinalStandings = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => b.score - a.score);
};

export const updatePlayerStats = (
  currentStats: Record<string, PlayerStatistics>,
  players: Player[]
): Record<string, PlayerStatistics> => {
  const sortedPlayers = calculateFinalStandings(players);
  const winner = sortedPlayers[0];
  
  const newStats: Record<string, PlayerStatistics> = {};
  
  players.forEach((player) => {
    const existingStats = currentStats[player.id] || {
      totalGames: 0,
      wins: 0,
      totalScore: 0,
      averageScore: 0,
      lastGamePosition: 0
    };
    
    const position = sortedPlayers.findIndex(p => p.id === player.id) + 1;
    
    newStats[player.id] = {
      totalGames: existingStats.totalGames + 1,
      wins: player.id === winner.id ? existingStats.wins + 1 : existingStats.wins,
      totalScore: existingStats.totalScore + player.score,
      averageScore: (existingStats.totalScore + player.score) / (existingStats.totalGames + 1),
      lastGamePosition: position
    };
  });
  
  return newStats;
}; 