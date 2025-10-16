// Fix: Provide full content for components/PredictionDashboard.tsx to resolve module resolution errors.
import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { Card as CardType, PredictionResult, Rank } from '../types';
import { getPredictionsFromDeck, getProbabilisticPrediction, generatePrediction } from '../services/gameService';
import CardSelector from './CardSelector';
import Modal from './Modal';
import { SUIT_SYMBOLS, SUIT_COLORS, RANKS } from '../constants';

interface PredictionDashboardProps {
    onClose: () => void;
    deckToAnalyze?: CardType[] | null;
}

interface ProbabilisticResult {
    andarWins: number;
    baharWins: number;
}

// Sub-component for Probabilistic Analysis
const ProbabilisticAnalysis: React.FC<{ markerCard: CardType }> = ({ markerCard }) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [simResult, setSimResult] = useState<ProbabilisticResult | null>(null);

    useEffect(() => {
        const runSimulation = async () => {
            setIsSimulating(true);
            setSimResult(null);
            await new Promise(resolve => setTimeout(resolve, 50)); 
            const results = getProbabilisticPrediction(markerCard);
            setSimResult(results);
            setIsSimulating(false);
        };
        runSimulation();
    }, [markerCard]);

    if (isSimulating) {
        return (
             <div className="text-center py-10 flex flex-col items-center justify-center animate-fade-in-up">
                <div className="w-16 h-16 border-4 border-dashed border-purple-500 rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-700">Running Simulations...</h3>
                <p className="text-sm text-gray-500">Calculating probabilities based on thousands of shuffles.</p>
            </div>
        );
    }

    if (simResult) {
        const total = simResult.andarWins + simResult.baharWins;
        const baharPercent = total > 0 ? (simResult.baharWins / total) * 100 : 0;
        const andarPercent = total > 0 ? (simResult.andarWins / total) * 100 : 0;
        return (
             <div className="animate-fade-in-up space-y-4">
                <p className="text-sm text-gray-500">
                    Based on {total.toLocaleString()} simulations of a randomly shuffled deck, the probability of the next matching card appearing on each side is:
                </p>
                 <div className="p-6 bg-white rounded-lg shadow-inner border border-gray-200">
                    <div className="flex justify-between items-center mb-2 font-bold text-xl">
                        <span className="text-blue-500">Bahar</span>
                        <span className="text-green-500">Andar</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full flex h-10 overflow-hidden border border-gray-300">
                        <div 
                            className="bg-blue-500 flex justify-center items-center text-lg font-bold text-white transition-all duration-500 ease-out" 
                            style={{ width: `${baharPercent}%` }}
                            title={`Bahar: ${baharPercent.toFixed(1)}%`}
                        >
                           {baharPercent >= 10 && `${baharPercent.toFixed(1)}%`}
                        </div>
                        <div 
                            className="bg-green-500 flex justify-center items-center text-lg font-bold text-white transition-all duration-500 ease-out" 
                            style={{ width: `${andarPercent}%` }}
                            title={`Andar: ${andarPercent.toFixed(1)}%`}
                        >
                            {andarPercent >= 10 && `${andarPercent.toFixed(1)}%`}
                        </div>
                    </div>
                     <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                        <span>{simResult.baharWins.toLocaleString()} wins</span>
                        <span>{simResult.andarWins.toLocaleString()} wins</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};


// Sub-component for Detailed Static Deck Analysis
const DetailedPredictionList: React.FC<{ deck: CardType[]; markerCard: CardType }> = ({ deck, markerCard }) => {
    const predictions = useMemo(() => getPredictionsFromDeck(deck, markerCard), [deck, markerCard]);
    const markerPositionInDeck = useMemo(() => deck.findIndex(c => c.rank === markerCard.rank && c.suit === markerCard.suit), [deck, markerCard]);
    
    const { matchingPredictions, higherRankPredictions } = useMemo(() => {
        const matching = predictions.filter(p => p.type === 'match');
        const higher = predictions.filter(p => p.type === 'higher');
        
        const groupedHigher = new Map<Rank, PredictionResult[]>();
        higher.forEach(p => {
            if (!groupedHigher.has(p.card.rank)) {
                groupedHigher.set(p.card.rank, []);
            }
            groupedHigher.get(p.card.rank)!.push(p);
        });

        const sortedGroupedHigher = new Map([...groupedHigher.entries()].sort((a, b) => {
            const rankOrderA = RANKS.indexOf(a[0]);
            const rankOrderB = RANKS.indexOf(b[0]);
            const markerRankOrder = RANKS.indexOf(markerCard.rank);
            const distA = (rankOrderA - markerRankOrder + RANKS.length) % RANKS.length;
            const distB = (rankOrderB - markerRankOrder + RANKS.length) % RANKS.length;
            return distA - distB;
        }));

        return { 
            matchingPredictions: matching, 
            higherRankPredictions: sortedGroupedHigher,
        };
    }, [predictions, markerCard.rank]);

    return (
        <div className="max-h-[50vh] overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-inner">
            <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-100 text-gray-600 uppercase z-10">
                    <tr>
                        <th className="p-3">Deck Pos.</th>
                        <th className="p-3">Deal Pos.</th>
                        <th className="p-3">Card</th>
                        <th className="p-3">Predicted Side</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {/* Marker Row */}
                    <tr className="bg-yellow-200 font-semibold text-yellow-900">
                        <td className="p-3 font-mono">{markerPositionInDeck + 1}</td>
                        <td className="p-3 font-mono">-</td>
                        <td className={`p-3 font-mono font-bold ${SUIT_COLORS[markerCard.suit]}`}>
                            {markerCard.rank}{SUIT_SYMBOLS[markerCard.suit]}
                        </td>
                        <td className="p-3">Marker Card</td>
                    </tr>
                    
                    {/* Matching predictions */}
                    <tr className="bg-gray-50"><td colSpan={4} className="p-2 font-semibold text-purple-800">Matching Cards ({markerCard.rank})</td></tr>
                    {matchingPredictions.map(p => (
                        <tr key={p.position} className="hover:bg-gray-50">
                           <td className="p-3 font-mono text-gray-500">{p.position}</td>
                           <td className="p-3 font-mono text-gray-700">{p.position - (markerPositionInDeck + 1)}</td>
                           <td className={`p-3 font-mono font-bold ${SUIT_COLORS[p.card.suit]}`}>
                                {p.card.rank}{SUIT_SYMBOLS[p.card.suit]}
                           </td>
                           <td className={`p-3 font-semibold ${p.side === 'Bahar' ? 'text-blue-500' : 'text-green-500'}`}>{p.side}</td>
                        </tr>
                    ))}

                    {/* Higher rank predictions */}
                     <tr className="bg-gray-50"><td colSpan={4} className="p-2 font-semibold text-purple-800">Higher Rank Cards ("6 Badi")</td></tr>
                    {Array.from(higherRankPredictions.entries()).map(([rank, preds]) => (
                        <Fragment key={rank}>
                            <tr className="bg-gray-100/60"><td colSpan={4} className="px-3 py-1 font-semibold text-gray-700">Predictions for Rank: {rank}</td></tr>
                            {preds.sort((a,b) => a.position - b.position).map(p => (
                               <tr key={p.position} className="hover:bg-gray-50">
                                   <td className="p-3 font-mono text-gray-500">{p.position}</td>
                                   <td className="p-3 font-mono text-gray-700">{p.position - (markerPositionInDeck + 1)}</td>
                                   <td className={`p-3 font-mono font-bold ${SUIT_COLORS[p.card.suit]}`}>
                                        {p.card.rank}{SUIT_SYMBOLS[p.card.suit]}
                                   </td>
                                   <td className={`p-3 font-semibold ${p.side === 'Bahar' ? 'text-blue-500' : 'text-green-500'}`}>{p.side}</td>
                               </tr>
                            ))}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ onClose, deckToAnalyze }) => {
    const [markerCard, setMarkerCard] = useState<CardType | null>(null);

    const analysisSource = useMemo(() => {
        if (deckToAnalyze) {
            return { deck: deckToAnalyze, type: 'Static' as const };
        }
        if (markerCard) {
            return { deck: generatePrediction(markerCard).shuffledDeck, type: 'Simulated' as const };
        }
        return null;
    }, [deckToAnalyze, markerCard]);


    return (
        <Modal title="Prediction Dashboard" onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">1. Select a Marker Card</h3>
                    <CardSelector onCardSelect={setMarkerCard} selectedCard={markerCard} />
                </div>

                {markerCard && analysisSource && (
                    <div className="space-y-8 mt-6 animate-fade-in-up">
                        {analysisSource.type === 'Static' ? (
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
                                <p className="font-bold">Static Analysis Mode</p>
                                <p>You are analyzing a saved deck with a fixed card order ({analysisSource.deck.length} cards). Predictions below show the exact outcomes for this specific shuffle.</p>
                                {analysisSource.deck.length < 52 && (
                                    <div className="mt-2 font-semibold text-orange-800 bg-orange-100 p-2 rounded border border-orange-300">
                                        Note: This is a partial deck. Analysis is limited to the cards provided.
                                    </div>
                                )}
                            </div>
                        ) : (
                             <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4" role="alert">
                                <p className="font-bold">Simulated Deck Analysis</p>
                                <p>A single random deck has been generated for analysis. The list below shows the exact outcome for this one shuffle, while the probabilistic section shows the average of thousands of shuffles.</p>
                            </div>
                        )}
                        
                        <section>
                             <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                                2. Detailed Prediction Analysis
                            </h3>
                            <DetailedPredictionList deck={analysisSource.deck} markerCard={markerCard} />
                        </section>
                        
                        <section>
                             <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                                3. Probabilistic Prediction
                            </h3>
                            <ProbabilisticAnalysis markerCard={markerCard} />
                        </section>
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

export default PredictionDashboard;
