export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  units: string[];
  emoji: string;
}

export interface CartItem {
  item: CatalogItem;
  qty: number;
  selectedUnit: string;
  note: string;
}

export type CartState = Record<string, CartItem>;

export enum Category {
  Vegetables = 'Vegetables',
  Fruits = 'Fruits',
  Dairy = 'Dairy',
  Pantry = 'Pantry',
  Spices = 'Spices'
}