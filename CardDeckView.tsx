import React, { useState, useMemo } from 'react';
import { Card as CardType } from '../types';
import { generatePrediction } from '../services/gameService';
import CardSelector from './CardSelector';
import Modal from './Modal';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface CardDeckViewProps {
    onClose: () => void;
    onSaveDeck: (deck: CardType[], name: string) => void;
}

const CardDeckView: React.FC<CardDeckViewProps> = ({ onClose, onSaveDeck }) => {
    const [markerCard, setMarkerCard] = useState<CardType | null>(null);
    const [deckName, setDeckName] = useState('');

    const { shuffledDeck } = useMemo(() => {
        if (!markerCard) return { shuffledDeck: [] };
        // We call generatePrediction to get a consistent shuffled deck with the marker at the start
        const prediction = generatePrediction(markerCard);
        setDeckName(`Deck with ${markerCard.rank}${SUIT_SYMBOLS[markerCard.suit]} marker`);
        return prediction;
    }, [markerCard]);

    const isMatch = (card: CardType) => {
        return card.rank === markerCard?.rank;
    };

    const handleSave = () => {
        if (deckName.trim() && shuffledDeck.length > 0) {
            onSaveDeck(shuffledDeck, deckName.trim());
        }
    }

    return (
        <Modal title="Visual Card Deck" onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">1. Select a Marker to Generate a Shuffled Deck</h3>
                    <CardSelector onCardSelect={setMarkerCard} selectedCard={markerCard} />
                </div>
                {markerCard && shuffledDeck.length > 0 && (
                    <div className="animate-fade-in-up">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">2. Shuffled Deck View</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Marker card is shown first, followed by the rest of the shuffled deck. Matching ranks are highlighted.
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-2 bg-gray-100 rounded-lg">
                            {shuffledDeck.map((card, index) => {
                                const match = isMatch(card);
                                return (
                                    <div 
                                        key={index} 
                                        className={`
                                            p-1 rounded-md flex flex-col items-center justify-center aspect-[2.5/3.5] border
                                            transition-all duration-200
                                            ${SUIT_COLORS[card.suit]}
                                            ${match ? 'bg-yellow-400 text-gray-900 shadow-lg scale-105 border-yellow-500' : 'bg-white border-gray-300'}
                                        `}
                                        title={index === 0 ? 'Marker Card' : `Position ${index + 1}`}
                                    >
                                        <div className="font-bold text-lg">{card.rank}</div>
                                        <div className="text-xl">{SUIT_SYMBOLS[card.suit]}</div>
                                        {index === 0 && <div className="text-xs font-bold text-black/70 absolute bottom-0.5">M</div>}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <input
                                type="text"
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                placeholder="Enter a name for this deck"
                                className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 w-full sm:w-auto flex-grow"
                                aria-label="Deck name"
                            />
                            <button
                                onClick={handleSave}
                                disabled={!deckName.trim()}
                                className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                Save This Deck
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </Modal>
    );
};

export default CardDeckView;
