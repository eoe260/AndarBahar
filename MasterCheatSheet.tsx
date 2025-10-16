
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { Card, Rank } from '../types';
import { FULL_DECK, SUIT_SYMBOLS, SUIT_COLORS } from '../constants';
import { shuffleDeck } from '../services/gameService';

interface MasterCheatSheetProps {
    onClose: () => void;
    initialDeck?: Card[] | null;
}

const MasterCheatSheet: React.FC<MasterCheatSheetProps> = ({ onClose, initialDeck }) => {
    const [shuffledDeck, setShuffledDeck] = useState<Card[]>(() => initialDeck || shuffleDeck(FULL_DECK));

    const cheatSheetData = useMemo(() => {
        if (shuffledDeck.length === 0) return [];

        const rankPositions = new Map<Rank, number[]>();
        shuffledDeck.forEach((card, index) => {
            if (!rankPositions.has(card.rank)) {
                rankPositions.set(card.rank, []);
            }
            rankPositions.get(card.rank)!.push(index);
        });

        return shuffledDeck.map((card, index) => {
            const positions = rankPositions.get(card.rank)!;
            const nextPosition = positions.find(p => p > index);

            if (nextPosition !== undefined) {
                const dealPosition = nextPosition - index;
                const winner = dealPosition % 2 === 1 ? 'Bahar' : 'Andar';
                return { card, winner, dealPosition };
            }

            return { card, winner: 'N/A', dealPosition: 'N/A' as 'N/A' | number };
        });
    }, [shuffledDeck]);

    const handleRefresh = () => {
        setShuffledDeck(shuffleDeck(FULL_DECK));
    };

    const title = initialDeck ? "Saved Deck Analysis" : "Master Cheat Sheet";

    return (
        <Modal title={title} onClose={onClose}>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-sm">
                        {initialDeck 
                            ? "This is an analysis of your saved deck. It shows the outcome if any card were the marker."
                            : "This is a randomly generated deck. For each card, it predicts the outcome if that card were the marker."
                        }
                    </p>
                    {!initialDeck && (
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                            Refresh Deck
                        </button>
                    )}
                </div>
                <div className="max-h-[60vh] overflow-y-auto bg-white rounded-lg border border-gray-200">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-gray-100 text-gray-600 uppercase z-10">
                            <tr>
                                <th className="p-2">S.No</th>
                                <th className="p-2">Card</th>
                                <th className="p-2">Predicted Winner</th>
                                <th className="p-2 text-center">Cards to Deal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {cheatSheetData.map((data, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="p-2 font-mono text-gray-500">{index + 1}</td>
                                    <td className={`p-2 font-mono font-bold ${SUIT_COLORS[data.card.suit]}`}>
                                        {data.card.rank}{SUIT_SYMBOLS[data.card.suit]}
                                    </td>
                                    <td className={`p-2 font-semibold ${data.winner === 'Bahar' ? 'text-blue-500' : data.winner === 'Andar' ? 'text-green-500' : 'text-gray-400'}`}>
                                        {data.winner}
                                    </td>
                                    <td className="p-2 font-mono text-gray-500 text-center">{data.dealPosition}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
};

export default MasterCheatSheet;
