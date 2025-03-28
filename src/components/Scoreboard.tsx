import React, { useState, ReactElement } from 'react';
import { useGameContext } from '../context/GameContext';
import { calculateHandsPerPlayer } from '../utils/gameUtils';
import { Player } from '../models/types';

interface PlayerScore {
  player: Player;
  score: number;
}

// Constantă pentru a traduce titlul în română
const TITLE_RO = 'Tabela de Scor';

// Funcție utilă pentru a sorta jucătorii după scor (descrescător)
const sortPlayersByScore = (results: {player: Player, score: number}[]) => {
  return [...results].sort((a, b) => b.score - a.score);
};

const Scoreboard: React.FC = () => {
  const { game, getPlayerCumulativeScore } = useGameContext();
  const [showLegend, setShowLegend] = useState<boolean>(false);
  
  // Dacă jocul nu este încărcat, nu afișăm nimic
  if (!game) {
    return null;
  }
  
  // Calculăm numărul total de runde și mâini pentru fiecare rundă
  const totalRounds = game.totalRounds;
  
  // Obținem toate rundele completate
  const completedRounds = game.rounds;
  
  // Verificăm dacă scoreboard-ul ar trebui afișat (cel puțin o rundă completată)
  const shouldShowScoreboard = completedRounds.length > 0;
  
  // Calculăm numărul de mâini pentru fiecare rundă
  const getCardsForRound = (roundNumber: number) => {
    return calculateHandsPerPlayer(roundNumber, game.players.length, game.gameType);
  };
  
  // Calculăm scorurile și clasamentul
  const calculatePlayerScores = (): PlayerScore[] => {
    return game.players.map((player: Player) => {
      const score = getPlayerCumulativeScore(player.id, Math.max(...game.rounds.map(r => r.roundNumber)));
      return { player, score };
    }).sort((a: PlayerScore, b: PlayerScore) => b.score - a.score);
  };
  
  const playerScores = calculatePlayerScores();
  
  // Obținem poziția curentă în clasament pentru un jucător
  const getPlayerRank = (playerId: string): number => {
    return playerScores.findIndex((item: PlayerScore) => item.player.id === playerId) + 1;
  };
  
  // Obținem indicatorul de tendință pentru un jucător (dacă scorul său crește sau scade)
  const getPlayerTrend = (playerId: string): 'up' | 'down' | 'stable' => {
    // Dacă nu avem cel puțin două runde, tendința este stabilă
    if (game.rounds.length < 2) return 'stable';
    
    const lastRoundNum = Math.max(...game.rounds.map(r => r.roundNumber));
    if (lastRoundNum <= 1) return 'stable';
    
    const lastScore = getPlayerCumulativeScore(playerId, lastRoundNum);
    const previousScore = getPlayerCumulativeScore(playerId, lastRoundNum - 1);
    
    if (lastScore > previousScore) return 'up';
    if (lastScore < previousScore) return 'down';
    return 'stable';
  };
  
  // Obținem icon-ul pentru tendință
  const getTrendIcon = (trend: 'up' | 'down' | 'stable'): ReactElement => {
    switch (trend) {
      case 'up':
        return (
          <span className="flex items-center text-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'down':
        return (
          <span className="flex items-center text-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="flex items-center text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </span>
        );
    }
  };
  
  if (!shouldShowScoreboard) {
    return null;
  }
  
  return (
    <div className="card bg-white dark:bg-dark-card-bg shadow-lg rounded-xl overflow-hidden" id="scoreboard">
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-color" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            {TITLE_RO}
          </h2>
          
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-sm flex items-center text-primary-color hover:text-primary-hover dark:text-primary-color dark:hover:text-primary-hover transition-colors"
            aria-expanded={showLegend}
            aria-controls="legend-panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {showLegend ? 'Ascunde legenda' : 'Arată legenda'}
          </button>
        </div>
        
        {showLegend && (
          <div id="legend-panel" className="bg-info-light dark:bg-info-light/10 p-4 rounded-lg mb-6 text-sm border-l-4 border-info scale-in">
            <p className="font-medium mb-2 text-info-dark dark:text-info">Legendă format scor:</p>
            <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-success-light text-success-dark mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span><span className="text-success font-medium">10</span> = Predicție corectă (5 puncte + numărul de mâini câștigate)</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-error-light text-error-dark mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span><span className="text-error font-medium">-2</span> = Predicție incorectă (0 - diferența absolută între predicție și mâini câștigate)</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span><span className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">3/2</span> = Format: Predicție/Mâini câștigate</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary-light text-primary-dark dark:text-primary-color mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <span><span className="text-primary-color font-medium">+5/-5</span> = Bonus/penalizare pentru 5 runde consecutive corecte/greșite</span>
              </li>
            </ul>
          </div>
        )}
        
        {/* Top 3 players - podium layout */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-300">Top Jucători</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {playerScores.slice(0, 3).map(({player, score}, index) => {
              const positionColors = [
                { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700', medal: '#FFD700' },
                { bg: 'bg-neutral-50 dark:bg-neutral-800/30', border: 'border-neutral-200 dark:border-neutral-700', medal: '#C0C0C0' },
                { bg: 'bg-amber-50/70 dark:bg-amber-800/20', border: 'border-amber-200/70 dark:border-amber-800/50', medal: '#CD7F32' },
              ];
              
              const trend = getPlayerTrend(player.id);
              const position = index + 1;
              
              return (
                <div 
                  key={player.id} 
                  className={`flex flex-col items-center p-4 rounded-xl border ${positionColors[index].bg} ${positionColors[index].border} shadow-sm transition-all hover:shadow-md relative overflow-hidden`}
                >
                  {position === 1 && (
                    <div className="absolute -right-6 -top-1 bg-amber-400 text-white py-0.5 px-8 rotate-45 text-xs font-bold shadow-sm">
                      LIDER
                    </div>
                  )}
                  
                  <div className="w-16 h-16 mb-3 flex items-center justify-center rounded-full font-bold text-white shadow-md relative" 
                    style={{ backgroundColor: positionColors[index].medal }}>
                    <span className="text-xl">{position}</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div 
                        className="w-3 h-3 rounded-full mr-1.5" 
                        style={{ backgroundColor: player.color }}
                      ></div>
                      <div className="font-semibold text-neutral-800 dark:text-neutral-100">{player.name}</div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-1">
                      <span className="font-bold text-xl text-neutral-900 dark:text-white">{score}</span> 
                      <span className="ml-1">{getTrendIcon(trend)}</span>
                    </div>
                    
                    <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {trend === 'up' ? 'Urcă în clasament' : 
                       trend === 'down' ? 'Coboară în clasament' : 
                       'Poziție stabilă'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Tabel complet cu scorurile */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-dark-border">
          <table className="min-w-full bg-white dark:bg-dark-surface text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-dark-card-bg border-b border-neutral-200 dark:border-dark-border">
                <th className="sticky left-0 bg-neutral-50 dark:bg-dark-card-bg p-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">Jucător</th>
                {Array.from({ length: totalRounds }, (_, i) => i + 1).map(roundNumber => (
                  <th key={roundNumber} className="p-2.5 text-center whitespace-nowrap font-semibold text-neutral-700 dark:text-neutral-300">
                    <div className="flex flex-col items-center">
                      <span>R{roundNumber}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
                        {getCardsForRound(roundNumber)} mâini
                      </span>
                    </div>
                  </th>
                ))}
                <th className="sticky right-0 bg-neutral-50 dark:bg-dark-card-bg p-3 text-center font-semibold text-neutral-700 dark:text-neutral-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {playerScores.map(({player, score}) => {
                const playerRank = getPlayerRank(player.id);
                const trend = getPlayerTrend(player.id);
                
                return (
                  <tr key={player.id} className="border-b border-neutral-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-dark-border/30 transition-colors">
                    <td className="sticky left-0 bg-white dark:bg-dark-surface p-3 font-medium">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-dark-card-bg font-semibold text-neutral-700 dark:text-neutral-300 mr-3 border border-neutral-200 dark:border-dark-border">
                          {playerRank}
                        </div>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: player.color }}
                          ></div>
                          <span className="text-neutral-800 dark:text-neutral-200">{player.name}</span>
                        </div>
                      </div>
                    </td>
                    
                    {Array.from({ length: totalRounds }, (_, i) => i + 1).map(roundNumber => {
                      const roundData = game.rounds.find(r => r.roundNumber === roundNumber);
                      const playerResult = roundData?.results.find(r => r.playerId === player.id);
                      
                      return (
                        <td key={`${player.id}-${roundNumber}`} className="p-2 text-center">
                          {playerResult ? (
                            <div className="flex flex-col items-center">
                              <div 
                                className={`text-sm font-semibold rounded px-2 py-0.5 ${
                                  playerResult.prediction === playerResult.tricksWon
                                    ? 'bg-success-light dark:bg-success-light/10 text-success-dark dark:text-success'
                                    : 'bg-error-light dark:bg-error-light/10 text-error-dark dark:text-error'
                                }`}
                              >
                                {playerResult.score}
                              </div>
                              <div className="text-xs mt-1 text-neutral-500 dark:text-neutral-400 font-mono">
                                {playerResult.prediction}/{playerResult.tricksWon}
                              </div>
                            </div>
                          ) : roundNumber <= game.currentRound ? (
                            <span className="text-neutral-400 dark:text-neutral-600">-</span>
                          ) : null}
                        </td>
                      );
                    })}
                    
                    <td className="sticky right-0 bg-white dark:bg-dark-surface p-3 text-center font-bold">
                      <div className="flex items-center justify-center">
                        <span className="text-neutral-800 dark:text-neutral-200">{score}</span>
                        <span className="ml-1.5">{getTrendIcon(trend)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard; 