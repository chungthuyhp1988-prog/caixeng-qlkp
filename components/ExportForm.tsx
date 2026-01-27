import React, { useState } from 'react';
import { Factory, Scale, DollarSign, FileText, Send, Package } from 'lucide-react';
import { Material, MaterialType, Partner, PartnerType } from '../types';

interface ExportFormProps {
  materials: Material[];
  onExport: (amount: number, price: number, customer: string) => void;
  partners: Partner[];
}

const ExportForm: React.FC<ExportFormProps> = ({ materials, onExport, partners }) => {
  const powderMaterial = materials.find(m => m.type === MaterialType.POWDER);

  const [formData, setFormData] = useState({
    customer: '',
    weight: '',
    price: '',
    batchCode: 'BATCH-' + new Date().toISOString().slice(0, 10).replace(/-/g, '')
  });

  // Filter only customers
  const customers = partners.filter(p => p.type === PartnerType.CUSTOMER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse formatted numbers
    const parseNumber = (val: string) => {
      if (!val) return 0;
      return Number(val.replace(/\./g, '').replace(',', '.'));
    };

    const weight = parseNumber(formData.weight);
    const price = parseNumber(formData.price);
    const stock = powderMaterial?.stock || 0;

    if (weight > stock) {
      alert(`Lỗi: Tồn kho không đủ! Chỉ còn ${stock} kg.`);
      return;
    }

    if (!formData.customer || !price || !weight) return;

    onExport(weight, price, formData.customer);
    alert('Đã tạo phiếu xuất kho thành công!');
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9,.]/g, '');
    const parts = val.split(',');
    const integerPart = parts[0].replace(/\./g, '');
    const decimalPart = parts.length > 1 ? ',' + parts[1] : '';

    if (!isNaN(Number(integerPart))) {
      const formattedInt = Number(integerPart).toLocaleString('vi-VN');
      setFormData({ ...formData, weight: formattedInt + decimalPart });
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, price: val ? Number(val).toLocaleString('vi-VN') : '' });
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Xuất Bột Nhựa</h2>
        <p className="text-slate-400 text-sm">Xuất hàng bột nhựa thành phẩm cho nhà máy sản xuất tấm ốp</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Static Material Display */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-slate-400 text-sm font-medium mb-2">Loại thành phẩm</label>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent-500/20 text-accent-500 flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Bột Nhựa Thành Phẩm</h3>
                <p className="text-slate-400 text-sm">Tồn kho hiện tại: {powderMaterial?.stock.toLocaleString()} kg</p>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-slate-400 text-sm font-medium mb-2">Khách hàng / Nhà máy</label>
            <div className="relative">
              <Factory className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                list="customers-list"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                placeholder="Chọn hoặc nhập tên..."
                value={formData.customer}
                onChange={e => setFormData({ ...formData, customer: e.target.value })}
              />
              <datalist id="customers-list">
                {customers.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Batch Code - Auto generated */}
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Mã lô sản xuất</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                readOnly
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-400 cursor-not-allowed"
                value={formData.batchCode}
              />
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Khối lượng xuất (kg)</label>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                placeholder="0.00"
                value={formData.weight}
                onChange={handleWeightChange}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 text-right">Tối đa: {powderMaterial?.stock.toLocaleString()} kg</p>
          </div>

          {/* Price */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-slate-400 text-sm font-medium mb-2">Đơn giá bán (VNĐ/kg)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
                placeholder="22.000"
                value={formData.price}
                onChange={handlePriceChange}
              />
            </div>
          </div>

          {/* Total Calculation */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="block text-slate-400 text-sm mb-1">Thành tiền:</span>
              <span className="text-3xl font-bold text-white">
                {formData.weight && formData.price
                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    Number(formData.weight.replace(/\./g, '').replace(',', '.')) *
                    Number(formData.price.replace(/\./g, '').replace(',', '.'))
                  )
                  : '0 ₫'}
              </span>
            </div>
            <button type="submit" className="w-full md:w-auto py-3 px-8 bg-accent-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
              <Send size={20} />
              Xuất Kho Ngay
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default ExportForm;