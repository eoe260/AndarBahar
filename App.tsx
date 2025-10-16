import React, { useState, useCallback, useEffect } from 'react';
import PredictionDashboard from './components/PredictionDashboard';
import HistoryCreator from './components/HistoryCreator';
import RandomHistoryCreator from './components/RandomHistoryCreator';
import CardDeckView from './components/CardDeckView';
import MasterCheatSheet from './components/MasterCheatSheet';
import SavedDecksManager from './components/SavedDecksManager';
import CameraScanner from './components/CameraScanner';
import OnboardingTour from './components/OnboardingTour';
import CardStatsDashboard from './components/CardStatsDashboard';
import ThemeManager from './components/ThemeManager';
import Toast from './components/Toast';
import Tooltip from './components/Tooltip';
import { GameState, RankHistory, Card, CardHistory, SavedDeck } from './types';
import { runSimulation } from './services/gameService';
import { useInterval } from './hooks/useInterval';
import { RANKS, FULL_DECK } from './constants';
import { getCardIdentifier } from './utils/cardUtils';
import ManualDeckCreator from './components/ManualDeckCreator';

type ModalType = 'prediction' | 'history' | 'simulation' | 'deckView' | 'cheatSheet' | 'savedDecks' | 'camera' | 'cardStats' | 'themeManager' | 'manualDeck' | null;

const MAX_GAMES = 30;
const INITIAL_GAMES = 4;
const MIN_GAMES = 1;
const DEFAULT_BACKGROUND_URL = 'https://images.unsplash.com/photo-1471922694854-ab62e3c3a108?q=80&w=2670&auto=format&fit=crop';


// Initialize a detailed history object to track wins per rank
const initialHistory: RankHistory = RANKS.reduce((acc, rank) => {
    acc[rank] = { andar: 0, bahar: 0, total: 0 };
    return acc;
}, {} as RankHistory);

// Initialize history for all 52 cards
const initialCardHistory: CardHistory = FULL_DECK.reduce((acc, card) => {
    acc[getCardIdentifier(card)] = { andar: 0, bahar: 0, total: 0 };
    return acc;
}, {} as CardHistory);

interface ToastState {
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const App: React.FC = () => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
    const [deckToAnalyze, setDeckToAnalyze] = useState<Card[] | null>(null);
    const [deckToPredict, setDeckToPredict] = useState<Card[] | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [backgroundUrl, setBackgroundUrl] = useState(DEFAULT_BACKGROUND_URL);
    const [savedBackgrounds, setSavedBackgrounds] = useState<string[]>([DEFAULT_BACKGROUND_URL]);

    // State for persistent simulation
    const [games, setGames] = useState<GameState[]>([]);
    const [history, setHistory] = useState<RankHistory>(initialHistory);
    const [cardHistory, setCardHistory] = useState<CardHistory>(initialCardHistory);
    const [isPlaying, setIsPlaying] = useState(true);
    // Load simulation speed from localStorage or use default
    const [simulationSpeed, setSimulationSpeed] = useState(() => {
        try {
            const savedSpeed = localStorage.getItem('simulationSpeed');
            return savedSpeed ? Number(savedSpeed) : 500;
        } catch (error) {
            console.error("Failed to load simulation speed:", error);
            return 500;
        }
    });

    // Check for onboarding completion on mount
    useEffect(() => {
        try {
            const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
            if (!hasCompletedOnboarding) {
                setShowOnboarding(true);
            }
        } catch (error) {
            console.error("Failed to access local storage for onboarding status:", error);
        }
    }, []);
    
     // Load backgrounds from local storage on mount
    useEffect(() => {
        try {
            const savedUrl = localStorage.getItem('backgroundUrl');
            if (savedUrl) setBackgroundUrl(savedUrl);

            const savedGallery = localStorage.getItem('savedBackgrounds');
            if (savedGallery) {
                const gallery = JSON.parse(savedGallery);
                // Ensure default is always present
                if (!gallery.includes(DEFAULT_BACKGROUND_URL)) {
                    gallery.unshift(DEFAULT_BACKGROUND_URL);
                }
                setSavedBackgrounds(gallery);
            }
        } catch (error) {
            console.error("Failed to load background data:", error);
        }
    }, []);


    const openModal = useCallback((modal: ModalType) => {
        setActiveModal(modal);
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setDeckToAnalyze(null); // Reset deck to analyze when any modal closes
        setDeckToPredict(null); // Reset deck to predict when any modal closes
    }, []);
    
    useEffect(() => {
        try {
            const saved = localStorage.getItem('savedDecks');
            if (saved) {
                let parsedDecks: SavedDeck[] = JSON.parse(saved);
                
                // Migration logic for old formats
                if (Array.isArray(parsedDecks) && parsedDecks.length > 0) {
                    // Check for old format (array of card arrays)
                    if (Array.isArray(parsedDecks[0])) {
                        parsedDecks = parsedDecks.map((deck: any, index: number) => ({
                            name: `Deck ${index + 1}`,
                            deck: deck,
                            isComplete: deck.length === 52,
                        }));
                    } 
                    // Check for decks without isComplete property
                    else if (typeof parsedDecks[0].isComplete === 'undefined') {
                         parsedDecks.forEach(deck => {
                            deck.isComplete = deck.deck.length === 52;
                         });
                    }
                }
                setSavedDecks(parsedDecks);
                 // Save migrated data back to localStorage
                localStorage.setItem('savedDecks', JSON.stringify(parsedDecks));
            }
        } catch (error) {
            console.error("Failed to load/migrate saved decks:", error);
        }
    }, []);

    // Initialize simulation games
    useEffect(() => {
        const initialGamesData: GameState[] = [];
        for (let i = 0; i < INITIAL_GAMES; i++) {
            initialGamesData.push({ ...runSimulation(), id: Date.now() + i });
        }
        setGames(initialGamesData);
    }, []);

    // Simulation logic updated to track history by marker rank and individual card
    useInterval(() => {
        const newHistory = JSON.parse(JSON.stringify(history));
        const newCardHistory = JSON.parse(JSON.stringify(cardHistory));
        
        const newGames = games.map(g => {
            const result = runSimulation();
            const rank = result.marker.rank;
            const cardId = getCardIdentifier(result.marker);

            if (result.winner === 'Andar') {
                newHistory[rank].andar++;
                newCardHistory[cardId].andar++;
            } else {
                newHistory[rank].bahar++;
                newCardHistory[cardId].bahar++;
            }
            newHistory[rank].total++;
            newCardHistory[cardId].total++;

            return { ...result, id: g.id };
        });
        setGames(newGames);
        setHistory(newHistory);
        setCardHistory(newCardHistory);
    }, isPlaying ? simulationSpeed : null);
    
    const addGame = useCallback(() => {
        setGames(prev => {
            if (prev.length >= MAX_GAMES) return prev;
            const newGame = { ...runSimulation(), id: Date.now() + Math.random() };
            return [...prev, newGame];
        });
    }, []);
    
    const removeGame = useCallback(() => {
        setGames(prev => {
            if (prev.length <= MIN_GAMES) return prev;
            return prev.slice(0, prev.length - 1);
        });
    }, []);
    
    const clearHistory = useCallback(() => {
        setHistory(JSON.parse(JSON.stringify(initialHistory)));
        setCardHistory(JSON.parse(JSON.stringify(initialCardHistory)));
        setToast({ message: "All simulation history has been cleared." });
    }, []);

    const handleSpeedChange = useCallback((newSpeed: number) => {
        setSimulationSpeed(newSpeed);
        try {
            localStorage.setItem('simulationSpeed', String(newSpeed));
        } catch (error) {
            console.error("Failed to save simulation speed:", error);
        }
    }, []);
    
    const handleBackgroundChange = useCallback((newUrl: string) => {
        setBackgroundUrl(newUrl);
         setSavedBackgrounds(prev => {
            const newGallery = [newUrl, ...prev.filter(url => url !== newUrl)];
            try {
                localStorage.setItem('backgroundUrl', newUrl);
                localStorage.setItem('savedBackgrounds', JSON.stringify(newGallery));
            } catch (error) {
                 console.error("Failed to save background data:", error);
            }
            return newGallery;
        });
        setToast({ message: "Background updated!" });
    }, []);

    const handleDeleteBackground = useCallback((urlToDelete: string) => {
        if (urlToDelete === DEFAULT_BACKGROUND_URL) {
            setToast({ message: "Cannot delete the default background." });
            return;
        }
        setSavedBackgrounds(prev => {
            const newGallery = prev.filter(url => url !== urlToDelete);
            try {
                localStorage.setItem('savedBackgrounds', JSON.stringify(newGallery));
                if (backgroundUrl === urlToDelete) {
                    setBackgroundUrl(DEFAULT_BACKGROUND_URL);
                    localStorage.setItem('backgroundUrl', DEFAULT_BACKGROUND_URL);
                }
                 setToast({ message: "Background removed from gallery." });
            } catch (error) {
                 console.error("Failed to update background gallery:", error);
            }
            return newGallery;
        });
    }, [backgroundUrl]);


    const handleResetBackground = useCallback(() => {
        setBackgroundUrl(DEFAULT_BACKGROUND_URL);
        try {
            localStorage.setItem('backgroundUrl', DEFAULT_BACKGROUND_URL);
            setToast({ message: "Background reset to default." });
        } catch (e) { console.error(e) }
    }, []);


    const handleSaveDeck = useCallback((deck: Card[], name: string) => {
        setSavedDecks(prev => {
            const newDeck: SavedDeck = { name, deck, isComplete: deck.length === 52 };
            const newDecks = [...prev, newDeck];
            try {
                localStorage.setItem('savedDecks', JSON.stringify(newDecks));
                setToast({ message: `Deck "${name}" saved!` });
            } catch (error) {
                console.error("Failed to save deck:", error);
                setToast({ message: "Error: Failed to save deck. Storage might be full." });
            }
            return newDecks;
        });
        closeModal();
    }, [closeModal]);

    const handleDeleteDeck = useCallback((indexToDelete: number) => {
        const deckToDelete = savedDecks[indexToDelete];

        if (!deckToDelete) {
            console.error("Attempted to delete a deck that does not exist at index:", indexToDelete);
            return; 
        }
        if (deckToDelete.isComplete) {
            setToast({ message: "Cannot delete a complete 52-card deck." });
            return;
        }

        const handleUndo = () => {
            setSavedDecks(currentDecks => {
                const restoredDecks = [...currentDecks];
                restoredDecks.splice(indexToDelete, 0, deckToDelete);
                try {
                    localStorage.setItem('savedDecks', JSON.stringify(restoredDecks));
                    setToast({ message: 'Deck restored!' });
                } catch (error) {
                    setToast({ message: 'Error restoring deck.' });
                    console.error("Failed to restore deck to localStorage:", error);
                }
                return restoredDecks;
            });
        };

        setSavedDecks(currentDecks => {
            const newDecks = currentDecks.filter((_, i) => i !== indexToDelete);
            try {
                localStorage.setItem('savedDecks', JSON.stringify(newDecks));
                setToast({
                    message: `Deck "${deckToDelete.name}" deleted.`,
                    action: { label: 'Undo', onClick: handleUndo }
                });
                return newDecks;
            } catch (error) {
                setToast({ message: 'Error deleting deck. Storage may be full.' });
                console.error("Failed to update saved decks in localStorage:", error);
                return currentDecks;
            }
        });
    }, [savedDecks, setToast]);


    const handleAnalyzeDeck = useCallback((deck: Card[]) => {
        setDeckToAnalyze(deck);
        openModal('cheatSheet');
    }, [openModal]);

    const handlePredictFromDeck = useCallback((deck: Card[]) => {
        setDeckToPredict(deck);
        openModal('prediction');
    }, [openModal]);

    const handleFinishOnboarding = () => {
        try {
            localStorage.setItem('hasCompletedOnboarding', 'true');
        } catch (error) {
             console.error("Failed to save onboarding status:", error);
        }
        setShowOnboarding(false);
    };

    const handleCloseToast = useCallback(() => {
        setToast(null);
    }, []);


    const renderModal = () => {
        switch (activeModal) {
            case 'prediction':
                return <PredictionDashboard onClose={closeModal} deckToAnalyze={deckToPredict} />;
            case 'history':
                return <HistoryCreator onClose={closeModal} />;
            case 'deckView':
                return <CardDeckView onClose={closeModal} onSaveDeck={handleSaveDeck} />;
            case 'cheatSheet':
                return <MasterCheatSheet onClose={closeModal} initialDeck={deckToAnalyze} />;
            case 'savedDecks':
                return <SavedDecksManager decks={savedDecks} onClose={closeModal} onAnalyze={handleAnalyzeDeck} onDelete={handleDeleteDeck} onPredict={handlePredictFromDeck} />;
            case 'camera':
                return <CameraScanner onClose={closeModal} />;
            case 'cardStats':
                return <CardStatsDashboard onClose={closeModal} history={cardHistory} />;
            case 'manualDeck':
                return <ManualDeckCreator onClose={closeModal} onSaveDeck={handleSaveDeck} setToast={setToast} />;
            case 'themeManager':
                 return (
                    <ThemeManager
                        onClose={closeModal}
                        simulationSpeed={simulationSpeed}
                        onSpeedChange={handleSpeedChange}
                        savedBackgrounds={savedBackgrounds}
                        onBackgroundChange={handleBackgroundChange}
                        onResetBackground={handleResetBackground}
                        onDeleteBackground={handleDeleteBackground}
                    />
                );
            case 'simulation':
                return (
                    <RandomHistoryCreator 
                        onClose={closeModal}
                        games={games}
                        rankHistory={history}
                        isPlaying={isPlaying}
                        onTogglePlay={() => setIsPlaying(p => !p)}
                        onAddGame={addGame}
                        onRemoveGame={removeGame}
                        onClearHistory={clearHistory}
                        maxGames={MAX_GAMES}
                        minGames={MIN_GAMES}
                    />
                );
            default:
                return null;
        }
    };
    
    return (
        <div 
            className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-4 relative transition-all duration-500"
            style={{ backgroundImage: `url('${backgroundUrl}')` }}
        >
            
            <Toast toast={toast} onClose={handleCloseToast} />
            
            {showOnboarding && <OnboardingTour onFinish={handleFinishOnboarding} />}
            
            <header className="text-center mb-12 absolute top-10 bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-600">
                    Andar Bahar Alltime Prediction
                </h1>
                <p className="text-gray-700 font-medium mt-2">Analyze and Predict Game Outcomes</p>
            </header>

            <main className="flex-grow flex items-center justify-center">
                {/* Main content can go here if needed */}
            </main>

            {renderModal()}
            
             <button
                onClick={() => openModal('themeManager')}
                id="settings-btn"
                aria-label="Open Settings and Theme Manager"
                className="fixed bottom-[10rem] left-6 bg-gradient-to-br from-gray-700 to-gray-800 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-40"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
            </button>
            
             <button
                onClick={() => openModal('manualDeck')}
                id="manual-deck-creator-btn"
                aria-label="Open Manual Deck Creator"
                className="fixed bottom-[6rem] left-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-40"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
            </button>

            <button
                onClick={() => openModal('camera')}
                id="camera-scanner-btn"
                aria-label="Open Live Card Scanner"
                className="fixed bottom-[2rem] left-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-40"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h12V8h-2a1 1 0 110-2h4a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path fillRule="evenodd" d="M13 4a1 1 0 011 1v1a1 1 0 11-2 0V5a1 1 0 011-1zM4 8a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M7 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H7zm3 1a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
            </button>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/60 backdrop-blur-sm flex flex-wrap justify-center items-center gap-4 border-t border-gray-200 z-30">
                <Tooltip text="Get predictions for a specific marker card">
                    <button
                        id="prediction-btn"
                        onClick={() => openModal('prediction')}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
                    >
                        Prediction
                    </button>
                </Tooltip>
                <Tooltip text="Manage your saved game decks">
                    <button
                        id="saved-decks-btn"
                        onClick={() => openModal('savedDecks')}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
                    >
                        Saved Decks
                    </button>
                </Tooltip>
                <Tooltip text="Generate and save a custom shuffled deck">
                    <button
                        id="manual-deck-btn"
                        onClick={() => openModal('deckView')}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
                    >
                        Generate Deck
                    </button>
                </Tooltip>
                <Tooltip text="Run high-speed simulations to gather data">
                    <button
                        id="simulation-btn"
                        onClick={() => openModal('simulation')}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
                    >
                        Simulator
                    </button>
                </Tooltip>
                <Tooltip text="View detailed win/loss stats for every card">
                    <button
                        id="card-stats-btn"
                        onClick={() => openModal('cardStats')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
                    >
                        Card Stats
                    </button>
                </Tooltip>
            </footer>
        </div>
    );
};

export default App;
