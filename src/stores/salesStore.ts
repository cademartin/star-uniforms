import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SaleItem {
  id: string;
  date: string;
  time: string;
  itemName: string;
  itemCode: string;
  itemColor: string;
  itemSize: string;
  quantity: number;
  sellingPrice: number;
  notes: string;
}

interface SalesStore {
  items: SaleItem[];
  addItem: (item: Omit<SaleItem, 'id'>) => void;
  removeItem: (id: string) => void;
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            { ...item, id: Date.now().toString() },
          ],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'sales-storage',
    }
  )
);