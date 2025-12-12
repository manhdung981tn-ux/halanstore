import React from 'react';
import { Edit2, Trash2, TrendingUp, Package, Tag, ArrowRight } from 'lucide-react';
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
  // const totalPotentialProfit = profitPerUnit * product.stock;

  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer hover:border-brand-blue/30"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl || 'https://picsum.photos/400/300'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?blur=2';
          }}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-blue shadow-sm">
          Kho: {product.stock}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-brand-blue transition-colors" title={product.name}>
          {product.name}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Giá nhập</span>
            <span className="font-semibold text-slate-700 block truncate">{formatCurrency(product.costPrice)}</span>
          </div>
          <div className="bg-brand-blue/5 p-2 rounded-lg border border-brand-blue/10">
            <span className="block text-brand-blue text-[10px] uppercase font-bold tracking-wider mb-1">Giá bán</span>
            <span className="font-bold text-brand-blue block truncate">{formatCurrency(product.sellingPrice)}</span>
          </div>
        </div>

        <div className="mb-4 pt-3 border-t border-dashed border-slate-200">
          <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg border border-green-100">
            <div className="flex items-center text-xs text-green-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Lãi/đơn
            </div>
            <span className="text-sm font-bold text-green-700">
              +{formatCurrency(profitPerUnit)}
            </span>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="flex-1 flex items-center justify-center py-2 px-4 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-600 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Sửa
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-colors duration-200"
            title="Xóa sản phẩm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};