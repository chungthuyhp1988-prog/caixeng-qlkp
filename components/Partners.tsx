import React, { useState } from 'react';
import { Search, UserPlus, Phone, MapPin, Truck, Factory, ArrowRight, Pencil, Trash2, X } from 'lucide-react';
import { Partner, PartnerType } from '../types';
import { formatCurrency } from '../constants';

interface PartnersProps {
  partners: Partner[];
  onAddPartner: (partner: Omit<Partner, 'id' | 'totalVolume' | 'totalValue'>) => void;
  onUpdatePartner?: (id: string, updates: Partial<Partner>) => void;
  onDeletePartner?: (id: string) => void;
}

const Partners: React.FC<PartnersProps> = ({ partners, onAddPartner, onUpdatePartner, onDeletePartner }) => {
  const [filter, setFilter] = useState<'ALL' | PartnerType>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // New Partner Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newType, setNewType] = useState<PartnerType>(PartnerType.SUPPLIER);
  const [newAddress, setNewAddress] = useState('');

  const filteredPartners = partners.filter(p => {
    const matchesFilter = filter === 'ALL' || p.type === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    if (editingPartner) {
      onUpdatePartner?.(editingPartner.id, {
        name: newName,
        phone: newPhone,
        type: newType,
        address: newAddress
      });
      setEditingPartner(null);
    } else {
      onAddPartner({
        name: newName,
        phone: newPhone,
        type: newType,
        address: newAddress
      });
    }

    setIsModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setNewName(partner.name);
    setNewPhone(partner.phone);
    setNewType(partner.type);
    setNewAddress(partner.address || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    onDeletePartner?.(id);
    setDeleteConfirm(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-24 md:pb-0 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Quản Lý Đối Tác</h2>
          <p className="text-slate-400 text-xs md:text-sm">Danh sách nhà cung cấp & khách hàng</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary-600/20"
          >
            <UserPlus size={18} />
            <span className="hidden md:inline">Thêm Đối Tác</span>
            <span className="md:hidden">Thêm</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex bg-slate-800 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter(PartnerType.SUPPLIER)}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === PartnerType.SUPPLIER ? 'bg-slate-700 text-orange-400 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Nhà Cung Cấp
          </button>
          <button
            onClick={() => setFilter(PartnerType.CUSTOMER)}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === PartnerType.CUSTOMER ? 'bg-slate-700 text-blue-400 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Khách Hàng
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((partner) => {
          const isSupplier = partner.type === PartnerType.SUPPLIER;
          return (
            <div key={partner.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 hover:border-slate-600 transition-all flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSupplier ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {isSupplier ? <Truck size={24} /> : <Factory size={24} />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base line-clamp-1">{partner.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSupplier ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {isSupplier ? 'NHÀ CUNG CẤP' : 'KHÁCH HÀNG'}
                    </span>
                  </div>
                </div>
                {/* Edit/Delete Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(partner)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-primary-400 transition-colors"
                    title="Sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(partner.id)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Phone size={14} />
                  <span>{partner.phone || 'Chưa cập nhật SĐT'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin size={14} />
                  <span className="line-clamp-1">{partner.address || 'Chưa cập nhật địa chỉ'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 mt-auto">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500">Tổng giao dịch</p>
                    <p className="text-sm font-bold text-white">{partner.totalVolume.toLocaleString()} kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Tổng giá trị</p>
                    <p className={`text-sm font-bold ${isSupplier ? 'text-orange-400' : 'text-blue-400'}`}>
                      {formatCurrency(partner.totalValue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Thêm Đối Tác Mới</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setNewType(PartnerType.SUPPLIER)}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 ${newType === PartnerType.SUPPLIER ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'border-slate-700 text-slate-400'}`}
                >
                  <Truck size={18} /> Nhà cung cấp
                </button>
                <button
                  type="button"
                  onClick={() => setNewType(PartnerType.CUSTOMER)}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 ${newType === PartnerType.CUSTOMER ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'border-slate-700 text-slate-400'}`}
                >
                  <Factory size={18} /> Khách hàng
                </button>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1">Tên đối tác <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                  placeholder="Nhập tên công ty hoặc cá nhân..."
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                  placeholder="09..."
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                  placeholder="Quận/Huyện, Tỉnh..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Xác nhận xóa?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              Bạn có chắc muốn xóa đối tác này? Thao tác không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors"
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

export default Partners;