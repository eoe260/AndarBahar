import React, { useMemo, useEffect, useState, memo } from 'react';
import Modal from './Modal';
import Tooltip from './Tooltip';
import Confetti from './Confetti'; // Import Confetti
import { GameState, RankHistory } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';
import MarkerRankAnalysis from './MarkerRankAnalysis';

const GameWindow: React.FC<{ game: GameState }> = memo(({ game }) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const prevGameId = React.useRef(game.id);

    useEffect(() => {
        // Trigger confetti only when the game result changes, not on initial render
        if (prevGameId.current !== game.id) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 2000); // Confetti lasts for 2s
            prevGameId.current = game.id;
            return () => clearTimeout(timer);
        }
    }, [game]);


    return (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {showConfetti && <Confetti />}
            <div className="text-xs text-gray-500 mb-2">Marker</div>
            <div className={`text-2xl font-bold ${SUIT_COLORS[game.marker.suit]}`}>
                {game.marker.rank}{SUIT_SYMBOLS[game.marker.suit]}
            </div>
            <div className="mt-2 text-sm">
                <span className="text-gray-500">Winner: </span>
                <span className={`font-bold ${game.winner === 'Bahar' ? 'text-blue-500' : 'text-green-500'}`}>
                    {game.winner}
                </span>
            </div>
            <div className="text-xs text-gray-400">in {game.cardsDealt} cards</div>
        </div>
    );
});


interface RandomHistoryCreatorProps {
    onClose: () => void;
    games: GameState[];
    rankHistory: RankHistory;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onAddGame: () => void;
    onRemoveGame: () => void;
    onClearHistory: () => void;
    maxGames: number;
    minGames: number;
}

const RandomHistoryCreator: React.FC<RandomHistoryCreatorProps> = ({ 
    onClose, 
    games, 
    rankHistory, 
    isPlaying, 
    onTogglePlay, 
    onAddGame,
    onRemoveGame, 
    onClearHistory,
    maxGames,
    minGames,
}) => {
    const { totalAndar, totalBahar, totalGames } = useMemo(() => {
        let andar = 0, bahar = 0, total = 0;
        for (const rank in rankHistory) {
            andar += rankHistory[rank as keyof RankHistory].andar;
            bahar += rankHistory[rank as keyof RankHistory].bahar;
            total += rankHistory[rank as keyof RankHistory].total;
        }
        return { totalAndar: andar, totalBahar: bahar, totalGames: total };
    }, [rankHistory]);

    const baharPercent = totalGames > 0 ? ((totalBahar / totalGames) * 100).toFixed(1) : '0.0';
    const andarPercent = totalGames > 0 ? ((totalAndar / totalGames) * 100).toFixed(1) : '0.0';

    return (
        <Modal title="Random History Creator (Simulation)" onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg border border-gray-200">
                        This tool runs multiple Andar Bahar games simultaneously to generate a large volume of historical data. Use the controls to manage the simulation and observe the win/loss statistics as they update in real-time.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-white rounded-lg shadow-inner">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500">{totalBahar}</div>
                        <div className="text-sm text-gray-500">Bahar Wins ({baharPercent}%)</div>
                    </div>
                     <div className="text-center">
                        <div className="text-3xl font-bold text-gray-600">{totalGames}</div>
                        <div className="text-sm text-gray-500">Total Games</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-500">{totalAndar}</div>
                        <div className="text-sm text-gray-500">Andar Wins ({andarPercent}%)</div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Simulation Controls</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Start or stop the simulation and adjust the number of concurrent games. Simulation speed can be changed in the main Settings panel.
                    </p>
                    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-inner">
                        <div className="flex flex-wrap gap-4 items-center">
                            <Tooltip text={isPlaying ? "Pause the simulation" : "Start the simulation"}>
                                <button
                                    onClick={onTogglePlay}
                                    aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
                                    className={`px-4 py-2 rounded-lg font-semibold text-white w-24 transition-colors ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>
                            </Tooltip>
                            <Tooltip text="Reset all win/loss statistics to zero">
                                 <button
                                    onClick={() => {
                                        if (window.confirm('This will reset all statistics. Are you sure?')) {
                                            onClearHistory();
                                        }
                                    }}
                                    aria-label="Clear all history and statistics"
                                    className="px-4 py-2 rounded-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
                                >
                                    Clear History
                                </button>
                            </Tooltip>
                            <div className="flex items-center gap-2">
                                <Tooltip text="Decrease the number of concurrent games">
                                    <button
                                        onClick={onRemoveGame}
                                        disabled={games.length <= minGames}
                                        aria-label="Remove one simulation game"
                                        className="px-4 py-2 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        - Remove
                                    </button>
                                </Tooltip>
                                <span className="font-mono text-center w-20">
                                    {games.length} / {maxGames} Sims
                                </span>
                                <Tooltip text="Increase the number of concurrent games">
                                    <button
                                        onClick={onAddGame}
                                        disabled={games.length >= maxGames}
                                        aria-label="Add one simulation game"
                                        className="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        + Add
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-100 rounded-lg">
                    {games.map((game) => (
                        <GameWindow key={game.id} game={game} />
                    ))}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Marker Rank Analysis</h3>
                    <p className="text-sm text-gray-500 mb-2">
                        This table breaks down the win/loss record for each card rank when it appears as the marker. Use this to identify trends and see if certain marker cards favor Andar or Bahar over time.
                    </p>
                    <MarkerRankAnalysis history={rankHistory} />
                </div>
            </div>
        </Modal>
    );
};

export default RandomHistoryCreator;
