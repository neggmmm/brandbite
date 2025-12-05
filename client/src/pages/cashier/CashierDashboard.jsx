// CashierDashboard.jsx - Main cashier dashboard
import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, BarChart3, TrendingUp } from "lucide-react";
import OrdersTab from "./components/OrdersTab";
import DirectOrderTab from "./components/DirectOrderTab";
import api from "../../api/axios";
import { useToast } from "../../hooks/useToast";

export default function CashierDashboard() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("orders");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    pendingPayments: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch statistics
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/api/orders");
      const orders = response.data.data || response.data || [];

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      const activeOrders = orders.filter(
        (o) => ["pending", "confirmed", "preparing", "ready"].includes(o.status)
      ).length;
      const pendingPayments = orders.filter((o) => o.paymentStatus === "pending").length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        activeOrders,
        pendingPayments,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleOrderCreated = (order) => {
    toast.success(`Order created successfully!`);
    setRefreshKey((prev) => prev + 1);
    fetchStats();
    // Switch to orders tab to see the new order
    setActiveTab("orders");
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    fetchStats();
    toast.success("Refreshed!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Cashier Dashboard
              </h1>
              <p className="text-amber-100 text-sm mt-1">Manage orders and take payments</p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-bold">TOTAL ORDERS</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-bold">TOTAL REVENUE</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-bold">ACTIVE ORDERS</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.activeOrders}</p>
              </div>
              <Plus className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-bold">PENDING PAYMENTS</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.pendingPayments}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 px-6 py-4 font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-amber-50 text-amber-700 border-b-4 border-amber-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              📋 Manage Orders
            </button>
            <button
              onClick={() => setActiveTab("direct")}
              className={`flex-1 px-6 py-4 font-bold transition-all ${
                activeTab === "direct"
                  ? "bg-green-50 text-green-700 border-b-4 border-green-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              ➕ Direct Order
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "orders" && <OrdersTab key={refreshKey} />}
            {activeTab === "direct" && <DirectOrderTab onOrderCreated={handleOrderCreated} />}
          </div>
        </div>
      </div>
    </div>
  );
}
