import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Package, Truck, AlertCircle, Factory, Wallet } from 'lucide-react';
import { formatCurrency } from '../constants';
import { Transaction, TransactionType, Material, MaterialType } from '../types';

interface DashboardProps {
  materials: Material[];
  transactions: Transaction[];
}

const StatCard = ({ title, value, subtext, icon, trend, alert }: any) => (
  <div className={`bg-slate-800 p-6 rounded-2xl border transition-all ${alert ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 hover:border-slate-600'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${alert ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-primary-400'}`}>
        {icon}
      </div>
      {trend !== undefined && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    <p className={`text-xs mt-2 ${alert ? 'text-red-400 font-medium' : 'text-slate-500'}`}>{subtext}</p>
  </div>
);

const RecentTransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isRevenue = transaction.type === TransactionType.EXPORT;
  // Import and Expense are money out
  const isExpense = transaction.type === TransactionType.IMPORT || transaction.type === TransactionType.EXPENSE;
  
  let Icon = Wallet;
  if (transaction.type === TransactionType.IMPORT) Icon = Truck;
  else if (transaction.type === TransactionType.EXPORT) Icon = Factory;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-3 hover:bg-slate-800 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isRevenue ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {transaction.materialName || transaction.note || 'Giao dịch khác'}
          </p>
          <p className="text-xs text-slate-400">{transaction.partnerName} • {new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isRevenue ? 'text-green-400' : 'text-red-400'}`}>
          {isRevenue ? '+' : '-'}{formatCurrency(transaction.totalValue)}
        </p>
        {transaction.weight ? (
          <p className="text-xs text-slate-500">{transaction.weight.toLocaleString()} kg</p>
        ) : (
          <p className="text-xs text-slate-500 italic">Chi phí</p>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ materials, transactions }) => {
  // 1. Calculate Stocks
  const scrapStock = materials.find(m => m.type === MaterialType.SCRAP)?.stock || 0;
  const powderStock = materials.find(m => m.type === MaterialType.POWDER)?.stock || 0;
  
  // 2. Calculate Financials
  const totalRevenue = transactions
    .filter(t => t.type === TransactionType.EXPORT)
    .reduce((sum, t) => sum + t.totalValue, 0);

  // 3. Process Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }); // dd/mm
      
      // Filter transactions for this specific day
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getDate() === date.getDate() && 
               tDate.getMonth() === date.getMonth() && 
               tDate.getFullYear() === date.getFullYear();
      });

      const inputWeight = dayTransactions
        .filter(t => t.type === TransactionType.IMPORT)
        .reduce((sum, t) => sum + (t.weight || 0), 0);
        
      const outputWeight = dayTransactions
        .filter(t => t.type === TransactionType.EXPORT)
        .reduce((sum, t) => sum + (t.weight || 0), 0);

      data.push({
        name: dateStr,
        input: inputWeight,
        output: outputWeight
      });
    }
    return data;
  }, [transactions]);

  // Alert Thresholds
  const lowScrapAlert = scrapStock < 1000; // Warning if under 1 ton
  const highStockAlert = powderStock > 20000; // Warning if too much inventory

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Tổng Quan Kho</h2>
          <p className="text-slate-400 text-sm">Cập nhật tình hình sản xuất hôm nay</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-700">
              Làm mới
            </button>
            <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-primary-600/20">
              Xuất Báo Cáo
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Tồn Kho Nhựa Phế" 
          value={`${(scrapStock / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Tấn`}
          subtext={lowScrapAlert ? "Cần nhập thêm hàng gấp!" : "Nguyên liệu ổn định"}
          icon={lowScrapAlert ? <AlertCircle size={24} /> : <Truck size={24} />}
          alert={lowScrapAlert}
        />
        <StatCard 
          title="Tồn Kho Bột Nhựa" 
          value={`${(powderStock / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Tấn`}
          subtext={highStockAlert ? "Kho sắp đầy, cần đẩy hàng đi" : "Sẵn sàng xuất kho"}
          icon={<Package size={24} />}
        />
        <StatCard 
          title="Tổng Doanh Thu" 
          value={formatCurrency(totalRevenue)}
          subtext="Doanh thu tích lũy tháng này"
          icon={<TrendingUp size={24} />}
          trend={12.5}
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-white">Biểu Đồ Nhập/Xuất (7 ngày qua)</h3>
             <div className="flex gap-4 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-slate-400">Nhập (kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-slate-400">Xuất (kg)</span>
                </div>
             </div>
          </div>
          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}T`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}
                  formatter={(value: number) => [`${value.toLocaleString()} kg`, '']}
                />
                <Area type="monotone" dataKey="input" name="Nhập (Phế)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorInput)" />
                <Area type="monotone" dataKey="output" name="Xuất (Bột)" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorOutput)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col h-[420px] lg:h-auto">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-lg font-semibold text-white">Giao Dịch Gần Đây</h3>
          </div>
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
            {transactions.length > 0 ? (
              transactions.slice(0, 20).map((t) => (
                <RecentTransactionItem key={t.id} transaction={t} />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                 <Package size={48} className="mb-2" strokeWidth={1} />
                 <p className="text-sm">Chưa có giao dịch nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;