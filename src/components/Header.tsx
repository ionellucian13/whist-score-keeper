import React, { useState, useEffect, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { GamePhase, GameType } from '../models/types';
import RulesModal from './RulesModal';
import './Header.css';

interface HeaderProps {
  onShowRules: () => void;
  onConfirm: (message: string, action: () => void) => void;
}

const Header: React.FC<HeaderProps> = ({ onShowRules, onConfirm }) => {
  const gameContext = useContext(GameContext);
  
  if (!gameContext) {
    throw new Error('Header must be used within a GameProvider');
  }
  
  const { game, gamePhase, resetGame } = gameContext;
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showPhaseSelector, setShowPhaseSelector] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  
  // Verificăm preferințele utilizatorului pentru tema întunecată
  useEffect(() => {
    let prefersDark = false;
    try {
      if (typeof window.matchMedia === 'function') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        prefersDark = !!mediaQuery && mediaQuery.matches === true;
      }
    } catch (error) {
      console.error('Error checking dark mode preference:', error);
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.body.classList.add("dark-theme");
    } else {
      setIsDark(false);
      document.body.classList.remove("dark-theme");
    }
    
    // Adăugăm un ascultător pentru a detecta scrollul și a aplica o clasă
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleReset = () => {
    if (window.confirm("Ești sigur că vrei să începi un joc nou?")) {
      resetGame();
    }
  };
  
  const openRulesModal = () => {
    if (onShowRules) {
      // Folosim prop-ul pentru a deschide modal-ul din părinte
      onShowRules();
    } else {
      // Fallback la comportamentul original
      setShowRulesModal(true);
    }
  };
  
  const closeRulesModal = () => {
    setShowRulesModal(false);
  };
  
  // Toggle tema între light și dark
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  };
  
  // Toggle dropdown pentru acțiuni
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setShowPhaseSelector(false);
  };
  
  // Toggle selector pentru faze
  const togglePhaseSelector = () => {
    setShowPhaseSelector(!showPhaseSelector);
    setShowDropdown(false);
  };
  
  // Închide dropdowns când se face click în altă parte
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (!target.closest('.phase-dropdown') && !target.closest('.phase-button')) {
        setShowPhaseSelector(false);
      }
      
      if (!target.closest('.action-dropdown') && !target.closest('.action-button')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Schimbă faza jocului
  const changeGamePhase = (phase: GamePhase) => {
    if (gameContext.setGamePhase) {
      gameContext.setGamePhase(phase);
    }
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
  
  // Obține numele fazei curente pentru afișare
  const getCurrentPhaseName = () => {
    switch (gamePhase) {
      case GamePhase.PREDICTION:
        return 'Predicții';
      case GamePhase.TRICKS:
        return 'Rezultate';
      case GamePhase.SCOREBOARD:
        return 'Clasament';
      case GamePhase.COMPLETE:
        return 'Finalizat';
      default:
        return 'Setare';
    }
  };
  
  // Handler pentru resetarea jocului cu confirmare
  const handleResetGame = () => {
    onConfirm(
      'Ești sigur că vrei să resetezi jocul? Toate datele vor fi pierdute.',
      () => {
        resetGame();
        setShowDropdown(false);
      }
    );
  };
  
  return (
    <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo-container">
          <div className="logo-icon">
            <span className="icon-spades">♠</span>
            <span className="icon-hearts">♥</span>
            <span className="icon-diamonds">♦</span>
            <span className="icon-clubs">♣</span>
          </div>
          <h1 className="app-title">Whist Românesc</h1>
        </div>

        <div className="header-controls">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            title="Joc nou"
          >
            Joc nou
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Comută la tema deschisă" : "Comută la tema întunecată"}
          >
            {isDark ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1126 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0795 20.7461C8.41104 20.3741 6.88302 19.5345 5.67425 18.3258C4.46548 17.117 3.62596 15.589 3.25401 13.9205C2.88205 12.252 2.99274 10.5121 3.57355 8.9043C4.15435 7.29651 5.18083 5.88737 6.53324 4.84175C7.88564 3.79614 9.5078 3.15731 11.21 3C10.2134 4.34827 9.73384 6.00945 9.85853 7.68141C9.98322 9.35338 10.7039 10.9251 11.8894 12.1106C13.0749 13.2961 14.6466 14.0168 16.3186 14.1415C17.9906 14.2662 19.6517 13.7866 21 12.79Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
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
              <button onClick={() => setShowResetConfirm(false)} className="cancel-button">
                Anulează
              </button>
              <button onClick={handleResetGame} className="confirm-button">
                Resetează
              </button>
            </div>
          </div>
        </div>
      )}
     
      {showRulesModal && <RulesModal isOpen={showRulesModal} onClose={closeRulesModal} />}
    </header>
  );
};

export default Header; 