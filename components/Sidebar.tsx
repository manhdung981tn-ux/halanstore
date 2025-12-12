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
    { id: 'history', icon: History, label: 'Lịch sử giao dịch' },
    { id: 'pos', icon: ShoppingCart, label: 'Bán hàng (POS)' },
  ];

  if (currentUser?.role === 'admin') {
      navItems.push({ id: 'settings', icon: Settings, label: 'Cài đặt hệ thống' });
  }

  return (
    <div className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-50 shadow-xl shadow-slate-200/50">
      {/* Brand Logo Area */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
        <div className="flex items-center gap-4 mb-1">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-blue to-blue-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105">
            <Bus className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight leading-none">HÀ LAN</h1>
            <span className="text-brand-orange font-bold text-sm tracking-[0.2em] uppercase mt-1">Store</span>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="px-4 py-6">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${currentUser?.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-brand-blue'}`}>
            <UserCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.name}</p>
                <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${currentUser?.role === 'admin' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                    <p className="text-[10px] uppercase font-bold text-slate-500">{currentUser?.role === 'admin' ? 'Quản lý' : 'Nhân viên'}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow" 
                title="Đăng xuất"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/30 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-blue'}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.id === 'pos' && cartItemCount > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-brand-blue' : 'bg-red-500 text-white shadow-md shadow-red-500/30'
                }`}>
                  {cartItemCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* CTA Buttons */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 pb-8">
        <button
            onClick={onNewOrderClick}
            className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 font-bold transition-all active:scale-95 group"
        >
            <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
            Bán Hàng Ngay
        </button>
        
        <button
            onClick={onAddClick}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors shadow-sm"
        >
            <Plus className="w-4 h-4" />
            Nhập Hàng Mới
        </button>
      </div>
    </div>
  );
};