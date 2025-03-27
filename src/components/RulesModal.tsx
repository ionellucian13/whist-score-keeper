import React from 'react';
import './RulesModal.css';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="rules-modal-overlay">
      <div className="rules-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="rules-content">
          <h2>Reguli Whist Românesc</h2>
          
          <section>
            <h3 className="font-semibold text-lg mb-2">Tipuri de joc</h3>
            <p>Aplicația suportă 3 moduri de joc:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Joc scurt:</strong> 8 runde, de la 1 la 8 mâini per jucător
              </li>
              <li>
                <strong>Joc mediu:</strong> Format din N jucători × 2 + 7 runde:
                <ul className="list-disc pl-5">
                  <li>Rundă cu 1 mână (de N ori)</li>
                  <li>Runde cu mâini crescător de la 2 la 8</li>
                  <li>Rundă cu 8 mâini (de N ori)</li>
                </ul>
              </li>
              <li>
                <strong>Joc lung:</strong> Format din N jucători × 3 + 12 runde:
                <ul className="list-disc pl-5">
                  <li>Rundă cu 1 mână (de N ori)</li>
                  <li>Runde cu mâini crescător de la 2 la 7</li>
                  <li>Rundă cu 8 mâini (de N ori) +</li>
                  <li>Runde cu mâini descrescător de la 7 la 2</li>
                  <li>Rundă cu 1 mână (de N ori)</li>
                </ul>
              </li>
            </ul>
          </section>
          
          <section>
            <h3>Scopul jocului</h3>
            <p>Scopul jocului este de a prezice corect numărul de "mâini câștigătoare" pe care le vei câștiga în fiecare rundă și de a acumula cât mai multe puncte.</p>
          </section>
          
          <section>
            <h3>Desfășurarea jocului</h3>
            <p>Fiecare rundă are două faze:</p>
            <ol>
              <li><strong>Faza de prezicere:</strong> fiecare jucător prezice câte mâini va câștiga</li>
              <li><strong>Faza de înregistrare:</strong> după jucarea cărților, se înregistrează câte mâini a câștigat efectiv fiecare jucător</li>
            </ol>
            <p><strong>Reguli importante pentru preziceri:</strong></p>
            <ul>
              <li>Ultimul jucător din listă este dealer-ul rundei.</li>
              <li>Primul jucător care pariază este cel din dreapta dealer-ului, apoi se continuă în sensul acelor de ceasornic.</li>
              <li>Dealer-ul pariază ultimul și este obligat să parieze astfel încât suma totală a pariurilor să NU fie egală cu numărul total de mâini disponibile în rundă.</li>
              <li>La finalul rundei, dealer-ul se schimbă și devine următorul jucător din dreapta dealer-ului anterior.</li>
            </ul>
          </section>
          
          <section>
            <h3>Punctajul</h3>
            <p>Punctele se acordă astfel:</p>
            <ul>
              <li><strong>Prezicere corectă:</strong> 5 + numărul de mâini câștigate</li>
              <li><strong>Prezicere greșită:</strong> 0 - diferența absolută între prezicere și mâinile câștigate</li>
            </ul>
            <p>Exemple:</p>
            <ul>
              <li>Dacă ai prezis 3 mâini și ai câștigat exact 3, primești 8 puncte (5 + 3)</li>
              <li>Dacă ai prezis 3 mâini dar ai câștigat 1, primești -2 puncte (0 - |3-1|)</li>
              <li>Dacă ai prezis 0 mâini și nu ai câștigat niciuna, primești 5 puncte (5 + 0)</li>
            </ul>
          </section>
          
          <section>
            <h3>Regula bonusului pentru consecvență</h3>
            <p>Există un bonus sau o penalizare pentru consecvență:</p>
            <ul>
              <li>Dacă un jucător prezice corect 5 runde consecutive, primește un bonus de 5 puncte.</li>
              <li>Dacă un jucător prezice greșit 5 runde consecutive, pierde 5 puncte.</li>
            </ul>
          </section>
          
          <section>
            <h3>Câștigătorul</h3>
            <p>La finalul tuturor rundelor, jucătorul cu cel mai mare punctaj total câștigă jocul!</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RulesModal; 