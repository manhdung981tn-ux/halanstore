export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  stock: number;
  costPrice: number; // Giá nhập
  sellingPrice: number; // Giá bán
  createdAt: number;
}

export interface ProductFormData {
  name: string;
  imageUrl: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  totalProfit: number;
  timestamp: number;
  paymentMethod: 'cash' | 'transfer'; // Phương thức thanh toán
  paymentNote?: string; // Ghi chú (số tài khoản, ngân hàng)
  employeeName?: string; // Tên nhân viên thực hiện
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ownerName: string;
}

export interface AppSettings {
  googleScriptUrl: string;
  storeName: string;
  employeeName?: string; // Tên nhân viên mặc định
  bankAccounts: BankAccount[]; // Danh sách tài khoản ngân hàng
}

export type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'stockAsc' | 'stockDesc';