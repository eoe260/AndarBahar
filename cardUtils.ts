import { Card } from '../types';

/**
 * Generates a unique string identifier for a card.
 * e.g., { rank: 'A', suit: 'Hearts' } becomes 'AH'
 * @param card The card object
 * @returns A unique string identifier
 */
export const getCardIdentifier = (card: Card): string => {
    return `${card.rank}${card.suit.charAt(0)}`;
};
