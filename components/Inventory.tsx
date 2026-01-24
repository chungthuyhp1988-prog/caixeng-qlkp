import React, { useState } from 'react';
import { Search, Settings, Package, Layers, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../constants';
import { MaterialType, Material } from '../types';

interface InventoryProps {
  materials: Material[];
  onProduce: (scrapAmount: number) => void;
}

const Inventory: React.FC<InventoryProps> = ({ materials, onProduce }) => {
  const [filter, setFilter] = useState<'ALL' | MaterialType>('ALL');
  const [search, setSearch] = useState('');
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [produceAmount, setProduceAmount] = useState('');

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
    const amount = Number(produceAmount);
    if (amount > 0 && amount <= scrapStock) {
      onProduce(amount);
      setShowProduceModal(false);
      setProduceAmount('');
      // In a real app, use a toast notification here instead of alert
      // alert(`Đã đưa ${amount}kg phế vào xay.`); 
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Kho Hàng</h2>
          <p className="text-slate-400 text-sm">Quản lý tồn kho hiện tại</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm mã hoặc tên..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-primary-500 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${filter === 'ALL' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Tất cả
        </button>
        <button 
          onClick={() => setFilter(MaterialType.SCRAP)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${filter === MaterialType.SCRAP ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Nhựa Phế
        </button>
        <button 
          onClick={() => setFilter(MaterialType.POWDER)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${filter === MaterialType.POWDER ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Bột Nhựa
        </button>
      </div>

      {/* Grid - Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaterials.map((material) => {
          const isLowStock = material.stock < LOW_STOCK_THRESHOLD;
          const isScrap = material.type === MaterialType.SCRAP;

          return (
            <div key={material.id} className={`bg-slate-800 rounded-2xl border p-6 transition-all ${isLowStock ? 'border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]' : 'border-slate-700 hover:border-slate-600'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isScrap ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {isScrap ? <Layers size={28} /> : <Package size={28} />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{material.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{material.code}</span>
                      {isLowStock && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} /> SẮP HẾT
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
                
              <div className="grid grid-cols-2 gap-6 my-6">
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Tồn kho</p>
                  <p className={`text-3xl font-bold tracking-tight ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                    {material.stock.toLocaleString('vi-VN')} 
                    <span className="text-lg font-normal text-slate-500 ml-1">{material.unit}</span>
                  </p>
                </div>
                <div className="text-right border-l border-slate-700 pl-6 flex flex-col justify-end">
                  <p className="text-slate-500 text-xs mb-1">Giá trị ước tính</p>
                  <p className="text-lg font-bold text-primary-400">{formatCurrency(material.stock * material.pricePerKg)}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Đơn giá: {formatCurrency(material.pricePerKg)}/kg</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                  {isScrap ? (
                    <button 
                    onClick={() => setShowProduceModal(true)}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:scale-[1.02] active:scale-[0.98]"
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
                    type="number" 
                    required
                    min="1"
                    max={scrapStock}
                    value={produceAmount}
                    onChange={(e) => setProduceAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 font-bold text-lg"
                    placeholder="0"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    Max: {scrapStock}
                  </div>
                </div>
              </div>

              {produceAmount && Number(produceAmount) > 0 && (
                <div className="mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Hao hụt (5%):</span>
                    <span className="text-red-400 font-medium text-sm">{(Number(produceAmount) * 0.05).toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                    <span className="text-white font-medium">Thu được bột:</span>
                    <span className="text-primary-400 font-bold text-xl flex items-center gap-2">
                      <ArrowRight size={18} className="text-slate-600"/>
                      {(Number(produceAmount) * 0.95).toFixed(1)} kg
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
                  disabled={!produceAmount || Number(produceAmount) <= 0 || Number(produceAmount) > scrapStock}
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;