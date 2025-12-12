import React, { useState, useMemo } from 'react';
import { Search, Calendar, Filter, Download, Trash2, ArrowUpRight, ArrowDownRight, User, CreditCard, Package } from 'lucide-react';
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
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
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
          const startOfWeek = startOfDay - (now.getDay() * 86400000); // Sunday as start
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

  // Statistics based on filtered data
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
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lịch sử đơn hàng</h2>
          <p className="text-slate-500 text-sm">Quản lý và tra cứu chi tiết giao dịch</p>
        </div>
        
        {/* Summary Cards */}
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm min-w-[140px]">
             <p className="text-xs text-slate-500 font-bold uppercase">Doanh thu</p>
             <p className="text-lg font-bold text-brand-blue">{formatCurrency(stats.revenue)}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm min-w-[140px]">
             <p className="text-xs text-slate-500 font-bold uppercase">Số đơn</p>
             <p className="text-lg font-bold text-slate-800">{stats.orders}</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-soft border border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-20">
         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
             {/* Date Filter */}
             <div className="flex bg-slate-100 p-1 rounded-lg">
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
                        className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
                            dateFilter === opt.id 
                            ? 'bg-white text-brand-blue shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
             </div>
         </div>

         <div className="flex gap-3 w-full md:w-auto">
             {/* Search */}
             <div className="relative flex-1 md:w-64">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Tìm mã đơn, nhân viên..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-brand-blue outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
             </div>
             
             {/* Payment Filter Dropdown */}
             <select 
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-brand-blue outline-none cursor-pointer"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
             >
                 <option value="all">Tất cả HTTT</option>
                 <option value="cash">Tiền mặt</option>
                 <option value="transfer">Chuyển khoản</option>
             </select>
         </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-50 overflow-hidden">
         {/* Desktop Table */}
         <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Mã đơn / Thời gian</th>
                        <th className="px-6 py-4">Nhân viên</th>
                        <th className="px-6 py-4">Chi tiết hàng hóa</th>
                        <th className="px-6 py-4">Thanh toán</th>
                        <th className="px-6 py-4 text-right">Tổng tiền</th>
                        <th className="px-6 py-4 text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <span className="font-bold text-slate-700 block">{order.id}</span>
                                <span className="text-xs text-slate-400">
                                    {new Date(order.timestamp).toLocaleString('vi-VN')}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                        <User className="w-3 h-3" />
                                    </div>
                                    <span className="text-slate-600 font-medium">{order.employeeName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    {order.items.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-slate-600 max-w-[200px]">
                                            <span className="truncate mr-2">{item.name}</span>
                                            <span className="font-bold text-slate-400">x{item.quantity}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <span className="text-[10px] text-slate-400 italic">...và {order.items.length - 2} sản phẩm khác</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    order.paymentMethod === 'cash' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-blue-100 text-brand-blue'
                                }`}>
                                    {order.paymentMethod === 'cash' ? <CreditCard className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                    {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'CK'}
                                </span>
                                {order.paymentNote && (
                                    <p className="text-[10px] text-slate-400 mt-1 max-w-[120px] truncate" title={order.paymentNote}>{order.paymentNote}</p>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="font-bold text-slate-800 text-base">{formatCurrency(order.totalAmount)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={() => onDeleteOrder(order.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
                <div key={order.id} className="p-4 border-b border-slate-50 last:border-0 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-slate-800">{order.id}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                    order.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-brand-blue'
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
                            <span className="block font-bold text-brand-blue text-lg">{formatCurrency(order.totalAmount)}</span>
                            <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                <User className="w-3 h-3" /> {order.employeeName}
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 p-2 rounded-lg text-xs space-y-1">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-slate-600">
                                <span className="truncate">{item.name}</span>
                                <span className="font-bold">x{item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => onDeleteOrder(order.id)}
                        className="self-end flex items-center gap-1 text-xs text-red-500 font-bold px-3 py-1.5 bg-red-50 rounded-lg active:bg-red-100"
                    >
                        <Trash2 className="w-3 h-3" /> Xóa đơn & Hoàn kho
                    </button>
                </div>
            ))}
         </div>
         
         {filteredOrders.length === 0 && (
             <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                 <Package className="w-12 h-12 mb-2 opacity-20" />
                 <p>Không tìm thấy đơn hàng nào trong khoảng thời gian này.</p>
             </div>
         )}
      </div>
    </div>
  );
};