import React, { useState } from 'react';
import Modal from './Modal';
import Tooltip from './Tooltip';

interface ThemeManagerProps {
    onClose: () => void;
    simulationSpeed: number;
    onSpeedChange: (speed: number) => void;
    savedBackgrounds: string[];
    onBackgroundChange: (url: string) => void;
    onResetBackground: () => void;
    onDeleteBackground: (url: string) => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ 
    onClose, 
    simulationSpeed, 
    onSpeedChange,
    savedBackgrounds,
    onBackgroundChange,
    onResetBackground,
    onDeleteBackground
}) => {
    const [bgUrlInput, setBgUrlInput] = useState('');

    const handleApplyUrl = () => {
        if (bgUrlInput.trim()) {
            onBackgroundChange(bgUrlInput.trim());
            setBgUrlInput('');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onBackgroundChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal title="Theme & Settings" onClose={onClose}>
            <div className="space-y-8">
                {/* Appearance Settings */}
                <section>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Appearance Settings</h3>
                     <div className="p-4 bg-white rounded-lg shadow-inner space-y-4">
                        <p className="text-sm text-gray-600">Change the application's background image. Uploaded images are saved to your gallery.</p>
                        
                        {/* Background Gallery */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-100 rounded-lg">
                            {savedBackgrounds.map((url) => (
                                <div key={url} className="relative group aspect-video">
                                    <img 
                                        src={url} 
                                        onClick={() => onBackgroundChange(url)}
                                        className="w-full h-full object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all"
                                        alt="Background thumbnail"
                                    />
                                     <button
                                        onClick={() => onDeleteBackground(url)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Delete background"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        {/* URL Input */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={bgUrlInput}
                                onChange={(e) => setBgUrlInput(e.target.value)}
                                placeholder="Paste an image URL here"
                                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 flex-grow"
                                aria-label="Background image URL"
                            />
                            <button
                                onClick={handleApplyUrl}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
                            >
                                Apply URL
                            </button>
                        </div>

                        <div className="flex items-center justify-center">
                            <span className="text-gray-500 mx-4">OR</span>
                        </div>
                        
                         <label
                             htmlFor="background-upload"
                             className="w-full text-center cursor-pointer px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 block"
                         >
                            Upload an Image
                         </label>
                         <input
                             type="file"
                             id="background-upload"
                             className="hidden"
                             accept="image/*"
                             onChange={handleFileChange}
                         />

                         <div className="pt-2">
                             <button
                                onClick={onResetBackground}
                                className="w-full text-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm"
                             >
                                Reset to Default Background
                            </button>
                         </div>
                    </div>
                </section>
                
                {/* Simulation Settings */}
                <section>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Simulation Settings</h3>
                    <div className="p-4 bg-white rounded-lg shadow-inner space-y-4">
                        <div className="flex items-center gap-4">
                            <Tooltip text="Adjust the delay between new game rounds in the Simulator.">
                                <label htmlFor="sim-speed" className="text-gray-600 font-medium">Simulation Speed:</label>
                            </Tooltip>
                            <input
                                id="sim-speed"
                                type="range"
                                min="50"
                                max="2000"
                                step="50"
                                value={simulationSpeed}
                                onChange={e => onSpeedChange(Number(e.target.value))}
                                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                aria-label="Simulation speed control"
                            />
                            <span className="font-mono text-lg w-24 text-center text-gray-700">{simulationSpeed}ms</span>
                        </div>
                    </div>
                </section>
            </div>
        </Modal>
    );
};

export default ThemeManager;
