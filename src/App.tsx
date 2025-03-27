import React, { useEffect } from 'react';
import { GameProvider, useGameContext } from './context/GameContext';
import { GamePhase, GameType } from './models/types';
import Header from './components/Header';
import GameSetup from './components/GameSetup';
import PredictionPhase from './components/PredictionPhase';
import TricksPhase from './components/TricksPhase';
import GameComplete from './components/GameComplete';
import Scoreboard from './components/Scoreboard';
import RulesModal from './components/RulesModal';
import './App.css';

const GameContent: React.FC = () => {
  const { gamePhase } = useGameContext();
  
  // Testează și afișează structura jocului în consolă (pentru dezvoltare)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Import dinamic pentru a evita dependența directă
      const { _testGameStructure } = require('./utils/gameUtils');
      // Testează funcțiile pentru fiecare tip de joc și afișează în consolă
      _testGameStructure();
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
      </div>
    </GameProvider>
  );
};

export default App;
