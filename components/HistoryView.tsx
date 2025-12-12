import React, { useState, useMemo } from 'react';
import { Search, Calendar, Filter, Trash2, ArrowUpRight, ArrowDownRight, User, CreditCard, Package, Smartphone, PieChart } from 'lucide-react';
import { Order, Employee } from '../types';
import { formatCurrency } from '../utils';

interface HistoryViewProps {
  orders: Order[];
  currentUser: Employee;
  onDeleteOrder: (orderId: string) => void;
}

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all';
type PaymentFilter = 'all' | 'cash' | 'transfer';

export const HistoryView: React.FC<HistoryViewProps> = ({ orders, currentUser, onDeleteOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month'); // Default to month for better history view
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  // Filter Logic
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return orders.filter(order => {
      // 1. Text Search
      const searchMatch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.paymentNote && order.paymentNote.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!searchMatch) return false;

      // 2. Payment Filter
      if (paymentFilter !== 'all' && order.paymentMethod !== paymentFilter) return false;

      // 3. Date Filter
      const orderDate = new Date(order.timestamp);
      const orderTime = orderDate.getTime();

      switch (dateFilter) {
        case 'today':
          return orderTime >= startOfDay;
        case 'yesterday':
          const startOfYesterday = startOfDay - 86400000;
          return orderTime >= startOfYesterday && orderTime < startOfDay;
        case 'week':
          const startOfWeek = startOfDay - (now.getDay() * 86400000); 
          return orderTime >= startOfWeek;
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          return orderTime >= startOfMonth;
        case 'all':
        default:
          return true;
      }
    });
  }, [orders, searchTerm, dateFilter, paymentFilter]);

  // Statistics
  const stats = useMemo(() => {
    return filteredOrders.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.totalAmount,
      orders: acc.orders + 1,
      cash: acc.cash + (curr.paymentMethod === 'cash' ? curr.totalAmount : 0),
      transfer: acc.transfer + (curr.paymentMethod === 'transfer' ? curr.totalAmount : 0),
    }), { revenue: 0, orders: 0, cash: 0, transfer: 0 });
  }, [filteredOrders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-blue" />
            Lịch sử giao dịch
          </h2>
          <p className="text-slate-500 text-sm mt-1">Xem lại toàn bộ các đơn hàng đã bán</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex flex-wrap gap-1">
        {[
            {id: 'today', label: 'Hôm nay'},
            {id: 'yesterday', label: 'Hôm qua'},
            {id: 'week', label: 'Tuần này'},
            {id: 'month', label: 'Tháng này'},
            {id: 'all', label: 'Tất cả'},
        ].map(opt => (
            <button
                key={opt.id}
                onClick={() => setDateFilter(opt.id as DateFilter)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    dateFilter === opt.id 
                    ? 'bg-brand-blue text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
                {opt.label}
            </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {/* Total Revenue */}
         <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-5">
                 <PieChart className="w-20 h-20 text-brand-blue" />
             </div>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Tổng doanh thu (Lọc)</p>
             <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.revenue)}</h3>
             <div className="mt-2 text-xs font-medium text-slate-400">
                {stats.orders} đơn hàng
             </div>
         </div>

         {/* Cash Detail */}
         <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                 <CreditCard className="w-6 h-6" />
             </div>
             <div>
                 <p className="text-slate-500 text-xs font-bold uppercase mb-1">Tiền mặt</p>
                 <h3 className="text-xl font-bold text-green-700">{formatCurrency(stats.cash)}</h3>
             </div>
         </div>

         {/* Transfer Detail */}
         <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue">
                 <Smartphone className="w-6 h-6" />
             </div>
             <div>
                 <p className="text-slate-500 text-xs font-bold uppercase mb-1">Chuyển khoản</p>
                 <h3 className="text-xl font-bold text-brand-blue">{formatCurrency(stats.transfer)}</h3>
             </div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
         <div className="relative flex-1">
             <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
             <input 
                type="text" 
                placeholder="Tìm kiếm theo mã đơn, tên nhân viên, ghi chú..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
         </div>
         
         <select 
            className="px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-brand-blue outline-none cursor-pointer shadow-sm font-medium min-w-[180px]"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
         >
             <option value="all">Tất cả phương thức</option>
             <option value="cash">Chỉ Tiền mặt</option>
             <option value="transfer">Chỉ Chuyển khoản</option>
         </select>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-200 overflow-hidden">
         <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 w-48">Mã đơn / Thời gian</th>
                        <th className="px-6 py-4 w-48">Nhân viên</th>
                        <th className="px-6 py-4">Sản phẩm</th>
                        <th className="px-6 py-4 w-40">Thanh toán</th>
                        <th className="px-6 py-4 text-right w-40">Tổng tiền</th>
                        <th className="px-6 py-4 text-center w-20"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                                <span className="font-bold text-slate-700 block font-mono bg-slate-100 w-fit px-1.5 rounded">{order.id}</span>
                                <span className="text-xs text-slate-400 mt-1 block flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(order.timestamp).toLocaleString('vi-VN')}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-slate-700 font-medium">{order.employeeName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1.5">
                                    {order.items.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="flex items-center text-sm text-slate-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                                            <span className="truncate max-w-[200px]">{item.name}</span>
                                            <span className="font-bold text-slate-400 ml-1">x{item.quantity}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <span className="text-[10px] text-slate-400 pl-3.5 italic">+{order.items.length - 2} sản phẩm khác...</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                    order.paymentMethod === 'cash' 
                                    ? 'bg-green-50 text-green-700 border-green-100' 
                                    : 'bg-blue-50 text-brand-blue border-blue-100'
                                }`}>
                                    {order.paymentMethod === 'cash' ? <CreditCard className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                                    {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'CK'}
                                </span>
                                {order.paymentNote && (
                                    <p className="text-[10px] text-slate-400 mt-1.5 max-w-[140px] truncate" title={order.paymentNote}>
                                        {order.paymentNote}
                                    </p>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="font-bold text-slate-800 text-lg">{formatCurrency(order.totalAmount)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={() => onDeleteOrder(order.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group-hover:visible"
                                    title="Xóa đơn và hoàn kho"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>

         {/* Mobile List Card */}
         <div className="md:hidden">
            {filteredOrders.map(order => (
                <div key={order.id} className="p-4 border-b border-slate-100 last:border-0 flex flex-col gap-3 active:bg-slate-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold text-slate-700 text-sm bg-slate-100 px-1.5 rounded">{order.id}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                    order.paymentMethod === 'cash' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-brand-blue border-blue-100'
                                }`}>
                                    {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'CK'}
                                </span>
                            </div>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(order.timestamp).toLocaleString('vi-VN')}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-slate-800 text-lg">{formatCurrency(order.totalAmount)}</span>
                            <span className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                                <User className="w-3 h-3" /> {order.employeeName}
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-slate-700">
                                <span className="truncate">{item.name}</span>
                                <span className="font-bold text-slate-900">x{item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-1">
                        <button 
                            onClick={() => onDeleteOrder(order.id)}
                            className="flex items-center gap-1 text-xs text-red-500 font-bold px-3 py-1.5 bg-white border border-red-100 rounded-lg active:bg-red-50 shadow-sm"
                        >
                            <Trash2 className="w-3 h-3" /> Hoàn tác đơn
                        </button>
                    </div>
                </div>
            ))}
         </div>
         
         {filteredOrders.length === 0 && (
             <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Filter className="w-8 h-8 opacity-30" />
                 </div>
                 <p className="font-medium">Không tìm thấy đơn hàng nào</p>
                 <p className="text-xs mt-1">Hãy thử thay đổi bộ lọc thời gian</p>
             </div>
         )}
      </div>
    </div>
  );
};