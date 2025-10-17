import React, { useEffect } from 'react';

interface ToastProps {
    toast: {
        message: string;
        action?: {
            label: string;
            onClick: () => void;
        };
    } | null;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto-close after 5 seconds to allow time for undo
            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    if (!toast) {
        return null;
    }

    return (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down">
            <div className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-2xl flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{toast.message}</span>
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        className="ml-4 font-bold uppercase text-sm bg-green-700 hover:bg-green-800 px-3 py-1 rounded-md border border-green-500 transition-colors"
                    >
                        {toast.action.label}
                    </button>
                )}
                <button onClick={onClose} className="ml-2 text-xl leading-none">&times;</button>
            </div>
            <style>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-20px) translateX(-50%); }
                    to { opacity: 1; transform: translateY(0) translateX(-50%); }
                }
                .animate-slide-down {
                    animation: slide-down 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </div>
    );
};

export default Toast;
