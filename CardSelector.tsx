
import React from 'react';
import { Card as CardType } from '../types';
import { FULL_DECK, SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface CardSelectorProps {
    onCardSelect: (card: CardType) => void;
    selectedCard: CardType | null;
}

const CardSelector: React.FC<CardSelectorProps> = ({ onCardSelect, selectedCard }) => {
    return (
        <div className="grid grid-cols-7 sm:grid-cols-13 gap-2 p-2 bg-gray-200 rounded-lg">
            {FULL_DECK.map((card, index) => {
                const isSelected = selectedCard?.rank === card.rank && selectedCard?.suit === card.suit;
                return (
                    <button 
                        key={index}
                        onClick={() => onCardSelect(card)}
                        className={`
                            flex items-center justify-center w-10 h-14 rounded 
                            transition-all duration-200 border
                            ${SUIT_COLORS[card.suit]} 
                            ${isSelected ? 'bg-yellow-400 text-gray-900 scale-110 shadow-lg border-yellow-500' : 'bg-white hover:bg-gray-100 border-gray-300'}
                        `}
                        title={`${card.rank} of ${card.suit}`}
                    >
                        <span className="font-bold">{card.rank}</span>
                        <span>{SUIT_SYMBOLS[card.suit]}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default CardSelector;
