import React, { useState, useMemo } from 'react';
import { ShoppingCart, BrainCircuit } from 'lucide-react';
import { INITIAL_CATALOG } from './constants';
import { CartState, CartItem, Category } from './types';
import CategoryTabs from './components/CategoryTabs';
import ItemCard from './components/ItemCard';
import ReviewModal from './components/ReviewModal';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(Category.Vegetables);
  const [cart, setCart] = useState<CartState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique categories from catalog
  const categories = useMemo(() => {
    return Array.from(new Set(INITIAL_CATALOG.map(item => item.category)));
  }, []);

  // Filter items based on active tab
  const activeItems = useMemo(() => {
    return INITIAL_CATALOG.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  // Handler for item updates (qty, unit, note)
  const handleUpdateCart = (id: string, updates: Partial<CartItem>) => {
    setCart(prev => {
      const current = prev[id];
      // If qty becomes 0, remove from cart state (optional, or keep with 0)
      // Here we keep it in state if it has updates, but logic mostly checks qty > 0
      if (!current && updates.qty === 0) return prev;

      return {
        ...prev,
        [id]: {
          ...(current || { item: updates.item!, qty: 0, selectedUnit: '', note: '' }),
          ...updates
        }
      };
    });
  };

  const totalItems = Object.values(cart).filter(i => i.qty > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-2xl mx-auto shadow-2xl shadow-gray-200">
      
      {/* Header */}
      <header className="bg-white px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            AGI
          </h1>
        </div>
        <p className="text-lg font-bold text-gray-800 leading-tight">
          Awesome Grocery Intelligence
        </p>
        <p className="text-gray-500 text-sm font-medium mt-1">
          Spouse-proof your shopping with precise items, units & photos 🛡️
        </p>
      </header>

      {/* Tabs */}
      <CategoryTabs 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Grid */}
      <main className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activeItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              cartItem={cart[item.id]}
              onUpdate={handleUpdateCart}
            />
          ))}
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`
            relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-300
            ${totalItems > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white scale-100' : 'bg-gray-300 text-gray-500 cursor-not-allowed scale-95'}
          `}
          disabled={totalItems === 0}
        >
          <ShoppingCart size={28} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cart={cart}
      />
    </div>
  );
};

export default App;