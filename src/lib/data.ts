export interface Product {
  id: string;
  name: string;
  category: 'console' | 'controller' | 'game' | 'accessory' | 'vr';
  price: number;
  rentalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isRental: boolean;
  description: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'PlayStation 5 Pro',
    category: 'console',
    price: 69990,
    rentalPrice: 2500,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    reviews: 128,
    inStock: true,
    isRental: true,
    description: "The latest PS5 Pro console with 8K gaming support and ultra-high speed SSD."
  },
  {
    id: '2',
    name: 'Xbox Series X',
    category: 'console',
    price: 49990,
    rentalPrice: 2000,
    image: 'https://images.unsplash.com/photo-1621259182902-3b836c824e22?auto=format&fit=crop&q=80&w=1000',
    rating: 4.8,
    reviews: 95,
    inStock: true,
    isRental: true,
    description: "Power your dreams with the fastest, most powerful Xbox ever."
  },
  {
    id: '3',
    name: 'DualSense Edge Controller',
    category: 'controller',
    price: 5990,
    image: 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?auto=format&fit=crop&q=80&w=1000',
    rating: 4.7,
    reviews: 45,
    inStock: true,
    isRental: false,
    description: "Built with high performance and personalization in mind."
  },
  {
    id: '4',
    name: 'Nintendo Switch OLED',
    category: 'console',
    price: 34990,
    rentalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=1000',
    rating: 4.8,
    reviews: 210,
    inStock: true,
    isRental: true,
    description: "7-inch OLED screen for vivid colors and crisp contrast."
  },
  {
    id: '5',
    name: 'Meta Quest 3',
    category: 'vr',
    price: 49990,
    rentalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&q=80&w=1000',
    rating: 4.6,
    reviews: 67,
    inStock: true,
    isRental: true,
    description: "Dive into mixed reality with the most powerful Meta Quest yet."
  },
  {
    id: '6',
    name: 'Elden Ring (PS5)',
    category: 'game',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1642425149556-b6f90e946859?auto=format&fit=crop&q=80&w=1000',
    rating: 5.0,
    reviews: 340,
    inStock: true,
    isRental: false,
    description: "Winner of Game of the Year. An epic fantasy action-RPG."
  }
];

export const REPAIR_SERVICES = [
  {
    id: 'repair-1',
    name: 'HDMI Port Replacement',
    price: 1500,
    duration: '1-2 Days'
  },
  {
    id: 'repair-2',
    name: 'Overheating / Cleaning',
    price: 800,
    duration: '1 Day'
  },
  {
    id: 'repair-3',
    name: 'Disc Drive Repair',
    price: 2500,
    duration: '2-3 Days'
  },
  {
    id: 'repair-4',
    name: 'Controller Drift Fix',
    price: 600,
    duration: '1 Day'
  }
];
