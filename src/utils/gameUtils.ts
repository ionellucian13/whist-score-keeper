import { v4 as uuidv4 } from 'uuid';
import { Game, Player, Round, PlayerRoundResult, GameSettings, GameType, ConsecutiveStreakType } from '../models/types';

// Default game settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  minPlayers: 3,
  maxPlayers: 6,
  playerColors: [
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ],
};

// Generate unique ID for new games
export const generateGameId = (): string => {
  return uuidv4();
};

// Calculează numărul total de runde pentru un joc
export const calculateTotalRounds = (numPlayers: number, gameType: GameType = GameType.LONG): number => {
  switch (gameType) {
    case GameType.SHORT:
      // Joc scurt: O rundă simplă cu 1-8 mâini
      return 8;
      
    case GameType.MEDIUM:
      // Joc mediu: 
      // 1. Runde de 1 mână (n ori, unde n = numărul de jucători)
      // 2. Runde crescătoare de la 2 la 8 (7 runde)
      // 3. Runde de 8 mâini (exact n ori, unde n = numărul de jucători)
      // Total: n + 7 + n = 2n + 7 runde
      return numPlayers * 2 + 7; // 2n + 7
      
    case GameType.LONG:
    default:
      // Joc lung: Runde complete (format standard)
      // 1. Runde cu 1 mână (repetate de n ori, unde n = numărul de jucători)
      // 2. Runde crescătoare de la 2 la 7 (câte o rundă pentru fiecare)
      // 3. Runde cu 8 mâini (repetate de n ori)
      // 4. Runde descrescătoare de la 7 la 2 (câte o rundă pentru fiecare)
      // 5. Runde cu 1 mână (repetate de n ori, unde n = numărul de jucători)
      return numPlayers * 3 + 12; // 3n + 12
  }
};

// Calculează mâinile per jucător pentru runda curentă
export const calculateHandsPerPlayer = (roundNumber: number, numPlayers: number, gameType: GameType = GameType.LONG): number => {
  switch (gameType) {
    case GameType.SHORT:
      // Joc scurt: runde cu mâini de la 1 la 8
      // Acest tip de joc are exact 8 runde
      return roundNumber;
      
    case GameType.MEDIUM: {
      // Joc mediu
      // Runde de 1 mână (n ori) + Runde crescătoare 2-8 + Runde de 8 mâini (n ori)
      
      // Prima secțiune - runde cu 1 mână (repetate de n ori)
      if (roundNumber <= numPlayers) {
        return 1;
      }
      
      // A doua secțiune - runde crescătoare de la 2 la 8
      if (roundNumber <= numPlayers + 7) {
        return roundNumber - numPlayers + 1;
      }
      
      // A treia secțiune - runde cu 8 mâini (repetate de n ori)
      // Corectăm problema cu runda în plus prin reducerea cu 1 a limitei superioare
      if (roundNumber <= numPlayers * 2 + 6) {
        return 8;
      }
      
      // Nu ar trebui să ajungem aici niciodată pentru jocul MEDIUM,
      // dar avem un caz de rezervă pentru orice eventualitate
      return 1;
    }
      
    case GameType.LONG:
    default: {
      // Joc lung (format standard)
      // Runde totale: 3n + 12
      
      // Prima secțiune - runde cu 1 mână (repetate de n ori)
      if (roundNumber <= numPlayers) {
        return 1;
      }
      
      // A doua secțiune - runde crescătoare de la 2 la 7
      if (roundNumber <= numPlayers + 6) {
        // Calculăm numărul de mâini pentru această rundă (2 până la 7)
        return roundNumber - numPlayers + 1;
      }
      
      // A treia secțiune - runde cu 8 mâini (repetate de n ori)
      if (roundNumber <= numPlayers * 2 + 6) {
        return 8;
      }
      
      // A patra secțiune - runde descrescătoare de la 7 la 2
      if (roundNumber <= numPlayers * 2 + 12) {
        // Calculăm numărul de mâini pentru această rundă (7 până la 2)
        const position = roundNumber - (numPlayers * 2 + 6);
        return 8 - position;
      }
      
      // Ultima secțiune - runde cu 1 mână (repetate de n ori)
      return 1;
    }
  }
};

// Funcție utilitară pentru a elimina duplicatele din array-ul de jucători
export const ensureUniquePlayers = (players: Player[]): Player[] => {
  // Folosim un Map pentru a păstra cea mai recentă instanță a fiecărui jucător după id
  const uniquePlayers = new Map<string, Player>();
  
  players.forEach(player => {
    uniquePlayers.set(player.id, player);
  });
  
  // Convertim Map înapoi la array
  return Array.from(uniquePlayers.values());
};

// Funcție pentru testarea structurii jocului și afișarea în consolă
export const _testGameStructure = (numPlayers: number = 4) => {
  // Testează jocul scurt
  console.group("TEST JOC SCURT (GameType.SHORT)");
  console.log(`Total runde: ${calculateTotalRounds(numPlayers, GameType.SHORT)}`);
  for (let i = 1; i <= calculateTotalRounds(numPlayers, GameType.SHORT); i++) {
    console.log(`Runda ${i}: ${calculateHandsPerPlayer(i, numPlayers, GameType.SHORT)} mâini, dealer: jucătorul ${getDealerIndex(i, numPlayers) + 1}`);
  }
  console.groupEnd();
  
  // Testează jocul mediu
  console.group("TEST JOC MEDIU (GameType.MEDIUM)");
  console.log(`Total runde: ${calculateTotalRounds(numPlayers, GameType.MEDIUM)}`);
  for (let i = 1; i <= calculateTotalRounds(numPlayers, GameType.MEDIUM); i++) {
    console.log(`Runda ${i}: ${calculateHandsPerPlayer(i, numPlayers, GameType.MEDIUM)} mâini, dealer: jucătorul ${getDealerIndex(i, numPlayers) + 1}`);
  }
  console.groupEnd();
  
  // Testează jocul lung
  console.group("TEST JOC LUNG (GameType.LONG)");
  console.log(`Total runde: ${calculateTotalRounds(numPlayers, GameType.LONG)}`);
  for (let i = 1; i <= calculateTotalRounds(numPlayers, GameType.LONG); i++) {
    console.log(`Runda ${i}: ${calculateHandsPerPlayer(i, numPlayers, GameType.LONG)} mâini, dealer: jucătorul ${getDealerIndex(i, numPlayers) + 1}`);
  }
  console.groupEnd();
};

// Returnează indexul dealer-ului pentru runda curentă
export const getDealerIndex = (roundNumber: number, numPlayers: number): number => {
  // Dealer-ul se rotește în fiecare rundă
  return (roundNumber - 1) % numPlayers;
};

// Create a new game with the specified players
export const createNewGame = (playerNames: string[], gameType: GameType = GameType.LONG): Game => {
  if (playerNames.length < DEFAULT_GAME_SETTINGS.minPlayers || 
      playerNames.length > DEFAULT_GAME_SETTINGS.maxPlayers) {
    throw new Error(`Game requires between ${DEFAULT_GAME_SETTINGS.minPlayers} and ${DEFAULT_GAME_SETTINGS.maxPlayers} players`);
  }
  
  // Create player objects with unique colors
  const players: Player[] = playerNames.map((name, index) => ({
    id: uuidv4(),
    name,
    color: DEFAULT_GAME_SETTINGS.playerColors[index],
  }));
  
  // Calculate total rounds based on number of players and game type
  const totalRounds = calculateTotalRounds(players.length, gameType);
  
  const now = new Date();
  
  return {
    id: generateGameId(),
    players,
    rounds: [],
    currentRound: 1,
    totalRounds,
    isComplete: false,
    createdAt: now,
    lastUpdated: now,
    gameType,
  };
};

// Initialize a new round
export const initializeRound = (game: Game): Round => {
  const roundNumber = game.currentRound;
  const cardsPerPlayer = calculateHandsPerPlayer(roundNumber, game.players.length, game.gameType);
  const dealerIndex = getDealerIndex(roundNumber, game.players.length);
  
  // Initialize empty player cards for each player
  const playerCards: Record<string, string[]> = {};
  game.players.forEach(player => {
    playerCards[player.id] = [];
  });
  
  return {
    roundNumber,
    cardsPerPlayer,
    totalTricks: cardsPerPlayer,
    dealerIndex,
    results: [],
    playerCards
  };
};

// Check if predictions are valid (sum can't equal total tricks)
export const arePredictionsValid = (predictions: number[], totalTricks: number): boolean => {
  const sum = predictions.reduce((acc, prediction) => acc + prediction, 0);
  return sum !== totalTricks;
};

// Calculate score for a player based on prediction and actual tricks won
export const calculateScore = (prediction: number, tricksWon: number): number => {
  if (prediction === tricksWon) {
    // Correct prediction: 5 points + number of tricks won
    return 5 + tricksWon;
  } else {
    // Incorrect prediction: lose the difference in points
    return -Math.abs(prediction - tricksWon);
  }
};

// Update the interface first in the function, we'll handle the type file separately
type StreakInfo = {
  count: number;
  type: ConsecutiveStreakType;
};

// Verifică dacă un jucător are 5 runde consecutive corecte sau greșite
export const checkConsecutiveRounds = (game: Game, playerId: string): { bonus: number, message: string | null } => {
  if (!game || game.rounds.length < 5) {
    return { bonus: 0, message: null };
  }

  // Începem de la cea mai veche rundă și construim un streak
  let currentStreak: StreakInfo = { count: 0, type: ConsecutiveStreakType.NONE };
  
  // Parcurgem toate rundele și menținem streak-ul
  for (let i = 0; i < game.rounds.length; i++) {
    const round = game.rounds[i];
    const playerResult = round.results.find(result => result.playerId === playerId);
    
    if (!playerResult) continue;
    
    // Verifică dacă această rundă a fost deja folosită pentru a acorda un bonus
    const hasReceivedBonus = playerResult.hasReceivedConsecutiveBonus || false;
    
    if (hasReceivedBonus) {
      // Resetăm streak-ul dacă deja s-a acordat un bonus pentru această rundă
      currentStreak = { count: 0, type: ConsecutiveStreakType.NONE };
      continue;
    }
    
    if (playerResult.prediction === playerResult.tricksWon) {
      // Predicție corectă
      if (currentStreak.type === ConsecutiveStreakType.CORRECT) {
        // Continuăm streak-ul corect
        currentStreak.count++;
      } else {
        // Începem un nou streak corect
        currentStreak = { count: 1, type: ConsecutiveStreakType.CORRECT };
      }
    } else {
      // Predicție greșită
      if (currentStreak.type === ConsecutiveStreakType.INCORRECT) {
        // Continuăm streak-ul greșit
        currentStreak.count++;
      } else {
        // Începem un nou streak greșit
        currentStreak = { count: 1, type: ConsecutiveStreakType.INCORRECT };
      }
    }
  }
  
  // Verificăm dacă avem exact 5 runde consecutive
  if (currentStreak.count === 5) {
    const player = game.players.find(p => p.id === playerId);
    const playerName = player ? player.name : 'Jucătorul';
    
    // Marcăm ultima rundă ca folosită pentru bonus
    if (game.rounds.length > 0) {
      const lastRound = game.rounds[game.rounds.length - 1];
      const lastResult = lastRound.results.find(result => result.playerId === playerId);
      if (lastResult) {
        lastResult.hasReceivedConsecutiveBonus = true;
      }
    }
    
    if (currentStreak.type === ConsecutiveStreakType.CORRECT) {
      return { 
        bonus: 5, 
        message: `${playerName} a primit bonus 5 puncte pentru 5 runde consecutive corecte!` 
      };
    } else if (currentStreak.type === ConsecutiveStreakType.INCORRECT) {
      return { 
        bonus: -5, 
        message: `${playerName} a pierdut 5 puncte pentru 5 runde consecutive greșite!` 
      };
    }
  }
  
  return { bonus: 0, message: null };
};

// Get player's cumulative score up to a specific round
export const getPlayerCumulativeScore = (game: Game, playerId: string, upToRound: number): number => {
  // Just get the sum of scores from the rounds - bonuses are already included in the round scores
  return game.rounds
    .filter(round => round.roundNumber <= upToRound)
    .reduce((total, round) => {
      const playerResult = round.results.find(result => result.playerId === playerId);
      return total + (playerResult ? playerResult.score : 0);
    }, 0);
};

// Get current round's data
export const getCurrentRound = (game: Game): Round | undefined => {
  return game.rounds.find(round => round.roundNumber === game.currentRound);
};

// Get final rankings
export const getFinalRankings = (game: Game): Player[] => {
  const playersWithScores = game.players.map(player => {
    const totalScore = getPlayerCumulativeScore(game, player.id, game.totalRounds);
    return { ...player, totalScore };
  });
  
  return playersWithScores.sort((a, b) => (b.totalScore as number) - (a.totalScore as number));
};

// Undo the last round
export const undoLastRound = (game: Game): Game => {
  if (game.rounds.length === 0) {
    return game;
  }
  
  const updatedRounds = [...game.rounds];
  updatedRounds.pop();
  
  return {
    ...game,
    rounds: updatedRounds,
    currentRound: Math.max(1, game.currentRound - 1),
    isComplete: false,
    lastUpdated: new Date(),
  };
};

// Save the results for the current round and advance to the next
export const saveRoundAndAdvance = (
  game: Game, 
  roundResults: PlayerRoundResult[]
): Game => {
  const currentRound: Round = {
    roundNumber: game.currentRound,
    cardsPerPlayer: calculateHandsPerPlayer(game.currentRound, game.players.length, game.gameType),
    totalTricks: calculateHandsPerPlayer(game.currentRound, game.players.length, game.gameType),
    dealerIndex: getDealerIndex(game.currentRound, game.players.length),
    results: roundResults,
    playerCards: {} // Inițializăm cu un obiect gol, deoarece aceste cărți nu mai sunt necesare după ce runda este salvată
  };
  
  const isLastRound = game.currentRound === game.totalRounds;
  const updatedGame = {
    ...game,
    rounds: [...game.rounds, currentRound],
    currentRound: game.currentRound + 1,
    isComplete: isLastRound,
    lastUpdated: new Date(),
  };
  
  return updatedGame;
};

// Funcție de test specifică pentru jocul MEDIUM
export const _testMediumGame = () => {
  console.group("TEST SPECIFIC JOC MEDIU");
  
  // Testează pentru fiecare număr posibil de jucători (3-6)
  for (let players = 3; players <= 6; players++) {
    console.group(`Cu ${players} jucători:`);
    
    console.log(`Total runde: ${calculateTotalRounds(players, GameType.MEDIUM)}`);
    
    // Contorizăm tipurile de runde
    let roundsWith1Card = 0;
    let roundsWithIncreasing = 0;
    let roundsWith8Cards = 0;
    
    // Parcurgem toate rundele și verificăm tipul fiecăreia
    for (let i = 1; i <= calculateTotalRounds(players, GameType.MEDIUM); i++) {
      const cardsInRound = calculateHandsPerPlayer(i, players, GameType.MEDIUM);
      console.log(`Runda ${i}: ${cardsInRound} mâini`);
      
      if (cardsInRound === 1) {
        roundsWith1Card++;
      } else if (cardsInRound === 8) {
        roundsWith8Cards++;
      } else {
        roundsWithIncreasing++;
      }
    }
    
    console.log(`Sumar: ${roundsWith1Card} runde cu 1 mână, ${roundsWithIncreasing} runde crescătoare, ${roundsWith8Cards} runde cu 8 mâini`);
    console.log(`Verificare: Runde cu 8 mâini = număr jucători? ${roundsWith8Cards === players ? 'DA' : 'NU - EROARE'}`);
    
    console.groupEnd();
  }
  
  console.groupEnd();
}; 