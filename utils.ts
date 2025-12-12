import { Order, Product } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// --- GOOGLE SHEETS INTEGRATION ---

// Helper to make requests
const googleSheetRequest = async (scriptUrl: string, method: 'GET' | 'POST', data?: any) => {
    if (!scriptUrl) return null;

    try {
        if (method === 'GET') {
            // For GET, we append action to URL
            const url = new URL(scriptUrl);
            Object.keys(data).forEach(key => url.searchParams.append(key, data[key]));
            
            const response = await fetch(url.toString());
            return await response.json();
        } else {
            // For POST (no-cors mode restriction usually applies in browsers, 
            // but we use a specific payload structure for the Script to handle)
            await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return true;
        }
    } catch (error) {
        console.error(`Lỗi Google Sheet (${method}):`, error);
        return null;
    }
};

export const fetchFromGoogleSheet = async (scriptUrl: string) => {
    return await googleSheetRequest(scriptUrl, 'GET', { action: 'get_all_data' });
};

export const syncOrderToGoogleSheet = async (order: Order, scriptUrl: string): Promise<boolean> => {
  const data = {
    action: 'add_order',
    orderId: order.id,
    date: new Date(order.timestamp).toLocaleString('vi-VN'),
    timestamp: order.timestamp,
    items: JSON.stringify(order.items), // Save full JSON for restoration
    itemsReadable: order.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
    totalAmount: order.totalAmount,
    totalProfit: order.totalProfit,
    paymentMethod: order.paymentMethod,
    paymentNote: order.paymentNote || '',
    employeeName: order.employeeName || 'Không tên',
  };
  const result = await googleSheetRequest(scriptUrl, 'POST', data);
  return result !== null;
};

export const syncProductToGoogleSheet = async (product: Product, action: 'add_product' | 'update_product' | 'delete_product', scriptUrl: string) => {
    const data = {
        action: action,
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        stock: product.stock,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        createdAt: product.createdAt
    };
    return await googleSheetRequest(scriptUrl, 'POST', data);
};

export const sendTestToGoogleSheet = async (scriptUrl: string): Promise<boolean> => {
  const data = {
      action: 'test_connection',
      date: new Date().toLocaleString('vi-VN'),
      message: 'Kết nối thành công từ Hà Lan Store'
  };
  const result = await googleSheetRequest(scriptUrl, 'POST', data);
  return result !== null;
};