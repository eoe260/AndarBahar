// Fix: Provide full content for services/gameService.ts to resolve module resolution errors.
import { Card, GameState, PredictionResult, Rank } from '../types';
import { FULL_DECK, RANKS } from '../constants';

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm.
 * @param deck The deck to shuffle.
 * @returns A new array with the cards shuffled.
 */
export const shuffleDeck = (deck: Card[]): Card[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};

/**
 * Runs a single simulation of an Andar Bahar game.
 * @returns The result of the game.
 */
export const runSimulation = (): Omit<GameState, 'id'> => {
    const deck = shuffleDeck(FULL_DECK);
    const marker = deck.shift()!; // Remove the first card as the marker

    let winner: 'Andar' | 'Bahar' = 'Andar'; // Default value, will be overwritten
    let cardsDealt = 0;

    for (let i = 0; i < deck.length; i++) {
        cardsDealt++;
        if (deck[i].rank === marker.rank) {
            // Logic based on existing components: 1st card dealt (i=0) => Bahar, 2nd (i=1) => Andar
            winner = (i + 1) % 2 === 1 ? 'Bahar' : 'Andar';
            break;
        }
    }

    return { marker, winner, cardsDealt };
};

/**
 * Analyzes a given deck for a specific marker card to find prediction results.
 * @param deck The full, ordered deck to analyze.
 * @param markerCard The card to be treated as the marker for this analysis.
 * @returns An array of prediction results.
 */
export const getPredictionsFromDeck = (deck: Card[], markerCard: Card): PredictionResult[] => {
    const predictions: PredictionResult[] = [];
    const markerRankIndex = RANKS.indexOf(markerCard.rank);
    
    // Determine the next 6 higher ranks, handling wrap-around from King
    const higherRanksToFind: Rank[] = [];
    for (let i = 1; i <= 6; i++) {
        const nextRankIndex = (markerRankIndex + i) % RANKS.length;
        higherRanksToFind.push(RANKS[nextRankIndex]);
    }
    const ranksToFind = [markerCard.rank, ...higherRanksToFind];

    // Find the position of the chosen marker card in the deck
    const markerPositionInDeck = deck.findIndex(c => c.rank === markerCard.rank && c.suit === markerCard.suit);

    // If marker is not in the deck, something is wrong
    if (markerPositionInDeck === -1) return [];

    // Find predictions for cards *after* the marker
    for (let i = markerPositionInDeck + 1; i < deck.length; i++) {
        const card = deck[i];
        if (ranksToFind.includes(card.rank)) {
            const dealPosition = i - markerPositionInDeck;
            // In this game variant, the first card (dealPosition 1) goes to Bahar.
            const side = dealPosition % 2 === 1 ? 'Bahar' : 'Andar';
            const type = card.rank === markerCard.rank ? 'match' : 'higher';

            predictions.push({
                card,
                side,
                position: i + 1, // Absolute position in the deck (1-based)
                type,
            });
        }
    }
    return predictions;
};


/**
 * Generates predictions for a game given a specific marker card.
 * It creates a randomly shuffled deck with the marker at the start and analyzes it.
 * @param markerCard The card to be used as the marker.
 * @returns An object containing the shuffled deck and the prediction results.
 */
export const generatePrediction = (markerCard: Card): { shuffledDeck: Card[]; predictions: PredictionResult[] } => {
    // Create a deck without the selected marker card
    const deckWithoutMarker = FULL_DECK.filter(
        c => !(c.rank === markerCard.rank && c.suit === markerCard.suit)
    );

    // Shuffle the rest of the deck
    const shuffledRest = shuffleDeck(deckWithoutMarker);

    // The full deck for this simulation is the marker card followed by the shuffled rest
    const shuffledDeck = [markerCard, ...shuffledRest];
    
    const predictions = getPredictionsFromDeck(shuffledDeck, markerCard);

    return { shuffledDeck, predictions };
};

/**
 * Runs multiple simulations for a given marker card to determine win probabilities.
 * This is used for predicting outcomes when the deck order is unknown.
 * @param markerCard The card to be used as the marker.
 * @param numSimulations The number of simulations to run.
 * @returns An object with the win counts for Andar and Bahar.
 */
export const getProbabilisticPrediction = (markerCard: Card, numSimulations: number = 2000): { andarWins: number; baharWins: number; } => {
    const remainingDeck = FULL_DECK.filter(c => !(c.rank === markerCard.rank && c.suit === markerCard.suit));
    
    let andarWins = 0;
    let baharWins = 0;

    for (let i = 0; i < numSimulations; i++) {
        const shuffledRemaining = shuffleDeck(remainingDeck);
        
        for (let j = 0; j < shuffledRemaining.length; j++) {
            if (shuffledRemaining[j].rank === markerCard.rank) {
                // The first card (j=0, deal pos 1) goes to Bahar.
                const winner = (j + 1) % 2 === 1 ? 'Bahar' : 'Andar';
                if (winner === 'Andar') {
                    andarWins++;
                } else {
                    baharWins++;
                }
                break; // Winner found for this simulation
            }
        }
    }
    return { andarWins, baharWins };
};
