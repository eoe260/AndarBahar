import React from 'react';
import { RankHistory } from '../types';
import { RANKS } from '../constants';

interface MarkerRankAnalysisProps {
    history: RankHistory;
}

const MarkerRankAnalysis: React.FC<MarkerRankAnalysisProps> = ({ history }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="max-h-[40vh] overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase sticky top-0 z-10">
                        <tr>
                            <th className="p-3">Rank</th>
                            <th className="p-3 text-center">Bahar Wins</th>
                            <th className="p-3 text-center">Andar Wins</th>
                            <th className="p-3 text-center">Total</th>
                            <th className="p-3 w-1/3">Win Distribution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {RANKS.map(rank => {
                            const stats = history[rank];
                            const baharPercent = stats.total > 0 ? (stats.bahar / stats.total) * 100 : 0;
                            const andarPercent = stats.total > 0 ? (stats.andar / stats.total) * 100 : 0;
                            
                            return (
                                <tr key={rank} className="hover:bg-gray-50">
                                    <td className="p-3 font-bold text-purple-600 text-base">{rank}</td>
                                    <td className="p-3 text-center text-blue-500 font-medium">{stats.bahar}</td>
                                    <td className="p-3 text-center text-green-500 font-medium">{stats.andar}</td>
                                    <td className="p-3 text-center text-gray-500">{stats.total}</td>
                                    <td className="p-3">
                                        {stats.total > 0 ? (
                                            <div className="w-full bg-green-200 rounded-full flex h-6 overflow-hidden border border-gray-300">
                                                <div 
                                                    className="bg-blue-500 flex justify-center items-center text-xs font-bold text-white transition-all duration-300" 
                                                    style={{ width: `${baharPercent}%` }}
                                                    title={`Bahar: ${baharPercent.toFixed(1)}%`}
                                                >
                                                   {baharPercent > 15 ? `${baharPercent.toFixed(0)}%` : ''}
                                                </div>
                                                <div 
                                                    className="bg-green-500 flex justify-center items-center text-xs font-bold text-white transition-all duration-300" 
                                                    style={{ width: `${andarPercent}%` }}
                                                    title={`Andar: ${andarPercent.toFixed(1)}%`}
                                                >
                                                    {andarPercent > 15 ? `${andarPercent.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full bg-gray-200 rounded-full h-6 flex items-center justify-center">
                                                <span className="text-xs text-gray-400">No data</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MarkerRankAnalysis;
