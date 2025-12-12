import { Order } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const syncOrderToGoogleSheet = async (order: Order, scriptUrl: string): Promise<boolean> => {
  if (!scriptUrl) return false;

  try {
    // Format data for Google Sheet
    const data = {
      action: 'add_order',
      orderId: order.id,
      date: new Date(order.timestamp).toLocaleString('vi-VN'),
      items: order.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
      totalAmount: order.totalAmount,
      totalProfit: order.totalProfit,
      paymentMethod: order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
      paymentNote: order.paymentNote || '',
      employeeName: order.employeeName || 'Không tên',
    };

    // Use no-cors mode for Google Apps Script Web App to avoid CORS errors in simple client-side apps
    // Note: In no-cors, we can't read the response, but the request is sent.
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return true;
  } catch (error) {
    console.error('Lỗi đồng bộ Google Sheet:', error);
    return false;
  }
};

export const sendTestToGoogleSheet = async (scriptUrl: string): Promise<boolean> => {
  if (!scriptUrl) return false;

  try {
    const data = {
      date: new Date().toLocaleString('vi-VN'),
      orderId: 'TEST-CONNECTION',
      items: 'Dữ liệu kiểm tra kết nối từ Hà Lan Store',
      totalAmount: 0,
      totalProfit: 0,
      paymentMethod: 'Test',
      paymentNote: 'Kiểm tra kết nối',
      employeeName: 'Admin System'
    };

    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return true;
  } catch (error) {
    console.error('Lỗi gửi test Google Sheet:', error);
    return false;
  }
};