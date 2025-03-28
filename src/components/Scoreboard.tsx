import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { getSortedPlayersByScore } from '../utils/gameUtils';
import { Player } from '../models/types';

interface PlayerTrend {
  player: Player;
  recentScores: number[];
  trend: 'up' | 'down' | 'stable';
}

const Scoreboard: React.FC = () => {
  const { game } = useGameContext();
  const [showLegend, setShowLegend] = useState<boolean>(false);

  if (!game) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary-color rounded-full"></div>
          <div className="h-3 w-3 bg-primary-color rounded-full"></div>
          <div className="h-3 w-3 bg-primary-color rounded-full"></div>
        </div>
      </div>
    );
  }

  // Sortare jucători după scorul total
  const sortedPlayers = getSortedPlayersByScore(game);

  // Obține scorurile recente și tendința pentru fiecare jucător
  const getPlayerTrends = (): PlayerTrend[] => {
    return game.players.map(player => {
      // Obține ultimele 3 runde pentru a calcula tendința
      const recentRounds = game.rounds.slice(-3);
      const recentScores: number[] = [];
      
      // Adună scorurile din rundele recente
      recentRounds.forEach(round => {
        const playerResult = round.results.find(r => r.playerId === player.id);
        if (playerResult) {
          recentScores.push(playerResult.score);
        }
      });
      
      // Calculează tendința pe baza scorurilor recente
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (recentScores.length >= 2) {
        // Suma ultimelor două scoruri pentru a determina tendința
        const latestSum = recentScores.slice(-2).reduce((a, b) => a + b, 0);
        
        if (latestSum > 0) trend = 'up';
        else if (latestSum < 0) trend = 'down';
      }
      
      return {
        player,
        recentScores,
        trend
      };
    });
  };

  const playerTrends = getPlayerTrends();
  
  // Compară scorurile și atribuie ranguri (locuri) jucătorilor
  const getRank = (playerIndex: number): number => {
    const playerScore = sortedPlayers[playerIndex].score;
    
    // Dacă este primul jucător sau are același scor cu jucătorul anterior,
    // primește același rang
    if (playerIndex === 0 || playerScore === sortedPlayers[playerIndex - 1].score) {
      return playerIndex === 0 ? 1 : getRank(playerIndex - 1);
    }
    
    // Altfel, rangul este poziția curentă + 1
    return playerIndex + 1;
  };
  
  // Obține culoarea pentru rang (locul 1, 2, sau 3)
  const getRankColor = (rank: number): string => {
    switch(rank) {
      case 1: return 'bg-amber-400 dark:bg-amber-500';
      case 2: return 'bg-neutral-400 dark:bg-neutral-300';
      case 3: return 'bg-amber-700 dark:bg-amber-600';
      default: return 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300';
    }
  };
  
  // Obține iconul pentru tendință (în creștere, în scădere, stabil)
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center text-success-color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center text-error-color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-neutral-500 dark:text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a1 1 0 01-1 1H3a1 1 0 110-2h14a1 1 0 011 1z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="card bg-app-surface shadow-app-elevation-2 rounded-radius-xl overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-app-text-primary">
            Clasament
          </h2>
          <button 
            className="text-sm flex items-center px-3 py-1.5 rounded-md bg-primary-surface text-primary-color hover:bg-primary-color hover:text-white transition-all"
            onClick={() => setShowLegend(!showLegend)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {showLegend ? 'Ascunde legenda' : 'Arată legenda'}
          </button>
        </div>
        
        {showLegend && (
          <div className="bg-app-surface-hover border border-app-border rounded-radius-lg p-4 mb-6 text-sm text-app-text-secondary animate-fadeIn">
            <h3 className="font-semibold mb-2 text-app-text-primary">Interpretarea scorurilor</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success-surface text-success-color mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Prezicere corectă: <strong>5 + numărul de mâini câștigate</strong></span>
              </li>
              <li className="flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-error-surface text-error-color mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Prezicere greșită: <strong>0 - diferența dintre prezicere și mâini câștigate</strong></span>
              </li>
              <li className="flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-surface text-primary-color mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </span>
                <span>Bonus/Penalizare consecvență: <strong>±5 puncte</strong> pentru 5 runde consecutive corecte/greșite</span>
              </li>
            </ul>
          </div>
        )}
        
        <div className="space-y-4">
          {sortedPlayers.map((playerData, index) => {
            const rank = getRank(index);
            const playerTrend = playerTrends.find(pt => pt.player.id === playerData.player.id);
            
            return (
              <div 
                key={playerData.player.id} 
                className="flex items-center p-4 border border-app-border rounded-radius-lg bg-app-surface hover:border-primary-color transition-all"
              >
                <div className="flex items-center mr-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${getRankColor(rank)}`}>
                    {rank}
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full mr-3" 
                    style={{ backgroundColor: playerData.player.color }}
                  ></div>
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-app-text-primary">{playerData.player.name}</div>
                  <div className="flex items-center text-sm text-app-text-secondary">
                    <span className="mr-2">
                      {playerTrend?.recentScores.map((score, i) => (
                        <span 
                          key={i} 
                          className={`inline-block mx-0.5 px-1.5 rounded-sm text-xs font-medium ${
                            score > 0 
                              ? 'bg-success-surface text-success-color' 
                              : score < 0 
                                ? 'bg-error-surface text-error-color' 
                                : 'bg-app-surface-hover text-app-text-tertiary'
                          }`}
                        >
                          {score > 0 ? `+${score}` : score}
                        </span>
                      ))}
                    </span>
                    {playerTrend && getTrendIcon(playerTrend.trend)}
                  </div>
                </div>
                
                <div className="text-xl font-bold text-app-text-primary">
                  {playerData.score}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard; 