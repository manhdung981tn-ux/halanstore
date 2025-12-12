import React from 'react';
import { LayoutGrid, Package, ShoppingCart, Settings, Plus, Bus, LogOut, UserCircle, History } from 'lucide-react';
import { Employee } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  onNewOrderClick: () => void;
  cartItemCount: number;
  currentUser: Employee | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onAddClick, 
  onNewOrderClick, 
  cartItemCount,
  currentUser,
  onLogout
}) => {
  const navItems = [
    { id: 'overview', icon: LayoutGrid, label: 'Tổng quan' },
    { id: 'products', icon: Package, label: 'Kho hàng' },
    { id: 'history', icon: History, label: 'Lịch sử đơn' }, // New Item
    { id: 'pos', icon: ShoppingCart, label: 'Bán hàng (POS)' },
  ];

  // Only Admin can see Settings
  if (currentUser?.role === 'admin') {
      navItems.push({ id: 'settings', icon: Settings, label: 'Cài đặt' });
  }

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-glow">
          <Bus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 leading-tight">Hà Lan<br/><span className="text-brand-blue">Buslines Store</span></h1>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-4 mt-4 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentUser?.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-brand-blue'}`}>
           <UserCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.name}</p>
            <p className="text-[10px] uppercase font-bold text-slate-400">{currentUser?.role === 'admin' ? 'Quản lý' : 'Nhân viên'}</p>
        </div>
        <button 
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
            title="Đăng xuất"
        >
            <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.id === 'pos' && cartItemCount > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-brand-blue' : 'bg-red-100 text-red-600'
                }`}>
                  {cartItemCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* CTA Buttons */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <button
            onClick={onNewOrderClick}
            className="w-full py-3 bg-brand-blue hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 font-bold transition-transform active:scale-95"
        >
            <ShoppingCart className="w-5 h-5" />
            Bán Hàng Ngay
        </button>
        
        <button
            onClick={onAddClick}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-colors"
        >
            <Plus className="w-4 h-4" />
            Nhập Hàng Mới
        </button>

        <p className="text-center text-xs text-slate-400 mt-2">
            Version 2.2.0
        </p>
      </div>
    </div>
  );
};