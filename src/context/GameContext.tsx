import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Game, Player, PlayerRoundResult, GamePhase, GameType, Round } from '../models/types';
import { 
  createNewGame, 
  arePredictionsValid, 
  calculateScore, 
  saveRoundAndAdvance,
  undoLastRound,
  getFinalRankings,
  ensureUniquePlayers,
  initializeRound,
  getPlayerCumulativeScore,
  checkConsecutiveRounds
} from '../utils/gameUtils';

interface GameContextType {
  game: Game | null;
  gamePhase: GamePhase;
  currentRound: Round | null;
  currentRoundPredictions: Map<string, number>;
  currentRoundTricks: Map<string, number>;
  createGame: (playerNames: string[], gameType: GameType) => void;
  updatePrediction: (playerId: string, prediction: number) => void;
  updateTricksWon: (playerId: string, tricks: number) => void;
  submitRound: (roundTricksWon: Record<string, number>) => void;
  startNewGame: (playerNames: string[]) => void;
  undoLastAction: () => void;
  isValidPrediction: () => boolean;
  rankings: Player[];
  error: string | null;
  resetGame: () => void;
  startGame: (playerNames: string[], gameType: GameType) => void;
  submitPredictions: (predictions: Record<string, number>) => void;
  getPlayerById: (id: string) => Player | undefined;
  getRoundByNumber: (roundNumber: number) => Round | undefined;
  getPlayerCumulativeScore: (playerId: string, upToRound: number) => number;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.SETUP);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [currentRoundPredictions, setCurrentRoundPredictions] = useState<Map<string, number>>(new Map());
  const [currentRoundTricks, setCurrentRoundTricks] = useState<Map<string, number>>(new Map());
  const [rankings, setRankings] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load game from localStorage on initial render
  useEffect(() => {
    const savedGame = localStorage.getItem('whistGame');
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        // Convert date strings back to Date objects
        parsedGame.createdAt = new Date(parsedGame.createdAt);
        parsedGame.lastUpdated = new Date(parsedGame.lastUpdated);
        
        setGame(parsedGame);
        
        // Determine the game phase
        if (parsedGame.isComplete) {
          setGamePhase(GamePhase.COMPLETE);
          setRankings(getFinalRankings(parsedGame));
        } else {
          // Check if we're in prediction or tricks phase based on round data
          const currentRoundExists = parsedGame.rounds.some(
            (round: any) => round.roundNumber === parsedGame.currentRound
          );
          setGamePhase(currentRoundExists ? GamePhase.TRICKS : GamePhase.PREDICTION);
        }
      } catch (e) {
        console.error('Failed to load saved game:', e);
        setError('Failed to load saved game');
      }
    }
  }, []);

  // Save game to localStorage whenever it changes
  useEffect(() => {
    if (game) {
      localStorage.setItem('whistGame', JSON.stringify(game));
    }
  }, [game]);

  // Initialize the current round whenever the game changes and we're in prediction phase
  useEffect(() => {
    if (game && gamePhase === GamePhase.PREDICTION && !currentRound) {
      const newRound = initializeRound(game);
      setCurrentRound(newRound);
    }
  }, [game, gamePhase, currentRound]);

  // Start a new game with the given player names and game type
  const startGame = (playerNames: string[], gameType: GameType = GameType.LONG) => {
    try {
      const newGame = createNewGame(playerNames, gameType);
      setGame(newGame);
      
      // Initialize the first round
      const firstRound = initializeRound(newGame);
      setCurrentRound(firstRound);
      
      setGamePhase(GamePhase.PREDICTION);
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  };

  // Reset the game completely - return to setup screen
  const resetGame = () => {
    setGame(null);
    setCurrentRound(null);
    setGamePhase(GamePhase.SETUP);
    setCurrentRoundPredictions(new Map());
    setCurrentRoundTricks(new Map());
    setRankings([]);
    setError(null);
    localStorage.removeItem('whistGame');
  };

  // Create new game (alias for startGame)
  const createGame = (playerNames: string[], gameType: GameType = GameType.LONG) => {
    startGame(playerNames, gameType);
  };

  // Update prediction for a player
  const updatePrediction = (playerId: string, prediction: number) => {
    setCurrentRoundPredictions(prev => {
      const newPredictions = new Map(prev);
      newPredictions.set(playerId, prediction);
      return newPredictions;
    });
  };

  // Update tricks won for a player
  const updateTricksWon = (playerId: string, tricks: number) => {
    setCurrentRoundTricks(prev => {
      const newTricks = new Map(prev);
      newTricks.set(playerId, tricks);
      return newTricks;
    });
  };

  // Check if current predictions are valid
  const isValidPrediction = (): boolean => {
    if (!game) return false;
    
    // Check if all players have made predictions
    if (currentRoundPredictions.size !== game.players.length) {
      return false;
    }
    
    const predictions = Array.from(currentRoundPredictions.values());
    const totalTricks = game.currentRound; // In this game, total tricks equals current round number
    
    return arePredictionsValid(predictions, totalTricks);
  };

  // Submit round results and advance to next round
  const submitRound = (roundTricksWon: Record<string, number>) => {
    if (!game) return;
    
    if (gamePhase === GamePhase.PREDICTION) {
      // Move from prediction to tricks entry
      setGamePhase(GamePhase.TRICKS);
    } else if (gamePhase === GamePhase.TRICKS) {
      // Generate results for the round
      const roundResults: PlayerRoundResult[] = game.players.map(player => {
        const prediction = currentRoundPredictions.get(player.id) || 0;
        const tricksWon = roundTricksWon[player.id] || 0;
        const score = calculateScore(prediction, tricksWon);
        
        return {
          playerId: player.id,
          prediction,
          tricksWon,
          score,
          hasReceivedConsecutiveBonus: false // Inițial, nicio rundă nu a primit bonus
        };
      });
      
      // Creăm un joc temporar cu runda curentă pentru a verifica bonusurile de consecvență
      const tempRound: Round = {
        roundNumber: game.currentRound,
        cardsPerPlayer: currentRound?.cardsPerPlayer || game.currentRound,
        totalTricks: currentRound?.totalTricks || game.currentRound,
        dealerIndex: currentRound?.dealerIndex || 0,
        results: roundResults
      };
      
      const tempGame = {
        ...game,
        rounds: [...game.rounds, tempRound]
      };
      
      // Actualizăm scorurile cu bonusuri de consecvență, dacă este cazul
      const updatedRoundResults = roundResults.map(result => {
        const { bonus } = checkConsecutiveRounds(tempGame, result.playerId);
        if (bonus !== 0) {
          return {
            ...result,
            score: result.score + bonus,
            hasReceivedConsecutiveBonus: true // Marcăm că această rundă a primit un bonus
          };
        }
        return result;
      });
      
      // Update game with new round results 
      let updatedGame = saveRoundAndAdvance(game, updatedRoundResults);
      
      // Asigură-te că nu există duplicate de jucători în jocul actualizat
      updatedGame = {
        ...updatedGame,
        players: ensureUniquePlayers(updatedGame.players)
      };
      
      setGame(updatedGame);
      
      // Reset for next round
      setCurrentRoundPredictions(new Map());
      setCurrentRoundTricks(new Map());
      
      if (updatedGame.isComplete) {
        setGamePhase(GamePhase.COMPLETE);
        setRankings(getFinalRankings(updatedGame));
      } else {
        setGamePhase(GamePhase.PREDICTION);
        setCurrentRound(null);
      }
      
      setError(null);
    }
  };

  // Submit predictions and convert to Map for the game context
  const submitPredictions = (predictions: Record<string, number>) => {
    // Convert the predictions object to a Map
    const predictionsMap = new Map<string, number>();
    Object.entries(predictions).forEach(([playerId, prediction]) => {
      predictionsMap.set(playerId, prediction);
    });
    
    setCurrentRoundPredictions(predictionsMap);
    submitRound({});
  };

  // Start a new game
  const startNewGame = (playerNames: string[]) => {
    startGame(playerNames);
    setCurrentRoundPredictions(new Map());
    setCurrentRoundTricks(new Map());
    setRankings([]);
  };

  // Undo last action
  const undoLastAction = () => {
    if (!game) return;
    
    if (gamePhase === GamePhase.TRICKS) {
      // Go back to prediction phase
      setGamePhase(GamePhase.PREDICTION);
      setCurrentRoundTricks(new Map());
    } else if (gamePhase === GamePhase.PREDICTION && game.currentRound > 1) {
      // Undo the last round
      let updatedGame = undoLastRound(game);
      
      // Asigură-te că nu există duplicate de jucători în jocul actualizat
      updatedGame = {
        ...updatedGame,
        players: ensureUniquePlayers(updatedGame.players)
      };
      
      setGame(updatedGame);
      setGamePhase(GamePhase.PREDICTION);
      setCurrentRoundPredictions(new Map());
      setCurrentRoundTricks(new Map());
    } else if (gamePhase === GamePhase.COMPLETE) {
      // Go back to the last round's trick entry
      let updatedGame = undoLastRound(game);
      
      // Asigură-te că nu există duplicate de jucători în jocul actualizat
      updatedGame = {
        ...updatedGame,
        players: ensureUniquePlayers(updatedGame.players)
      };
      
      setGame(updatedGame);
      setGamePhase(GamePhase.TRICKS);
    }
  };

  const getPlayerById = (id: string): Player | undefined => {
    if (!game) return undefined;
    return game.players.find(player => player.id === id);
  };

  const getRoundByNumber = (roundNumber: number): Round | undefined => {
    if (!game) return undefined;
    return game.rounds.find(round => round.roundNumber === roundNumber);
  };

  // Get player's cumulative score up to a specific round
  const getPlayerCumulativeScoreFunc = (playerId: string, upToRound: number): number => {
    if (!game) return 0;
    return getPlayerCumulativeScore(game, playerId, upToRound);
  };

  const value = {
    game,
    gamePhase,
    currentRound,
    currentRoundPredictions,
    currentRoundTricks,
    createGame,
    updatePrediction,
    updateTricksWon,
    submitRound,
    startNewGame,
    undoLastAction,
    isValidPrediction,
    rankings,
    error,
    resetGame,
    startGame,
    submitPredictions,
    getPlayerById,
    getRoundByNumber,
    getPlayerCumulativeScore: getPlayerCumulativeScoreFunc
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}; 