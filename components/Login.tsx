import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Phone, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../lib/api';

const Login = () => {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Clean input (remove spaces)
            const cleanIdentifier = identifier.replace(/\s+/g, '');
            let emailToUse = cleanIdentifier;

            // Check if it looks like a phone number (digits only, 9-12 chars)
            const isPhoneNumber = /^\d{9,12}$/.test(cleanIdentifier);

            if (isPhoneNumber) {
                emailToUse = `${cleanIdentifier}@qlkp.com`;
            } else if (!cleanIdentifier.includes('@')) {
                // Fallback for username-like input
                emailToUse = `${cleanIdentifier}@qlkp.com`;
            }

            await authAPI.loginWithPassword(emailToUse, password);
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="max-w-md w-full relative z-20">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-2xl mb-6 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg shadow-lg relative z-10"></div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">KHO PHẾ THANH NAM</h1>
                    <p className="text-slate-400">Đăng nhập hệ thống</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">Số điện thoại</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors">
                                    {/^\d+$/.test(identifier) ? <Phone size={20} /> : <Mail size={20} />}
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-all shadow-sm"
                                    placeholder="Nhập số điện thoại (ví dụ: 0969509456)"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">Mật khẩu</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-all shadow-sm"
                                    placeholder="••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <>
                                    <span>Đăng Nhập</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-4">
                            <p className="text-slate-500 text-xs">Liên hệ Admin để cấp tài khoản</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
