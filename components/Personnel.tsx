import React, { useState, useEffect } from 'react';
import { staffAPI } from '../lib/api';
import { formatCurrency } from '../constants';
import { Users, UserPlus, Phone, Briefcase, DollarSign, Calendar, Search, Loader2, Save, X, Trash2, Pencil } from 'lucide-react';

interface Staff {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'STAFF';
    phone: string;
    salaryBase: number;
    status: 'ACTIVE' | 'INACTIVE';
    joinedAt: string;
}

const Personnel = () => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [salaryBase, setSalaryBase] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await staffAPI.getAll();
            setStaff(data as unknown as Staff[]);
        } catch (err: any) {
            setError('Không thể tải danh sách nhân viên.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleEdit = (user: Staff) => {
        setEditingStaff(user);
        setFullName(user.fullName || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setSalaryBase(user.salaryBase.toString());
        setRole(user.role);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setPhone('');
        setSalaryBase('');
        setRole('STAFF');
        setEditingStaff(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                // Update existing
                await staffAPI.update(editingStaff.id, {
                    fullName,
                    phone,
                    salaryBase: Number(salaryBase),
                    role,
                    status: editingStaff.status
                });
                alert('Cập nhật thành công!');
            } else {
                // Add new
                alert('Chức năng thêm nhân viên cần sử dụng Supabase Invite từ Dashboard.');
                // await staffAPI.createInvite(email);
            }
            closeModal();
            fetchStaff();
        } catch (err) {
            alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
            console.error(err);
        }
    };

    // Calculations
    const totalStaff = staff.length;
    const totalMonthlySalary = staff.reduce((sum, s) => sum + s.salaryBase, 0);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>;

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Quản Lý Nhân Sự</h2>
                    <p className="text-slate-400 text-sm">Danh sách nhân viên & Lương</p>
                </div>
                <div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary-600/20"
                    >
                        <UserPlus size={18} />
                        Thêm Nhân Viên
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Tổng nhân viên</p>
                        <p className="text-2xl font-bold text-white">{totalStaff}</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Tổng quỹ lương / tháng</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalMonthlySalary)}</p>
                    </div>
                </div>
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((user) => (
                    <div key={user.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 hover:border-slate-600 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold border border-slate-500">
                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">{user.fullName || 'Chưa cập nhật tên'}</h3>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                {user.role}
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Phone size={14} />
                                <span>{user.phone || '---'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Briefcase size={14} />
                                <span>Lương CB: <strong className="text-green-400">{formatCurrency(user.salaryBase)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                                <Calendar size={12} />
                                <span>Vào làm: {new Date(user.joinedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700 flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(user)}
                                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{editingStaff ? 'Cập Nhật Hồ Sơ' : 'Thêm Nhân Viên Mới'}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editingStaff && (
                                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl text-xs text-blue-300 mb-4">
                                    Hiện tại chức năng tạo user mới cần được thực hiện qua Dashboard hoặc Invite Link. Form này chỉ tạo hồ sơ demo.
                                </div>
                            )}

                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    required={!editingStaff}
                                    disabled={!!editingStaff}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1">Vai trò</label>
                                    <select
                                        value={role}
                                        onChange={e => setRole(e.target.value as any)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="STAFF">Nhân viên</option>
                                        <option value="ADMIN">Quản lý</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Lương cơ bản (VNĐ)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={salaryBase}
                                    onChange={e => setSalaryBase(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500 font-bold"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all mt-4"
                            >
                                {editingStaff ? 'Lưu Thay Đổi' : 'Tiếp Tục'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Personnel;
