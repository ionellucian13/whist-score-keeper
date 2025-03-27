import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface PlayerRanking {
  id: string;
  name: string;
  color: string;
  score: number;
  rank: number;
}

const GameComplete: React.FC = () => {
  const { game, resetGame } = useGameContext();
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();
  
  useEffect(() => {
    if (game) {
      // Calculează scorul final pentru fiecare jucător
      const playerRankings: PlayerRanking[] = game.players.map(player => {
        // Obține toate rezultatele pentru acest jucător
        const playerResults = game.rounds.flatMap(round => 
          round.results.filter(result => result.playerId === player.id)
        );
        
        // Calculează scorul total
        const totalScore = playerResults.reduce((sum, result) => sum + result.score, 0);
        
        return {
          id: player.id,
          name: player.name,
          color: player.color,
          score: totalScore,
          rank: 0 // vom calcula asta după sortare
        };
      });
      
      // Sortează jucătorii după scor (descrescător)
      playerRankings.sort((a, b) => b.score - a.score);
      
      // Atribuie ranguri (ținând cont de scoruri egale)
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
      
      // Oprește confetti după 5 secunde
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [game]);
  
  const handlePlayAgain = () => {
    resetGame();
  };
  
  const handleShare = () => {
    if (!game) return;
    
    try {
      // Creează textul pentru partajare
      const shareText = `Rezultate Whist:\n${rankings.map(player => 
        `${player.rank}. ${player.name}: ${player.score} puncte`
      ).join('\n')}`;
      
      // Verifică dacă API-ul de partajare este disponibil
      if (navigator.share) {
        navigator.share({
          title: 'Rezultate Whist',
          text: shareText
        });
      } else {
        // Copia în clipboard ca alternativă
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
    <div className="card max-w-lg mx-auto p-6">
      {showConfetti && <Confetti width={width} height={height} recycle={true} numberOfPieces={150} />}
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Joc Terminat!</h1>
        {winner && (
          <p className="text-lg">
            Câștigător: <span className="font-bold" style={{ color: winner.color }}>{winner.name}</span> cu {winner.score} puncte!
          </p>
        )}
      </div>
      
      <div className="winners-podium mb-8">
        <div className="flex justify-center items-end h-48 px-4">
          {/* Locul 2 */}
          {rankings.length > 1 && (
            <div className="podium-place" style={{ width: '30%', marginRight: '2%' }}>
              <div className="h-24 rounded-t-lg bg-gray-200 flex items-center justify-center relative">
                <div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
                  style={{ backgroundColor: rankings[1].color }}
                >
                  2
                </div>
                <div className="text-center">
                  <div className="font-bold truncate px-2">{rankings[1].name}</div>
                  <div>{rankings[1].score} pct</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Locul 1 */}
          {rankings.length > 0 && (
            <div className="podium-place" style={{ width: '34%', marginRight: '2%', marginLeft: '2%' }}>
              <div className="h-36 rounded-t-lg bg-yellow-200 flex items-center justify-center relative">
                <div 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                  style={{ backgroundColor: rankings[0].color }}
                >
                  1
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold truncate px-2">{rankings[0].name}</div>
                  <div className="text-lg">{rankings[0].score} pct</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Locul 3 */}
          {rankings.length > 2 && (
            <div className="podium-place" style={{ width: '30%' }}>
              <div className="h-16 rounded-t-lg bg-gray-200 flex items-center justify-center relative">
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
        <h2 className="text-lg font-semibold mb-4">Clasament Final</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="pb-2 text-left">Loc</th>
              <th className="pb-2 text-left">Jucător</th>
              <th className="pb-2 text-right">Puncte</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((player, index) => (
              <tr 
                key={player.id} 
                className={`border-b ${index < 3 ? 'font-medium' : ''}`}
              >
                <td className="py-3">
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
                <td className="py-3">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: player.color }}
                    ></div>
                    <span>{player.name}</span>
                  </div>
                </td>
                <td className="py-3 text-right font-semibold">
                  {player.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="action-buttons space-y-3">
        <button
          onClick={handlePlayAgain}
          className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
        >
          Joc Nou
        </button>
        
        <button
          onClick={handleShare}
          className="w-full p-3 border border-indigo-500 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors font-medium flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          Partajează Rezultatele
        </button>
        
        <div className="text-center text-gray-500 text-sm mt-4">
          Mulțumim că ai jucat Whist Score Keeper!
        </div>
      </div>
    </div>
  );
};

export default GameComplete; 