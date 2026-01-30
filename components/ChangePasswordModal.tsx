import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);

        try {
            // Timeout after 15 seconds
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Yêu cầu quá thời gian. Vui lòng thử lại.')), 15000)
            );

            const updatePromise = supabase.auth.updateUser({ password });
            const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

            if (error) throw error;

            setSuccess(true);
            setPassword('');
            setConfirmPassword('');
            // Auto close after 2 seconds
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);

        } catch (err: any) {
            console.error('Error changing password:', err);
            if (err.message?.includes('session')) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else {
                setError(err.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key size={24} className="text-primary-400" />
                </div>

                <h3 className="text-xl font-bold text-white text-center mb-6">Đổi Mật Khẩu</h3>

                {success ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-in zoom-in duration-300">
                        <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
                        <p className="text-emerald-400 font-bold text-lg">Đổi mật khẩu thành công!</p>
                        <p className="text-slate-400 text-sm mt-1">Đang đóng cửa sổ...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                                <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1">Mật khẩu mới</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="Nhập mật khẩu mới..."
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="Nhập lại mật khẩu mới..."
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Key size={18} />
                                        Xác nhận đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ChangePasswordModal;
