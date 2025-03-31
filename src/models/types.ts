export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface PlayerRoundResult {
  playerId: string;
  prediction: number;
  tricksWon: number;
  score: number;
  hasReceivedConsecutiveBonus?: boolean;
}

export interface Round {
  roundNumber: number;
  cardsPerPlayer: number;
  totalTricks: number;
  dealerIndex: number;
  results: PlayerRoundResult[];
  playerCards: Record<string, string[]>;
}

export interface Game {
  id: string;
  players: Player[];
  rounds: Round[];
  currentRound: number;
  totalRounds: number;
  isComplete: boolean;
  createdAt: Date;
  lastUpdated: Date;
  gameType: GameType;
}

export interface GameSettings {
  minPlayers: number;
  maxPlayers: number;
  playerColors: string[];
}

/* eslint-disable no-unused-vars */
export enum GamePhase {
  SETUP = "setup",
  PREDICTION = "prediction",
  TRICKS = "tricks",
  COMPLETE = "complete"
}

export enum GameType {
  SHORT = 'short',   // Joc scurt: 8 runde (1-8 mâini)
  MEDIUM = 'medium', // Joc mediu: 2n+7 runde (runde de 1 și 8 mâini + runde crescătoare 1-8)
  LONG = 'long'      // Joc lung: 3n+12 runde (format complet cu toate secțiunile)
}

export enum ConsecutiveStreakType {
  NONE = 'none',
  CORRECT = 'correct',
  INCORRECT = 'incorrect'
}
/* eslint-enable no-unused-vars */ 