import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { Player, PlayerRanking } from '../models/types';
import Confetti from 'react-confetti';
import { useWindowSize } from '../utils/hooks';

const GameComplete: React.FC = () => {
  const { game, resetGame, restartGameWithSamePlayers } = useGameContext();
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();
  
  useEffect(() => {
    if (game) {
      // Calculează scorul final pentru fiecare jucător
      const playerRankings: PlayerRanking[] = game.players.map(player => {
        const playerResults = game.rounds.flatMap(round => 
          round.results.filter(result => result.playerId === player.id)
        );
        
        const totalScore = playerResults.reduce((sum, result) => sum + result.score, 0);
        
        return {
          id: player.id,
          name: player.name,
          color: player.color,
          score: totalScore,
          rank: 0
        };
      });
      
      // Sortează și atribuie ranguri
      playerRankings.sort((a, b) => b.score - a.score);
      
      let currentRank = 1;
      let previousScore = playerRankings[0]?.score;
      
      playerRankings.forEach((player, index) => {
        if (index > 0 && player.score < previousScore) {
          currentRank = index + 1;
        }
        player.rank = currentRank;
        previousScore = player.score;
      });
      
      setRankings(playerRankings);
      
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [game]);

  const handleNewGameSamePlayers = () => {
    if (game) {
      restartGameWithSamePlayers();
    }
  };

  const handleNewGameDifferentPlayers = () => {
    resetGame();
  };
  
  const handleShare = () => {
    if (!game) return;
    
    try {
      const shareText = `Rezultate Whist:\n${rankings.map(player => 
        `${player.rank}. ${player.name}: ${player.score} puncte`
      ).join('\n')}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Rezultate Whist',
          text: shareText
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('Rezultatele au fost copiate în clipboard!');
      }
    } catch (error) {
      console.error('Eroare la partajare:', error);
    }
  };
  
  if (!game) {
    return null;
  }
  
  const winner = rankings[0];
  
  return (
    <div className="card max-w-lg mx-auto p-6 slide-in-up">
      {showConfetti && <Confetti width={width} height={height} recycle={true} numberOfPieces={200} gravity={0.15} />}
      
      <div className="text-center mb-8">
        <div className="inline-block p-3 mb-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Joc Terminat!</h1>
        {winner && (
          <div className="winner-announcement fade-in">
            <p className="text-lg mb-2">Câștigător:</p>
            <div className="flex items-center justify-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md mr-3"
                style={{ backgroundColor: winner.color }}
              >
                1
              </div>
              <span className="text-2xl font-bold" style={{ color: winner.color }}>{winner.name}</span>
            </div>
            <p className="text-xl mt-2">
              <span className="font-semibold">{winner.score}</span> puncte
            </p>
          </div>
        )}
      </div>
      
      <div className="winners-podium mb-10">
        <div className="flex justify-center items-end h-52 px-4">
          {/* Locul 2 */}
          {rankings.length > 1 && (
            <div className="podium-place scale-in" style={{ width: '30%', marginRight: '2%', animationDelay: '0.2s' }}>
              <div className="h-24 rounded-t-lg flex items-center justify-center relative shadow-md" style={{ backgroundColor: rankings[1].color + '33' }}>
                <div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
                  style={{ backgroundColor: rankings[1].color }}
                >
                  2
                </div>
                <div className="text-center">
                  <div className="font-bold truncate px-2">{rankings[1].name}</div>
                  <div className="text-lg">{rankings[1].score} pct</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Locul 1 */}
          {rankings.length > 0 && (
            <div className="podium-place scale-in" style={{ width: '34%', marginRight: '2%', marginLeft: '2%', animationDelay: '0s' }}>
              <div className="h-40 rounded-t-lg flex items-center justify-center relative shadow-md" style={{ 
                background: `linear-gradient(to bottom, ${rankings[0].color}33, ${rankings[0].color}66)`
              }}>
                <div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                  style={{ backgroundColor: rankings[0].color }}
                >
                  1
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold truncate px-2">{rankings[0].name}</div>
                  <div className="text-xl font-semibold">{rankings[0].score} pct</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Locul 3 */}
          {rankings.length > 2 && (
            <div className="podium-place scale-in" style={{ width: '30%', animationDelay: '0.4s' }}>
              <div className="h-16 rounded-t-lg flex items-center justify-center relative shadow-md" style={{ backgroundColor: rankings[2].color + '33' }}>
                <div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
                  style={{ backgroundColor: rankings[2].color }}
                >
                  3
                </div>
                <div className="text-center">
                  <div className="font-bold truncate px-2">{rankings[2].name}</div>
                  <div>{rankings[2].score} pct</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="results-table mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Clasament Final
        </h2>
        <table className="w-full rounded-lg overflow-hidden border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">Loc</th>
              <th className="py-3 px-2 text-left text-gray-600 font-semibold">Jucător</th>
              <th className="py-3 px-4 text-right text-gray-600 font-semibold">Puncte</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((player, index) => (
              <tr 
                key={player.id} 
                className={`border-b ${index < 3 ? 'font-medium' : ''} hover:bg-gray-50 transition-colors fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <td className="py-3 px-4">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      player.rank === 1 ? 'bg-yellow-400' : 
                      player.rank === 2 ? 'bg-gray-400' : 
                      player.rank === 3 ? 'bg-amber-700' : 
                      'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {player.rank}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: player.color }}
                    ></div>
                    <span>{player.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-semibold text-xl">
                  {player.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 space-y-4">
        <button
          onClick={handleNewGameSamePlayers}
          className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center shadow-sm hover:shadow transform hover:-translate-y-1 active:translate-y-0 active:shadow-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Joc Nou cu Aceiași Jucători
        </button>

        <button
          onClick={handleNewGameDifferentPlayers}
          className="w-full p-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors font-medium flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Joc Nou cu Jucători Diferiți
        </button>
        
        <button
          onClick={handleShare}
          className="w-full p-3 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Partajează Rezultatele
        </button>
      </div>
      
      <div className="text-center text-gray-500 text-sm mt-6">
        <p>Mulțumim că ai folosit Whist Score Keeper!</p>
        <div className="mt-2 flex justify-center">
          <span className="text-xl">♠ ♥ ♣ ♦</span>
        </div>
      </div>
    </div>
  );
};

export default GameComplete; 