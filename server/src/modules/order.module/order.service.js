import mongoose from "mongoose";
import orderRepo from "./order.repository.js";
import { calculateTotal } from "./orderUtils.js";
import { getProductById } from "../product/product.repository.js";
import * as rewardService from "../rewards/reward.service.js";
import * as couponService from "../coupon/coupon.service.js";
class OrderService {
  // 1) Create Order
   async createOrder(orderData) {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Snapshot item prices
      for (const item of orderData.items) {
        const prod = await getProductById(item.productId);
        if (!prod) throw new Error(`Product not found: ${item.productId}`);
        
        item.name = prod.name;
        item.img = prod.imgURL || prod.img || "";
        
        let price = prod.basePrice || 0;
        if (item.selectedOptions && prod.options) {
          for (const opt of prod.options) {
            const selected = item.selectedOptions?.[opt.name];
            if (!selected) continue;
            const choice = opt.choices?.find(c => c.label === selected);
            if (choice && choice.priceDelta) price += choice.priceDelta;
          }
        }
        item.price = price;
        item.itemPoints = prod.productPoints || 0;
      }

      // 2. Calculate subtotal (before discount)
      const subtotal = calculateTotal(orderData.items);
      orderData.subtotal = subtotal;
      
      // 3. Apply coupon if provided
      let discountAmount = 0;
      
      if (orderData.couponCode && !orderData.isRewardOrder) {
        const validation = await couponService.validateCouponService(
          orderData.couponCode,
          orderData.customerId,
          subtotal,
          orderData.restaurantId
        );
        
        if (!validation.valid) {
          throw new Error(validation.message);
        }
        
        discountAmount = validation.discountAmount;
        
        // Store coupon info in order
        orderData.appliedCoupon = {
          couponId: validation.coupon._id,
          code: orderData.couponCode,
          discountAmount: discountAmount,
        };
      }
      
      // 4. Calculate final total
      if (!orderData.isRewardOrder) {
        orderData.totalAmount = subtotal - discountAmount;
      } else {
        orderData.totalAmount = 0;
      }

      // 5. Create order
      const newOrder = await orderRepo.create(orderData, session);
      
      // 6. Record coupon usage
      if (orderData.appliedCoupon && orderData.appliedCoupon.couponId) {
        await couponService.applyCouponService(
          orderData.appliedCoupon.couponId,
          orderData.customerId,
          newOrder._id,
          discountAmount,
          session
        );
      }

      await session.commitTransaction();
      session.endSession();
      return newOrder;
      
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
  // 2) Get Order by ID
  async getOrder(orderId) {
    const order = await orderRepo.findById(orderId);
    if (!order) throw new Error("Order not found");
    return order;
  }
  // 3) Update Order Status (with reward awarding on transition to completed)
  async updateStatus(orderId, newStatus) {
    // We perform order status changes inside a DB transaction so that
    // awarding points and updating the order happen atomically.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await orderRepo.findById(orderId, { populate: [], lean: false, session });
      // Load the order document (not lean) so we can modify and save it in-session.
      if (!order) throw new Error("Order not found");

      const prevStatus = order.orderStatus; // remember previous state for transition checks

      // update the status in document
      order.orderStatus = newStatus; // update status on the Mongoose document

      // Only award points when transitioning to completed and not already awarded
      if (newStatus === "completed" && prevStatus !== "completed" && (!order.rewardPointsEarned || order.rewardPointsEarned === 0)) {
        // We only award points when transitioning TO completed and only once per order;
        // `rewardPointsEarned` is the idempotency guard.
        // compute points from the snapshot itemPoints
        let awardedPoints = 0;
          for (const it of order.items) {
            // For each order item use the snapshot `itemPoints` that was stored
            // at order creation time. `itemPoints` represents points per unit.
          const qty = it.quantity || 1;
          const pts = it.itemPoints || 0;
          awardedPoints += pts * qty;
        }

        if (awardedPoints > 0 && order.customerId) {
          // Call the reward service (business logic) to increment user points.
          // The reward service delegates DB operations to the repo, keeping
          // this service layer focused on business orchestration.
          await rewardService.awardPointsToUser(order.customerId, awardedPoints, session);
          order.rewardPointsEarned = awardedPoints; // snapshot awarded points onto order for audit & idempotency
        }
      }

      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
      return order;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
  // 4) Update Payment (status, method, stripeSessionId)
  async updatePayment(orderId, paymentStatus, paymentMethod = null, stripeSessionId = null) {
    return await orderRepo.updatePayment(orderId, paymentStatus, paymentMethod, stripeSessionId);
  }
  // 5) Update Reward Points (after reward system calculates them)
  async updateRewardPoints(orderId, rewardPoints) {
    return await orderRepo.updateRewardPoints(orderId, rewardPoints);
  }

  // 6) Add Item to Existing Order
  async addItemToOrder(orderId, item) {
    return await orderRepo.addItem(orderId, item);
  }

  // 7) Replace All Items in Order
  async updateOrderItems(orderId, items) {
    return await orderRepo.updateItems(orderId, items);
  }

  // 8) Update Total Amount
  async updateTotal(orderId, totalAmount) {
    return await orderRepo.updateTotal(orderId, totalAmount);
  }

  // 9) Update Table Number
  async updateTable(orderId, tableNumber) {
    return await orderRepo.updateTable(orderId, tableNumber);
  }
  // 10) Update Service Type
  async updateServiceType(orderId, serviceType) {
    return await orderRepo.updateServiceType(orderId, serviceType);
  }

  // 11) Mark Order as Reward Order
  async markAsRewardOrder(orderId, isReward = true) {
    return await orderRepo.markAsRewardOrder(orderId, isReward);
  }

  // 12) Get Orders for Restaurant (supports filtering by status & reward)
  async getOrdersForRestaurant(restaurantId, { status, isRewardOrder } = {}) {
    const filter = { restaurantId };
    if (status) filter.orderStatus = status;
    if (typeof isRewardOrder === "boolean") filter.isRewardOrder = isRewardOrder;
    return await orderRepo.search(filter);
  }

  // 13) Get Orders for Customer (supports filtering by reward)
  async getOrdersForCustomer(customerId, { isRewardOrder } = {}) {
    const filter = { customerId };
    if (typeof isRewardOrder === "boolean") filter.isRewardOrder = isRewardOrder;
    return await orderRepo.search(filter);
  }

  // 14) GET all orders
  async getAllOrders(){
    return await orderRepo.getAllOrders()
  }
}

export default new OrderService();
