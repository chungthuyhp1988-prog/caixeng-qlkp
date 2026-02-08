import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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

// Custom tooltip for the bar chart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-white font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400 text-xs">{entry.name}:</span>
          <span className="text-white text-xs font-bold">
            {entry.value >= 1000
              ? `${(entry.value / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tấn`
              : `${entry.value.toLocaleString('vi-VN')} kg`}
          </span>
        </div>
      ))}
    </div>
  );
};

const MONTH_NAMES = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];

const Dashboard: React.FC<DashboardProps> = ({ materials, transactions }) => {
  // 1. Calculate Stocks
  const scrapStock = materials.find(m => m.type === MaterialType.SCRAP)?.stock || 0;
  const powderStock = materials.find(m => m.type === MaterialType.POWDER)?.stock || 0;

  // 2. Calculate Financials
  const totalRevenue = transactions
    .filter(t => t.type === TransactionType.EXPORT)
    .reduce((sum, t) => sum + t.totalValue, 0);

  // 3. Process Chart Data — Last 6 Months (grouped by month)
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const m = month.getMonth();
      const y = month.getFullYear();

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === m && tDate.getFullYear() === y;
      });

      const inputWeight = monthTransactions
        .filter(t => t.type === TransactionType.IMPORT)
        .reduce((sum, t) => sum + (t.weight || 0), 0);

      const outputWeight = monthTransactions
        .filter(t => t.type === TransactionType.EXPORT)
        .reduce((sum, t) => sum + (t.weight || 0), 0);

      data.push({
        name: `${MONTH_NAMES[m]}/${y}`,
        shortName: MONTH_NAMES[m],
        input: inputWeight,
        output: outputWeight,
      });
    }
    return data;
  }, [transactions]);

  // Alert Thresholds
  const lowScrapAlert = scrapStock < 1000;
  const highStockAlert = powderStock > 20000;

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
            <h3 className="text-lg font-semibold text-white">Nhập / Xuất theo tháng</h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                <span className="text-slate-400">Nhập (kg)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                <span className="text-slate-400">Xuất (kg)</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={4} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}T` : `${value}`}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                <Bar dataKey="input" name="Nhập (Phế)" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="output" name="Xuất (Bột)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
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