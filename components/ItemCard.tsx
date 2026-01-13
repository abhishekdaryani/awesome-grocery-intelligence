import React from 'react';
import { Minus, Plus, MessageSquareWarning } from 'lucide-react';
import { CatalogItem, CartItem } from '../types';

interface ItemCardProps {
  item: CatalogItem;
  cartItem?: CartItem;
  onUpdate: (id: string, updates: Partial<CartItem>) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, cartItem, onUpdate }) => {
  const quantity = cartItem?.qty || 0;
  const isSelected = quantity > 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newQty = quantity + 1;
    onUpdate(item.id, {
      item,
      qty: newQty,
      selectedUnit: cartItem?.selectedUnit || item.units[0],
      note: cartItem?.note || ''
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity === 0) return;
    const newQty = quantity - 1;
    onUpdate(item.id, {
      item,
      qty: newQty,
      selectedUnit: cartItem?.selectedUnit || item.units[0],
      note: cartItem?.note || ''
    });
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(item.id, {
      item,
      qty: quantity || 1, // Auto-select if unit changes
      selectedUnit: e.target.value,
      note: cartItem?.note || ''
    });
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(item.id, {
      item,
      qty: quantity || 1, // Auto-select if note is added
      selectedUnit: cartItem?.selectedUnit || item.units[0],
      note: e.target.value
    });
  };

  // Select item on card click if not interacting with controls
  const handleCardClick = () => {
    if (quantity === 0) {
      onUpdate(item.id, {
        item,
        qty: 1,
        selectedUnit: item.units[0],
        note: ''
      });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative flex flex-col p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-1 ring-emerald-500/20' 
          : 'border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm'
        }
      `}
    >
      {/* Header: Emoji & Name */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl filter drop-shadow-sm">{item.emoji}</span>
        <h3 className={`font-bold text-gray-800 leading-tight ${isSelected ? 'text-emerald-900' : ''}`}>
          {item.name}
        </h3>
      </div>

      {/* Controls - Always visible but styled differently if active */}
      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-2">
          {/* Stepper */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleDecrement}
              className={`p-1.5 rounded-md transition-colors ${quantity > 0 ? 'bg-white shadow-sm text-emerald-600 hover:text-emerald-700' : 'text-gray-400'}`}
              disabled={quantity === 0}
            >
              <Minus size={16} strokeWidth={3} />
            </button>
            <span className={`w-8 text-center font-bold ${quantity > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="p-1.5 rounded-md bg-white shadow-sm text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>

          {/* Unit Selector */}
          <div className="flex-1" onClick={(e) => e.stopPropagation()}>
            <select
              value={cartItem?.selectedUnit || item.units[0]}
              onChange={handleUnitChange}
              className={`w-full p-1.5 text-sm bg-gray-100 border-transparent rounded-lg focus:border-emerald-500 focus:ring-emerald-500 ${quantity > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}
            >
              {item.units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Spouse-Proof Note */}
        {(isSelected || quantity > 0) && (
          <div className="relative animate-in fade-in slide-in-from-top-1 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <MessageSquareWarning size={14} className="text-amber-500" />
            </div>
            <input
              type="text"
              placeholder="Instructions (e.g. not too soft)"
              value={cartItem?.note || ''}
              onChange={handleNoteChange}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-amber-200 rounded-lg bg-amber-50 focus:ring-1 focus:ring-amber-400 focus:border-amber-400 text-gray-700 placeholder-amber-400/70"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ItemCard);