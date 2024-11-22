import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProductionStore } from '../stores/productionStore';
import { format } from 'date-fns';

function Production() {
  const { items, addItem } = useProductionStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    batchNumber: '',
    itemCode: '',
    quantity: '',
    productionCost: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem({
      ...formData,
      quantity: Number(formData.quantity),
      productionCost: Number(formData.productionCost),
    });
    setShowForm(false);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      batchNumber: '',
      itemCode: '',
      quantity: '',
      productionCost: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold"
        >
          Production Data
        </motion.h1>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Production Entry'}
        </motion.button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white/30 backdrop-blur-xl p-6 rounded-xl border border-white/20 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Production Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({ ...formData, batchNumber: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Code
              </label>
              <input
                type="text"
                value={formData.itemCode}
                onChange={(e) =>
                  setFormData({ ...formData, itemCode: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Production Cost per Item
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.productionCost}
                onChange={(e) =>
                  setFormData({ ...formData, productionCost: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Production Entry
            </button>
          </div>
        </motion.form>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/30 backdrop-blur-xl p-6 rounded-xl border border-white/20"
      >
        <h2 className="text-xl font-semibold mb-4">Production History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Batch Number</th>
                <th className="text-left py-3 px-4">Item Code</th>
                <th className="text-left py-3 px-4">Quantity</th>
                <th className="text-left py-3 px-4">Cost per Item</th>
                <th className="text-left py-3 px-4">Total Cost</th>
                <th className="text-left py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 px-4">{item.date}</td>
                  <td className="py-3 px-4">{item.batchNumber}</td>
                  <td className="py-3 px-4">{item.itemCode}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">${item.productionCost}</td>
                  <td className="py-3 px-4">
                    ${(item.quantity * item.productionCost).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default Production;