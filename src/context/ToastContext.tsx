import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X, Trophy } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'achievement';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, type === 'achievement' ? 5000 : 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-in slide-in-from-right-10 duration-300
              ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100' :
                                toast.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-100' :
                                    toast.type === 'achievement' ? 'bg-amber-950/95 border-amber-400/60 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.15)]' :
                                        'bg-slate-900/90 border-slate-700 text-slate-100'}`}
                    >
                        {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
                        {toast.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
                        {toast.type === 'info' && <Info size={18} className="text-cyan-400" />}
                        {toast.type === 'achievement' && <Trophy size={18} className="text-amber-400 animate-bounce" />}
                        <span className={`text-sm font-medium ${toast.type === 'achievement' ? 'font-black uppercase tracking-wider' : ''}`}>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 text-white/20 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

