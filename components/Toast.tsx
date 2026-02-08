import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toast: {
        success: (message: string) => void;
        error: (message: string) => void;
        warning: (message: string) => void;
        info: (message: string) => void;
    };
    confirm: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside ToastProvider');
    return ctx;
};

// ─── Single Toast Item ───
const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; text: string }> = {
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <CheckCircle2 size={18} className="text-emerald-400" />, text: 'text-emerald-300' },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <XCircle size={18} className="text-red-400" />, text: 'text-red-300' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <AlertTriangle size={18} className="text-amber-400" />, text: 'text-amber-300' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <Info size={18} className="text-blue-400" />, text: 'text-blue-300' },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    const [exiting, setExiting] = useState(false);
    const style = TOAST_STYLES[toast.type];

    useEffect(() => {
        const duration = toast.duration || 3000;
        const exitTimer = setTimeout(() => setExiting(true), duration - 300);
        const removeTimer = setTimeout(() => onDismiss(toast.id), duration);
        return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
    }, [toast, onDismiss]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl max-w-sm w-full transition-all duration-300 ${style.bg} ${style.border} ${exiting ? 'opacity-0 translate-y-[-8px] scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
            style={{ animation: exiting ? 'none' : 'toast-in 0.3s ease-out' }}
        >
            <span className="shrink-0">{style.icon}</span>
            <p className={`text-sm font-medium flex-1 ${style.text}`}>{toast.message}</p>
            <button onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 200); }} className="text-slate-500 hover:text-white transition-colors shrink-0 cursor-pointer p-1">
                <X size={14} />
            </button>
        </div>
    );
};

// ─── Confirm Dialog ───
interface ConfirmState {
    message: string;
    resolve: (value: boolean) => void;
}

const ConfirmDialog: React.FC<{ state: ConfirmState; onClose: () => void }> = ({ state, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => { state.resolve(false); onClose(); }}>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}
            style={{ animation: 'toast-in 0.2s ease-out' }}>
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Xác nhận</h3>
            <p className="text-slate-400 text-sm text-center mb-6">{state.message}</p>
            <div className="flex gap-3">
                <button
                    onClick={() => { state.resolve(false); onClose(); }}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors cursor-pointer"
                >
                    Hủy
                </button>
                <button
                    onClick={() => { state.resolve(true); onClose(); }}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                    Đồng ý
                </button>
            </div>
        </div>
    </div>
);

// ─── Provider ───
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const idRef = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
        const id = ++idRef.current;
        setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]); // max 5
    }, []);

    const toast = {
        success: (msg: string) => addToast('success', msg),
        error: (msg: string) => addToast('error', msg, 5000),
        warning: (msg: string) => addToast('warning', msg, 4000),
        info: (msg: string) => addToast('info', msg),
    };

    const confirm = useCallback((message: string): Promise<boolean> => {
        return new Promise(resolve => {
            setConfirmState({ message, resolve });
        });
    }, []);

    return (
        <ToastContext.Provider value={{ toast, confirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center gap-2 pointer-events-none w-full px-4">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>

            {/* Confirm Dialog */}
            {confirmState && <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />}

            {/* Animation keyframes */}
            <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </ToastContext.Provider>
    );
};
