import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSalesStore } from '../stores/salesStore';
import { format } from 'date-fns';

function Sales() {
  const { items, addItem } = useSalesStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    itemName: '',
    itemCode: '',
    itemColor: '',
    itemSize: '',
    quantity: '',
    sellingPrice: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem({
      ...formData,
      quantity: Number(formData.quantity),
      sellingPrice: Number(formData.sellingPrice),
    });
    setShowForm(false);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      itemName: '',
      itemCode: '',
      itemColor: '',
      itemSize: '',
      quantity: '',
      sellingPrice: '',
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
          Sales Data
        </motion.h1>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Sale Entry'}
        </motion.button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white/30 backdrop-blur-xl p-6 rounded-xl border border-white/20 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
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
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) =>
                  setFormData({ ...formData, itemName: e.target.value })
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
                Color
              </label>
              <input
                type="text"
                value={formData.itemColor}
                onChange={(e) =>
                  setFormData({ ...formData, itemColor: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <input
                type="text"
                value={formData.itemSize}
                onChange={(e) =>
                  setFormData({ ...formData, itemSize: e.target.value })
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
                Selling Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: e.target.value })
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
              Save Sale Entry
            </button>
          </div>
        </motion.form>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/30 backdrop-blur-xl p-6 rounded-xl border border-white/20"
      >
        <h2 className="text-xl font-semibold mb-4">Sales History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Time</th>
                <th className="text-left py-3 px-4">Item Name</th>
                <th className="text-left py-3 px-4">Code</th>
                <th className="text-left py-3 px-4">Color</th>
                <th className="text-left py-3 px-4">Size</th>
                <th className="text-left py-3 px-4">Quantity</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 px-4">{item.date}</td>
                  <td className="py-3 px-4">{item.time}</td>
                  <td className="py-3 px-4">{item.itemName}</td>
                  <td className="py-3 px-4">{item.itemCode}</td>
                  <td className="py-3 px-4">{item.itemColor}</td>
                  <td className="py-3 px-4">{item.itemSize}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">${item.sellingPrice}</td>
                  <td className="py-3 px-4">
                    ${(item.quantity * item.sellingPrice).toFixed(2)}
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

export default Sales;