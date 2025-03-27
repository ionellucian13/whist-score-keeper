import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { GameType } from '../models/types';
import { calculateTotalRounds } from '../utils/gameUtils';
import { DEFAULT_GAME_SETTINGS } from '../utils/gameUtils';

const GameSetup: React.FC = () => {
  const { createGame } = useGameContext();
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '']);
  const [gameType, setGameType] = useState<GameType>(GameType.MEDIUM);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  // Validăm playerNames de fiecare dată când se schimbă
  useEffect(() => {
    // Verificăm dacă avem cel puțin 3 jucători cu nume completate
    const validPlayers = playerNames.filter(name => name.trim().length > 0);
    setIsValid(validPlayers.length >= DEFAULT_GAME_SETTINGS.minPlayers);
  }, [playerNames]);
  
  const handlePlayerNameChange = (index: number, value: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = value;
    setPlayerNames(newPlayerNames);
    
    // Resetăm eroarea când utilizatorul începe să tasteze
    if (error) {
      setError(null);
    }
  };
  
  const handleAddPlayer = () => {
    if (playerNames.length < DEFAULT_GAME_SETTINGS.maxPlayers) {
      setPlayerNames([...playerNames, '']);
    }
  };
  
  const handleRemovePlayer = (index: number) => {
    if (playerNames.length > DEFAULT_GAME_SETTINGS.minPlayers) {
      const newPlayerNames = [...playerNames];
      newPlayerNames.splice(index, 1);
      setPlayerNames(newPlayerNames);
    }
  };
  
  const handleGameTypeChange = (type: GameType) => {
    setGameType(type);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtrăm jucătorii completați
    const validPlayers = playerNames.filter(name => name.trim().length > 0);
    
    // Verificăm dacă avem destui jucători
    if (validPlayers.length < DEFAULT_GAME_SETTINGS.minPlayers) {
      setError(`Jocul necesită cel puțin ${DEFAULT_GAME_SETTINGS.minPlayers} jucători.`);
      return;
    }
    
    // Verificăm dacă există nume duplicate
    const uniqueNames = new Set(validPlayers.map(name => name.toLowerCase()));
    if (uniqueNames.size !== validPlayers.length) {
      setError('Numele jucătorilor trebuie să fie unice.');
      return;
    }
    
    // Creăm jocul cu jucătorii valizi
    createGame(validPlayers, gameType);
  };
  
  const getGameTypeDescription = (type: GameType): string => {
    const validPlayers = playerNames.filter(name => name.trim().length > 0).length || DEFAULT_GAME_SETTINGS.minPlayers;
    
    switch (type) {
      case GameType.SHORT:
        return 'Joc scurt: 8 runde (mâini de la 1 la 8)';
      case GameType.MEDIUM:
        return `Joc mediu: ${2 * validPlayers + 7} runde (rundă de 1 mână × ${validPlayers}, urcare 2-8, rundă de 8 mâini × ${validPlayers})`;
      case GameType.LONG:
      default:
        return `Joc lung: ${3 * validPlayers + 12} runde (rundă de 1 mână × ${validPlayers}, urcare 2-7, rundă de 8 mâini × ${validPlayers}, coborâre 7-2, rundă de 1 mână × ${validPlayers})`;
    }
  };
  
  return (
    <div className="card max-w-xl mx-auto mt-8 p-6">
      <header className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Configurare Joc Nou
        </h2>
        <p className="text-gray-600">
          Configurează jocul selectând numărul de jucători și tipul de joc
        </p>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Jucători</h3>
            <div className="tooltip">
              <button 
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <span className="mr-1">{showHelp ? 'Ascunde' : 'Arată'} ajutor</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
          
          {showHelp && (
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 mb-4">
              <p className="font-medium mb-1">Sfaturi pentru configurarea jocului:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Adaugă între {DEFAULT_GAME_SETTINGS.minPlayers} și {DEFAULT_GAME_SETTINGS.maxPlayers} jucători</li>
                <li>Fiecare jucător trebuie să aibă un nume unic</li>
                <li>Alege tipul de joc în funcție de timpul disponibil</li>
                <li>Jocul scurt este perfect pentru începători</li>
                <li>Jocul mediu este recomandat pentru sesiuni normale</li>
                <li>Jocul lung oferă experiența completă de Whist</li>
              </ul>
            </div>
          )}
          
          {playerNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: DEFAULT_GAME_SETTINGS.playerColors[index % DEFAULT_GAME_SETTINGS.playerColors.length] }}>
                {index + 1}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                placeholder={`Numele jucătorului ${index + 1}`}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {playerNames.length > DEFAULT_GAME_SETTINGS.minPlayers && (
                <button
                  type="button"
                  onClick={() => handleRemovePlayer(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          {playerNames.length < DEFAULT_GAME_SETTINGS.maxPlayers && (
            <button
              type="button"
              onClick={handleAddPlayer}
              className="w-full p-2 border border-dashed border-gray-300 rounded-md text-gray-500 hover:text-indigo-600 hover:border-indigo-500 flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Adaugă jucător
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lungimea Jocului</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(GameType).map((type) => (
              <div 
                key={type}
                onClick={() => handleGameTypeChange(type)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  gameType === type 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-4 h-4 rounded-full mr-2 ${gameType === type ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                  <span className="font-medium">
                    {type === GameType.SHORT ? 'Scurt' : type === GameType.MEDIUM ? 'Mediu' : 'Lung'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{getGameTypeDescription(type)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4">
          <div className="flex items-center justify-end mb-3">
            <span className="text-sm text-gray-600">
              Jucători: <strong>{playerNames.filter(Boolean).length}/{playerNames.length}</strong>
            </span>
          </div>
          
          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full p-3 rounded-lg font-medium ${
              isValid 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            Începe Joc Nou
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameSetup; 