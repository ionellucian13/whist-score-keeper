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
        return 'Faza de Mâini';
      case GamePhase.COMPLETE:
        return 'Joc Finalizat';
      case GamePhase.SCOREBOARD:
        return 'Tabela de Scor';
      default:
        return '';
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="logo">
          <span className="card-icon-wrapper">
            <span className="card-icon">
              <span className="spade">♠</span>
              <span className="heart">♥</span>
              <span className="club">♣</span>
              <span className="diamond">♦</span>
            </span>
          </span>
          Whist Românesc
        </h1>
        
        {game && gamePhase !== GamePhase.SETUP && (
          <div className="game-info">
            <div className="game-type-badge">
              {getGameTypeText()}
            </div>
            <div className="round-info">
              {gamePhase !== GamePhase.COMPLETE ? (
                <>
                  <div className="round-counter">
                    <span className="round-number">{game.currentRound}</span>
                    <span className="round-separator">/</span>
                    <span className="total-rounds">{game.totalRounds}</span>
                  </div>
                  <div className="round-progress-container">
                    <div 
                      className="round-progress"
                      aria-label={`Progres joc: ${getGameProgress()}%`}
                      role="progressbar"
                      aria-valuenow={getGameProgress()}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div 
                        className="round-progress-bar" 
                        style={{ width: `${getGameProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="phase-badge" data-phase={gamePhase.toLowerCase()}>
                    {getPhaseText()}
                  </div>
                </>
              ) : (
                <div className="phase-badge complete">Joc Finalizat</div>
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Reguli
        </button>
        
        {gamePhase !== GamePhase.SETUP && (
          <button onClick={handleResetClick} className="reset-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Joc Nou
          </button>
        )}
      </div>
      
      {showResetConfirm && (
        <div className="reset-confirm-overlay">
          <div className="reset-confirm-modal scale-in">
            <div className="modal-header">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3>Resetare Joc</h3>
            </div>
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