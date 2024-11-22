import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductionItem {
  id: string;
  date: string;
  batchNumber: string;
  itemCode: string;
  quantity: number;
  productionCost: number;
  notes: string;
}

interface ProductionStore {
  items: ProductionItem[];
  addItem: (item: Omit<ProductionItem, 'id'>) => void;
  removeItem: (id: string) => void;
}

export const useProductionStore = create<ProductionStore>()(
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
      name: 'production-storage',
    }
  )
);