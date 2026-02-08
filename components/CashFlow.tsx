import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, Calendar, Search, Wrench, Users, Box, PlusCircle, X, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '../constants';
import { Transaction, TransactionType, ExpenseCategory } from '../types';

interface CashFlowProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onUpdateExpense?: (id: string, updates: any) => void;
}

const CashFlow: React.FC<CashFlowProps> = ({ transactions, onAddTransaction, onDeleteTransaction, onUpdateExpense }) => {
  const [activeTab, setActiveTab] = useState<'REVENUE' | 'EXPENSE'>('REVENUE');
  const [expenseFilter, setExpenseFilter] = useState<'ALL' | ExpenseCategory>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.LABOR);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Calculations
  const totalRevenue = transactions
    .filter(t => t.type === TransactionType.EXPORT)
    .reduce((sum, t) => sum + t.totalValue, 0);

  const totalExpense = transactions
    .filter(t => t.type === TransactionType.IMPORT || t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.totalValue, 0);

  const netProfit = totalRevenue - totalExpense;

  // Filtering Logic
  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'REVENUE') {
      return t.type === TransactionType.EXPORT;
    } else {
      // Logic cho Tab CHI
      const isExpense = t.type === TransactionType.IMPORT || t.type === TransactionType.EXPENSE;
      if (!isExpense) return false;

      if (expenseFilter === 'ALL') return true;
      return t.category === expenseFilter;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;

    // Clean formatting (remove dots) before converting to number
    const numericAmount = Number(amount.replace(/\./g, '').replace(/,/g, ''));

    if (editingTransaction) {
      onUpdateExpense?.(editingTransaction.id, {
        totalValue: numericAmount,
        category: category,
        note: note,
        transaction_date: new Date(date).toISOString()
      });
      setEditingTransaction(null);
    } else {
      const newTransaction: Transaction = {
        id: `t-${Date.now()}`,
        date: new Date(date).toISOString(),
        type: TransactionType.EXPENSE,
        category: category,
        partnerName: 'Chi phí vận hành',
        totalValue: numericAmount,
        note: note
      };
      onAddTransaction(newTransaction);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setCategory(ExpenseCategory.LABOR);
    setDate(new Date().toISOString().slice(0, 10));
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.totalValue.toLocaleString('vi-VN'));
    setCategory(transaction.category || ExpenseCategory.LABOR);
    setNote(transaction.note || '');
    setDate(new Date(transaction.date).toISOString().slice(0, 10));
    // For revenue (export) edits, we also store partnerName
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const getCategoryIcon = (category?: ExpenseCategory) => {
    switch (category) {
      case ExpenseCategory.MATERIAL: return <Box size={18} />;
      case ExpenseCategory.LABOR: return <Users size={18} />;
      case ExpenseCategory.MACHINERY: return <Wrench size={18} />;
      default: return <Wallet size={18} />;
    }
  };

  const getCategoryLabel = (category?: ExpenseCategory) => {
    switch (category) {
      case ExpenseCategory.MATERIAL: return 'Nguyên Vật Liệu';
      case ExpenseCategory.LABOR: return 'Lương Nhân Công';
      case ExpenseCategory.MACHINERY: return 'Máy Móc & Bảo Trì';
      default: return 'Chi Khác';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 relative">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Sổ Thu Chi</h2>
            <p className="text-slate-400 text-xs md:text-sm">Quản lý dòng tiền chi tiết</p>
          </div>
          {activeTab === 'EXPENSE' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-lg shadow-red-900/20 min-h-[40px] cursor-pointer active:scale-95"
            >
              <PlusCircle size={16} /> Tạo khoản chi
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <div className="bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] md:text-xs mb-0.5 font-medium">Tổng Thu</p>
            <p className="text-base md:text-xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-400">
            <ArrowDownRight size={20} />
          </div>
        </div>

        <div className="bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] md:text-xs mb-0.5 font-medium">Tổng Chi</p>
            <p className="text-base md:text-xl font-bold text-red-400">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-400">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] md:text-xs mb-0.5 font-medium">Lợi Nhuận</p>
            <p className={`text-base md:text-xl font-bold ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatCurrency(netProfit)}
            </p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
            <Wallet size={20} />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
        <button
          onClick={() => setActiveTab('REVENUE')}
          className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer min-h-[40px] ${activeTab === 'REVENUE' ? 'bg-green-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Doanh Thu (Thu)
        </button>
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer min-h-[40px] ${activeTab === 'EXPENSE' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Chi Phí (Chi)
        </button>
      </div>

      {/* Expense Filters (Chips) - Only show in Expense Tab */}
      {activeTab === 'EXPENSE' && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setExpenseFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border min-h-[36px] cursor-pointer ${expenseFilter === 'ALL' ? 'bg-slate-700 border-slate-500 text-white' : 'bg-transparent border-slate-700 text-slate-400'}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setExpenseFilter(ExpenseCategory.MATERIAL)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${expenseFilter === ExpenseCategory.MATERIAL ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-transparent border-slate-700 text-slate-400'}`}
          >
            Nguyên Vật Liệu
          </button>
          <button
            onClick={() => setExpenseFilter(ExpenseCategory.LABOR)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${expenseFilter === ExpenseCategory.LABOR ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-transparent border-slate-700 text-slate-400'}`}
          >
            Nhân Công
          </button>
          <button
            onClick={() => setExpenseFilter(ExpenseCategory.MACHINERY)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${expenseFilter === ExpenseCategory.MACHINERY ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-transparent border-slate-700 text-slate-400'}`}
          >
            Máy Móc
          </button>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
        <div className="divide-y divide-slate-700">
          {filteredTransactions.length > 0 ? filteredTransactions.map((t) => {
            const isRevenue = t.type === TransactionType.EXPORT;
            // Determine color based on type
            let iconColorClass = isRevenue ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400';
            // If manual expense, use category colors
            if (!isRevenue) {
              if (t.category === ExpenseCategory.LABOR) iconColorClass = 'bg-blue-500/10 text-blue-400';
              if (t.category === ExpenseCategory.MACHINERY) iconColorClass = 'bg-purple-500/10 text-purple-400';
              if (t.category === ExpenseCategory.MATERIAL) iconColorClass = 'bg-orange-500/10 text-orange-400';
            }

            return (
              <div key={t.id} className="p-3 md:p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">

                {/* Left Side: Icon & Details */}
                <div className="flex items-center gap-2.5 md:gap-3 overflow-hidden">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${iconColorClass}`}>
                    {isRevenue ? <ArrowDownRight size={18} /> : getCategoryIcon(t.category)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm truncate pr-2">
                      {isRevenue ? 'Xuất Bán Bột' : (t.note || getCategoryLabel(t.category))}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {t.partnerName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {!isRevenue && t.category && (
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/50">
                          {getCategoryLabel(t.category)}
                        </span>
                      )}
                      <span className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(t.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {t.createdBy && (
                      <p className="text-[10px] text-slate-500 mt-0.5 ml-0.5">
                        Bởi: <span className="font-medium text-slate-400">{t.createdBy}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Amount & Actions */}
                <div className="flex items-center gap-3">
                  <div className="text-right shrink-0 ml-2">
                    <span className={`block text-sm md:text-base font-bold ${isRevenue ? 'text-green-400' : 'text-red-400'}`}>
                      {isRevenue ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(t.totalValue)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">VND</span>
                  </div>

                  {/* Edit/Delete actions for ALL transactions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-2 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                      title="Sửa"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(t.id)}
                      className="p-2 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              Không có giao dịch nào trong mục này.
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md shadow-2xl animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingTransaction
                  ? (editingTransaction.type === TransactionType.EXPORT ? 'Cập Nhật Doanh Thu' : 'Cập Nhật Khoản Chi')
                  : 'Tạo Khoản Chi Mới'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Loại chi phí</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory(ExpenseCategory.LABOR)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${category === ExpenseCategory.LABOR ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-slate-700 text-slate-400 bg-slate-900'}`}
                  >
                    <Users size={20} />
                    <span className="text-xs font-bold">Nhân công</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory(ExpenseCategory.MACHINERY)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${category === ExpenseCategory.MACHINERY ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'border-slate-700 text-slate-400 bg-slate-900'}`}
                  >
                    <Wrench size={20} />
                    <span className="text-xs font-bold">Máy móc</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory(ExpenseCategory.OTHER)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${category === ExpenseCategory.OTHER ? 'bg-slate-500/20 border-slate-500 text-slate-300' : 'border-slate-700 text-slate-400 bg-slate-900'}`}
                  >
                    <Wallet size={20} />
                    <span className="text-xs font-bold">Khác</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1">Số tiền (VNĐ) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={amount}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setAmount(val ? Number(val).toLocaleString('vi-VN') : '');
                  }}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 font-bold text-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1">Ngày chi</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-1">Ghi chú / Diễn giải</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-red-500"
                  placeholder="Ví dụ: Trả lương tuần 1, Sửa motor..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all min-h-[48px] cursor-pointer active:scale-[0.98]"
                >
                  Lưu Khoản Chi
                </button>
              </div>
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
            <h3 className="text-xl font-bold text-white text-center mb-2">Xác nhận xóa?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              Bạn có chắc muốn xóa khoản chi này? Thao tác không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                title="Hủy thao tác"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction?.(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors"
                title="Xóa khoản chi"
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

export default CashFlow;