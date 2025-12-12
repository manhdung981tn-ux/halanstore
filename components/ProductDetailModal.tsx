import React from 'react';
import { X, Calendar, Package, TrendingUp, Edit2, Wallet, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
}) => {
  if (!isOpen || !product) return null;

  const profitPerUnit = product.sellingPrice - product.costPrice;
  const margin = product.sellingPrice > 0 ? ((profitPerUnit / product.sellingPrice) * 100) : 0;
  const totalCapital = product.stock * product.costPrice;
  const totalPotentialRevenue = product.stock * product.sellingPrice;
  const totalPotentialProfit = totalPotentialRevenue - totalCapital;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Image Section */}
        <div className="relative h-56 sm:h-72 bg-slate-100 group">
            <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?blur=2';
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
            
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-all z-10"
            >
                <X className="w-5 h-5" />
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
                 <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-blue/90 text-white text-xs font-bold backdrop-blur-sm shadow-sm border border-white/20">
                        Kho: {product.stock}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm border border-white/20">
                        ID: {product.id}
                    </span>
                 </div>
                 <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md leading-tight">{product.name}</h2>
            </div>
        </div>

        {/* Details Content */}
        <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Inventory Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-slate-500" />
                        Thông tin kho vận
                    </h3>
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Tồn kho hiện tại</span>
                            <span className="font-bold text-slate-800 text-lg">{product.stock} đơn vị</span>
                         </div>
                         <div className="w-full h-px bg-slate-200"></div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Ngày nhập hàng</span>
                            <span className="font-medium text-slate-700 text-sm flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Tổng vốn tồn kho</span>
                            <span className="font-bold text-slate-700">{formatCurrency(totalCapital)}</span>
                         </div>
                    </div>
                </div>

                {/* Pricing Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-brand-orange" />
                        Hiệu quả kinh doanh
                    </h3>
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-3 opacity-10">
                            <TrendingUp className="w-24 h-24 text-brand-orange" />
                         </div>
                         <div className="flex justify-between items-end relative z-10">
                            <div>
                                <span className="block text-slate-500 text-xs mb-1">GIÁ NHẬP</span>
                                <span className="font-semibold text-slate-600 text-lg">{formatCurrency(product.costPrice)}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 mb-2" />
                            <div className="text-right">
                                <span className="block text-brand-orange text-xs font-bold mb-1">GIÁ BÁN</span>
                                <span className="font-bold text-brand-orange text-2xl">{formatCurrency(product.sellingPrice)}</span>
                            </div>
                         </div>
                         
                         <div className="bg-white/60 rounded-xl p-3 border border-slate-200 flex justify-between items-center relative z-10">
                            <span className="text-sm font-medium text-slate-600">Lợi nhuận/đơn</span>
                            <div className="text-right">
                                <span className="block font-bold text-green-600">+{formatCurrency(profitPerUnit)}</span>
                                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded ml-auto w-fit">
                                    {margin.toFixed(1)}%
                                </span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Total Profit Projection */}
            <div className="bg-gradient-to-br from-brand-blue to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 rounded-full blur-xl"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3.5 bg-white/20 rounded-full backdrop-blur-sm border border-white/20">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-1">Tổng lợi nhuận dự kiến (nếu bán hết)</p>
                        <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalPotentialProfit)}</p>
                    </div>
                </div>
                
                <button
                    onClick={() => {
                        onClose();
                        onEdit(product);
                    }}
                    className="relative z-10 w-full sm:w-auto px-6 py-3 bg-white text-brand-blue hover:bg-brand-light rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                    <Edit2 className="w-4 h-4" />
                    Chỉnh sửa
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};