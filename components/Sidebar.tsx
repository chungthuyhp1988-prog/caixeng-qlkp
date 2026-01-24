import React from 'react';
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, Settings, Recycle, Wallet, Users } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobile }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', mobileLabel: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Kho Hàng', mobileLabel: 'Kho', icon: <Package size={20} /> },
    { id: 'partners', label: 'Đối Tác', mobileLabel: 'Đối tác', icon: <Users size={20} /> },
    { id: 'import', label: 'Nhập Phế', mobileLabel: 'Nhập', icon: <ArrowDownToLine size={20} /> },
    { id: 'export', label: 'Xuất Bột', mobileLabel: 'Xuất', icon: <ArrowUpFromLine size={20} /> },
    { id: 'finance', label: 'Sổ Thu Chi', mobileLabel: 'ThuChi', icon: <Wallet size={20} /> },
  ];

  const handleSettings = () => {
    alert("Tính năng cài đặt đang được phát triển.");
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white shadow-xl z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Recycle className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">EcoPlast</h1>
          <p className="text-xs text-slate-400">Quản lý kho tái chế</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              currentView === item.id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.label}</span>
            {currentView === item.id && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleSettings}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium text-sm">Cài đặt</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-between px-2 py-2 z-50 shadow-2xl safe-area-pb">
         {menuItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 transition-all active:scale-95 ${
              currentView === item.id ? 'text-primary-500 bg-primary-500/10' : 'text-slate-500'
            }`}
          >
            {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
            <span className="text-[10px] mt-1 font-medium whitespace-nowrap">{item.mobileLabel}</span>
          </button>
        ))}
         <button
            onClick={() => setCurrentView('finance')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 transition-all active:scale-95 ${
              currentView === 'finance' ? 'text-primary-500 bg-primary-500/10' : 'text-slate-500'
            }`}
          >
            <Wallet size={20} />
            <span className="text-[10px] mt-1 font-medium whitespace-nowrap">ThuChi</span>
          </button>
      </div>
    );
  }

  return <div className="hidden md:block w-64 h-screen sticky top-0">{content}</div>;
};

export default Sidebar;