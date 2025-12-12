import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, CheckCircle, Banknote, Smartphone, Check } from 'lucide-react';
import { Product, CartItem, BankAccount } from '../types';
import { formatCurrency } from '../utils';

interface POSViewProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onCheckout: (paymentMethod: 'cash' | 'transfer', paymentNote: string) => void;
  bankAccounts?: BankAccount[];
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
  bankAccounts = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0
  );

  const totalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePay = () => {
    onCheckout(paymentMethod, paymentMethod === 'transfer' ? paymentNote : '');
    setIsCheckoutSuccess(true);
    setTimeout(() => setIsCheckoutSuccess(false), 2000);
  };

  const selectBank = (acc: BankAccount) => {
      setPaymentNote(`${acc.bankName} - ${acc.accountNumber} - ${acc.ownerName}`);
      setSelectedBankId(acc.id);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header & Search */}
      <div className="bg-white sticky top-0 z-10 px-4 py-3 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Bán hàng</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm sản phẩm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
      </div>

      {/* Main Content Area: Split View */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <div className="grid grid-cols-2 gap-3 pb-20 md:pb-0">
            {filteredProducts.map(product => {
                const cartItem = cart.find(i => i.id === product.id);
                const currentQty = cartItem ? cartItem.quantity : 0;
                const available = product.stock - currentQty;
                const isInCart = currentQty > 0;

                return (
                  <div 
                    key={product.id} 
                    onClick={() => available > 0 && onAddToCart(product)}
                    className={`rounded-xl p-3 shadow-sm border transition-all active:scale-95 ${
                        available <= 0 ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100' : 'cursor-pointer'
                    } ${
                        isInCart 
                        ? 'bg-blue-50 border-brand-blue ring-1 ring-brand-blue' 
                        : 'bg-white border-slate-100 hover:border-brand-blue'
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2 relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                      {isInCart && (
                          <div className="absolute inset-0 bg-brand-blue/10 flex items-center justify-center">
                              <div className="bg-brand-blue text-white w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center shadow-lg transform scale-110">
                                  {currentQty}
                              </div>
                          </div>
                      )}
                    </div>
                    <h4 className="font-medium text-slate-800 text-xs line-clamp-2 mb-1 h-8 leading-4">{product.name}</h4>
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-brand-orange text-sm">{formatCurrency(product.sellingPrice)}</span>
                      <span className="text-[10px] text-slate-400">Kho: {product.stock}</span>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>

        {/* Cart Sidebar (Desktop) / Bottom Sheet (Mobile) */}
        {cart.length > 0 && (
          <div className="bg-white border-t md:border-t-0 md:border-l border-slate-200 md:w-80 flex flex-col shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.1)] z-20">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Giỏ hàng ({totalItems})
                </span>
                <span className="text-xs font-semibold text-brand-blue">
                    {formatCurrency(totalAmount)}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[40vh] md:max-h-full">
                {cart.map(item => (
                    <div key={item.id} className="flex gap-3 bg-white">
                        <img src={item.imageUrl} className="w-12 h-12 rounded bg-slate-100 object-cover shrink-0" alt="" />
                        <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-medium text-slate-800 truncate mb-1">{item.name}</h5>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-brand-orange">{formatCurrency(item.sellingPrice)}</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                        className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-200"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                    <button 
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                        className="w-5 h-5 rounded bg-brand-blue text-white flex items-center justify-center active:bg-blue-700"
                                        disabled={item.quantity >= item.stock}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white space-y-3">
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

                {/* Bank Account Selection Logic */}
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
                                setSelectedBankId(null);
                            }}
                        />
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Tổng thanh toán</span>
                    <span className="text-xl font-bold text-slate-800">{formatCurrency(totalAmount)}</span>
                </div>
                <button 
                    onClick={handlePay}
                    disabled={isCheckoutSuccess}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-brand-blue/30 flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isCheckoutSuccess ? 'bg-green-500' : 'bg-brand-blue hover:bg-blue-700'
                    }`}
                >
                    {isCheckoutSuccess ? (
                        <>
                            <CheckCircle className="w-5 h-5" /> Đã thanh toán!
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5" /> Thanh toán
                        </>
                    )}
                </button>
            </div>
          </div>
        )}
        
        {cart.length === 0 && (
             <div className="hidden md:flex md:w-80 flex-col items-center justify-center text-slate-400 bg-slate-50 border-l border-slate-200 p-8 text-center">
                 <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                 <p className="text-sm">Chọn sản phẩm bên trái để thêm vào đơn hàng</p>
             </div>
        )}
      </div>
    </div>
  );
};