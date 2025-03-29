import React, { useState, useEffect } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { GameType, GamePhase, Player } from '../models/types';
import { setupGame } from '../utils/gameUtils';
import '../styles/GameSetup.css';

const MAX_PLAYERS = 6;
const MIN_PLAYERS = 3;
const DEFAULT_PLAYER_COLORS = [
  '#3b82f6', // Primary blue
  '#f97316', // Orange
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#eab308', // Yellow
];

const GameSetup: React.FC = () => {
  const { gameState, dispatch } = useGameContext();
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: '', color: DEFAULT_PLAYER_COLORS[0] },
    { id: 2, name: '', color: DEFAULT_PLAYER_COLORS[1] },
    { id: 3, name: '', color: DEFAULT_PLAYER_COLORS[2] },
  ]);
  const [gameType, setGameType] = useState<GameType>(GameType.MEDIUM);
  const [formError, setFormError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Validare formular
    if (players.length < MIN_PLAYERS) {
      setFormError(`Sunt necesari minim ${MIN_PLAYERS} jucători.`);
      setIsFormValid(false);
      return;
    }

    if (players.some(player => !player.name.trim())) {
      setFormError('Toți jucătorii trebuie să aibă un nume.');
      setIsFormValid(false);
      return;
    }

    // Verificare nume duplicate
    const names = players.map(p => p.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== players.length) {
      setFormError('Numele jucătorilor trebuie să fie unice.');
      setIsFormValid(false);
      return;
    }

    setFormError('');
    setIsFormValid(true);
  }, [players, gameType]);

  const handlePlayerNameChange = (id: number, name: string) => {
    setPlayers(
      players.map(player => (player.id === id ? { ...player, name } : player))
    );
  };

  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      const newId = Math.max(...players.map(p => p.id)) + 1;
      setPlayers([
        ...players,
        {
          id: newId,
          name: '',
          color: DEFAULT_PLAYER_COLORS[players.length % DEFAULT_PLAYER_COLORS.length],
        },
      ]);
    }
  };

  const removePlayer = (id: number) => {
    if (players.length > MIN_PLAYERS) {
      setPlayers(players.filter(player => player.id !== id));
    }
  };

  const handleGameTypeChange = (type: GameType) => {
    setGameType(type);
  };

  const handleColorChange = (id: number, color: string) => {
    setPlayers(
      players.map(player => (player.id === id ? { ...player, color } : player))
    );
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    // Calcularea numărului de runde în funcție de tipul de joc
    let totalRounds;
    switch (gameType) {
      case GameType.SHORT:
        totalRounds = 8; // 8 runde
        break;
      case GameType.MEDIUM:
        totalRounds = 2 * players.length + 7; // Variabil în funcție de numărul de jucători
        break;
      case GameType.LONG:
        totalRounds = 3 * players.length + 12; // Variabil în funcție de numărul de jucători
        break;
    }

    setupGame(
      dispatch,
      players.map(p => ({ ...p, name: p.name.trim() })),
      gameType,
      totalRounds
    );
  };

  return (
    <div className="game-setup card animate-fade-in">
      <div className="card-header">
        <h2>Configurare Joc Nou</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleStartGame}>
          <div className="setup-section">
            <h3>Tipul Jocului</h3>
            <div className="game-type-selector">
              <button
                type="button"
                className={`game-type-option ${gameType === GameType.SHORT ? 'selected' : ''}`}
                onClick={() => handleGameTypeChange(GameType.SHORT)}
              >
                <div className="option-content">
                  <span className="option-title">Joc Scurt</span>
                  <span className="option-description">8 runde</span>
                </div>
              </button>
              <button
                type="button"
                className={`game-type-option ${gameType === GameType.MEDIUM ? 'selected' : ''}`}
                onClick={() => handleGameTypeChange(GameType.MEDIUM)}
              >
                <div className="option-content">
                  <span className="option-title">Joc Mediu</span>
                  <span className="option-description">{2 * players.length + 7} runde</span>
                </div>
              </button>
              <button
                type="button"
                className={`game-type-option ${gameType === GameType.LONG ? 'selected' : ''}`}
                onClick={() => handleGameTypeChange(GameType.LONG)}
              >
                <div className="option-content">
                  <span className="option-title">Joc Lung</span>
                  <span className="option-description">{3 * players.length + 12} runde</span>
                </div>
              </button>
            </div>
          </div>

          <div className="setup-section">
            <div className="section-header">
              <h3>Jucători</h3>
              <button
                type="button"
                className={`btn-add-player ${players.length >= MAX_PLAYERS ? 'disabled' : ''}`}
                onClick={addPlayer}
                disabled={players.length >= MAX_PLAYERS}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Adaugă Jucător
              </button>
            </div>
            <div className="players-list">
              {players.map((player, index) => (
                <div className="player-item" key={player.id}>
                  <div className="player-number">{index + 1}</div>
                  <label className="player-color-indicator" style={{ backgroundColor: player.color }}>
                    <input
                      type="color"
                      value={player.color}
                      onChange={(e) => handleColorChange(player.id, e.target.value)}
                      className="color-picker"
                    />
                  </label>
                  <input
                    type="text"
                    className="player-name-input"
                    placeholder={`Jucătorul ${index + 1}`}
                    value={player.name}
                    onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
                    maxLength={15}
                  />
                  {players.length > MIN_PLAYERS && (
                    <button
                      type="button"
                      className="remove-player-btn"
                      onClick={() => removePlayer(player.id)}
                      aria-label="Elimină jucător"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {formError && <div className="setup-error">{formError}</div>}

          <div className="setup-actions">
            <button
              type="submit"
              className="btn-start-game"
              disabled={!isFormValid}
            >
              Începe Jocul
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameSetup; 