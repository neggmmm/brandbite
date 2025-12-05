// DirectOrderForm.jsx - Create direct orders from cashier
import React, { useState } from "react";
import { ShoppingCart, Loader2, DollarSign, User, X } from "lucide-react";
import MenuBrowser from "./MenuBrowser";
import api from "../../../api/axios";
import { useToast } from "../../../hooks/useToast";

export default function DirectOrderForm({ onOrderCreated, onCancel }) {
  const toast = useToast();
  const [step, setStep] = useState(1); // 1: Menu, 2: Customer & Payment
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [walkIn, setWalkIn] = useState(false);

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleItemSelect = (item) => {
    if (!selectedItems.find((i) => i.productId === item.productId)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleItemRemove = (productId) => {
    setSelectedItems(selectedItems.filter((i) => i.productId !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleItemRemove(productId);
      return;
    }

    setSelectedItems(
      selectedItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
          : item
      )
    );
  };

  const handleSubmitOrder = async () => {
    // Validation
    if (selectedItems.length === 0) {
      toast.error("Add at least one item to the order");
      return;
    }

    if (!walkIn && !customerName.trim()) {
      toast.error("Enter customer name or mark as Walk-In");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: selectedItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        })),
        customerName: walkIn ? "Walk-In Customer" : customerName,
        customerPhone: customerPhone || undefined,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod,
        subtotal,
        tax,
        totalAmount: total,
        orderType: "direct",
      };

      const response = await api.post("/api/orders/direct", orderData);
      
      if (response.data) {
        toast.success(`Order #${response.data._id?.slice(-6).toUpperCase()} created successfully!`);
        onOrderCreated(response.data);
        // Reset form
        setSelectedItems([]);
        setCustomerName("");
        setCustomerPhone("");
        setPaymentStatus("pending");
        setPaymentMethod("cash");
        setWalkIn(false);
        setStep(1);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error?.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">Create Direct Order</h2>
              <p className="text-green-100 text-sm">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="hover:bg-green-700 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-200">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                Select Items
              </h3>
              <MenuBrowser
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                onItemRemove={handleItemRemove}
                onQuantityChange={handleQuantityChange}
              />

              {/* Selected Items Summary */}
              {selectedItems.length > 0 && (
                <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-bold text-slate-900 mb-3">Selected Items ({selectedItems.length})</h4>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-bold text-amber-600">
                          ${item.totalPrice?.toFixed(2) || (item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-green-300 pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-700">Subtotal:</span>
                      <span className="font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span className="text-slate-700">Tax (10%):</span>
                      <span className="font-bold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-amber-600">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Information
                </h3>

                <div className="space-y-4">
                  {/* Walk-In Toggle */}
                  <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={walkIn}
                      onChange={(e) => setWalkIn(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                    <span className="font-bold text-slate-900">Walk-In Customer (no name required)</span>
                  </label>

                  {/* Customer Name */}
                  {!walkIn && (
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  )}

                  {/* Phone */}
                  <input
                    type="tel"
                    placeholder="Customer Phone (optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Payment Information
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h4 className="font-bold text-slate-900 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Items:</span>
                    <span className="font-bold">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Subtotal:</span>
                    <span className="font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Tax:</span>
                    <span className="font-bold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-amber-600 border-t border-amber-300 pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={selectedItems.length === 0 || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Continue to Payment
            </button>
          ) : (
            <button
              onClick={handleSubmitOrder}
              disabled={loading || (selectedItems.length === 0 && !walkIn && !customerName)}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Create Order
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
