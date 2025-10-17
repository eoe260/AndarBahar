// Fix: Provide full content for types.ts to resolve module resolution errors.
export enum Suit {
    Hearts = 'Hearts',
    Diamonds = 'Diamonds',
    Clubs = 'Clubs',
    Spades = 'Spades',
}

export enum Rank {
    Ace = 'A',
    Two = '2',
    Three = '3',
    Four = '4',
    Five = '5',
    Six = '6',
    Seven = '7',
    Eight = '8',
    Nine = '9',
    Ten = 'T',
    Jack = 'J',
    Queen = 'Q',
    King = 'K',
}

export interface Card {
    suit: Suit;
    rank: Rank;
}

export interface GameState {
    id: number;
    marker: Card;
    winner: 'Andar' | 'Bahar';
    cardsDealt: number;
}

export interface RankHistory {
    [key: string]: {
        andar: number;
        bahar: number;
        total: number;
    };
}

export interface CardHistory {
    [key: string]: {
        andar: number;
        bahar: number;
        total: number;
    };
}

export interface PredictionResult {
    card: Card;
    side: 'Andar' | 'Bahar';
    position: number;
    type: 'match' | 'higher';
}

export interface OnboardingStep {
    selector: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

export interface SavedDeck {
    name: string;
    deck: Card[];
    isComplete: boolean;
}
