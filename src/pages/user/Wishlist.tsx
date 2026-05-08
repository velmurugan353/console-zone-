import { ShoppingCart, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function Wishlist() {
  const wishlistItems = [
    {
      id: 1,
      name: 'Xbox Series X',
      price: 499.99,
      image: 'https://images.unsplash.com/photo-1621259182902-3b836c824e22?auto=format&fit=crop&q=80&w=200',
      inStock: true
    },
    {
      id: 2,
      name: 'Elden Ring (PS5)',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1592155931584-901ac15763e3?auto=format&fit=crop&q=80&w=200',
      inStock: true
    },
    {
      id: 3,
      name: 'Limited Edition Headset',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=200',
      inStock: false
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Wishlist</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {wishlistItems.map((item) => (
          <div key={item.id} className="bg-gaming-card border border-gaming-border rounded-xl p-4 flex items-center gap-4 group hover:border-gaming-accent/50 transition-colors">
            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-gaming-bg" />
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white group-hover:text-gaming-accent transition-colors">{item.name}</h3>
              <p className="text-gaming-muted font-mono">{formatCurrency(item.price)}</p>
              <span className={`text-xs ${item.inStock ? 'text-green-400' : 'text-red-400'}`}>
                {item.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                className="p-2 bg-gaming-accent text-black rounded-lg hover:bg-gaming-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!item.inStock}
                title="Add to Cart"
                aria-label={`Add ${item.name} to cart`}
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
              <button 
                className="p-2 bg-gaming-bg border border-gaming-border text-gaming-muted hover:text-red-400 hover:border-red-400/50 rounded-lg transition-colors"
                title="Remove"
                aria-label={`Remove ${item.name} from wishlist`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
