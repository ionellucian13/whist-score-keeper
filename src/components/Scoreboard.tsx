import React, { useState, ReactElement } from 'react';
import { useGameContext } from '../context/GameContext';
import { calculateHandsPerPlayer } from '../utils/gameUtils';
import { Player } from '../models/types';

interface PlayerScore {
  player: Player;
  score: number;
}

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
        return <span className="text-green-500">↑</span>;
      case 'down':
        return <span className="text-red-500">↓</span>;
      default:
        return <span className="text-gray-500">-</span>;
    }
  };
  
  if (!shouldShowScoreboard) {
    return null;
  }
  
  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-4 fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Scoreboard
        </h2>
        
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {showLegend ? 'Ascunde legenda' : 'Arată legenda'}
        </button>
      </div>
      
      {showLegend && (
        <div className="bg-indigo-50 p-3 rounded-md mb-5 text-sm border border-indigo-100 scale-in">
          <p className="font-medium mb-2 text-indigo-800">Legendă format scor:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-indigo-700">
            <li><span className="text-green-600 font-medium">10</span> = Predicție corectă (5 puncte + numărul de mâini câștigate)</li>
            <li><span className="text-red-600 font-medium">-2</span> = Predicție incorectă (0 - diferența absolută între predicție și mâini câștigate)</li>
            <li><span className="font-mono bg-gray-100 px-1 py-0.5 rounded">3/2</span> = Format: Predicție/Mâini câștigate</li>
            <li><span className="text-purple-600 font-medium">+5/-5</span> = Bonus/penalizare pentru 5 runde consecutive corecte/greșite</li>
          </ul>
        </div>
      )}
      
      {/* Clasament rapid */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {playerScores.slice(0, 4).map(({player, score}, index) => {
          const trend = getPlayerTrend(player.id);
          return (
            <div 
              key={player.id} 
              className={`flex items-center p-3 rounded-lg border ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm' 
                  : index === 1
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                    : index === 2
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
                      : 'bg-gray-50 border-gray-200'
              } transition-all hover:shadow-md`}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full font-bold text-white mr-3 shadow-sm" style={{ 
                backgroundColor: index === 0 
                  ? '#FFD700' 
                  : index === 1
                    ? '#C0C0C0'
                    : index === 2
                      ? '#CD7F32'
                      : '#718096' 
              }}>
                {index + 1}
              </div>
              <div className="flex flex-col flex-grow">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: player.color }}
                  ></div>
                  <div className="font-medium truncate">{player.name}</div>
                </div>
                <div className="flex items-center mt-1">
                  <span className="font-bold text-lg mr-1">{score}</span> 
                  <span className={`text-sm ${
                    trend === 'up' 
                      ? 'text-green-500' 
                      : trend === 'down' 
                        ? 'text-red-500' 
                        : 'text-gray-500'
                  }`}>
                    {getTrendIcon(trend)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Tabel complet cu scorurile */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 p-3 text-left font-semibold text-gray-600">Jucător</th>
              {Array.from({ length: totalRounds }, (_, i) => i + 1).map(roundNumber => (
                <th key={roundNumber} className="p-2 text-center whitespace-nowrap font-semibold text-gray-600">
                  R{roundNumber}
                  <div className="text-xs text-gray-500">
                    ({getCardsForRound(roundNumber)} mâini)
                  </div>
                </th>
              ))}
              <th className="sticky right-0 bg-gray-50 p-3 text-center font-semibold text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {playerScores.map(({player}) => {
              const playerRank = getPlayerRank(player.id);
              const trend = getPlayerTrend(player.id);
              
              return (
                <tr key={player.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="sticky left-0 bg-white p-3 font-medium whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700 mr-2 border">
                        {playerRank}
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: player.color }}
                      ></div>
                      <span>{player.name}</span>
                      <span className={`ml-1 ${
                        trend === 'up' 
                          ? 'text-green-500' 
                          : trend === 'down' 
                            ? 'text-red-500' 
                            : 'text-gray-500'
                      }`}>
                        {getTrendIcon(trend)}
                      </span>
                    </div>
                  </td>
                  
                  {Array.from({ length: totalRounds }, (_, i) => i + 1).map(roundNumber => {
                    // Găsim rezultatul pentru runda curentă dacă există
                    const roundData = game.rounds.find(r => r.roundNumber === roundNumber);
                    const playerResult = roundData?.results.find(result => result.playerId === player.id);
                    
                    let displayText = '';
                    let scoreClass = '';
                    
                    if (playerResult) {
                      displayText = `${playerResult.score} (${playerResult.prediction}/${playerResult.tricksWon})`;
                      scoreClass = playerResult.prediction === playerResult.tricksWon ? 'text-green-600' : 'text-red-600';
                    }
                    
                    return (
                      <td 
                        key={roundNumber} 
                        className={`p-2 text-center ${roundNumber === game.currentRound - 1 ? 'animate-highlight' : ''}`}
                      >
                        {playerResult ? (
                          <span className={`${scoreClass} font-medium`}>{displayText}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  
                  <td className="sticky right-0 bg-white p-3 text-center font-bold">
                    {playerScores.find(ps => ps.player.id === player.id)?.score || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Scoreboard; 