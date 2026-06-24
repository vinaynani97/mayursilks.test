export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  category: string;
  categorySlug: string;
  fabric: string;
  weavingTechnique: string;
  designDetails: string;
  length: string;
  color: string;
  availability: "in_stock" | "out_of_stock" | "made_to_order";
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string | Date;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  author: string;
  publishedAt: string | Date;
  readingTime: number;
  tags: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
  purchasedProduct: string;
  date: string | Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  address: Address;
  paymentMethod: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  timeline: OrderTimeline[];
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string | Date;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "customer" | "admin";
  createdAt: string | Date;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  colors: string[];
  fabrics: string[];
  availability: string[];
  isNew: boolean;
  isBestSeller: boolean;
}
