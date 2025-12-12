import React from 'react';
import { LayoutGrid, Package, Plus, ShoppingCart, Settings, History } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  onNewOrderClick: () => void;
  cartItemCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onAddClick, onNewOrderClick, cartItemCount }) => {
  const navItems = [
    { id: 'overview', icon: LayoutGrid, label: 'Tổng quan' },
    { id: 'history', icon: History, label: 'Lịch sử' }, // New Item
    { id: 'quick-order', icon: Plus, label: '', isAction: true },
    { id: 'pos', icon: ShoppingCart, label: 'Bán hàng' },
    { id: 'settings', icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe pt-2 px-2 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-between items-end max-w-md mx-auto relative">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <div key={item.id} className="relative -top-6 px-2">
                <button
                  onClick={onNewOrderClick}
                  className="w-14 h-14 bg-brand-blue rounded-full shadow-glow text-white flex items-center justify-center transform active:scale-95 transition-all"
                >
                  <Plus className="w-8 h-8" strokeWidth={3} />
                </button>
              </div>
            );
          }

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors duration-200 relative ${
                isActive ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {item.id === 'pos' && cartItemCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-white">
                  {cartItemCount}
                </span>
              )}
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};