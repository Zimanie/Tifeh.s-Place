export type ProductCategory = 'shoes' | 'bags' | 'jewelry' | 'watches' | 'perfumes';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  material: string;
  sizes: string[];
  colors: string[];
  description: string;
  image_url: string;
  is_new_arrival: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  image_url: string;
}

export type OrderStatus = 'pending_payment' | 'confirmed' | 'dispatched' | 'delivered';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_email: string;
  delivery_address: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  payment_method: 'bank_transfer' | 'cash_on_delivery';
  created_at: string;
}

export interface UserSession {
  email: string;
  isAdmin: boolean;
  name?: string;
}
