import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ImportForm from './components/ImportForm';
import ExportForm from './components/ExportForm';
import CashFlow from './components/CashFlow';
import Partners from './components/Partners';
import { MOCK_MATERIALS, MOCK_TRANSACTIONS, MOCK_PARTNERS } from './constants';
import { Material, Transaction, TransactionType, MaterialType, Partner, ExpenseCategory } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Application State
  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddPartner = (newPartner: Partner) => {
    setPartners(prev => [newPartner, ...prev]);
  };

  const updatePartnerStats = (partnerName: string, amount: number, value: number) => {
    setPartners(prev => prev.map(p => {
      if (p.name.toLowerCase() === partnerName.toLowerCase()) {
        return {
          ...p,
          totalVolume: p.totalVolume + amount,
          totalValue: p.totalValue + value
        };
      }
      return p;
    }));
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Handler: Nhập kho
  const handleImport = (amount: number, price: number, supplier: string) => {
    const totalValue = amount * price;
    
    // 1. Update Material Stock (Scrap)
    setMaterials(prev => prev.map(m => {
      if (m.type === MaterialType.SCRAP) {
        return { ...m, stock: m.stock + amount };
      }
      return m;
    }));

    // 2. Add Transaction
    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      type: TransactionType.IMPORT,
      category: ExpenseCategory.MATERIAL, // Auto categorize as Material
      materialId: 'scrap',
      materialName: 'Nhựa Phế Liệu',
      partnerName: supplier,
      weight: amount,
      totalValue: totalValue
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // 3. Update Partner Stats
    updatePartnerStats(supplier, amount, totalValue);

    // 4. Navigate
    setCurrentView('inventory');
  };

  // Handler: Xuất kho
  const handleExport = (amount: number, price: number, customer: string) => {
    const totalValue = amount * price;

    // 1. Update Material Stock (Powder)
    setMaterials(prev => prev.map(m => {
      if (m.type === MaterialType.POWDER) {
        return { ...m, stock: m.stock - amount };
      }
      return m;
    }));

    // 2. Add Transaction
    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      type: TransactionType.EXPORT,
      materialId: 'powder',
      materialName: 'Bột Nhựa Thành Phẩm',
      partnerName: customer,
      weight: amount,
      totalValue: totalValue
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // 3. Update Partner Stats
    updatePartnerStats(customer, amount, totalValue);

    // 4. Navigate
    setCurrentView('inventory');
  };

  // Handler: Sản Xuất
  const handleProduce = (scrapAmount: number) => {
    const powderAmount = scrapAmount * 0.95; 

    setMaterials(prev => prev.map(m => {
      if (m.type === MaterialType.SCRAP) {
        return { ...m, stock: m.stock - scrapAmount };
      }
      if (m.type === MaterialType.POWDER) {
        return { ...m, stock: m.stock + powderAmount };
      }
      return m;
    }));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard materials={materials} transactions={transactions} />;
      case 'inventory':
        return <Inventory materials={materials} onProduce={handleProduce} />;
      case 'partners':
        return <Partners partners={partners} onAddPartner={handleAddPartner} />;
      case 'import':
        return <ImportForm onImport={handleImport} partners={partners} />;
      case 'export':
        return <ExportForm materials={materials} onExport={handleExport} partners={partners} />;
      case 'finance':
        return <CashFlow transactions={transactions} onAddTransaction={handleAddTransaction} />;
      default:
        return <Dashboard materials={materials} transactions={transactions} />;
    }
  };

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
            <h1 className="font-bold text-xl text-white">EcoPlast</h1>
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

export default App;