export interface PlayerStatistics {
  totalGames: number;
  wins: number;
  totalScore: number;
  averageScore: number;
  lastGamePosition: number;
}

export interface GameEndState {
  showStats: boolean;
  playerStats: Record<string, PlayerStatistics>;
  continuationChoice: 'same_players' | 'new_players' | null;
  selectedGameType: GameType | null;
} 