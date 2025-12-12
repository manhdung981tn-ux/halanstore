import React from 'react';
import { Edit2, Trash2, TrendingUp, Package, Percent, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onEdit, onDelete }) => {
  const profitPerUnit = product.sellingPrice - product.costPrice;
  const margin = product.sellingPrice > 0 ? ((profitPerUnit / product.sellingPrice) * 100) : 0;
  const isLowStock = product.stock <= 5;
  
  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer hover:border-brand-blue/30 relative"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl || 'https://picsum.photos/400/300'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?blur=2';
          }}
        />
        
        {/* Stock Badge */}
        <div className={`absolute top-3 right-3 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors ${
            isLowStock 
            ? 'bg-red-500/90 text-white animate-pulse' 
            : 'bg-white/90 text-slate-700'
        }`}>
          {isLowStock ? <AlertCircle className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
          <span>Kho: {product.stock}</span>
        </div>

        {/* Hot Badge */}
        {margin > 30 && (
           <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-lg flex items-center gap-1 transform group-hover:scale-105 transition-transform">
             <TrendingUp className="w-3 h-3" />
             HOT DEAL
           </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
            <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-brand-blue transition-colors" title={product.name}>
            {product.name}
            </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 group-hover:border-slate-200 transition-colors">
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Giá nhập</span>
            <span className="font-semibold text-slate-600 block truncate">{formatCurrency(product.costPrice)}</span>
          </div>
          <div className="bg-brand-blue/5 p-2.5 rounded-xl border border-brand-blue/10 group-hover:bg-brand-blue/10 transition-colors">
            <span className="block text-brand-blue/70 text-[10px] uppercase font-bold tracking-wider mb-0.5">Giá bán</span>
            <span className="font-bold text-brand-blue block truncate text-base">{formatCurrency(product.sellingPrice)}</span>
          </div>
        </div>

        <div className="mb-5 pt-3 border-t border-dashed border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
               <Percent className="w-3 h-3 mr-1" />
               Margin: {margin.toFixed(0)}%
            </div>
            <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Lãi/đơn</span>
                <span className="text-sm font-bold text-green-600 block leading-none ml-1">
                +{formatCurrency(profitPerUnit)}
                </span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="flex-1 flex items-center justify-center py-2.5 px-4 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-600 rounded-xl transition-all duration-200 text-sm font-bold"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Sửa
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            className="flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all duration-200"
            title="Xóa sản phẩm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};