// OrdersTab.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { Loader2, Trash2, AlertCircle } from "lucide-react";
import api from "../../../api/axios";
import socketClient from "../../../utils/socketRedux";
import { useToast } from "../../../hooks/useToast";
import { useSelector } from "react-redux";
import FilterBar from "./FilterBar";
import SortBar from "./SortBar";
import OrderCard from "./OrderCard";
import OrderDetailsModal from "./OrderDetailsModal";
import StatusUpdateModal from "./StatusUpdateModal";
import PaymentUpdateModal from "./PaymentUpdateModal";
import { useTranslation } from "react-i18next";

export default function OrdersTab() {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateOrder, setStatusUpdateOrder] = useState(null);
  const [paymentUpdateOrder, setPaymentUpdateOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  // Socket setup - SIMPLIFIED AND FIXED
  useEffect(() => {
    const socket = socketClient.getSocket() || socketClient.initSocket();
    
    if (!socket) {
      console.error("❌ [CASHIER] Socket not initialized");
      return;
    }

    console.log("🔌 [CASHIER] Setting up socket listeners");

    // Wait for connection
    const handleConnect = () => {
      console.log("✅ [CASHIER] Socket connected:", socket.id);
      
      // Register user and join rooms
      if (user?._id) {
        console.log("📝 [CASHIER] Registering user:", user._id, "role:", user.role);
        socket.emit("register", user._id);
        
        if (user.role) {
          socket.emit("joinRole", user.role);
        }
        
        if (user.role === "cashier" || user.role === "admin") {
          console.log("🏪 [CASHIER] Joining cashier room");
          socket.emit("joinCashier");
        }
      }
      
      setSocketReady(true);
    };

    // Handle connection
    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    // ===== ORDER CREATED/NEW EVENTS =====
    const handleNewOrder = (order) => {
      console.log("✅ [CASHIER] New order received:", order?.orderNumber, order?._id);
      
      if (!order || !order._id) {
        console.warn("⚠️ [CASHIER] Invalid order received:", order);
        return;
      }

      setOrders((prevOrders) => {
        // Check if order already exists
        const exists = prevOrders.some(o => o._id === order._id);
        if (exists) {
          console.log("ℹ️ [CASHIER] Order already exists, skipping:", order._id);
          return prevOrders;
        }
        
        console.log("➕ [CASHIER] Adding new order to list");
        return [order, ...prevOrders];
      });
      
      toast.showToast({
        message: `📋 ${t("new_order")}: #${order.orderNumber} ${t("from")} ${order.customerInfo?.name || t("guest")}`,
        type: "success",
        duration: 5000,
      });
    };

    // ===== STATUS CHANGE EVENTS =====
    const handleStatusChange = (data) => {
      console.log("🔄 [CASHIER] Order status changed:", data);
      
      const orderId = data._id || data.orderId;
      if (!orderId) return;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: data.status,
                estimatedReadyTime: data.estimatedReadyTime || order.estimatedReadyTime,
              }
            : order
        )
      );

      // Update modal if open
      if (statusUpdateOrder?._id === orderId) {
        setStatusUpdateOrder((prev) => prev ? ({
          ...prev,
          status: data.status,
          estimatedReadyTime: data.estimatedReadyTime || prev.estimatedReadyTime,
        }) : null);
      }
    };

    // ===== PAYMENT CHANGE EVENTS =====
    const handlePaymentChange = (data) => {
      console.log("💳 [CASHIER] Order payment changed:", data);
      
      const orderId = data._id || data.orderId;
      if (!orderId) return;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                paymentStatus: data.paymentStatus,
                paidAt: data.paidAt || order.paidAt,
              }
            : order
        )
      );

      // Update modal if open
      if (paymentUpdateOrder?._id === orderId) {
        setPaymentUpdateOrder((prev) => prev ? ({
          ...prev,
          paymentStatus: data.paymentStatus,
          paidAt: data.paidAt || prev.paidAt,
        }) : null);
      }
    };

    // ===== REGISTER ALL EVENT LISTENERS =====
    
    // New order events (multiple event names for compatibility)
    socket.on("order:new", handleNewOrder);
    socket.on("order:created", handleNewOrder);
    socket.on("order:direct", handleNewOrder);
    socket.on("order:new:paid", handleNewOrder);
    socket.on("order:new:online", handleNewOrder);
    socket.on("order:new:instore", handleNewOrder);

    // Status change events
    socket.on("order:status-changed", handleStatusChange);
    socket.on("order:your-status-changed", handleStatusChange);
    socket.on("order:updated", handleStatusChange);

    // Payment events
    socket.on("order:payment-updated", handlePaymentChange);
    socket.on("order:your-payment-updated", handlePaymentChange);
    socket.on("order:payment:success", handlePaymentChange);

    // Connection events
    socket.on("disconnect", () => {
      console.log("❌ [CASHIER] Socket disconnected");
      setSocketReady(false);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ [CASHIER] Socket connect error:", error);
    });

    // ===== CLEANUP =====
    return () => {
      console.log("🧹 [CASHIER] Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("order:new", handleNewOrder);
      socket.off("order:created", handleNewOrder);
      socket.off("order:direct", handleNewOrder);
      socket.off("order:new:paid", handleNewOrder);
      socket.off("order:new:online", handleNewOrder);
      socket.off("order:new:instore", handleNewOrder);
      socket.off("order:status-changed", handleStatusChange);
      socket.off("order:your-status-changed", handleStatusChange);
      socket.off("order:updated", handleStatusChange);
      socket.off("order:payment-updated", handlePaymentChange);
      socket.off("order:your-payment-updated", handlePaymentChange);
      socket.off("order:payment:success", handlePaymentChange);
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [user, statusUpdateOrder, paymentUpdateOrder, t, toast]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("api/orders/all-orders-rewards");
      setOrders(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.showToast({message: t("admin.failed_load_orders")});
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => activeFilter === "all" || order.status === activeFilter)
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      const aItems = a.items?.length || 0;
      const bItems = b.items?.length || 0;

      switch (activeSort) {
        case "newest":
          return bTime - aTime;
        case "oldest":
          return aTime - bTime;
        case "fewest_items":
          return aItems - bItems;
        case "most_items":
          return bItems - aItems;
        default:
          return 0;
      }
    });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await api.patch(`api/orders/${orderId}/status`, {
        status: newStatus,
      });

      const updatedOrder = response.data.data || response.data;
      setOrders(orders.map((o) => (o._id === orderId ? updatedOrder : o)));
      toast.showToast({message: t("admin.order_status_updated")});
      setStatusUpdateOrder(null);
    } catch (error) {
      toast.showToast({message: t("admin.failed_update_status")});
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePayment = async (orderId, newPaymentStatus) => {
    try {
      setUpdatingPayment(true);
      const response = await api.patch(`api/orders/${orderId}/payment`, {
        paymentStatus: newPaymentStatus,
      });

      const updatedOrder = response.data.data || response.data;
      setOrders(orders.map((o) => (o._id === orderId ? updatedOrder : o)));
      toast.showToast({message: t("payment_status_updated")});
      setPaymentUpdateOrder(null);
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.showToast({message: t("failed_update_payment")});
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(t("admin.delete_confirm"))) {
      return;
    }

    try {
      setDeletingId(orderId);
      await api.delete(`api/orders/${orderId}`);
      setOrders(orders.filter((o) => o._id !== orderId));
      toast.showToast({message: t("admin.order_deleted")});
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.showToast({message:"Failed to delete order"});
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
          <p className="text-slate-600 font-medium">{t("loading_orders")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Socket Status Indicator (for debugging) */}
      {!socketReady && (
        <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900 dark:border-yellow-600 rounded-lg p-3">
          <p className="text-sm text-yellow-900 dark:text-yellow-50">
            ⚠️ Connecting to real-time updates...
          </p>
        </div>
      )}

      {/* Filters and Sorting */}
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <SortBar activeSort={activeSort} onSortChange={setActiveSort} />

      {/* Orders Count */}
      <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900 dark:border-blue-600 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-50">
          <span className="font-bold">{filteredOrders.length}</span> {t("orders_found")}
        </p>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div>
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onViewDetails={setSelectedOrder}
              onUpdateStatus={setStatusUpdateOrder}
              onUpdatePayment={setPaymentUpdateOrder}
              onDelete={handleDeleteOrder}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t("no_orders_found")}</h3>
          <p className="text-slate-600">
            {activeFilter !== "all"
              ? `${t("no")} ${t("admin." + activeFilter)} ${t("orders_lower")}`
              : t("no_orders_yet")}
          </p>
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {statusUpdateOrder && (
        <StatusUpdateModal
          order={statusUpdateOrder}
          onClose={() => setStatusUpdateOrder(null)}
          onUpdate={handleUpdateStatus}
          loading={updatingStatus}
        />
      )}

      {paymentUpdateOrder && (
        <PaymentUpdateModal
          order={paymentUpdateOrder}
          onClose={() => setPaymentUpdateOrder(null)}
          onUpdate={handleUpdatePayment}
          loading={updatingPayment}
        />
      )}
    </div>
  );
}