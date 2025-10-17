import { Card, Suit, Rank } from './types';

export const SUITS: Suit[] = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];
export const RANKS: Rank[] = [Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King];

export const FULL_DECK: Card[] = SUITS.flatMap(suit =>
    RANKS.map(rank => ({ suit, rank }))
);

export const SUIT_SYMBOLS: Record<Suit, string> = {
    [Suit.Hearts]: '♥',
    [Suit.Diamonds]: '♦',
    [Suit.Clubs]: '♣',
    [Suit.Spades]: '♠',
};

export const SUIT_COLORS: Record<Suit, string> = {
    [Suit.Hearts]: 'text-red-500',
    [Suit.Diamonds]: 'text-orange-500',
    [Suit.Clubs]: 'text-green-600',
    [Suit.Spades]: 'text-gray-800',
};
