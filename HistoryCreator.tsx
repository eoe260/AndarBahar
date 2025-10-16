
import React, { useState, useMemo } from 'react';
import { Card as CardType } from '../types';
import { generatePrediction } from '../services/gameService';
import CardSelector from './CardSelector';
import Modal from './Modal';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';


const HistoryCreator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [markerCard, setMarkerCard] = useState<CardType | null>(null);

    const { shuffledDeck } = useMemo(() => {
        if (!markerCard) return { shuffledDeck: [] };
        return generatePrediction(markerCard);
    }, [markerCard]);

    const isMatch = (card: CardType) => {
        return card.rank === markerCard?.rank;
    }

    return (
        <Modal title="Create History & Predict Full Deck" onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">1. Select Marker Card to Simulate a Game</h3>
                     <p className="text-sm text-gray-500 mb-3">
                        Pick a marker card to generate a complete, randomly shuffled deck. This simulates a full game from start to finish.
                    </p>
                    <CardSelector onCardSelect={setMarkerCard} selectedCard={markerCard} />
                </div>
                {markerCard && shuffledDeck.length > 0 && (
                    <div className="animate-fade-in-up">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">2. Simulated Deck & Predictions</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Below is a complete simulated deck with your chosen marker at position 1. Cards with a matching rank are highlighted, showing where they landed in the shuffle and which side would win.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {shuffledDeck.map((card, index) => (
                                <div key={index} className={`p-2 rounded-md flex items-center gap-2 ${isMatch(card) ? 'bg-purple-100 border border-purple-300' : 'bg-gray-100'}`}>
                                    <span className="font-mono text-xs text-gray-500 w-6 text-right">{index + 1}.</span>
                                    <div className={`flex items-center font-bold ${SUIT_COLORS[card.suit]}`}>
                                        <span>{card.rank}</span>
                                        <span>{SUIT_SYMBOLS[card.suit]}</span>
                                    </div>
                                    {index > 0 && isMatch(card) && (
                                        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${index % 2 === 1 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                                            {index % 2 === 1 ? 'Bahar' : 'Andar'}
                                        </span>
                                    )}
                                     {index === 0 && (
                                        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-400 text-gray-800">
                                            Marker
                                        </span>
                                    )}
                                </div>
                            ))}
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

export default HistoryCreator;
