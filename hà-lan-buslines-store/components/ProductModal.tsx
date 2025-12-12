import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Box, Tag, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Product, ProductFormData } from '../types';
import { formatCurrency } from '../utils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    imageUrl: '',
    stock: 0,
    costPrice: 0,
    sellingPrice: 0,
  });

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        imageUrl: initialData.imageUrl,
        stock: initialData.stock,
        costPrice: initialData.costPrice,
        sellingPrice: initialData.sellingPrice,
      });
      setImageError(false);
    } else {
      setFormData({
        name: '',
        imageUrl: '',
        stock: 0,
        costPrice: 0,
        sellingPrice: 0,
      });
      setImageError(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  // Calculate real-time profit stats
  const profit = formData.sellingPrice - formData.costPrice;
  const margin = formData.sellingPrice > 0 ? ((profit / formData.sellingPrice) * 100) : 0;
  const isProfitable = profit >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-brand-blue to-blue-800 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: General Info & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên sản phẩm</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    placeholder="Nhập tên sản phẩm..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tồn kho</label>
                <div className="relative">
                  <Box className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Image Preview & URL */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">Hình ảnh sản phẩm</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative flex-1 w-full">
                  <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setImageError(false);
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-1 ml-1">Dán đường dẫn ảnh vào đây để xem trước.</p>
                </div>
                
                {/* Image Preview Box */}
                <div className="shrink-0 w-full sm:w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden relative">
                  {formData.imageUrl && !imageError ? (
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 block">Chưa có ảnh</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Financials (Grouped) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-brand-blue" />
                <span className="font-semibold text-slate-700 text-sm">Thiết lập giá & Lợi nhuận</span>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-5">
                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Giá nhập (Vốn)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        required
                        className="w-full pl-3 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-medium text-brand-orange mb-1">Giá bán ra</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        required
                        className="w-full pl-3 pr-4 py-2.5 rounded-xl border border-brand-orange/30 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all font-bold text-brand-orange"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Profit Calculation Feedback */}
                <div className={`rounded-lg p-3 flex items-center justify-between border ${isProfitable ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center gap-2">
                    {isProfitable ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className={`text-xs font-bold uppercase ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                        {isProfitable ? 'Lợi nhuận dự kiến' : 'Đang lỗ vốn'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Biên lợi nhuận: <span className="font-medium">{margin.toFixed(1)}%</span>
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${isProfitable ? 'text-green-700' : 'text-red-600'}`}>
                    {isProfitable ? '+' : ''}{formatCurrency(profit)}
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white hover:shadow-sm transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="product-form"
            className="flex-1 py-3 px-4 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {initialData ? 'Lưu thay đổi' : 'Thêm hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};