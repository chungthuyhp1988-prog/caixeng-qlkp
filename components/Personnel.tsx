import React, { useState, useEffect } from 'react';
import { staffAPI, Staff } from '../lib/api';
import { formatCurrency } from '../constants';
import { Users, UserPlus, Phone, Briefcase, DollarSign, Calendar, Search, Loader2, Save, X, Trash2, Pencil, ToggleLeft, ToggleRight, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from './Toast';

import { useAuth } from '../contexts/AuthContext';

const Personnel = () => {
    const { user, refreshProfile } = useAuth();
    const { toast, confirm } = useToast();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [salaryBase, setSalaryBase] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await staffAPI.getAll();
            setStaff(data);
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

    const handleEdit = (staffMember: Staff) => {
        setEditingStaff(staffMember);
        setFullName(staffMember.fullName || '');
        setEmail(staffMember.email || '');
        setPhone(staffMember.phone || '');
        setSalaryBase(staffMember.salaryBase.toLocaleString('vi-VN'));
        setRole(staffMember.role);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setShowPassword(false);
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
        const numericSalary = Number(salaryBase.replace(/\./g, '').replace(/,/g, ''));

        try {
            if (editingStaff) {
                // Update existing
                await staffAPI.update(editingStaff.id, {
                    fullName,
                    phone,
                    salaryBase: numericSalary,
                    role,
                    status: editingStaff.status
                });

                // If updating self, refresh profile context
                if (user && editingStaff.id === user.id) {
                    await refreshProfile();
                }

                toast.success('Cập nhật thành công!');
            } else {
                // Create new staff with login credentials
                if (!phone) {
                    toast.warning('Vui lòng nhập số điện thoại (dùng làm tài khoản đăng nhập).');
                    return;
                }
                if (!password || password.length < 6) {
                    toast.warning('Mật khẩu phải có ít nhất 6 ký tự.');
                    return;
                }
                await staffAPI.create({
                    fullName,
                    email: `${phone}@qlkp.com`,
                    phone,
                    password,
                    salaryBase: numericSalary,
                    role,
                    status: 'ACTIVE',
                    joinedAt: new Date().toISOString()
                });
                toast.success(`Đã tạo tài khoản cho ${fullName}! SĐT đăng nhập: ${phone}`);
            }
            closeModal();
            fetchStaff();
        } catch (err: any) {
            const msg = err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            toast.error(msg);
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await staffAPI.delete(id);
            setStaff(prev => prev.filter(s => s.id !== id));
            setDeleteConfirm(null);
            toast.success('Đã xóa nhân viên.');
        } catch (err) {
            toast.error('Không thể xóa nhân viên. Vui lòng thử lại.');
            console.error(err);
        }
    };

    const handleToggleStatus = async (staffMember: Staff) => {
        try {
            const newStatus = staffMember.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await staffAPI.update(staffMember.id, { status: newStatus });
            setStaff(prev => prev.map(s => s.id === staffMember.id ? { ...s, status: newStatus } : s));
        } catch (err) {
            toast.error('Không thể cập nhật trạng thái.');
            console.error(err);
        }
    };

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setSalaryBase(val ? Number(val).toLocaleString('vi-VN') : '');
    };

    // Calculations
    const activeStaff = staff.filter(s => s.status === 'ACTIVE');
    const totalStaff = staff.length;
    const totalMonthlySalary = activeStaff.reduce((sum, s) => sum + s.salaryBase, 0);

    // Filter & Search
    const filteredStaff = staff.filter(s => {
        const matchSearch = search === '' ||
            s.fullName.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            s.phone.includes(search);
        const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
        return matchSearch && matchStatus;
    });

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Quản Lý Nhân Sự</h2>
                    <p className="text-slate-400 text-sm">Danh sách nhân viên & Lương</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email, SĐT..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-primary-500 w-full md:w-64 min-h-[44px]"
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary-600/20 min-h-[44px] whitespace-nowrap cursor-pointer"
                    >
                        <UserPlus size={18} />
                        <span className="hidden md:inline">Thêm Nhân Viên</span>
                        <span className="md:hidden">Thêm</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border min-h-[36px] cursor-pointer transition-colors ${filterStatus === status
                            ? (status === 'ACTIVE' ? 'bg-green-500/20 border-green-500 text-green-400'
                                : status === 'INACTIVE' ? 'bg-red-500/20 border-red-500 text-red-400'
                                    : 'bg-slate-700 border-slate-500 text-white')
                            : 'bg-transparent border-slate-700 text-slate-400'
                            }`}
                    >
                        {status === 'ALL' ? `Tất cả (${totalStaff})` : status === 'ACTIVE' ? `Đang làm (${activeStaff.length})` : `Nghỉ việc (${totalStaff - activeStaff.length})`}
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Đang làm việc</p>
                        <p className="text-2xl font-bold text-green-400">{activeStaff.length}</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
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
                {filteredStaff.map((staffMember) => (
                    <div key={staffMember.id} className={`bg-slate-800 rounded-2xl border p-5 transition-all group ${staffMember.status === 'INACTIVE' ? 'border-slate-700/50 opacity-60' : 'border-slate-700 hover:border-slate-600'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border ${staffMember.status === 'ACTIVE' ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-slate-500' : 'bg-slate-800 border-slate-600'}`}>
                                    {staffMember.fullName ? staffMember.fullName.charAt(0).toUpperCase() : staffMember.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">{staffMember.fullName || 'Chưa cập nhật tên'}</h3>
                                    <p className="text-xs text-slate-500">{staffMember.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${staffMember.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {staffMember.role === 'ADMIN' ? 'Quản lý' : 'Nhân viên'}
                                </div>
                                {staffMember.status === 'INACTIVE' && (
                                    <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400">
                                        Nghỉ
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Phone size={14} />
                                <span>{staffMember.phone || '---'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <DollarSign size={14} />
                                <span>Lương CB: <strong className="text-green-400">{formatCurrency(staffMember.salaryBase)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                                <Calendar size={12} />
                                <span>Vào làm: {new Date(staffMember.joinedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700 flex justify-between items-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Toggle Active/Inactive */}
                            <button
                                onClick={() => handleToggleStatus(staffMember)}
                                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer ${staffMember.status === 'ACTIVE' ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}
                                title={staffMember.status === 'ACTIVE' ? 'Chuyển sang Nghỉ việc' : 'Kích hoạt lại'}
                            >
                                {staffMember.status === 'ACTIVE' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                {staffMember.status === 'ACTIVE' ? 'Hoạt động' : 'Nghỉ việc'}
                            </button>

                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(staffMember)}
                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    title="Sửa thông tin"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(staffMember.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Xóa nhân viên"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredStaff.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <Users size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">Không tìm thấy nhân viên</p>
                    <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{editingStaff ? 'Cập Nhật Hồ Sơ' : 'Thêm Nhân Viên Mới'}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white cursor-pointer">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            {!editingStaff && (
                                <>
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-blue-300 text-xs">
                                        💡 Số điện thoại sẽ là tài khoản đăng nhập của nhân viên
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                <Lock size={16} />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={6}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 pl-10 pr-10 text-white focus:outline-none focus:border-primary-500"
                                                placeholder="Ít nhất 6 ký tự"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1">Số điện thoại {!editingStaff && <span className="text-red-500">*</span>}</label>
                                    <input
                                        type="tel"
                                        required={!editingStaff}
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                                        placeholder="0901234567"
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
                                    type="text"
                                    value={salaryBase}
                                    onChange={handleSalaryChange}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500 font-bold"
                                    placeholder="8.000.000"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all mt-4 cursor-pointer"
                            >
                                {editingStaff ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-6 w-full max-w-sm shadow-2xl">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white text-center mb-2">Xóa nhân viên?</h3>
                        <p className="text-slate-400 text-sm text-center mb-6">
                            Bạn có chắc muốn xóa nhân viên này khỏi hệ thống? Thao tác không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Personnel;
