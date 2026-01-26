import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await login(email);
            setSuccess(true);
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-purple-600"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="mb-8 text-center relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-700/50 mb-4 border border-slate-600 shadow-inner">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg shadow-lg shadow-primary-500/30"></div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">QA.QLKP</h1>
                    <p className="text-slate-400">Hệ thống quản lý kho & sản xuất</p>
                </div>

                {success ? (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-500/20 text-green-400 p-6 rounded-2xl border border-green-500/30 mb-6">
                            <Mail className="w-12 h-12 mx-auto mb-3" />
                            <h3 className="text-xl font-bold mb-2">Kiểm tra Email</h3>
                            <p className="text-sm">Chúng tôi đã gửi Magic Link đăng nhập vào email <strong>{email}</strong>.</p>
                        </div>
                        <button
                            onClick={() => setSuccess(false)}
                            className="text-slate-400 hover:text-white text-sm"
                        >
                            Quay lại đăng nhập
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">Email đăng nhập</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-all shadow-sm"
                                    placeholder="nhanvien@qa.qlkp.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Đăng Nhập
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-xs text-slate-500">
                                Liên hệ Admin nếu chưa có tài khoản
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
