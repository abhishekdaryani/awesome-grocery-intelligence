import React, { useState } from 'react';
import { X, Share, CheckCircle2, MessageSquareWarning, Copy } from 'lucide-react';
import { CartState } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartState;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, cart }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const items = Object.values(cart).filter(i => i.qty > 0);

  const generateListText = () => {
    return items.map(item => {
      let line = `[ ] ${item.qty} ${item.selectedUnit} ${item.item.name}`;
      if (item.note && item.note.trim().length > 0) {
        line += ` - Note: ${item.note}`;
      }
      return line;
    }).join('\n');
  };

  const generateShortcutLink = () => {
    const textList = generateListText();
    const encodedText = encodeURIComponent(textList);
    return `shortcuts://run-shortcut?name=Add%20Groceries&input=text&text=${encodedText}`;
  };

  const handleCopy = async () => {
    const text = generateListText();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shortcutUrl = generateShortcutLink();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Review List</h2>
            <p className="text-sm text-gray-500">{items.length} items selected</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>Your list is empty.</p>
              <button 
                onClick={onClose}
                className="mt-2 text-emerald-600 font-medium hover:underline"
              >
                Go add some groceries!
              </button>
            </div>
          ) : (
            items.map((cartItem) => (
              <div key={cartItem.item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-2xl">{cartItem.item.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800">{cartItem.item.name}</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap">
                      {cartItem.qty} {cartItem.selectedUnit}
                    </span>
                  </div>
                  {cartItem.note && (
                    <div className="mt-1 flex items-start gap-1.5 text-amber-700 text-sm bg-amber-50 p-2 rounded-lg border border-amber-100">
                      <MessageSquareWarning size={14} className="mt-0.5 shrink-0" />
                      <span className="italic leading-snug">{cartItem.note}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl flex flex-col gap-3">
          {items.length > 0 && (
            <>
              <a
                href={shortcutUrl}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
              >
                <Share size={20} />
                Open in Shortcuts
              </a>
              
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
              >
                {isCopied ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Copy size={20} />}
                {isCopied ? "Copied to Clipboard!" : "Copy List Text"}
              </button>
            </>
          )}
          <div className="text-center">
             <p className="text-[10px] text-gray-400">
               "Open in Shortcuts" requires the "Add Groceries" Shortcut on iOS.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;