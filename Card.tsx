
import React from 'react';
import { Card as CardType } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface CardProps {
    card: CardType;
    className?: string;
}

const Card: React.FC<CardProps> = ({ card, className }) => {
    const suitSymbol = SUIT_SYMBOLS[card.suit];
    const colorClass = SUIT_COLORS[card.suit];

    return (
        <div className={`bg-white rounded-md shadow-md flex flex-col items-center justify-center p-2 border border-gray-300 w-16 h-24 ${className}`}>
            <div className={`text-2xl font-bold ${colorClass}`}>
                {card.rank}
            </div>
            <div className={`text-3xl ${colorClass}`}>
                {suitSymbol}
            </div>
        </div>
    );
};

export default Card;
