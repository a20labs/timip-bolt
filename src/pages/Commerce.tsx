import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Eye, Edit, Trash2, Package, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const mockProducts = [
  {
    id: '1',
    name: 'Midnight Dreams Vinyl',
    price: 29.99,
    inventory: 150,
    sold: 23,
    status: 'Active',
    image: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'Band T-Shirt (Black)',
    price: 24.99,
    inventory: 85,
    sold: 67,
    status: 'Active',
    image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Exclusive NFT Collection',
    price: 0.05,
    inventory: 1000,
    sold: 234,
    status: 'Active',
    image: 'https://images.pexels.com/photos/8369769/pexels-photo-8369769.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'Sarah Johnson', product: 'Midnight Dreams Vinyl', amount: 29.99, status: 'Shipped' },
  { id: 'ORD-002', customer: 'Mike Chen', product: 'Band T-Shirt (Black)', amount: 24.99, status: 'Processing' },
  { id: 'ORD-003', customer: 'Emma Davis', product: 'Exclusive NFT #127', amount: 0.05, status: 'Completed' },
];

export function Commerce() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commerce</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your products, orders, and merchandise
          </p>
        </div>
        <Button onClick={() => setShowAddProduct(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { name: 'Total Products', value: '12', icon: Package, color: 'text-primary-600' },
          { name: 'Total Orders', value: '324', icon: ShoppingBag, color: 'text-secondary-600' },
          { name: 'Revenue (30d)', value: '$2,847', icon: DollarSign, color: 'text-green-600' },
          { name: 'Conversion Rate', value: '3.2%', icon: Eye, color: 'text-accent-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'products', name: 'Products' },
          { id: 'orders', name: 'Orders' },
          { id: 'nfts', name: 'NFTs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden" hover>
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      {product.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-bold text-primary-600 mb-2">
                    ${product.price}
                  </p>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>In stock: {product.inventory}</span>
                    <span>Sold: {product.sold}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      ${order.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : order.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* NFTs Tab */}
      {activeTab === 'nfts' && (
        <Card className="p-6">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              NFT Collection Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create and manage your exclusive NFT collections on Algorand
            </p>
            <Button>Launch NFT Collection</Button>
          </div>
        </Card>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddProduct(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add New Product
            </h3>
            <div className="space-y-4">
              <Input label="Product Name" placeholder="Enter product name" />
              <Input label="Price" type="number" placeholder="0.00" />
              <Input label="Inventory" type="number" placeholder="0" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option>Physical Product</option>
                  <option>Digital Download</option>
                  <option>NFT</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </Button>
                <Button>Add Product</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}