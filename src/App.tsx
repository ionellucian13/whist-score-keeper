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
import Notification from './components/Notification';
import './App.css';

const GameContent: React.FC = () => {
  const { gamePhase } = useGameContext();
  
  // Testează și afișează structura jocului în consolă (pentru dezvoltare)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Import dinamic pentru a evita dependența directă
      const { _testGameStructure, _testMediumGame } = require('./utils/gameUtils');
      // Testează funcțiile pentru fiecare tip de joc și afișează în consolă
      _testGameStructure();
      // Testează specific jocul mediu pentru a verifica numărul corect de runde cu 8 mâini
      _testMediumGame();
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
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const openRulesModal = () => setShowRulesModal(true);
  const closeRulesModal = () => setShowRulesModal(false);
  const closeNotification = () => {
    setShowNotification(false);
    // Incrementăm contorul de vizite
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
    localStorage.setItem('visitCount', (visitCount + 1).toString());
  };

  // Verifică dacă trebuie să afișeze notificarea
  useEffect(() => {
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0', 10);
    if (visitCount < 2) {
      setShowNotification(true);
    }
  }, []);

  const notificationMessage = "Bun venit la Whist Score Keeper! Această aplicație este partenerul tău digital pentru jocul tradițional de whist. Joacă-te în realitate cu prietenii și lasă-ne pe noi să ținem scorul - fără hârtie, fără pix, doar distracție pură!";

  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-100">
        <Header onOpenRules={openRulesModal} />
        <GameContent />
        <RulesModal isOpen={showRulesModal} onClose={closeRulesModal} />
        {showNotification && (
          <Notification 
            message={notificationMessage} 
            onClose={closeNotification} 
          />
        )}
      </div>
    </GameProvider>
  );
};

export default App;
