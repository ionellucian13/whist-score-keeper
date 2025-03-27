import React, { useEffect, useState } from 'react';
import { GameProvider, useGameContext } from './context/GameContext';
import { GamePhase } from './models/types';
import Header from './components/Header';
import GameSetup from './components/GameSetup';
import PredictionPhase from './components/PredictionPhase';
import TricksPhase from './components/TricksPhase';
import GameComplete from './components/GameComplete';
import Scoreboard from './components/Scoreboard';
import RulesModal from './components/RulesModal';
import './App.css';

const WelcomeAlert: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifică dacă utilizatorul a văzut deja alerta
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      // Dacă nu, afișează alerta și salvează că a văzut-o
      setIsVisible(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  const closeAlert = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-filter backdrop-blur-sm" onClick={closeAlert}></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md shadow-2xl relative z-10 transform transition-all scale-in">
        <div className="text-center mb-6">
          <div className="inline-block p-3 mb-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Bine ai venit!</h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          🎮 <span className="font-medium">Whist Score Keeper</span> e partenerul tău de joc, nu jocul însuși!
        </p>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Această aplicație te ajută să ții scorul la jocul de Whist pe care îl joci în realitate cu prietenii tăi, 
          fără nevoia de hârtie și creion.
        </p>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Ai nevoie de cărți reale și prieteni pentru a juca Whist - noi vom face restul!
        </div>
        
        <button
          onClick={closeAlert}
          className="w-full p-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Am înțeles, hai să începem!
        </button>
      </div>
    </div>
  );
};

const GameContent: React.FC = () => {
  const { gamePhase } = useGameContext();
  
  // Testează și afișează structura jocului în consolă (pentru dezvoltare)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Dynamic import using ES modules
      import('./utils/gameUtils').then(({ _testGameStructure, _testMediumGame }) => {
        // Test functions for each game type and display in console
        _testGameStructure();
        // Test specifically medium game to verify correct number of rounds with 8 hands
        _testMediumGame();
      });
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {gamePhase === GamePhase.SETUP && <GameSetup />}
      {gamePhase === GamePhase.PREDICTION && <PredictionPhase />}
      {gamePhase === GamePhase.TRICKS && <TricksPhase />}
      {gamePhase === GamePhase.COMPLETE && <GameComplete />}
      
      {/* Afișăm Scoreboard pe toate paginile, dar doar dacă nu suntem în faza de setup */}
      {gamePhase !== GamePhase.SETUP && <Scoreboard />}
    </div>
  );
};

const App: React.FC = () => {
  const [showRulesModal, setShowRulesModal] = React.useState(false);
  
  const openRulesModal = () => setShowRulesModal(true);
  const closeRulesModal = () => setShowRulesModal(false);

  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-100">
        <Header onOpenRules={openRulesModal} />
        <GameContent />
        <RulesModal isOpen={showRulesModal} onClose={closeRulesModal} />
        <WelcomeAlert />
      </div>
    </GameProvider>
  );
};

export default App;
