import React from 'react';
import './RulesModal.css';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="rules-modal-overlay" onClick={onClose}>
      <div className="rules-modal" onClick={e => e.stopPropagation()}>
        <button 
          className="close-button" 
          onClick={onClose}
          aria-label="Închide regulile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="rules-content">
          <header className="rules-header">
            <div className="rules-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <h2>Reguli Whist Românesc</h2>
          </header>
          
          <section className="rules-section">
            <h3 className="rules-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              Tipuri de joc
            </h3>
            <p>Aplicația suportă 3 moduri de joc:</p>
            <div className="game-types-grid">
              <div className="game-type-card">
                <div className="game-type-header">
                  <span className="badge badge-primary">Joc scurt</span>
                </div>
                <p>8 runde, de la 1 la 8 mâini per jucător</p>
              </div>
              
              <div className="game-type-card">
                <div className="game-type-header">
                  <span className="badge badge-primary">Joc mediu</span>
                </div>
                <p>Format din N jucători × 2 + 7 runde:</p>
                <ul className="rules-list">
                  <li>Rundă cu 1 mână (de N ori)</li>
                  <li>Runde cu mâini crescător de la 2 la 8</li>
                  <li>Rundă cu 8 mâini (de N ori)</li>
                </ul>
              </div>
              
              <div className="game-type-card">
                <div className="game-type-header">
                  <span className="badge badge-primary">Joc lung</span>
                </div>
                <p>Format din N jucători × 3 + 12 runde:</p>
                <ul className="rules-list">
                  <li>Rundă cu 1 mână (de N ori)</li>
                  <li>Runde cu mâini crescător de la 2 la 7</li>
                  <li>Rundă cu 8 mâini (de N ori)</li>
                  <li>Runde cu mâini descrescător de la 7 la 2</li>
                  <li>Rundă cu 1 mână (de N ori)</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section className="rules-section">
            <h3 className="rules-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Scopul jocului
            </h3>
            <div className="info-card">
              <p>Scopul jocului este de a prezice corect numărul de "mâini câștigătoare" pe care le vei câștiga în fiecare rundă și de a acumula cât mai multe puncte.</p>
            </div>
          </section>
          
          <section className="rules-section">
            <h3 className="rules-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Desfășurarea jocului
            </h3>
            <p>Fiecare rundă are două faze:</p>
            <div className="phases-container">
              <div className="phase-card prediction">
                <div className="phase-number">1</div>
                <div className="phase-content">
                  <h4>Faza de prezicere</h4>
                  <p>Fiecare jucător prezice câte mâini va câștiga</p>
                </div>
              </div>
              
              <div className="phase-card tricks">
                <div className="phase-number">2</div>
                <div className="phase-content">
                  <h4>Faza de înregistrare</h4>
                  <p>După jucarea cărților, se înregistrează câte mâini a câștigat efectiv fiecare jucător</p>
                </div>
              </div>
            </div>
            
            <div className="important-rules">
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Reguli importante pentru preziceri
              </h4>
              <ul className="rules-list">
                <li>Ultimul jucător din listă este dealer-ul rundei.</li>
                <li>Primul jucător care pariază este cel din dreapta dealer-ului, apoi se continuă în sensul acelor de ceasornic.</li>
                <li>Dealer-ul pariază ultimul și este obligat să parieze astfel încât suma totală a pariurilor să NU fie egală cu numărul total de mâini disponibile în rundă.</li>
                <li>La finalul rundei, dealer-ul se schimbă și devine următorul jucător din dreapta dealer-ului anterior.</li>
              </ul>
            </div>
          </section>
          
          <section className="rules-section">
            <h3 className="rules-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              Punctajul
            </h3>
            <div className="scoring-rules">
              <div className="scoring-category">
                <div className="scoring-badge correct">+</div>
                <div>
                  <h4>Prezicere corectă</h4>
                  <p>5 + numărul de mâini câștigate</p>
                  <div className="scoring-example">
                    <span className="example-title">Exemplu:</span> Dacă ai prezis 3 mâini și ai câștigat exact 3, primești 8 puncte (5 + 3)
                  </div>
                </div>
              </div>
              
              <div className="scoring-category">
                <div className="scoring-badge incorrect">-</div>
                <div>
                  <h4>Prezicere greșită</h4>
                  <p>0 - diferența absolută între prezicere și mâinile câștigate</p>
                  <div className="scoring-example">
                    <span className="example-title">Exemplu:</span> Dacă ai prezis 3 mâini dar ai câștigat 1, primești -2 puncte (0 - |3-1|)
                  </div>
                </div>
              </div>
              
              <div className="scoring-category special">
                <div className="scoring-badge special">0</div>
                <div>
                  <h4>Cazul special 0 mâini</h4>
                  <div className="scoring-example">
                    <span className="example-title">Exemplu:</span> Dacă ai prezis 0 mâini și nu ai câștigat niciuna, primești 5 puncte (5 + 0)
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="rules-section">
            <h3 className="rules-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Regula bonusului pentru consecvență
            </h3>
            <div className="bonus-rules">
              <div className="bonus-rule positive">
                <div className="bonus-icon">+5</div>
                <p>Dacă un jucător prezice corect 5 runde consecutive, primește un bonus de 5 puncte.</p>
              </div>
              
              <div className="bonus-rule negative">
                <div className="bonus-icon">-5</div>
                <p>Dacă un jucător prezice greșit 5 runde consecutive, pierde 5 puncte.</p>
              </div>
            </div>
          </section>
          
          <section className="rules-section">
            <h3 className="rules-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Câștigătorul
            </h3>
            <div className="winner-section">
              <div className="trophy-icon">🏆</div>
              <p>La finalul tuturor rundelor, jucătorul cu cel mai mare punctaj total câștigă jocul!</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RulesModal; 