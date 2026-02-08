import React, { useState } from 'react';
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, Settings, Recycle, Wallet, Users, LogOut, Briefcase, Key, MoreHorizontal, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import ChangePasswordModal from './ChangePasswordModal';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobile }) => {
  const { logout, user, isAdmin, profile } = useAuth();
  const { toast, confirm } = useToast();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Main items shown in bottom nav (max 5 for mobile)
  const mainMenuItems = [
    { id: 'dashboard', label: 'Tổng Quan', mobileLabel: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Kho Hàng', mobileLabel: 'Kho', icon: <Package size={20} /> },
    { id: 'import', label: 'Nhập Phế', mobileLabel: 'Nhập', icon: <ArrowDownToLine size={20} /> },
    { id: 'export', label: 'Xuất Bột', mobileLabel: 'Xuất', icon: <ArrowUpFromLine size={20} /> },
    { id: 'finance', label: 'Sổ Thu Chi', mobileLabel: 'Thu Chi', icon: <Wallet size={20} /> },
  ];

  // Extra items for "More" menu
  const moreMenuItems = [
    { id: 'partners', label: 'Đối Tác', mobileLabel: 'Đối tác', icon: <Users size={20} /> },
  ];

  if (isAdmin) {
    moreMenuItems.push({ id: 'personnel', label: 'Nhân Sự', mobileLabel: 'Nhân sự', icon: <Briefcase size={20} /> });
  }

  // Full menu for desktop sidebar
  const allMenuItems = [
    ...mainMenuItems.slice(0, 2), // Dashboard, Kho
    { id: 'partners', label: 'Đối Tác', mobileLabel: 'Đối tác', icon: <Users size={20} /> },
    ...mainMenuItems.slice(2), // Nhập, Xuất, Thu Chi
  ];
  if (isAdmin) {
    allMenuItems.push({ id: 'personnel', label: 'Nhân Sự', mobileLabel: 'Nhân sự', icon: <Briefcase size={20} /> });
  }

  const handleLogout = async () => {
    const ok = await confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (ok) {
      try {
        await logout();
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  // Check if current view is in more menu
  const isMoreActive = moreMenuItems.some(item => item.id === currentView);

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white shadow-xl z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Recycle className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight">KHO PHẾ THANH NAM</h1>
          <p className="text-xs text-slate-400">Quản lý kho tái chế</p>
        </div>
      </div>

      <div className="px-6 py-2">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 relative group">
          <p className="text-xs text-slate-400 mb-1">Xin chào,</p>
          <p className="text-sm font-bold truncate">
            {profile?.full_name && profile.full_name !== user?.email
              ? profile.full_name
              : user?.user_metadata?.full_name}
          </p>
          <div className="mt-1 inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 uppercase">
            {isAdmin ? 'Quản lý' : 'Nhân viên'}
          </div>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Đổi mật khẩu"
          >
            <Key size={14} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
        {allMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative cursor-pointer ${currentView === item.id
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

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => toast.info('Tính năng đang phát triển')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <Settings size={20} />
          <span className="font-medium text-sm">Cài đặt</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Đăng xuất</span>
        </button>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* More Menu Overlay */}
        {isMoreMenuOpen && (
          <div className="fixed inset-0 z-[60]" onClick={() => setIsMoreMenuOpen(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
              className="absolute bottom-[68px] left-3 right-3 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <span className="text-sm font-semibold text-white">Thêm</span>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-700/50">
                <p className="text-xs text-slate-400">Xin chào,</p>
                <p className="text-sm font-bold text-white truncate">
                  {profile?.full_name && profile.full_name !== user?.email
                    ? profile.full_name
                    : user?.user_metadata?.full_name || user?.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 uppercase">
                  {isAdmin ? 'Quản lý' : 'Nhân viên'}
                </span>
              </div>
              <div className="p-2">
                {moreMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${currentView === item.id
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-slate-300 active:bg-slate-700'
                      }`}
                  >
                    {item.icon}
                    <span className="font-medium text-sm">{item.mobileLabel}</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 active:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Key size={20} />
                  <span className="font-medium text-sm">Đổi mật khẩu</span>
                </button>
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 active:bg-red-500/10 transition-colors cursor-pointer mt-1 border-t border-slate-700/50"
                >
                  <LogOut size={20} />
                  <span className="font-medium text-sm">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div
          className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50 shadow-2xl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-stretch justify-around px-1 py-1.5">
            {mainMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-1 py-1.5 rounded-xl flex-1 transition-colors active:scale-95 cursor-pointer ${currentView === item.id
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-slate-500 active:text-slate-300'
                  }`}
              >
                {React.cloneElement(item.icon as any, { size: 22 })}
                <span className="text-[10px] mt-0.5 font-medium leading-tight">{item.mobileLabel}</span>
              </button>
            ))}
            {/* More button */}
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-1 py-1.5 rounded-xl flex-1 transition-colors active:scale-95 cursor-pointer ${isMoreActive || isMoreMenuOpen
                ? 'text-primary-400 bg-primary-500/10'
                : 'text-slate-500 active:text-slate-300'
                }`}
            >
              <MoreHorizontal size={22} />
              <span className="text-[10px] mt-0.5 font-medium leading-tight">Thêm</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return <div className="hidden md:block w-64 h-screen sticky top-0">{content}</div>;
};

export default Sidebar;