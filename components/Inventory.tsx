import React, { useState } from 'react';
import { Search, Settings, Package, Layers, AlertTriangle, CheckCircle2, ArrowRight, History, ArrowDownCircle, ArrowUpCircle, Clock, Trash2, PlusCircle, Pencil, X } from 'lucide-react';
import { formatCurrency } from '../constants';
import { MaterialType, Material, Transaction, TransactionType } from '../types';

interface InventoryProps {
  materials: Material[];
  transactions: Transaction[];
  onProduce: (scrapAmount: number) => void;
  onDeleteTransaction?: (id: string) => void;
  onAddMaterial?: (material: Omit<Material, 'id'>) => void;
  onUpdateMaterial?: (id: string, updates: Partial<Material>) => void;
  onDeleteMaterial?: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ materials, transactions, onProduce, onDeleteTransaction, onAddMaterial, onUpdateMaterial, onDeleteMaterial }) => {
  const [filter, setFilter] = useState<'ALL' | MaterialType>('ALL');
  const [search, setSearch] = useState('');
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [produceAmount, setProduceAmount] = useState('');
  const [historyTab, setHistoryTab] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Material form state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialDeleteConfirm, setMaterialDeleteConfirm] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState({
    name: '',
    code: '',
    type: MaterialType.SCRAP as MaterialType,
    stock: '',
    unit: 'kg',
    pricePerKg: ''
  });

  const filteredMaterials = materials.filter(m => {
    const matchesFilter = filter === 'ALL' || m.type === filter;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const scrapMaterial = materials.find(m => m.type === MaterialType.SCRAP);
  const scrapStock = scrapMaterial?.stock || 0;

  // Constants for stock alerts
  const LOW_STOCK_THRESHOLD = 2000; // kg

  const handleProduceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(produceAmount.replace(/\./g, '').replace(',', '.'));
    if (amount > 0 && amount <= scrapStock) {
      onProduce(amount);
      setShowProduceModal(false);
      setProduceAmount('');
    }
  };

  // ━━ Material CRUD handlers ━━
  const resetMaterialForm = () => {
    setMaterialForm({ name: '', code: '', type: MaterialType.SCRAP, stock: '', unit: 'kg', pricePerKg: '' });
    setEditingMaterial(null);
  };

  const openAddMaterial = () => {
    resetMaterialForm();
    setShowMaterialModal(true);
  };

  const openEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name,
      code: material.code,
      type: material.type,
      stock: material.stock.toString(),
      unit: material.unit,
      pricePerKg: material.pricePerKg.toString()
    });
    setShowMaterialModal(true);
  };

  const closeMaterialModal = () => {
    setShowMaterialModal(false);
    resetMaterialForm();
  };

  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = Number(materialForm.stock.replace(/\./g, '').replace(',', '.'));
    const pricePerKg = Number(materialForm.pricePerKg.replace(/\./g, '').replace(',', '.'));

    if (!materialForm.name || !materialForm.code || isNaN(stock) || isNaN(pricePerKg)) return;

    if (editingMaterial) {
      onUpdateMaterial?.(editingMaterial.id, {
        name: materialForm.name,
        code: materialForm.code,
        type: materialForm.type,
        stock,
        unit: materialForm.unit,
        pricePerKg
      });
    } else {
      onAddMaterial?.({
        name: materialForm.name,
        code: materialForm.code,
        type: materialForm.type,
        stock,
        unit: materialForm.unit,
        pricePerKg
      });
    }
    closeMaterialModal();
  };

  const handleFormatNumber = (value: string): string => {
    const val = value.replace(/[^0-9,.]/g, '');
    const parts = val.split(',');
    const integerPart = parts[0].replace(/\./g, '');
    const decimalPart = parts.length > 1 ? ',' + parts[1] : '';
    if (!isNaN(Number(integerPart))) {
      return Number(integerPart).toLocaleString('vi-VN') + decimalPart;
    }
    return val;
  };

  return (
    <div className="space-y-4 md:space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Kho Hàng</h2>
          <p className="text-slate-400 text-xs md:text-sm">Quản lý tồn kho hiện tại</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm mã hoặc tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-primary-500 w-full md:w-64 min-h-[44px]"
            />
          </div>
          {onAddMaterial && (
            <button
              onClick={openAddMaterial}
              className="bg-primary-600 hover:bg-primary-500 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary-600/20 min-h-[44px] whitespace-nowrap cursor-pointer"
            >
              <PlusCircle size={18} />
              <span className="hidden md:inline">Thêm Vật Liệu</span>
              <span className="md:hidden">Thêm</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 min-h-[40px] cursor-pointer ${filter === 'ALL' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter(MaterialType.SCRAP)}
          className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 min-h-[40px] cursor-pointer ${filter === MaterialType.SCRAP ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Nhựa Phế
        </button>
        <button
          onClick={() => setFilter(MaterialType.POWDER)}
          className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 min-h-[40px] cursor-pointer ${filter === MaterialType.POWDER ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Bột Nhựa
        </button>
      </div>

      {/* Grid - Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {filteredMaterials.map((material) => {
          const isLowStock = material.stock < LOW_STOCK_THRESHOLD;
          const isScrap = material.type === MaterialType.SCRAP;

          return (
            <div key={material.id} className={`bg-slate-800 rounded-2xl border p-4 md:p-6 transition-all group ${isLowStock ? 'border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]' : 'border-slate-700 hover:border-slate-600'}`}>
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className="flex items-center gap-2.5 md:gap-3">
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${isScrap ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {isScrap ? <Layers size={22} /> : <Package size={22} />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base md:text-lg">{material.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] md:text-xs font-mono bg-slate-900 px-1.5 md:px-2 py-0.5 rounded text-slate-400 border border-slate-700">{material.code}</span>
                      {isLowStock && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} /> SẮP HẾT
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Edit/Delete buttons */}
                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {onUpdateMaterial && (
                    <button
                      onClick={() => openEditMaterial(material)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Sửa vật liệu"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {onDeleteMaterial && (
                    <button
                      onClick={() => setMaterialDeleteConfirm(material.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Xóa vật liệu"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-6 my-4 md:my-6">
                <div>
                  <p className="text-slate-500 text-[10px] md:text-xs uppercase font-bold tracking-wider mb-1">Tồn kho</p>
                  <p className={`text-2xl md:text-3xl font-bold tracking-tight ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                    {material.stock.toLocaleString('vi-VN')}
                    <span className="text-sm md:text-lg font-normal text-slate-500 ml-1">{material.unit}</span>
                  </p>
                </div>
                <div className="text-right border-l border-slate-700 pl-3 md:pl-6 flex flex-col justify-end">
                  <p className="text-slate-500 text-[10px] md:text-xs mb-1">Giá trị ước tính</p>
                  <p className="text-sm md:text-lg font-bold text-primary-400">{formatCurrency(material.stock * material.pricePerKg)}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Đơn giá: {formatCurrency(material.pricePerKg)}/kg</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                {isScrap ? (
                  <button
                    onClick={() => setShowProduceModal(true)}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 active:scale-[0.98] cursor-pointer min-h-[44px]"
                  >
                    <Settings size={18} />
                    Sản Xuất (Xay Nhựa)
                  </button>
                ) : (
                  <div className="w-full py-3 flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 rounded-xl text-sm font-medium border border-emerald-500/20">
                    <CheckCircle2 size={16} />
                    Sẵn sàng xuất bán
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Import/Export History Section */}
      <div className="mt-6 md:mt-8 bg-slate-800/50 rounded-2xl border border-slate-700 p-4 md:p-6">
        <div className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <History size={18} className="text-primary-400" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-white">Lịch Sử Giao Dịch</h3>
        </div>

        {/* History Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setHistoryTab('IMPORT')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl font-medium text-xs md:text-sm transition-all min-h-[40px] cursor-pointer ${historyTab === 'IMPORT'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
          >
            <ArrowDownCircle size={16} />
            Lịch sử Nhập
          </button>
          <button
            onClick={() => setHistoryTab('EXPORT')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl font-medium text-xs md:text-sm transition-all min-h-[40px] cursor-pointer ${historyTab === 'EXPORT'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
          >
            <ArrowUpCircle size={16} />
            Lịch sử Xuất
          </button>
        </div>

        {/* History List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {transactions
            .filter(t => t.type === (historyTab === 'IMPORT' ? TransactionType.IMPORT : TransactionType.EXPORT))
            .slice(0, 20)
            .map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all ${historyTab === 'IMPORT'
                  ? 'bg-orange-500/5 border-orange-500/20'
                  : 'bg-blue-500/5 border-blue-500/20'
                  }`}
              >
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 ${historyTab === 'IMPORT' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                    }`}>
                    {historyTab === 'IMPORT' ? (
                      <ArrowDownCircle size={20} className="text-orange-400" />
                    ) : (
                      <ArrowUpCircle size={20} className="text-blue-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {transaction.partnerName || 'Không xác định'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={12} />
                      {new Date(transaction.date).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {transaction.createdBy && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Bởi: <span className="text-slate-400 font-medium">{transaction.createdBy}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-2">
                  <div className="text-right">
                    <p className={`font-bold text-sm ${historyTab === 'IMPORT' ? 'text-orange-400' : 'text-blue-400'}`}>
                      {historyTab === 'IMPORT' ? '+' : '-'}{transaction.weight?.toLocaleString('vi-VN')} kg
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(transaction.totalValue)}
                    </p>
                  </div>
                  {onDeleteTransaction && (
                    <button
                      onClick={() => setDeleteConfirm(transaction.id)}
                      className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                      title="Xóa giao dịch"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

          {transactions.filter(t => t.type === (historyTab === 'IMPORT' ? TransactionType.IMPORT : TransactionType.EXPORT)).length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <History size={32} className="mx-auto mb-2 opacity-50" />
              <p>Chưa có giao dịch {historyTab === 'IMPORT' ? 'nhập' : 'xuất'} nào</p>
            </div>
          )}
        </div>
      </div>

      {/* ━━ Add/Edit Material Modal ━━ */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingMaterial ? 'Cập Nhật Vật Liệu' : 'Thêm Vật Liệu Mới'}
              </h3>
              <button onClick={closeMaterialModal} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleMaterialSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1">Tên vật liệu</label>
                <input
                  type="text"
                  required
                  value={materialForm.name}
                  onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                  placeholder="VD: Nhựa Phế Liệu"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-1">Mã vật liệu</label>
                  <input
                    type="text"
                    required
                    value={materialForm.code}
                    onChange={e => setMaterialForm({ ...materialForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500 font-mono"
                    placeholder="VD: PHE-LIEU"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-1">Loại</label>
                  <select
                    value={materialForm.type}
                    onChange={e => setMaterialForm({ ...materialForm, type: e.target.value as MaterialType })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value={MaterialType.SCRAP}>Nhựa Phế</option>
                    <option value={MaterialType.POWDER}>Bột Nhựa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-1">Tồn kho ({materialForm.unit})</label>
                  <input
                    type="text"
                    required
                    value={materialForm.stock}
                    onChange={e => setMaterialForm({ ...materialForm, stock: handleFormatNumber(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500 font-bold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-1">Đơn vị</label>
                  <input
                    type="text"
                    required
                    value={materialForm.unit}
                    onChange={e => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500"
                    placeholder="kg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1">Đơn giá (VNĐ/{materialForm.unit})</label>
                <input
                  type="text"
                  required
                  value={materialForm.pricePerKg}
                  onChange={e => setMaterialForm({ ...materialForm, pricePerKg: handleFormatNumber(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary-500 font-bold"
                  placeholder="8.000"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all mt-4 cursor-pointer"
              >
                {editingMaterial ? 'Lưu Thay Đổi' : 'Thêm Vật Liệu'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Production Modal */}
      {showProduceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md shadow-2xl scale-100">
            <h3 className="text-xl font-bold text-white mb-2">Quy trình Xay Nhựa</h3>
            <p className="text-slate-400 text-sm mb-6">Chuyển đổi từ <span className="text-orange-400 font-bold">Phế Liệu</span> sang <span className="text-blue-400 font-bold">Bột Nhựa</span>.</p>

            <form onSubmit={handleProduceSubmit}>
              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">Khối lượng phế đưa vào (kg)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={produceAmount}
                    onChange={(e) => {
                      setProduceAmount(handleFormatNumber(e.target.value));
                    }}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 font-bold text-lg"
                    placeholder="0"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    Max: {scrapStock.toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              {produceAmount && (() => {
                const amount = Number(produceAmount.replace(/\./g, '').replace(',', '.'));
                return amount > 0;
              })() && (
                  <div className="mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">Hao hụt (5%):</span>
                      <span className="text-red-400 font-medium text-sm">{
                        (Number(produceAmount.replace(/\./g, '').replace(',', '.')) * 0.05).toFixed(1)
                      } kg</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                      <span className="text-white font-medium">Thu được bột:</span>
                      <span className="text-primary-400 font-bold text-xl flex items-center gap-2">
                        <ArrowRight size={18} className="text-slate-600" />
                        {(Number(produceAmount.replace(/\./g, '').replace(',', '.')) * 0.95).toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProduceModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={(() => {
                    const amount = Number(produceAmount.replace(/\./g, '').replace(',', '.'));
                    return !produceAmount || amount <= 0 || amount > scrapStock;
                  })()}
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Xác nhận xóa?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              Bạn có chắc muốn xóa giao dịch này? Hành động này sẽ hoàn tác tồn kho và quỹ tiền.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction?.(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Material Confirmation Modal */}
      {materialDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Xóa vật liệu?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              Bạn có chắc muốn xóa vật liệu này? Vật liệu đã có giao dịch sẽ không thể xóa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMaterialDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDeleteMaterial?.(materialDeleteConfirm);
                  setMaterialDeleteConfirm(null);
                }}
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

export default Inventory;