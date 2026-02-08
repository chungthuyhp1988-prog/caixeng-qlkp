import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ImportForm from './components/ImportForm';
import ExportForm from './components/ExportForm';
import CashFlow from './components/CashFlow';
import Partners from './components/Partners';
import Personnel from './components/Personnel';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { Material, Transaction, Partner } from './types';
import { materialsAPI, partnersAPI, transactionsAPI } from './lib/api';

const MainApp: React.FC = () => {
  const { user, logout, loading: authLoading, profile } = useAuth();
  const { toast, confirm } = useToast();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Application State
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Supabase on mount
  useEffect(() => {
    let mounted = true;
    const IS_DEV = false; // Set true to enable verbose logging

    async function loadData() {
      // Wait for auth check to complete first
      if (authLoading) return;

      // Don't load if not logged in
      if (!user) {
        setLoading(false);
        return;
      }

      IS_DEV && console.log('Starting loadData...', { user: user.email });

      // Failsafe timeout - reduced to 12s to show diagnostics faster
      const timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.error("Global timeout loading data reached (12s)");
          setError('Kết nối quá hạn (12s). Vui lòng kiểm tra mạng.');
          setLoading(false);
        }
      }, 12000);

      if (mounted) setLoading(true);

      // Track failures
      const failures: string[] = [];
      let successCount = 0;

      // 1. Test Connection First
      try {
        /* 
           Bỏ qua testConnection riêng lẻ để tiết kiệm 1 request round-trip,
           nhưng nếu materials load fail ngay lập tức thì ta biết connection toi.
        */
      } catch (e) {
        // Ignore
      }

      // 2. Load Materials
      if (mounted) {
        try {
          IS_DEV && console.log("Fetching materials...");
          const data = await materialsAPI.getAll();
          IS_DEV && console.log("Fetched materials:", data.length);
          if (mounted) {
            setMaterials(data);
            successCount++;
          }
        } catch (e) {
          console.error("Failed to load materials", e);
          failures.push('nguyên liệu');
        }
      }

      // 3. Load Partners
      if (mounted) {
        try {
          IS_DEV && console.log("Fetching partners...");
          const data = await partnersAPI.getAll();
          IS_DEV && console.log("Fetched partners:", data.length);
          if (mounted) {
            setPartners(data);
            successCount++;
          }
        } catch (e) {
          console.error("Failed to load partners", e);
          failures.push('đối tác');
        }
      }

      // 4. Load Transactions
      if (mounted) {
        try {
          IS_DEV && console.log("Fetching transactions...");
          const data = await transactionsAPI.getAll();
          IS_DEV && console.log("Fetched transactions:", data.length);
          if (mounted) {
            setTransactions(data);
            successCount++;
          }
        } catch (e) {
          console.error("Failed to load transactions", e);
          failures.push('giao dịch');
        }
      }

      if (mounted) {
        clearTimeout(timeoutId);
        setLoading(false);

        // Show error logic
        if (failures.length > 0) {
          if (successCount === 0) {
            // All failed
            setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra cấu hình mạng hoặc biến môi trường.');
          } else {
            // Partial failure
            setError(`Cảnh báo: Không thể tải ${failures.join(', ')}.`);
          }
        } else {
          setError(null);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ━━ Material Handlers ━━
  const handleAddMaterial = async (material: Omit<Material, 'id'>) => {
    try {
      const created = await materialsAPI.create(material);
      setMaterials(prev => [...prev, created]);
    } catch (err) {
      console.error('Error adding material:', err);
      toast.error('Không thể thêm vật liệu. Vui lòng thử lại.');
    }
  };

  const handleUpdateMaterial = async (id: string, updates: Partial<Material>) => {
    try {
      await materialsAPI.update(id, updates);
      setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    } catch (err) {
      console.error('Error updating material:', err);
      toast.error('Không thể cập nhật vật liệu. Vui lòng thử lại.');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await materialsAPI.delete(id);
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      console.error('Error deleting material:', err);
      toast.error(err?.message || 'Không thể xóa vật liệu. Vui lòng thử lại.');
    }
  };

  // ━━ Partner Handlers ━━
  const handleAddPartner = async (newPartner: Omit<Partner, 'id' | 'totalVolume' | 'totalValue'>) => {
    try {
      const created = await partnersAPI.create(newPartner);
      setPartners(prev => [created, ...prev]);
    } catch (err) {
      console.error('Error adding partner:', err);
      toast.error('Không thể thêm đối tác. Vui lòng thử lại.');
    }
  };

  const handleUpdatePartner = async (id: string, updates: Partial<Partner>) => {
    try {
      await partnersAPI.update(id, updates);
      setPartners(prev => prev.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ));
    } catch (err) {
      console.error('Error updating partner:', err);
      toast.error('Không thể cập nhật đối tác. Vui lòng thử lại.');
    }
  };

  const handleDeletePartner = async (id: string) => {
    try {
      await partnersAPI.delete(id);
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting partner:', err);
      toast.error('Không thể xóa đối tác. Vui lòng thử lại.');
    }
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleImport = async (amount: number, price: number, supplier: string) => {
    try {
      await transactionsAPI.createImport({
        materialCode: 'PHE-LIEU',
        partnerName: supplier,
        weight: amount,
        pricePerKg: price
      });

      const [materialsData, partnersData, transactionsData] = await Promise.all([
        materialsAPI.getAll(),
        partnersAPI.getAll(),
        transactionsAPI.getAll()
      ]);
      setMaterials(materialsData);
      setPartners(partnersData);
      setTransactions(transactionsData);

      setCurrentView('inventory');
    } catch (err) {
      console.error('Error importing:', err);
      toast.error('Không thể thực hiện nhập kho. Vui lòng thử lại.');
    }
  };

  const handleExport = async (amount: number, price: number, customer: string) => {
    try {
      await transactionsAPI.createExport({
        materialCode: 'BOT-NHUA',
        partnerName: customer,
        weight: amount,
        pricePerKg: price
      });

      const [materialsData, partnersData, transactionsData] = await Promise.all([
        materialsAPI.getAll(),
        partnersAPI.getAll(),
        transactionsAPI.getAll()
      ]);
      setMaterials(materialsData);
      setPartners(partnersData);
      setTransactions(transactionsData);

      setCurrentView('inventory');
    } catch (err) {
      console.error('Error exporting:', err);
      toast.error('Không thể thực hiện xuất kho. Vui lòng thử lại.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionsAPI.delete(id);

      const [materialsData, partnersData, transactionsData] = await Promise.all([
        materialsAPI.getAll(),
        partnersAPI.getAll(),
        transactionsAPI.getAll()
      ]);
      setMaterials(materialsData);
      setPartners(partnersData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast.error('Không thể xóa giao dịch. Vui lòng thử lại.');
    }
  };

  const handleUpdateExpense = async (id: string, updates: any) => {
    try {
      await transactionsAPI.updateExpense(id, updates);

      const [transactionsData] = await Promise.all([
        transactionsAPI.getAll()
      ]);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error updating expense:', err);
      toast.error('Không thể cập nhật chi phí. Vui lòng thử lại.');
    }
  };

  const handleProduce = async (scrapAmount: number) => {
    try {
      await transactionsAPI.createProduction(scrapAmount);

      const materialsData = await materialsAPI.getAll();
      setMaterials(materialsData);
    } catch (err) {
      console.error('Error producing:', err);
      toast.error('Không thể thực hiện sản xuất. Vui lòng thử lại.');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard materials={materials} transactions={transactions} />;
      case 'inventory':
        return <Inventory materials={materials} transactions={transactions} onProduce={handleProduce} onDeleteTransaction={handleDeleteTransaction} onAddMaterial={handleAddMaterial} onUpdateMaterial={handleUpdateMaterial} onDeleteMaterial={handleDeleteMaterial} />;
      case 'partners':
        return <Partners partners={partners} onAddPartner={handleAddPartner} onUpdatePartner={handleUpdatePartner} onDeletePartner={handleDeletePartner} />;
      case 'import':
        return <ImportForm onImport={handleImport} partners={partners} />;
      case 'export':
        return <ExportForm materials={materials} onExport={handleExport} partners={partners} />;
      case 'finance':
        return <CashFlow transactions={transactions} onAddTransaction={handleAddTransaction} onDeleteTransaction={handleDeleteTransaction} onUpdateExpense={handleUpdateExpense} />;
      case 'personnel':
        return <Personnel />;
      default:
        return <Dashboard materials={materials} transactions={transactions} />;
    }
  };

  // Auth Loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Require Login
  if (!user) {
    return <Login />;
  }

  // App Data Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Đang tải dữ liệu...</p>
        <p className="text-slate-600 text-xs mt-2">KHO PHẾ THANH NAM</p>
        {loading && error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-sm text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Tải lại trang
            </button>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <div className="bg-slate-800 border border-red-500/50 rounded-2xl p-8 max-w-sm text-center">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Lỗi Kết Nối</h2>
          <p className="text-slate-400 text-sm mb-5">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-sm"
            >
              Tải lại trang
            </button>
            <button
              onClick={() => logout()}
              className="text-slate-400 hover:text-white px-4 py-2.5 text-sm transition-colors cursor-pointer"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isMobile={isMobile}
      />

      <main className="flex-1 p-3 md:p-8 overflow-x-hidden w-full">
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-bold text-lg text-white">KHO PHẾ THANH NAM</h1>
            <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 text-xs font-bold">
              {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <div className={`max-w-7xl mx-auto ${isMobile ? 'mobile-content-pb' : ''}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;