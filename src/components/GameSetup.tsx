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
  
  const totalRounds = calculateTotalRounds(
    playerNames.filter(name => name.trim().length > 0).length || DEFAULT_GAME_SETTINGS.minPlayers,
    gameType
  );
  
  return (
    <div className="card bg-white dark:bg-dark-card-bg shadow-lg rounded-xl overflow-hidden">
      <div className="p-6 md:p-8">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary-light dark:bg-primary-light/10 text-primary-color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            Configurare Joc Nou
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            Configurează jocul selectând jucătorii și tipul de joc
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-color" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Jucători
              </h3>
              <button 
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-sm flex items-center text-primary-color hover:text-primary-hover dark:text-primary-color dark:hover:text-primary-hover transition-colors"
              >
                <span className="mr-1">{showHelp ? 'Ascunde' : 'Arată'} sfaturi</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {showHelp && (
              <div className="bg-info-light dark:bg-info-light/10 p-4 rounded-lg text-sm border-l-4 border-info">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-info" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-info-dark dark:text-info mb-1">Sfaturi pentru configurarea jocului:</p>
                    <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
                      <li>Adaugă între {DEFAULT_GAME_SETTINGS.minPlayers} și {DEFAULT_GAME_SETTINGS.maxPlayers} jucători</li>
                      <li>Fiecare jucător trebuie să aibă un nume unic</li>
                      <li>Alege tipul de joc în funcție de timpul disponibil</li>
                      <li>Jocul scurt este perfect pentru începători ({GameType.SHORT})</li>
                      <li>Jocul mediu este recomandat pentru sesiuni normale ({GameType.MEDIUM})</li>
                      <li>Jocul lung oferă experiența completă de Whist ({GameType.LONG})</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {playerNames.map((name, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="player-indicator shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110" 
                    style={{ backgroundColor: DEFAULT_GAME_SETTINGS.playerColors[index % DEFAULT_GAME_SETTINGS.playerColors.length] }}>
                    <span className="font-bold text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      placeholder={`Numele jucătorului ${index + 1}`}
                      className="w-full p-3 bg-neutral-50 dark:bg-dark-surface border border-neutral-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-color focus:border-primary-color transition-all dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </div>
                  {playerNames.length > DEFAULT_GAME_SETTINGS.minPlayers && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(index)}
                      className="p-2.5 text-neutral-400 hover:text-error hover:bg-error-light dark:hover:bg-error-light/10 rounded-full transition-colors"
                      aria-label="Elimină jucătorul"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {playerNames.length < DEFAULT_GAME_SETTINGS.maxPlayers && (
              <button
                type="button"
                onClick={handleAddPlayer}
                className="w-full p-3.5 border border-dashed border-neutral-300 dark:border-dark-border rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-primary-color hover:border-primary-color hover:bg-primary-light/20 dark:hover:border-primary-color dark:hover:bg-primary-light/5 flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Adaugă jucător
              </button>
            )}
          </div>
          
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-color" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Lungimea Jocului
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(GameType).map((type) => (
                <div 
                  key={type}
                  onClick={() => handleGameTypeChange(type)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    gameType === type 
                      ? 'border-primary-color bg-primary-light/30 dark:bg-primary-light/10 shadow-sm' 
                      : 'border-neutral-200 dark:border-dark-border hover:border-primary-color dark:hover:border-primary-color dark:bg-dark-surface'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`game-type-indicator inline-block w-5 h-5 rounded-full mr-3 transition-colors ${
                      gameType === type ? 'bg-primary-color' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}>
                      {gameType === type && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <span className={`font-medium ${gameType === type ? 'text-primary-color' : 'text-neutral-700 dark:text-neutral-300'}`}>
                      {type === GameType.SHORT ? 'Scurt' : type === GameType.MEDIUM ? 'Mediu' : 'Lung'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{getGameTypeDescription(type)}</p>
                </div>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="bg-error-light dark:bg-error-light/10 p-4 rounded-lg border-l-4 border-error text-error-dark dark:text-error flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-medium">Total runde:</span> {totalRounds}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-medium">Jucători:</span> {playerNames.filter(name => name.trim().length > 0).length || 0}/{DEFAULT_GAME_SETTINGS.maxPlayers}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full p-4 rounded-lg text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isValid
                  ? 'bg-gradient-to-r from-primary-color to-primary-hover hover:from-primary-hover hover:to-primary-dark shadow-md hover:shadow-lg focus:ring-primary-color'
                  : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center">
                <span>Începe Jocul</span>
                {isValid && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameSetup; 