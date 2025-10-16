import React, { useState, useEffect, useMemo } from 'react';
import { OnboardingStep } from '../types';

const STEPS: OnboardingStep[] = [
    {
        selector: '#prediction-btn',
        title: 'Prediction Dashboard',
        content: 'Select a marker card to get instant predictions on where the other three matching cards might appear in the deck.',
        position: 'top',
    },
    {
        selector: '#saved-decks-btn',
        title: 'Saved Decks',
        content: 'Access, analyze, or delete any decks you have previously saved.',
        position: 'top',
    },
    {
        selector: '#manual-deck-btn',
        title: 'Generate a Deck',
        content: 'Generate a complete, random shuffled deck based on a marker card. You can then save it for later analysis.',
        position: 'top',
    },
    {
        selector: '#simulation-btn',
        title: 'Simulator',
        content: 'Run a powerful, high-speed simulation with multiple games at once to gather a large amount of statistical data.',
        position: 'top',
    },
     {
        selector: '#card-stats-btn',
        title: 'Card Stats',
        content: 'View detailed win/loss statistics for every single card in the deck when it appears as a marker.',
        position: 'top',
    },
    {
        selector: '#manual-deck-creator-btn',
        title: 'Manual Deck Creator',
        content: 'Manually input a complete 52-card deck in its exact order. Perfect for analyzing real-world shuffles or specific scenarios.',
        position: 'right',
    },
    {
        selector: '#camera-scanner-btn',
        title: 'Live Card Scanner',
        content: 'This feature simulates scanning cards with your camera to get live predictions during a game. Give it a try!',
        position: 'left',
    },
    {
        selector: '#settings-btn',
        title: 'Settings',
        content: 'Customize your experience by changing the simulation speed or updating the background image.',
        position: 'right',
    },
];

interface OnboardingTourProps {
    onFinish: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const step = STEPS[currentStep];
    const targetElement = useMemo(() => {
        if (typeof window !== 'undefined' && step) {
            return document.querySelector(step.selector);
        }
        return null;
    }, [currentStep, step]);

    const targetRect = targetElement?.getBoundingClientRect();

    useEffect(() => {
        const handleResize = () => {
            // Force a re-render to recalculate position on resize
            setCurrentStep(s => s);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onFinish();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!targetRect || !step) return null;

    const tooltipStyle: React.CSSProperties = {
        position: 'absolute',
        zIndex: 10001,
    };
    
    // Position tooltip based on step.position
    switch (step.position) {
        case 'top':
            tooltipStyle.bottom = window.innerHeight - targetRect.top + 10;
            tooltipStyle.left = targetRect.left + targetRect.width / 2;
            tooltipStyle.transform = 'translateX(-50%)';
            break;
        case 'bottom':
            tooltipStyle.top = targetRect.bottom + 10;
            tooltipStyle.left = targetRect.left + targetRect.width / 2;
            tooltipStyle.transform = 'translateX(-50%)';
            break;
        case 'left':
            tooltipStyle.top = targetRect.top + targetRect.height / 2;
            tooltipStyle.right = window.innerWidth - targetRect.left + 10;
            tooltipStyle.transform = 'translateY(-50%)';
            break;
        case 'right':
            tooltipStyle.top = targetRect.top + targetRect.height / 2;
            tooltipStyle.left = targetRect.right + 10;
            tooltipStyle.transform = 'translateY(-50%)';
            break;
    }


    return (
        <div className="fixed inset-0 z-[10000]">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                style={{
                    clipPath: `path('M0,0H${window.innerWidth}V${window.innerHeight}H0V0ZM${targetRect.left - 4},${targetRect.top - 4}V${targetRect.bottom + 4}H${targetRect.right + 4}V${targetRect.top - 4}H${targetRect.left - 4}Z')`
                }}
            ></div>

            {/* Tooltip */}
            <div style={tooltipStyle} className="bg-white rounded-lg shadow-2xl p-4 w-72 animate-fade-in">
                <h3 className="font-bold text-lg text-purple-600 mb-2">{step.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{step.content}</p>
                <div className="flex justify-between items-center">
                    <button onClick={onFinish} className="text-sm text-gray-500 hover:text-gray-800">Skip</button>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                             <button onClick={handlePrev} className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md">Back</button>
                        )}
                        <button onClick={handleNext} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                            {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default OnboardingTour;
