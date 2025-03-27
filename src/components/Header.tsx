import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { GamePhase, GameType } from '../models/types';
import RulesModal from './RulesModal';
import './Header.css';

interface HeaderProps {
  onOpenRules?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenRules }) => {
  const { game, gamePhase, resetGame } = useGameContext();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Verifică preferința salvată sau preferința sistemului
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Aplică tema când se schimbă
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  
  const handleResetClick = () => {
    setShowResetConfirm(true);
  };
  
  const confirmReset = () => {
    resetGame();
    setShowResetConfirm(false);
  };
  
  const cancelReset = () => {
    setShowResetConfirm(false);
  };
  
  const openRulesModal = () => {
    if (onOpenRules) {
      // Folosim prop-ul pentru a deschide modal-ul din părinte
      onOpenRules();
    } else {
      // Fallback la comportamentul original
      setShowRulesModal(true);
    }
  };
  
  const closeRulesModal = () => {
    setShowRulesModal(false);
  };
  
  // Toggle dark mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  // Determină textul pentru tipul de joc
  const getGameTypeText = () => {
    if (!game?.gameType) return '';
    
    switch (game.gameType) {
      case GameType.SHORT:
        return 'Joc Scurt (8 runde)';
      case GameType.MEDIUM:
        return `Joc Mediu (${2 * game.players.length + 7} runde)`;
      case GameType.LONG:
        return `Joc Lung (${3 * game.players.length + 12} runde)`;
      default:
        return '';
    }
  };
  
  // Calculează progresul jocului
  const getGameProgress = (): number => {
    if (!game) return 0;
    return Math.min(100, Math.round((game.currentRound / game.totalRounds) * 100));
  };
  
  // Determină textul pentru faza curentă
  const getPhaseText = () => {
    switch (gamePhase) {
      case GamePhase.PREDICTION:
        return 'Faza de Predicție';
      case GamePhase.TRICKS:
        return 'Faza de înregistrare a Câștigurilor';
      case GamePhase.COMPLETE:
        return 'Joc Finalizat';
      default:
        return '';
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="logo">
          <span className="card-icon">♠♥♣♦</span>
          Whist Românesc
        </h1>
        
        {game && gamePhase !== GamePhase.SETUP && (
          <div className="game-info">
            <div className="game-type">{getGameTypeText()}</div>
            <div className="round-info">
              {gamePhase !== GamePhase.COMPLETE ? (
                <>
                  <span>Runda {game.currentRound} din {game.totalRounds}</span>
                  <div className="round-progress">
                    <div 
                      className="round-progress-bar" 
                      style={{ width: `${getGameProgress()}%` }}
                    ></div>
                  </div>
                  <span className="badge badge-primary">{getPhaseText()}</span>
                </>
              ) : (
                <span className="badge badge-success">Joc Finalizat</span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="header-actions">
        <button 
          onClick={toggleTheme} 
          className="theme-toggle"
          aria-label={darkMode ? 'Comută la tema luminoasă' : 'Comută la tema întunecată'}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
        
        <button onClick={openRulesModal} className="rules-button">
          Reguli
        </button>
        
        {gamePhase !== GamePhase.SETUP && (
          <button onClick={handleResetClick} className="reset-button">
            Joc Nou
          </button>
        )}
      </div>
      
      {showResetConfirm && (
        <div className="reset-confirm-overlay">
          <div className="reset-confirm-modal scale-in">
            <h3>Resetare Joc</h3>
            <p>Ești sigur că vrei să începi un joc nou? Toate datele curente vor fi pierdute.</p>
            <div className="reset-actions">
              <button onClick={cancelReset} className="cancel-button">
                Anulează
              </button>
              <button onClick={confirmReset} className="confirm-button">
                Resetează
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Renderează modal-ul doar dacă nu este gestionat de părinte */}
      {!onOpenRules && <RulesModal isOpen={showRulesModal} onClose={closeRulesModal} />}
    </header>
  );
};

export default Header; 