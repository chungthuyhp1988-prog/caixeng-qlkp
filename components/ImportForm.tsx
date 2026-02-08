import React, { useState } from 'react';
import { Truck, Scale, DollarSign, Save, Recycle, FileText } from 'lucide-react';
import { Partner, PartnerType } from '../types';
import { useToast } from './Toast';

interface ImportFormProps {
  onImport: (amount: number, price: number, supplier: string) => void;
  partners: Partner[];
}

const ImportForm: React.FC<ImportFormProps> = ({ onImport, partners }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    supplier: '',
    weight: '',
    price: '',
    note: ''
  });

  // Filter only suppliers for suggestion
  const suppliers = partners.filter(p => p.type === PartnerType.SUPPLIER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse formatted numbers (remove dots, replace comma with dot for decimals)
    const parseNumber = (val: string) => {
      if (!val) return 0;
      return Number(val.replace(/\./g, '').replace(',', '.'));
    };

    const weight = parseNumber(formData.weight);
    const price = parseNumber(formData.price);

    if (!weight || !price || !formData.supplier) return;

    onImport(
      weight,
      price,
      formData.supplier
    );

    toast.success('Đã nhập kho thành công!');
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digit, dot, comma
    const val = e.target.value.replace(/[^0-9,.]/g, '');
    // Simple formatting for display? 
    // For now, let's just use raw input for decimals to avoid cursor issues, 
    // OR stick to the integer approach for thousands if user didn't type comma.
    // To strictly follow request "có dấu chấm phân cách hàng nghìn", we need to format.

    // Better implementation: split by comma
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">Nhập Kho Nhựa Phế</h2>
        <p className="text-slate-400 text-xs md:text-sm">Nhập liệu nhanh gọn, không cần hình ảnh</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 md:p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* Static Material Display */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-slate-900 p-3 md:p-4 rounded-xl border border-slate-700 flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center">
                <Recycle size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base md:text-lg">Nhựa Phế Liệu</h3>
                <p className="text-slate-400 text-xs md:text-sm">Nguyên liệu đầu vào</p>
              </div>
            </div>
          </div>

          {/* Supplier */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-slate-400 text-sm font-medium mb-2">Nhà cung cấp / Vựa</label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                list="suppliers-list"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[44px]"
                placeholder="Chọn hoặc nhập tên..."
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              />
              <datalist id="suppliers-list">
                {suppliers.map(s => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Khối lượng (kg)</label>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold"
                placeholder="0.00"
                value={formData.weight}
                onChange={handleWeightChange}
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Đơn giá nhập (VNĐ/kg)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="8.000"
                value={formData.price}
                onChange={handlePriceChange}
              />
            </div>
          </div>

          {/* Total Calculation */}
          <div className="col-span-1 md:col-span-2 bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center gap-1">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Thành tiền</span>
            <span className="text-2xl md:text-3xl font-bold text-primary-400">
              {formData.weight && formData.price
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  Number(formData.weight.replace(/\./g, '').replace(',', '.')) *
                  Number(formData.price.replace(/\./g, '').replace(',', '.'))
                )
                : '0 ₫'}
            </span>
          </div>

        </div>

        <div className="mt-6 md:mt-8">
          <button type="submit" className="w-full py-3.5 md:py-4 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 text-base md:text-lg min-h-[48px] cursor-pointer active:scale-[0.98]">
            <Save size={20} />
            Lưu Phiếu Nhập
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImportForm;