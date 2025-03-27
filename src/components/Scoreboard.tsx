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
  
  // Formatarea scorului pentru afișare
  const formatScore = (score: number | undefined, prediction?: number, tricksWon?: number): ReactElement => {
    if (score === undefined) return <span>-</span>;
    
    // Dacă nu avem predicție sau tricks, afișăm doar scorul
    if (prediction === undefined || tricksWon === undefined) {
      return <span className={score >= 0 ? 'text-green-600' : 'text-red-600'}>{score}</span>;
    }
    
    // Predicție corectă (verde), predicție greșită (roșu)
    const isCorrectPrediction = prediction === tricksWon;
    const colorClass = isCorrectPrediction ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={colorClass}>
        {score} <span className="text-xs">({prediction}/{tricksWon})</span>
      </span>
    );
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
    <div className="mt-8 bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Scoreboard</h2>
        
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          {showLegend ? 'Ascunde legenda' : 'Arată legenda'}
        </button>
      </div>
      
      {showLegend && (
        <div className="bg-gray-50 p-3 rounded-md mb-4 text-sm">
          <p className="font-medium mb-1">Legendă format scor:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-green-600">10</span> = Predicție corectă (5 puncte + numărul de mâini câștigate)</li>
            <li><span className="text-red-600">-2</span> = Predicție incorectă (0 - diferența absolută între predicție și mâini câștigate)</li>
            <li><span className="font-mono">3/2</span> = Format: Predicție/Mâini câștigate</li>
            <li><span className="text-purple-600">+5/-5</span> = Bonus/penalizare pentru 5 runde consecutive corecte/greșite</li>
          </ul>
        </div>
      )}
      
      {/* Clasament rapid */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {playerScores.slice(0, 4).map(({player, score}, index) => {
          const trend = getPlayerTrend(player.id);
          return (
            <div key={player.id} className={`flex items-center p-2 rounded-md border ${index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700">
                {index + 1}
              </div>
              <div 
                className="w-3 h-3 rounded-full ml-2" 
                style={{ backgroundColor: player.color }}
              ></div>
              <div className="ml-2 flex-grow">
                <div className="font-medium">{player.name}</div>
              </div>
              <div className="font-bold text-lg">
                {score} {getTrendIcon(trend)}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Tabel complet cu scorurile */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="sticky left-0 bg-gray-100 p-2 text-left">Jucător</th>
              {Array.from({ length: totalRounds }, (_, i) => i + 1).map(roundNumber => (
                <th key={roundNumber} className="p-2 text-center whitespace-nowrap">
                  R{roundNumber}
                  <div className="text-xs text-gray-500">
                    ({getCardsForRound(roundNumber)} mâini)
                  </div>
                </th>
              ))}
              <th className="sticky right-0 bg-gray-100 p-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {playerScores.map(({player}) => {
              const playerRank = getPlayerRank(player.id);
              const trend = getPlayerTrend(player.id);
              
              return (
                <tr key={player.id} className="border-b hover:bg-gray-50">
                  <td className="sticky left-0 bg-white p-2 font-medium whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700 mr-2">
                        {playerRank}
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: player.color }}
                      ></div>
                      <span>{player.name}</span>
                      <span className="ml-1">{getTrendIcon(trend)}</span>
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
                        className="p-2 text-center"
                      >
                        {playerResult ? (
                          <span className={scoreClass}>{displayText}</span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    );
                  })}
                  
                  <td className="sticky right-0 bg-white p-2 text-center font-bold">
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