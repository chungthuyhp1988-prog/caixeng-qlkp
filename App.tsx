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
import { Material, Transaction, Partner } from './types';
import { materialsAPI, partnersAPI, transactionsAPI } from './lib/api';

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
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

    async function loadData() {
      if (!user) return; // Don't load if not logged in

      // Failsafe timeout
      const timeoutId = setTimeout(() => {
        if (mounted) {
          setError('Kết nối quá hạn. Vui lòng kiểm tra mạng hoặc thử lại.');
          setLoading(false);
        }
      }, 10000);

      try {
        if (mounted) setLoading(true);
        const [materialsData, partnersData, transactionsData] = await Promise.all([
          materialsAPI.getAll(),
          partnersAPI.getAll(),
          transactionsAPI.getAll()
        ]);

        if (mounted) {
          setMaterials(materialsData);
          setPartners(partnersData);
          setTransactions(transactionsData);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        if (mounted) {
          setError('Không thể kết nối đến database. Vui lòng kiểm tra cấu hình Supabase.');
        }
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    }
    loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleAddPartner = async (newPartner: Omit<Partner, 'id' | 'totalVolume' | 'totalValue'>) => {
    try {
      const created = await partnersAPI.create(newPartner);
      setPartners(prev => [created, ...prev]);
    } catch (err) {
      console.error('Error adding partner:', err);
      alert('Không thể thêm đối tác. Vui lòng thử lại.');
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
      alert('Không thể cập nhật đối tác. Vui lòng thử lại.');
    }
  };

  const handleDeletePartner = async (id: string) => {
    try {
      await partnersAPI.delete(id);
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting partner:', err);
      alert('Không thể xóa đối tác. Vui lòng thử lại.');
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
      alert('Không thể thực hiện nhập kho. Vui lòng thử lại.');
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
      alert('Không thể thực hiện xuất kho. Vui lòng thử lại.');
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
      alert('Không thể xóa giao dịch. Vui lòng thử lại.');
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
      alert('Không thể cập nhật chi phí. Vui lòng thử lại.');
    }
  };

  const handleProduce = async (scrapAmount: number) => {
    try {
      await transactionsAPI.createProduction(scrapAmount);

      const materialsData = await materialsAPI.getAll();
      setMaterials(materialsData);
    } catch (err) {
      console.error('Error producing:', err);
      alert('Không thể thực hiện sản xuất. Vui lòng thử lại.');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard materials={materials} transactions={transactions} />;
      case 'inventory':
        return <Inventory materials={materials} transactions={transactions} onProduce={handleProduce} onDeleteTransaction={handleDeleteTransaction} />;
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
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <div className="bg-slate-800 border border-red-500/50 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Lỗi Kết Nối</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-xl font-medium"
          >
            Thử Lại
          </button>
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

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden w-full">
        {isMobile && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-bold text-xl text-white">KHO PHẾ THANH NAM</h1>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"></div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;