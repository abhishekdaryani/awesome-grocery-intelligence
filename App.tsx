import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, BrainCircuit, Search, Plus } from 'lucide-react';
import { INITIAL_CATALOG } from './constants';
import { CartState, CartItem, CatalogItem } from './types';
import CategoryTabs from './components/CategoryTabs';
import ItemCard from './components/ItemCard';
import ReviewModal from './components/ReviewModal';

const STORAGE_KEY_FREQ = 'agi_frequent_items';

const App: React.FC = () => {
  // Load frequency map from local storage
  const [frequencies, setFrequencies] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FREQ);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load history", e);
      return {};
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Frequent');
  const [cart, setCart] = useState<CartState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique categories from catalog, prepend 'Frequent' and 'All'
  const categories = useMemo(() => {
    const distinctCategories = Array.from(new Set(INITIAL_CATALOG.map(item => item.category)));
    return ['Frequent', 'All', ...distinctCategories];
  }, []);

  // Identify custom items currently in the cart (those not in the initial catalog)
  const customItemsInCart = useMemo(() => {
    return Object.values(cart)
      .map(c => c.item)
      .filter(item => !INITIAL_CATALOG.find(i => i.id === item.id));
  }, [cart]);

  // Combine static catalog with any active custom items
  const fullCatalog = useMemo(() => {
    // Deduplicate by ID just in case
    const combined = [...INITIAL_CATALOG, ...customItemsInCart];
    const unique = new Map(combined.map(item => [item.id, item]));
    return Array.from(unique.values());
  }, [customItemsInCart]);

  // Filter items based on search or active tab
  const activeItems = useMemo(() => {
    // 1. Search Mode overrides tabs
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return fullCatalog.filter(item => item.name.toLowerCase().includes(query));
    }

    // 2. Tab filtering
    if (selectedCategory === 'All') {
      return fullCatalog;
    }
    
    if (selectedCategory === 'Frequent') {
      // Get items with > 0 frequency, sort by frequency desc
      return fullCatalog
        .filter(item => (frequencies[item.id] || 0) > 0)
        .sort((a, b) => (frequencies[b.id] || 0) - (frequencies[a.id] || 0));
    }

    return fullCatalog.filter(item => item.category === selectedCategory);
  }, [selectedCategory, fullCatalog, searchQuery, frequencies]);

  // Handler for item updates (qty, unit, note)
  const handleUpdateCart = (id: string, updates: Partial<CartItem>) => {
    setCart(prev => {
      const current = prev[id];
      // If qty becomes 0, remove from cart state (optional, or keep with 0)
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

  const handleCreateCustomItem = () => {
    const name = searchQuery.trim();
    if (!name) return;

    // Generate a unique ID
    const id = `custom_${Date.now()}`;
    const newItem: CatalogItem = {
      id,
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
      category: 'Custom',
      units: ['pcs', 'pkg', 'box', 'kg', 'lb'],
      emoji: '📝'
    };

    handleUpdateCart(id, {
      item: newItem,
      qty: 1,
      selectedUnit: 'pcs',
      note: ''
    });
    
    // We don't clear search query so the user sees the new item immediately
  };

  const handleReviewClick = () => {
    // When user reviews list, we assume these items are "used"
    // Update frequency stats
    const newFreqs = { ...frequencies };
    let hasChanges = false;

    Object.values(cart).forEach(cartItem => {
      if (cartItem.qty > 0) {
        newFreqs[cartItem.item.id] = (newFreqs[cartItem.item.id] || 0) + 1;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFrequencies(newFreqs);
      localStorage.setItem(STORAGE_KEY_FREQ, JSON.stringify(newFreqs));
    }

    setIsModalOpen(true);
  };

  const totalItems = Object.values(cart).filter(i => i.qty > 0).length;

  // Check if we should show the "Create" button
  // Show if search has text AND no exact match exists in the current filtered list
  const showCreateOption = searchQuery.trim().length > 0 && 
    !activeItems.some(item => item.name.toLowerCase() === searchQuery.trim().toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-2xl mx-auto shadow-2xl shadow-gray-200">
      
      {/* Header */}
      <header className="bg-white pt-6 pb-2 border-b border-gray-100 sticky top-0 z-30">
        <div className="px-6">
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="text-emerald-600" size={28} />
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              AGI
            </h1>
          </div>
          <p className="text-lg font-bold text-gray-800 leading-tight">
            Awesome Grocery Intelligence
          </p>
          <p className="text-gray-500 text-sm font-medium mt-1 mb-4">
            Spouse-proof your shopping 🛡️
          </p>

          {/* Search Bar */}
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search or add custom item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Tabs - Only show if not searching */}
        {!searchQuery.trim() && (
          <div className="mt-2">
            <CategoryTabs 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        )}
      </header>

      {/* Grid */}
      <main className="p-4">
        {/* Empty State for Frequent */}
        {!searchQuery && selectedCategory === 'Frequent' && activeItems.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="mb-2 text-4xl">🕰️</p>
            <p>No frequent items yet.</p>
            <p className="text-sm">Start creating lists and they will appear here!</p>
          </div>
        )}

        {/* Empty State for Search */}
        {searchQuery && activeItems.length === 0 && !showCreateOption && (
          <div className="text-center py-10 text-gray-400">
            <p>No items found.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Active Items */}
          {activeItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              cartItem={cart[item.id]}
              onUpdate={handleUpdateCart}
            />
          ))}

          {/* Create Custom Item Card */}
          {showCreateOption && (
            <button
              onClick={handleCreateCustomItem}
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-all text-emerald-700 gap-2 min-h-[160px]"
            >
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Plus size={24} />
              </div>
              <div className="text-center">
                <span className="block text-xs font-medium uppercase tracking-wider opacity-70">Add Custom</span>
                <span className="font-bold text-lg leading-tight break-all">"{searchQuery}"</span>
              </div>
            </button>
          )}
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={handleReviewClick}
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