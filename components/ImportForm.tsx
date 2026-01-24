import React, { useState } from 'react';
import { Truck, Scale, DollarSign, Save, Recycle } from 'lucide-react';
import { Partner, PartnerType } from '../types';

interface ImportFormProps {
  onImport: (amount: number, price: number, supplier: string) => void;
  partners: Partner[];
}

const ImportForm: React.FC<ImportFormProps> = ({ onImport, partners }) => {
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
    if (!formData.weight || !formData.price || !formData.supplier) return;
    
    onImport(
      Number(formData.weight),
      Number(formData.price),
      formData.supplier
    );
    
    alert('Đã nhập kho thành công!');
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Nhập Kho Nhựa Phế</h2>
        <p className="text-slate-400 text-sm">Nhập liệu nhanh gọn, không cần hình ảnh</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Static Material Display */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center">
                 <Recycle size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Nhựa Phế Liệu</h3>
                <p className="text-slate-400 text-sm">Nguyên liệu đầu vào</p>
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Chọn hoặc nhập tên..."
                value={formData.supplier}
                onChange={e => setFormData({...formData, supplier: e.target.value})}
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
                type="number" 
                required
                min="0"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold"
                placeholder="0.00"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: e.target.value})}
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Đơn giá nhập (VNĐ/kg)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="number" 
                required
                min="0"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="8000"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

           {/* Total Calculation */}
           <div className="col-span-1 md:col-span-2 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center gap-2">
              <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Thành tiền</span>
              <span className="text-3xl font-bold text-primary-400">
                {formData.weight && formData.price 
                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(formData.weight) * Number(formData.price))
                  : '0 ₫'}
              </span>
           </div>

        </div>

        <div className="mt-8">
           <button type="submit" className="w-full py-4 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 text-lg">
             <Save size={24} />
             Lưu Phiếu Nhập
           </button>
        </div>
      </form>
    </div>
  );
};

export default ImportForm;