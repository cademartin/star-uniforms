import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Settings as SettingsIcon, Database, Download, Save, Edit2, Trash2, Calendar, PlusCircle, UserPlus, Users } from 'lucide-react';
import { createBackup } from '../utils/backup';
import { useUserCredentialsStore } from '../stores/userCredentialsStore';
import { useProductionStore } from '../stores/productionStore';
import { useSalesStore } from '../stores/salesStore';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { credentials, isEditing, setCredentials, deleteCredentials, setIsEditing, users, addUser } = useUserCredentialsStore();

  const productionData = useProductionStore((state) => state.items);
  const salesData = useSalesStore((state) => state.items);

  const [showDatePicker, setShowDatePicker] = useState<'production' | 'sales' | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const datePickerRef = useRef<HTMLDivElement>(null);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user' as const,
  });

  useEffect(() => {
    if (isEditing && credentials) {
      setFormData({
        fullName: credentials.fullName,
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.password,
      });
    }
  }, [isEditing, credentials]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setCredentials({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    });

    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    
    setIsEditing(false);
    setError('');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your credentials?')) {
      deleteCredentials();
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    }
  };

  const handleBackup = () => {
    createBackup();
  };

  const exportToCSV = (data: any[], filename: string) => {
    // Convert object keys to CSV headers
    const headers = Object.keys(data[0] || {}).join(',');
    
    // Convert each data row to CSV format
    const rows = data.map(item => 
      Object.values(item).map(value => 
        // Handle values that might contain commas
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterDataByDateRange = (data: any[]) => {
    if (!dateRange.startDate && !dateRange.endDate) return data;

    return data.filter(item => {
      const itemDate = new Date(item.date);
      const start = dateRange.startDate ? new Date(dateRange.startDate) : new Date(0);
      const end = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
      
      return itemDate >= start && itemDate <= end;
    });
  };

  const handleExportWithDateRange = (type: 'production' | 'sales') => {
    const data = type === 'production' ? productionData : salesData;
    const filteredData = filterDataByDateRange(data);
    
    if (filteredData.length === 0) {
      alert(`No ${type} data found in the selected date range`);
      return;
    }

    const dateRangeString = dateRange.startDate && dateRange.endDate 
      ? `-${dateRange.startDate}-to-${dateRange.endDate}`
      : '';
    
    exportToCSV(filteredData, `${type}-data${dateRangeString}`);
    setShowDatePicker(null);
    setDateRange({ startDate: '', endDate: '' });
  };

  const handleAddUser = () => {
    addUser(newUserData);
    setNewUserData({
      fullName: '',
      email: '',
      password: '',
      role: 'user',
    });
    setShowAddUser(false);
  };

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold"
      >
        Settings
      </motion.h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white'
              : 'bg-white/30 hover:bg-white/50'
          }`}
        >
          <User size={20} />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'system'
              ? 'bg-purple-600 text-white'
              : 'bg-white/30 hover:bg-white/50'
          }`}
        >
          <SettingsIcon size={20} />
          System
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'data'
              ? 'bg-purple-600 text-white'
              : 'bg-white/30 hover:bg-white/50'
          }`}
        >
          <Database size={20} />
          Data Management
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/30 backdrop-blur-xl p-6 rounded-xl border border-white/20"
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 border border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* User Management Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">User Management</h2>
                </div>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Add User
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white/10 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="bg-white/5">
                        <td className="px-4 py-3 text-sm">{user.fullName}</td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-sm capitalize">{user.role}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={() => handleDelete()}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add User Modal */}
              {showAddUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg p-6 w-full max-w-md"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Add New User</h3>
                      <button
                        onClick={() => setShowAddUser(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={newUserData.fullName}
                          onChange={(e) =>
                            setNewUserData({ ...newUserData, fullName: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={newUserData.email}
                          onChange={(e) =>
                            setNewUserData({ ...newUserData, email: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={newUserData.password}
                          onChange={(e) =>
                            setNewUserData({ ...newUserData, password: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          value={newUserData.role}
                          onChange={(e) =>
                            setNewUserData({
                              ...newUserData,
                              role: e.target.value as 'admin' | 'user',
                            })
                          }
                          className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        onClick={() => setShowAddUser(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddUser}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add User
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">System Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-gray-600">
                    Enable dark mode for better visibility in low light
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications for important updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Data Management</h2>
            <div className="space-y-4">
              {/* Backup Section */}
              <div className="p-4 bg-white/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Data Backup
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Backup your production and sales data
                    </p>
                  </div>
                  <button
                    onClick={handleBackup}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Backup Now
                  </button>
                </div>
                <div className="mt-4 text-sm text-gray-500 space-y-1">
                  <p>• Automatic backups occur every Monday</p>
                  <p>• Backups are downloaded as JSON files</p>
                  <p>• Keep your backups in a safe location</p>
                </div>
              </div>

              {/* Export Section */}
              <div className="p-4 bg-white/20 rounded-lg">
                <h3 className="font-medium mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download your data in CSV format
                </p>
                <div className="flex gap-4 relative">
                  <div className="relative">
                    <button 
                      onClick={() => setShowDatePicker('production')}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Production Data
                      {productionData.length > 0 && (
                        <span className="ml-2 bg-purple-500 px-2 py-0.5 rounded-full text-xs">
                          {productionData.length}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowDatePicker('sales')}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Sales Data
                      {salesData.length > 0 && (
                        <span className="ml-2 bg-purple-500 px-2 py-0.5 rounded-full text-xs">
                          {salesData.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Date Range Picker Modal */}
                  {showDatePicker && (
                    <motion.div
                      ref={datePickerRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    >
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Select Date Range
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={dateRange.startDate}
                              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">End Date</label>
                            <input
                              type="date"
                              value={dateRange.endDate}
                              min={dateRange.startDate}
                              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            onClick={() => {
                              setShowDatePicker(null);
                              setDateRange({ startDate: '', endDate: '' });
                            }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleExportWithDateRange(showDatePicker)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Export
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Clear Data Section */}
              <div className="p-4 bg-white/20 rounded-lg">
                <h3 className="font-medium mb-2">Clear Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Warning: This action cannot be undone
                </p>
                <div className="flex gap-4">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Settings;