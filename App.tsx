import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  ChevronRight,
  Search,
  Filter,
  User,
  MoreHorizontal,
  CheckCircle,
  Plus,
  Trash2,
  RefreshCw,
  Cloud
} from 'lucide-react';
import { Product, ProductFormData, AppSettings, CartItem, Order, Employee } from './types';
import { generateId, formatCurrency, syncOrderToGoogleSheet, syncProductToGoogleSheet, fetchFromGoogleSheet } from './utils';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SalesChart } from './components/SalesChart';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { POSView } from './components/POSView';
import { SettingsView } from './components/SettingsView';
import { HistoryView } from './components/HistoryView';
import { QuickOrderModal } from './components/QuickOrderModal';
import { LoginScreen } from './components/LoginScreen';
import { Toast, ToastType } from './components/Toast';

const STORAGE_KEY = 'halan_buslines_store_data';
const SETTINGS_KEY = 'halan_buslines_settings';
const ORDERS_KEY = 'halan_buslines_orders';
const CART_KEY = 'halan_buslines_cart_draft';

// Dummy data for initial load - Customized for Buslines
const INITIAL_DATA: Product[] = [
  {
    id: '1',
    name: 'Mô hình xe giường nằm Hà Lan (Limited)',
    imageUrl: 'https://i.pinimg.com/736x/88/2c/3f/882c3f585a21323330623a8b41724227.jpg',
    stock: 5,
    costPrice: 250000,
    sellingPrice: 450000,
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: 'Vé tháng tuyến Thái Nguyên - Hà Nội',
    imageUrl: 'https://busvietnam.net/wp-content/uploads/2016/11/ve-xe-bus.jpg',
    stock: 50,
    costPrice: 800000,
    sellingPrice: 850000,
    createdAt: Date.now(),
  },
  {
    id: '3',
    name: 'Gối cổ chữ U cao cấp (Memory Foam)',
    imageUrl: 'https://cf.shopee.vn/file/2065842c36688756d1088496739f37c3',
    stock: 25,
    costPrice: 85000,
    sellingPrice: 180000,
    createdAt: Date.now(),
  },
  {
    id: '4',
    name: 'Nước suối Hà Lan (Thùng 24 chai)',
    imageUrl: 'https://cdn.tgdd.vn/Products/Images/3364/79468/bhx/thung-24-chai-nuoc-tinh-khiet-aquafina-500ml-202302271445524675.jpg',
    stock: 100,
    costPrice: 70000,
    sellingPrice: 110000,
    createdAt: Date.now(),
  },
  {
    id: '5',
    name: 'Dù cầm tay in logo Hà Lan',
    imageUrl: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/364/630/products/o-cam-tay-khung-sat.jpg',
    stock: 15,
    costPrice: 60000,
    sellingPrice: 150000,
    createdAt: Date.now(),
  }
];

const DEFAULT_ADMIN: Employee = {
    id: '1',
    name: 'Quản trị viên',
    pin: '0000',
    role: 'admin'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    googleScriptUrl: '', 
    storeName: 'Hà Lan Buslines Store', 
    bankAccounts: [],
    employees: [DEFAULT_ADMIN] 
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('today');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false); // Product Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false); // Quick Order Modal

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const storedProducts = localStorage.getItem(STORAGE_KEY);
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        const storedOrders = localStorage.getItem(ORDERS_KEY);
        const storedCart = localStorage.getItem(CART_KEY);

        if (storedProducts) setProducts(JSON.parse(storedProducts));
        else setProducts(INITIAL_DATA);

        if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            // Migration: Ensure employees list exists
            if (!parsedSettings.employees || parsedSettings.employees.length === 0) {
                parsedSettings.employees = [DEFAULT_ADMIN];
            }
            // Migration: Ensure bankAccounts exists
            setSettings({
                ...parsedSettings,
                bankAccounts: parsedSettings.bankAccounts || []
            });
        }
        if (storedOrders) setOrders(JSON.parse(storedOrders));
        if (storedCart) setCart(JSON.parse(storedCart));

      } catch (error) {
        console.error("Load data error", error);
        setProducts(INITIAL_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data locally
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [products, settings, orders, cart, isLoading]);

  // Sync Logic
  const handleSyncData = async () => {
      if (!settings.googleScriptUrl) {
          showToast('Vui lòng cấu hình URL Google Script', 'warning');
          return;
      }
      setIsSyncing(true);
      try {
          const data = await fetchFromGoogleSheet(settings.googleScriptUrl);
          if (data && data.products && data.orders) {
              // Merge Logic: Local vs Cloud? For now, Cloud overwrites Local to ensure consistency across devices
              setProducts(data.products);
              setOrders(data.orders);
              showToast('Đã đồng bộ dữ liệu mới nhất từ Cloud', 'success');
          } else {
              showToast('Không thể lấy dữ liệu từ Sheet', 'error');
          }
      } catch (e) {
          showToast('Lỗi kết nối mạng', 'error');
      } finally {
          setIsSyncing(false);
      }
  };

  // Product Management
  const handleAddProduct = async (data: ProductFormData) => {
    const newProduct: Product = {
      id: generateId(),
      createdAt: Date.now(),
      ...data,
    };
    setProducts(prev => [newProduct, ...prev]);
    setActiveTab('products');
    showToast('Đã thêm sản phẩm mới');
    
    if (settings.googleScriptUrl) {
        await syncProductToGoogleSheet(newProduct, 'add_product', settings.googleScriptUrl);
    }
  };

  const handleEditProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    const updatedProduct = { ...editingProduct, ...data };
    
    setProducts(prev => 
      prev.map(p => p.id === editingProduct.id ? updatedProduct : p)
    );
    setEditingProduct(null);
    showToast('Đã cập nhật sản phẩm');

    if (settings.googleScriptUrl) {
        await syncProductToGoogleSheet(updatedProduct, 'update_product', settings.googleScriptUrl);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (currentUser?.role !== 'admin') {
        showToast('Chỉ quản lý được xóa sản phẩm!', 'error');
        return;
    }
    if (window.confirm('Xóa sản phẩm này?')) {
      const product = products.find(p => p.id === id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Đã xóa sản phẩm', 'warning');
      
      if (settings.googleScriptUrl && product) {
         await syncProductToGoogleSheet(product, 'delete_product', settings.googleScriptUrl);
      }
    }
  };

  // Order Deletion (Reverse Stock)
  const handleDeleteOrder = (orderId: string) => {
      // REMOVED ROLE CHECK: Allow everyone to delete orders for quick fixes
      if (!window.confirm('CẢNH BÁO: Xóa đơn hàng sẽ hoàn trả số lượng vào kho. Bạn có chắc chắn?')) return;

      const orderToDelete = orders.find(o => o.id === orderId);
      if (!orderToDelete) return;

      // 1. Restore Stock
      const stockUpdates = new Map<string, number>();
      orderToDelete.items.forEach(item => {
          stockUpdates.set(item.id, item.quantity);
      });

      setProducts(prev => prev.map(p => {
          if (stockUpdates.has(p.id)) {
              // Update stock locally
              const newStock = p.stock + (stockUpdates.get(p.id) || 0);
              // Optimistically update cloud for each product affected
              if (settings.googleScriptUrl) {
                  syncProductToGoogleSheet({...p, stock: newStock}, 'update_product', settings.googleScriptUrl);
              }
              return { ...p, stock: newStock };
          }
          return p;
      }));

      // 2. Remove Order
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showToast('Đã xóa đơn & hoàn kho', 'success');
      
      // Note: Delete order from Sheet is not implemented in V1 to preserve logs, can be added if needed
  };

  // Cart & POS Management
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
           showToast('Đã đạt giới hạn tồn kho!', 'error');
           return prev; 
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          // Check stock limit
          const product = products.find(p => p.id === productId);
          if (product && newQty > product.stock) {
            showToast('Không đủ tồn kho!', 'error');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleCheckout = async (paymentMethod: 'cash' | 'transfer', paymentNote: string) => {
    if (cart.length === 0) return;

    const totalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const totalProfit = cart.reduce((sum, item) => sum + ((item.sellingPrice - item.costPrice) * item.quantity), 0);
    
    const newOrder: Order = {
      id: `DH-${Math.floor(Math.random() * 10000)}`,
      items: [...cart],
      totalAmount,
      totalProfit,
      timestamp: Date.now(),
      paymentMethod,
      paymentNote,
      employeeName: currentUser?.name || 'Không xác định' // Use logged in user name
    };

    // 1. Update Inventory Locally
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    }));

    // 2. Save Order Locally
    setOrders(prev => [newOrder, ...prev]);

    // 3. Sync to Google Sheets (Order + Product Updates)
    let isSyncSuccess = true;
    if (settings.googleScriptUrl) {
      // Sync the Order
      isSyncSuccess = await syncOrderToGoogleSheet(newOrder, settings.googleScriptUrl);
      
      // Sync updated stock for each product
      cart.forEach(item => {
          const product = products.find(p => p.id === item.id);
          if (product) {
              const newStock = product.stock - item.quantity;
              syncProductToGoogleSheet({...product, stock: newStock}, 'update_product', settings.googleScriptUrl);
          }
      });
    }

    // 4. Notification
    if (settings.googleScriptUrl && !isSyncSuccess) {
        showToast('Đã lưu đơn (Offline) - Lỗi đồng bộ Sheet', 'warning');
    } else {
        showToast('Thanh toán thành công!', 'success');
    }

    // 5. Clear Cart
    setCart([]);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Computed Stats for Dashboard
  const todayRevenue = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return orders
      .filter(o => now - o.timestamp < oneDay)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const todayProfit = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return orders
      .filter(o => now - o.timestamp < oneDay)
      .reduce((sum, o) => sum + o.totalProfit, 0);
  }, [orders]);

  const lowStockProducts = products.filter(p => p.stock <= 5);
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // AUTH CHECK
  if (!currentUser) {
      return (
          <LoginScreen 
            employees={settings.employees} 
            onLogin={(user) => setCurrentUser(user)} 
          />
      );
  }

  // Render Dashboard View with Responsive Grid
  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Filter - Flex on Mobile, Row on Desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm font-medium">Dashboard</p>
          <h1 className="text-2xl font-bold text-slate-800">{settings.storeName}</h1>
        </div>
        
        <div className="flex items-center gap-2">
           {settings.googleScriptUrl && (
             <button
                onClick={handleSyncData}
                disabled={isSyncing}
                className="bg-white text-brand-blue px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100 shadow-sm hover:bg-blue-50 transition-colors"
             >
                <div className={`${isSyncing ? 'animate-spin' : ''}`}>
                    {isSyncing ? <RefreshCw className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                </div>
                {isSyncing ? 'Đang bộ...' : 'Đồng bộ Cloud'}
             </button>
           )}
           
           <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {['Hôm nay', 'Tuần này', 'Tháng'].map((label, idx) => {
                const id = idx === 0 ? 'today' : idx === 1 ? 'week' : 'month';
                const isActive = timeFilter === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTimeFilter(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
           </div>
           
           <button 
             onClick={() => setIsQuickOrderOpen(true)}
             className="hidden md:flex bg-brand-blue text-white px-4 py-2 rounded-xl text-sm font-bold items-center gap-2 shadow-md hover:bg-blue-700 transition-colors"
           >
              <Plus className="w-4 h-4" /> Tạo đơn mới
           </button>

           <div className="relative p-2 bg-white rounded-xl shadow-sm border border-slate-200 md:hidden">
            <Bell className="w-6 h-6 text-slate-600" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Grid Layout: 2 col mobile, 3 col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Main Revenue Card */}
        <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-6 shadow-soft border border-slate-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <TrendingUp className="w-24 h-24 text-brand-blue" />
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-medium mb-2">Doanh thu</p>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">{formatCurrency(todayRevenue)}</h2>
            <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-50">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-orange-50 rounded-lg text-brand-orange">
                    <Receipt className="w-5 h-5" />
                </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Đơn hàng</p>
            <h3 className="text-2xl font-bold text-slate-800">{orders.length}</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-50">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-brand-blue">
                    <ArrowUpRight className="w-5 h-5" />
                </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Lợi nhuận gộp</p>
            <h3 className="text-2xl font-bold text-brand-blue">{formatCurrency(todayProfit)}</h3>
        </div>
      </div>

      {/* Main Content Grid: Chart (Left) + Warnings (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Chart & Transactions */}
          <div className="lg:col-span-2 space-y-6">
              {/* Chart */}
              <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-50 h-80" id="chart-canvas">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">Biểu đồ doanh thu</h3>
                  <select className="text-xs bg-slate-50 border-none rounded-lg py-1 px-2 text-slate-600 outline-none cursor-pointer">
                      <option>7 ngày qua</option>
                      <option>Tháng này</option>
                  </select>
                </div>
                <div className="h-64 w-full">
                  <SalesChart />
                </div>
              </div>

              {/* Recent Transactions Table (Desktop) / List (Mobile) */}
              <div className="bg-white rounded-2xl shadow-soft border border-slate-50 overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Giao dịch gần đây</h3>
                    <button onClick={() => setActiveTab('history')} className="text-xs font-bold text-brand-blue hover:underline">Xem tất cả</button>
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Mã đơn</th>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Nhân viên</th>
                                <th className="px-6 py-4">Phương thức</th>
                                <th className="px-6 py-4 text-right">Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.slice(0, 5).map(order => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">{order.id}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(order.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                        <span className="block text-xs text-slate-400">
                                            {new Date(order.timestamp).toLocaleDateString('vi-VN')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                         <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                                <User className="w-3 h-3" />
                                            </div>
                                            <span className="text-slate-600 text-sm">{order.employeeName || 'NV'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold px-2 py-1 rounded w-fit ${order.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-brand-blue'}`}>
                                                {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                                            </span>
                                            {order.paymentMethod === 'transfer' && order.paymentNote && (
                                                <span className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate" title={order.paymentNote}>
                                                    {order.paymentNote}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Chưa có giao dịch nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile List View */}
                <div className="md:hidden">
                    {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="p-4 border-b border-slate-50 last:border-0 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
                                <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                <p className="font-bold text-slate-800 text-sm">{order.id} <span className="text-xs font-normal text-slate-400">({order.employeeName})</span></p>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {new Date(order.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                    <span className="mx-1">•</span>
                                    {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'CK'}
                                </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-green-600">
                                    +{formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Chưa có đơn hàng nào</p>}
                </div>
              </div>
          </div>

          {/* Right Column: Alerts & Calendar */}
          <div className="space-y-6">
              {/* Stock Warning */}
              <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Cảnh báo kho
                  </h3>
                  <button onClick={() => setActiveTab('products')} className="text-xs text-brand-blue font-bold">Xem kho</button>
                </div>
                
                <div className="space-y-3">
                    {lowStockProducts.length > 0 ? (
                        lowStockProducts.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100" 
                            />
                            <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 text-xs truncate">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                Sắp hết
                                </span>
                                <span className="text-xs text-slate-500">Còn: <b className="text-slate-700">{item.stock}</b></span>
                            </div>
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <p className="text-xs text-slate-500">Kho hàng ổn định</p>
                        </div>
                    )}
                </div>
              </div>

              {/* Mini Calendar (Visual Only) */}
              <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-50 hidden lg:block">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800">Lịch làm việc</h3>
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400 font-medium">
                      <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                       {/* Simplified Calendar Grid */}
                       {Array.from({length: 30}).map((_, i) => (
                           <div key={i} className={`p-2 rounded-lg hover:bg-slate-50 cursor-pointer ${i === 12 ? 'bg-brand-blue text-white font-bold hover:bg-blue-700' : 'text-slate-700'}`}>
                               {i + 1}
                           </div>
                       ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-800">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onAddClick={openAddModal}
        onNewOrderClick={() => setIsQuickOrderOpen(true)}
        cartItemCount={cart.length}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />
      
      <main className="flex-1 md:ml-64 pb-24 md:pb-0 min-h-screen relative overflow-x-hidden">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Kho hàng ({products.length})</h2>
                <div className="flex gap-2">
                    {settings.googleScriptUrl && (
                        <button 
                            onClick={handleSyncData}
                            disabled={isSyncing}
                            className="bg-white text-slate-600 border border-slate-200 px-3 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-slate-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> 
                            <span className="hidden sm:inline">Đồng bộ</span>
                        </button>
                    )}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm sản phẩm..." 
                            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-blue"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="bg-brand-blue text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Thêm hàng</span>
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onClick={(p) => {
                        setViewingProduct(p);
                        setIsDetailModalOpen(true);
                    }}
                    onEdit={(p) => {
                        setEditingProduct(p);
                        setIsModalOpen(true);
                    }}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
              {filteredProducts.length === 0 && (
                  <div className="text-center py-20 text-slate-400">
                      Không tìm thấy sản phẩm nào
                  </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
              <HistoryView 
                  orders={orders}
                  currentUser={currentUser}
                  onDeleteOrder={handleDeleteOrder}
              />
          )}

          {activeTab === 'pos' && (
            <POSView 
                products={products}
                cart={cart}
                onAddToCart={addToCart}
                onUpdateQuantity={updateCartQuantity}
                onRemoveFromCart={(id) => updateCartQuantity(id, -999)}
                onCheckout={handleCheckout}
                bankAccounts={settings.bankAccounts}
            />
          )}

          {activeTab === 'settings' && currentUser.role === 'admin' && (
             <SettingsView 
                settings={settings}
                onSave={(newSettings) => {
                    setSettings(newSettings);
                    showToast('Đã lưu cài đặt');
                }}
             />
          )}
        </div>
      </main>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onAddClick={openAddModal}
        onNewOrderClick={() => setIsQuickOrderOpen(true)}
        cartItemCount={cart.length}
      />

      {/* Modals */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        initialData={editingProduct}
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={viewingProduct}
        onEdit={(p) => {
            setIsDetailModalOpen(false);
            setEditingProduct(p);
            setIsModalOpen(true);
        }}
      />

      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        products={products}
        cart={cart}
        onAddToCart={addToCart}
        onUpdateQuantity={updateCartQuantity}
        onCheckout={handleCheckout}
        bankAccounts={settings.bankAccounts}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;