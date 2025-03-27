import React, { useState } from 'react';
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
        return 'Faza de Înregistrare Pliuri';
      case GamePhase.COMPLETE:
        return 'Joc Finalizat';
      default:
        return '';
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>Whist Românesc</h1>
        
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
          <div className="reset-confirm-modal">
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