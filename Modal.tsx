
import React from 'react';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-gray-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-300"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 id="modal-title" className="text-xl font-bold text-purple-600">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-800 transition-colors text-2xl"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </header>
                <main className="p-6 overflow-y-auto bg-white">
                    {children}
                </main>
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

export default Modal;
