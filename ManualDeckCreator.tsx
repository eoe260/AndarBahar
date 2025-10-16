import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { Card as CardType } from '../types';
import { FULL_DECK, SUIT_SYMBOLS, SUIT_COLORS } from '../constants';
import { getCardIdentifier } from '../utils/cardUtils';

interface ManualDeckCreatorProps {
    onClose: () => void;
    onSaveDeck: (deck: CardType[], name: string) => void;
    setToast: (toast: { message: string; action?: { label: string; onClick: () => void; } } | null) => void;
}

const ManualDeckCreator: React.FC<ManualDeckCreatorProps> = ({ onClose, onSaveDeck, setToast }) => {
    const [deck, setDeck] = useState<CardType[]>([]);
    const [deckName, setDeckName] = useState('');
    const [previousState, setPreviousState] = useState<{ deck: CardType[]; name: string } | null>(null);

    const deckIdentifiers = useMemo(() => new Set(deck.map(getCardIdentifier)), [deck]);

    const handleCardSelect = (card: CardType) => {
        if (deck.length < 52 && !deckIdentifiers.has(getCardIdentifier(card))) {
            setDeck(prev => [...prev, card]);
        }
    };

    const handleUndo = () => {
        if (previousState) {
            setDeck(previousState.deck);
            setDeckName(previousState.name);
            setPreviousState(null);
            setToast({ message: 'Action undone.' });
        }
    };

    const handleRemoveLast = () => {
        setPreviousState({ deck, name: deckName });
        setDeck(prev => prev.slice(0, -1));
        setToast({ message: 'Last card removed.', action: { label: 'Undo', onClick: handleUndo } });
    };

    const handleReset = () => {
        if (deck.length > 0) {
            setPreviousState({ deck, name: deckName });
            setDeck([]);
            setDeckName('');
            setToast({ message: 'Deck reset.', action: { label: 'Undo', onClick: handleUndo } });
        }
    };
    
    const handleSave = () => {
        if (deckName.trim() && deck.length > 0) {
            onSaveDeck(deck, deckName.trim());
        }
    };

    return (
        <Modal title="Manual Deck Creator" onClose={onClose}>
            <div className="space-y-6">
                
                {/* Deck Construction Area */}
                <section>
                    <div className="flex flex-wrap justify-between items-center mb-2 gap-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            Deck in Progress ({deck.length} / 52)
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <input 
                                type="text" 
                                value={deckName} 
                                onChange={(e) => setDeckName(e.target.value)} 
                                placeholder="Enter Deck Name to Save"
                                className="px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-purple-500 focus:border-purple-500"
                            />
                            <button
                                onClick={handleSave}
                                disabled={!deckName.trim() || deck.length === 0}
                                className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Save Deck
                            </button>
                            <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>
                            <button
                                onClick={handleRemoveLast}
                                disabled={deck.length === 0}
                                className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Remove Last
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={deck.length === 0}
                                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    <div className="p-2 bg-gray-200 rounded-lg min-h-[120px] overflow-x-auto w-full">
                        <div className="flex gap-2 w-max">
                            {deck.length === 0 ? (
                                <p className="text-gray-500 p-8 text-center w-full">Select cards below to begin building your deck.</p>
                            ) : (
                                deck.map((card, index) => (
                                    <div key={getCardIdentifier(card)} className="relative flex-shrink-0">
                                        <div className="w-16 h-24 bg-white rounded-md flex flex-col items-center justify-center p-1 border border-gray-300">
                                            <div className={`text-xl font-bold ${SUIT_COLORS[card.suit]}`}>{card.rank}</div>
                                            <div className={`text-2xl ${SUIT_COLORS[card.suit]}`}>{SUIT_SYMBOLS[card.suit]}</div>
                                        </div>
                                        <span className="absolute -top-1 -left-1 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10">
                                            {index + 1}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Available Cards Selection */}
                <section>
                     <h3 className="text-lg font-semibold text-gray-700 mb-2">Available Cards ({52 - deck.length})</h3>
                     <div className="grid grid-cols-7 sm:grid-cols-[repeat(13,minmax(0,1fr))] gap-1 p-2 bg-gray-100 rounded-lg max-h-60 overflow-y-auto">
                        {FULL_DECK.map((card) => {
                            const isSelected = deckIdentifiers.has(getCardIdentifier(card));
                            return (
                                <button
                                    key={getCardIdentifier(card)}
                                    onClick={() => handleCardSelect(card)}
                                    disabled={isSelected}
                                    className={`
                                        flex items-center justify-center w-10 h-14 rounded transition-all duration-200 border
                                        ${SUIT_COLORS[card.suit]} 
                                        ${isSelected ? 'bg-gray-300 opacity-30 cursor-not-allowed' : 'bg-white hover:bg-gray-100 border-gray-300'}
                                    `}
                                    title={`${card.rank} of ${card.suit}`}
                                >
                                    <span className="font-bold">{card.rank}</span>
                                    <span>{SUIT_SYMBOLS[card.suit]}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>
        </Modal>
    );
};

export default ManualDeckCreator;
