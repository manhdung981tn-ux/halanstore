import React, { useState, useEffect } from 'react';
import { X, Search, ShoppingCart, Plus, Minus, CreditCard, Trash2, CheckCircle, Banknote, Smartphone } from 'lucide-react';
import { Product, CartItem, BankAccount } from '../types';
import { formatCurrency } from '../utils';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onCheckout: (paymentMethod: 'cash' | 'transfer', paymentNote: string) => void;
  bankAccounts?: BankAccount[];
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onCheckout,
  bankAccounts = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
        setPaymentMethod('cash');
        setPaymentNote('');
        setSelectedBankId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0
  );

  const totalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePay = () => {
    onCheckout(paymentMethod, paymentMethod === 'transfer' ? paymentNote : '');
    setIsCheckoutSuccess(true);
    setTimeout(() => {
      setIsCheckoutSuccess(false);
      onClose();
    }, 1500);
  };

  const selectBank = (acc: BankAccount) => {
    setPaymentNote(`${acc.bankName} - ${acc.accountNumber} - ${acc.ownerName}`);
    setSelectedBankId(acc.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/80 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors md:hidden"
        >
            <X className="w-6 h-6" />
        </button>

        {/* Left Side: Product Selection */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-brand-blue" />
                Tạo Đơn Hàng Mới
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm tên sản phẩm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full bg-slate-100 pl-10 pr-4 py-2.5 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map(product => {
                const cartItem = cart.find(i => i.id === product.id);
                const currentQty = cartItem ? cartItem.quantity : 0;
                const available = product.stock - currentQty;
                
                return (
                  <button 
                    key={product.id} 
                    onClick={() => available > 0 && onAddToCart(product)}
                    disabled={available <= 0}
                    className={`text-left p-3 rounded-xl border transition-all active:scale-95 flex flex-col h-full ${
                        currentQty > 0 
                        ? 'bg-blue-50 border-brand-blue ring-1 ring-brand-blue' 
                        : 'bg-white border-slate-200 hover:border-brand-blue hover:shadow-md'
                    } ${available <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="aspect-square rounded-lg bg-slate-100 mb-2 overflow-hidden relative w-full">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        {currentQty > 0 && (
                            <div className="absolute inset-0 bg-brand-blue/20 flex items-center justify-center">
                                <span className="w-8 h-8 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center shadow-lg">
                                    {currentQty}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-slate-800 text-xs line-clamp-2 mb-1">{product.name}</h4>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                        <span className="font-bold text-brand-orange text-xs">{formatCurrency(product.sellingPrice)}</span>
                        <span className="text-[10px] text-slate-400">Kho: {product.stock}</span>
                    </div>
                  </button>
                );
              })}
              {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-10 text-slate-400">
                      Không tìm thấy sản phẩm nào
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Cart & Checkout */}
        <div className="w-full md:w-96 bg-white flex flex-col shadow-[-4px_0_20px_-2px_rgba(0,0,0,0.05)] h-[45vh] md:h-auto border-t md:border-t-0 md:border-l border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-bold text-slate-700">Giỏ hàng ({totalItems})</span>
                <button onClick={onClose} className="hidden md:block p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                        <ShoppingCart className="w-12 h-12 opacity-20" />
                        <p className="text-sm">Chưa có sản phẩm nào</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex gap-3 animate-in slide-in-from-right-5 duration-200">
                            <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg bg-slate-100 object-cover border border-slate-100" />
                            <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-semibold text-slate-800 truncate">{item.name}</h5>
                                <p className="text-xs text-brand-orange font-medium mb-1">{formatCurrency(item.sellingPrice)}</p>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                    <button 
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                        disabled={item.quantity >= item.stock}
                                        className="w-6 h-6 rounded-md bg-brand-blue text-white hover:bg-blue-700 flex items-center justify-center transition-colors disabled:opacity-50"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={() => onUpdateQuantity(item.id, -999)}
                                        className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                {/* Payment Method Selection */}
                <div className="bg-slate-100 p-1 rounded-xl flex">
                    <button
                        onClick={() => {
                            setPaymentMethod('cash');
                            setSelectedBankId(null);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                            paymentMethod === 'cash' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Banknote className="w-4 h-4" /> Tiền mặt
                    </button>
                    <button
                        onClick={() => setPaymentMethod('transfer')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                            paymentMethod === 'transfer' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Smartphone className="w-4 h-4" /> Chuyển khoản
                    </button>
                </div>

                {/* Transfer Info Input */}
                {paymentMethod === 'transfer' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
                        {bankAccounts.length > 0 && (
                             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                 {bankAccounts.map((acc) => (
                                     <button
                                        key={acc.id}
                                        onClick={() => selectBank(acc)}
                                        className={`shrink-0 px-3 py-2 border rounded-lg text-xs transition-colors text-left min-w-[120px] ${
                                            selectedBankId === acc.id 
                                            ? 'bg-blue-50 border-brand-blue ring-1 ring-brand-blue' 
                                            : 'bg-slate-50 border-slate-200 hover:border-brand-blue hover:bg-blue-50'
                                        }`}
                                     >
                                         <p className={`font-bold truncate ${selectedBankId === acc.id ? 'text-brand-blue' : 'text-slate-700'}`}>{acc.bankName}</p>
                                         <p className="text-slate-500 truncate">{acc.accountNumber}</p>
                                     </button>
                                 ))}
                             </div>
                        )}
                        <input 
                            type="text" 
                            placeholder="Nhập thông tin TK (hoặc chọn ở trên)..." 
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none"
                            value={paymentNote}
                            onChange={(e) => {
                                setPaymentNote(e.target.value);
                                setSelectedBankId(null); // Clear selection if typing manual
                            }}
                        />
                        <p className="text-[10px] text-slate-400 mt-1 pl-1">Thông tin này sẽ được lưu vào đơn hàng</p>
                    </div>
                )}

                <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 text-sm">Tổng thanh toán</span>
                    <span className="text-xl font-bold text-slate-800">{formatCurrency(totalAmount)}</span>
                </div>
                
                <button 
                    onClick={handlePay}
                    disabled={cart.length === 0 || isCheckoutSuccess}
                    className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                        isCheckoutSuccess 
                        ? 'bg-green-500 shadow-green-500/30' 
                        : cart.length === 0 
                            ? 'bg-slate-300 shadow-none cursor-not-allowed'
                            : 'bg-brand-blue hover:bg-blue-700 shadow-brand-blue/30'
                    }`}
                >
                    {isCheckoutSuccess ? (
                        <>
                            <CheckCircle className="w-5 h-5" /> Thanh toán thành công!
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5" /> 
                            {paymentMethod === 'cash' ? 'Thu tiền mặt' : 'Xác nhận chuyển khoản'}
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};