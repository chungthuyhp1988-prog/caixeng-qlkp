import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Package, Truck, AlertCircle, Factory, Wallet, RefreshCw, FileDown } from 'lucide-react';
import { formatCurrency } from '../constants';
import { Transaction, TransactionType, Material, MaterialType } from '../types';
import { useToast } from './Toast';

interface DashboardProps {
  materials: Material[];
  transactions: Transaction[];
}

// Desktop StatCard — full size
const StatCard = ({ title, value, subtext, icon, trend, alert }: any) => (
  <div className={`bg-slate-800 p-6 rounded-2xl border transition-all ${alert ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 hover:border-slate-600'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${alert ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-primary-400'}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      {trend !== undefined && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend > 0 ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-0.5">{title}</h3>
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    <p className={`text-xs mt-2 ${alert ? 'text-red-400 font-medium' : 'text-slate-500'}`}>{subtext}</p>
  </div>
);

// Mobile mini stat — compact inline
const MiniStat = ({ label, value, icon, color, alert }: { label: string; value: string; icon: React.ReactElement<any>; color: string; alert?: boolean }) => (
  <div className={`flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2.5 border ${alert ? 'border-red-500/40' : 'border-slate-700'}`}>
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      {React.cloneElement(icon, { size: 14 })}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400 leading-tight">{label}</p>
      <p className="text-sm font-bold text-white leading-tight truncate">{value}</p>
    </div>
  </div>
);

const RecentTransactionItem: React.FC<{ transaction: Transaction; compact?: boolean }> = ({ transaction, compact }) => {
  const isRevenue = transaction.type === TransactionType.EXPORT;

  let Icon = Wallet;
  if (transaction.type === TransactionType.IMPORT) Icon = Truck;
  else if (transaction.type === TransactionType.EXPORT) Icon = Factory;

  return (
    <div className={`flex items-center justify-between ${compact ? 'p-3' : 'p-4'} bg-slate-800/50 rounded-xl border border-slate-700/50 mb-2 hover:bg-slate-800 transition-colors`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center shrink-0 ${isRevenue ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          <Icon size={compact ? 14 : 18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-white truncate`}>
            {transaction.materialName || transaction.note || 'Giao dịch khác'}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{transaction.partnerName} • {new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <p className={`${compact ? 'text-xs' : 'text-sm'} font-bold ${isRevenue ? 'text-green-400' : 'text-red-400'}`}>
          {isRevenue ? '+' : '-'}{formatCurrency(transaction.totalValue)}
        </p>
        {transaction.weight ? (
          <p className="text-[11px] text-slate-500">{transaction.weight.toLocaleString()} kg</p>
        ) : (
          <p className="text-[11px] text-slate-500 italic">Chi phí</p>
        )}
      </div>
    </div>
  );
};

// Custom tooltip for the bar chart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 shadow-2xl">
      <p className="text-white font-semibold text-xs mb-1.5">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400 text-[11px]">{entry.name}:</span>
          <span className="text-white text-[11px] font-bold">
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
  const { toast } = useToast();
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Tổng Quan Kho</h2>
          <p className="text-slate-400 text-xs md:text-sm">Cập nhật tình hình sản xuất hôm nay</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toast.info('Dữ liệu đã cập nhật')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-colors border border-slate-700 min-h-[40px] cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            <span className="hidden md:inline">Làm mới</span>
          </button>
          <button
            onClick={() => toast.info('Tính năng xuất báo cáo đang phát triển')}
            className="bg-primary-600 hover:bg-primary-500 text-white p-2.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-colors shadow-lg shadow-primary-600/20 min-h-[40px] cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <FileDown size={16} />
            <span className="hidden md:inline">Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Stats — Mobile: compact 3-col strip */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <MiniStat
          label="Tồn Phế"
          value={`${(scrapStock / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} T`}
          icon={lowScrapAlert ? <AlertCircle /> : <Truck />}
          color={lowScrapAlert ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-blue-400'}
          alert={lowScrapAlert}
        />
        <MiniStat
          label="Tồn Bột"
          value={`${(powderStock / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} T`}
          icon={<Package />}
          color="bg-slate-700/50 text-emerald-400"
        />
        <MiniStat
          label="Doanh Thu"
          value={totalRevenue >= 1000000000
            ? `${(totalRevenue / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`
            : `${(totalRevenue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} tr`
          }
          icon={<TrendingUp />}
          color="bg-slate-700/50 text-primary-400"
        />
      </div>

      {/* Stats — Desktop: full cards */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        <StatCard
          title="Tồn Nhựa Phế"
          value={`${(scrapStock / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} T`}
          subtext={lowScrapAlert ? "Cần nhập thêm!" : "Ổn định"}
          icon={lowScrapAlert ? <AlertCircle size={24} /> : <Truck size={24} />}
          alert={lowScrapAlert}
        />
        <StatCard
          title="Tồn Bột Nhựa"
          value={`${(powderStock / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} T`}
          subtext={highStockAlert ? "Kho sắp đầy" : "Sẵn sàng"}
          icon={<Package size={24} />}
        />
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(totalRevenue)}
          subtext="Doanh thu tích lũy"
          icon={<TrendingUp size={24} />}
          trend={12.5}
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-700">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-sm md:text-lg font-semibold text-white">Nhập / Xuất theo tháng</h3>
            <div className="flex gap-3 text-[10px] md:text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-blue-500"></span>
                <span className="text-slate-400">Nhập</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-emerald-500"></span>
                <span className="text-slate-400">Xuất</span>
              </div>
            </div>
          </div>
          <div className="h-48 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barGap={2} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}T` : `${value}`}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                <Bar dataKey="input" name="Nhập (Phế)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="output" name="Xuất (Bột)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-700 flex flex-col max-h-[360px] md:max-h-none md:h-auto">
          <div className="flex justify-between items-center mb-3 md:mb-6 shrink-0">
            <h3 className="text-sm md:text-lg font-semibold text-white">Giao Dịch Gần Đây</h3>
          </div>
          <div className="overflow-y-auto pr-1 custom-scrollbar flex-1">
            {transactions.length > 0 ? (
              transactions.slice(0, 20).map((t) => (
                <RecentTransactionItem key={t.id} transaction={t} compact />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <Package size={40} className="mb-2" strokeWidth={1} />
                <p className="text-xs">Chưa có giao dịch nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;