import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { CardHistory, Card as CardType } from '../types';
import { FULL_DECK, SUIT_SYMBOLS, SUIT_COLORS, RANKS, SUITS } from '../constants';
import { getCardIdentifier } from '../utils/cardUtils';

type SortKey = 'card' | 'total' | 'andar' | 'bahar' | 'winRate' | 'rank' | 'suit';
type SortDirection = 'asc' | 'desc';

interface CardStatsDashboardProps {
    onClose: () => void;
    history: CardHistory;
}

const CardStatsDashboard: React.FC<CardStatsDashboardProps> = ({ onClose, history }) => {
    const [sortKey, setSortKey] = useState<SortKey>('card');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const cardStats = useMemo(() => {
        return FULL_DECK.map(card => {
            const id = getCardIdentifier(card);
            const stats = history[id] || { andar: 0, bahar: 0, total: 0 };
            const winRate = stats.total > 0 ? (stats.bahar / stats.total) * 100 : -1; // -1 for sorting no-data
            return { card, ...stats, winRate };
        });
    }, [history]);

    const sortedStats = useMemo(() => {
        return [...cardStats].sort((a, b) => {
            let aVal, bVal;

            switch (sortKey) {
                case 'rank':
                    aVal = RANKS.indexOf(a.card.rank);
                    bVal = RANKS.indexOf(b.card.rank);
                    break;
                case 'suit':
                    aVal = SUITS.indexOf(a.card.suit);
                    bVal = SUITS.indexOf(b.card.suit);
                    break;
                case 'card':
                     const suitOrder = 'CDHS'; // Clubs, Diamonds, Hearts, Spades
                     aVal = suitOrder.indexOf(a.card.suit.charAt(0)) * 13 + RANKS.indexOf(a.card.rank);
                     bVal = suitOrder.indexOf(b.card.suit.charAt(0)) * 13 + RANKS.indexOf(b.card.rank);
                    break;
                default:
                    aVal = a[sortKey];
                    bVal = b[sortKey];
                    break;
            }
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            
            // Secondary sort for rank/suit to keep it stable
            if (sortKey === 'rank') {
                const suitOrder = 'CDHS';
                return suitOrder.indexOf(a.card.suit.charAt(0)) - suitOrder.indexOf(b.card.suit.charAt(0));
            }
             if (sortKey === 'suit') {
                return RANKS.indexOf(a.card.rank) - RANKS.indexOf(b.card.rank);
            }

            return 0;
        });
    }, [cardStats, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection(key === 'card' || key === 'rank' || key === 'suit' ? 'asc' : 'desc');
        }
    };

    const SortableHeader: React.FC<{ headerKey: SortKey, children: React.ReactNode, className?: string }> = ({ headerKey, children, className }) => (
        <th className={`p-3 cursor-pointer hover:bg-gray-200 transition-colors ${className}`} onClick={() => handleSort(headerKey)}>
            <div className="flex items-center justify-center">
                {children}
                {sortKey === headerKey && (
                    <span className="ml-1 text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
            </div>
        </th>
    );

    return (
        <Modal title="Detailed Card Statistics" onClose={onClose}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg border border-gray-200">
                    This table shows the historical performance of every card when it appears as the marker. Click on column headers or use the sort buttons to organize the data.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Sort by:</span>
                    <button onClick={() => handleSort('rank')} className={`px-3 py-1 text-sm rounded-md ${sortKey === 'rank' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Rank</button>
                    <button onClick={() => handleSort('suit')} className={`px-3 py-1 text-sm rounded-md ${sortKey === 'suit' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Suit</button>
                    <button onClick={() => handleSort('card')} className={`px-3 py-1 text-sm rounded-md ${sortKey === 'card' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Default</button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto bg-white rounded-lg border border-gray-200">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-gray-100 text-gray-600 uppercase z-10">
                            <tr>
                                <SortableHeader headerKey="card" className="text-left">Card</SortableHeader>
                                <SortableHeader headerKey="total">Times as Marker</SortableHeader>
                                <SortableHeader headerKey="bahar">Bahar Wins</SortableHeader>
                                <SortableHeader headerKey="andar">Andar Wins</SortableHeader>
                                <SortableHeader headerKey="winRate">Bahar Win %</SortableHeader>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedStats.map(({ card, total, andar, bahar, winRate }) => (
                                <tr key={getCardIdentifier(card)} className="hover:bg-gray-50">
                                    <td className={`p-3 font-mono font-bold text-base ${SUIT_COLORS[card.suit]}`}>
                                        {card.rank}{SUIT_SYMBOLS[card.suit]}
                                    </td>
                                    <td className="p-3 text-center text-gray-600 font-medium">{total}</td>
                                    <td className="p-3 text-center text-blue-500 font-medium">{bahar}</td>
                                    <td className="p-3 text-center text-green-500 font-medium">{andar}</td>
                                    <td className="p-3 text-center font-mono">
                                        {winRate === -1 ? 'N/A' : `${winRate.toFixed(1)}%`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
};

export default CardStatsDashboard;
