import React from 'react';
import Modal from './Modal';
import Tooltip from './Tooltip';
import { Card as CardType, SavedDeck } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface SavedDecksManagerProps {
    decks: SavedDeck[];
    onClose: () => void;
    onAnalyze: (deck: CardType[]) => void;
    onDelete: (index: number) => void;
    onPredict: (deck: CardType[]) => void;
}

const DeckPreview: React.FC<{ deck: CardType[] }> = ({ deck }) => {
    // Show first 8 cards as a preview, creating a fanned-out look
    const previewCards = deck.slice(0, 8);
    return (
        <div className="flex items-center justify-center -space-x-6 scale-90">
            {previewCards.map((card, index) => (
                <div 
                    key={index} 
                    className={`w-12 h-16 rounded-md bg-white border-2 border-gray-300 flex flex-col items-center justify-center text-sm ${SUIT_COLORS[card.suit]} shadow-lg`}
                    style={{ zIndex: index, transform: `rotate(${index * 4 - 14}deg)`}}
                    title={`${card.rank} of ${card.suit}`}
                >
                    <span className="font-bold text-lg">{card.rank}</span>
                    <span className="text-lg">{SUIT_SYMBOLS[card.suit]}</span>
                </div>
            ))}
            {deck.length > 8 && <div className="pl-8 text-gray-600 font-bold z-10 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1 text-sm shadow-md border border-gray-200">+{deck.length - 8}</div>}
        </div>
    );
};

const SavedDecksManager: React.FC<SavedDecksManagerProps> = ({ decks, onClose, onAnalyze, onDelete, onPredict }) => {
    return (
        <Modal title="Saved Decks Manager" onClose={onClose}>
            <div className="space-y-4">
                {decks.length === 0 ? (
                    <div className="text-center py-12 px-6 bg-gray-100 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No Saved Decks</h3>
                        <p className="mt-1 text-sm text-gray-500">
                           Use the "Generate Deck" or "Manual Deck Creator" to save a deck.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto p-4">
                        {decks.map((savedDeck, index) => (
                            <div 
                                key={`${index}-${savedDeck.name}`} 
                                className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                            >
                                {/* Header */}
                                <div className="p-4 border-b border-black/10">
                                    <div className="flex items-center gap-2">
                                        {savedDeck.isComplete && (
                                            <Tooltip text="Complete decks cannot be deleted.">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                                </svg>
                                            </Tooltip>
                                        )}
                                        <h4 className="font-bold text-xl text-gray-800 truncate" title={savedDeck.name}>{savedDeck.name}</h4>
                                    </div>
                                    <p className="text-sm text-gray-500">{savedDeck.deck.length} / 52 cards</p>
                                </div>
                                
                                {/* Body with Card Preview */}
                                <div className="flex-grow flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[150px]">
                                    <DeckPreview deck={savedDeck.deck} />
                                </div>
                                
                                {/* Actions Footer */}
                                <div className={`grid ${savedDeck.isComplete ? 'grid-cols-2' : 'grid-cols-3'} gap-px bg-gray-200`}>
                                    <button
                                        onClick={() => onAnalyze(savedDeck.deck)}
                                        className="flex items-center justify-center gap-2 p-4 text-sm bg-white hover:bg-purple-50 text-purple-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
                                        </svg>
                                        Full Analysis
                                    </button>
                                     <button
                                        onClick={() => onPredict(savedDeck.deck)}
                                        className="flex items-center justify-center gap-2 p-4 text-sm bg-white hover:bg-teal-50 text-teal-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.293 9.293a1 1 0 011.414 0L10 14.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Predict
                                    </button>
                                    {!savedDeck.isComplete && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete "${savedDeck.name}"?`)) {
                                                    onDelete(index);
                                                }
                                            }}
                                            className="flex items-center justify-center gap-2 p-4 text-sm bg-white hover:bg-red-50 text-red-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:z-10"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                            </svg>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default SavedDecksManager;
