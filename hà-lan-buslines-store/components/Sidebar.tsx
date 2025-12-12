import React from 'react';
import { LayoutGrid, Package, ShoppingCart, Settings, Plus, Bus, Box } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  onNewOrderClick: () => void;
  cartItemCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onAddClick, onNewOrderClick, cartItemCount }) => {
  const navItems = [
    { id: 'overview', icon: LayoutGrid, label: 'Tổng quan' },
    { id: 'products', icon: Package, label: 'Kho hàng' },
    { id: 'pos', icon: ShoppingCart, label: 'Bán hàng (POS)' },
    { id: 'settings', icon: Settings, label: 'Cài đặt' },
  ];

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
            Version 2.0.2
        </p>
      </div>
    </div>
  );
};