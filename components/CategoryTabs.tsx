import React from 'react';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100">
      <div className="flex overflow-x-auto py-3 px-4 gap-2 no-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;