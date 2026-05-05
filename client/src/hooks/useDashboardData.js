import { useState, useCallback } from 'react';
import api from '../services/httpServices';

export const useDashboardData = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalRevenue: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [packagingOptions, setPackagingOptions] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch products with ingredients
      const productsRes = await api.get('/admin/recipe-ingredients');
      setProducts(productsRes.data.data || []);

      // Fetch orders
      const ordersRes = await api.get('/orders');
      setOrders(ordersRes.data || []);

      // Calculate stats
      const totalRevenue = (ordersRes.data || []).reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      setStats({
        totalOrders: ordersRes.data?.length || 0,
        totalProducts: productsRes.data.data?.length || 0,
        totalRevenue: totalRevenue.toFixed(2)
      });

      // Fetch packaging options
      const packagingRes = await api.get('/admin/packaging-options');
      setPackagingOptions(packagingRes.data || []);

      // Fetch ingredients
      const ingredientsRes = await api.get('/admin/ingredients');
      setAvailableIngredients(ingredientsRes.data || []);

      // Fetch categories
      const categoriesRes = await api.get('/admin/categories');
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMessage('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  return {
    stats,
    setStats,
    products,
    setProducts,
    orders,
    setOrders,
    packagingOptions,
    setPackagingOptions,
    availableIngredients,
    setAvailableIngredients,
    categories,
    setCategories,
    loading,
    setLoading,
    message,
    setMessage,
    fetchDashboardData,
    clearMessage
  };
};
