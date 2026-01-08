import bookingRepository from "./booking.repository.js";
import tableRepository from "./table.repository.js";
import restaurantRepository from "../restaurant/restaurant.repository.js";
import { overlaps } from "./time.utils.js";

class BookingService {
  // create booking with checks
  async createBooking(data) {
    const { restaurantId, tableId, date, startTime, endTime, guests } = data;

    // Check restaurant and service toggle
    const restaurant = await restaurantRepository.findByRestaurantId(restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");
    if (!restaurant.services?.tableBookings?.enabled) {
      throw new Error("Table booking is disabled for this restaurant");
    }

    // If no tableId provided, try to auto-assign an available table
    let assignedTableId = tableId;
    if (!assignedTableId) {
      const tableService = await import("./table.service.js");
      const available = await tableService.default.checkAvailability({ restaurantId, date, time: startTime, guests });
      if (!available || available.length === 0) throw new Error("No available table for selected time");
      assignedTableId = available[0]._id;
      data.tableId = assignedTableId;
    }

    // Check table exists and capacity
    const table = await tableRepository.findById(assignedTableId);
    if (!table) throw new Error("Table not found");
    if (!table.isActive) throw new Error("Table is not active");
    if (String(table.restaurantId) !== String(restaurantId)) throw new Error("Table does not belong to this restaurant");
    if (guests > table.capacity) throw new Error("Number of guests exceeds table capacity");

    // Respect opening hours (systemSettings.landing.hours)
    try {
      const day = new Date(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const hours = restaurant.systemSettings?.landing?.hours?.[day];
      if (hours && hours.enabled) {
        const open = hours.open;
        const close = hours.close;
        if (!(startTime >= open && endTime <= close)) {
          throw new Error("Booking time is outside restaurant opening hours");
        }
      }
    } catch (err) {
      // If date parsing fails, let validation continue elsewhere
    }

    // Overlapping check for same table and date
    const existing = await bookingRepository.find({ restaurantId, tableId, date, status: { $ne: "cancelled" } });
    for (const b of existing) {
      if (overlaps(b.startTime, b.endTime, startTime, endTime)) {
        throw new Error("Table already booked for the selected time");
      }
    }

    // generate a bookingId if not provided
    if (!data.bookingId) {
      const now = new Date();
      const seq = Math.floor(Math.random() * 90000) + 10000;
      data.bookingId = `RES-${now.getFullYear()}-${seq}`;
    }
    if (!data.status) data.status = "confirmed";

    // All good, create
    const created = await bookingRepository.create(data);
    try {
      if (global.io) {
        // emit to cashiers and restaurant room
        global.io.to("cashier").emit("booking:new", created);
        if (created.restaurantId) global.io.to(`restaurant:${created.restaurantId}`).emit("booking:new", created);
      }
    } catch (e) {
      console.warn("Booking emit failed", e.message);
    }
    // Send notifications/email if service is available
    try {
      if (global.notificationService) {
        await global.notificationService.sendToRole('cashier', { title: 'New booking', body: `${created.customerName || 'Guest'} booked ${created.date} ${created.startTime}`, data: created });
      }
      // send email if available
      const mailer = await import('../../utils/Mailer.js');
      try {
        if (created.customerEmail) {
          await mailer.sendEmail(created.customerEmail, 'Booking confirmed', `Your booking ${created.bookingId} is confirmed.`);
        }
      } catch (e) {
        // non-fatal
      }
    } catch (e) {}
    return created;
  }

  async listBookings(restaurantId, date) {
    const filter = { restaurantId };
    if (date) filter.date = date;
    return await bookingRepository.find(filter);
  }

  async updateBookingStatus(id, updates) {
    const prev = await bookingRepository.findById(id);
    const updated = await bookingRepository.update(id, updates);
    // cascade: if booking is seated/completed/cancelled update table status
    try {
      if (updates.status && prev && prev.tableId) {
        const tableService = await import("./table.service.js");
        if (updates.status === "seated") {
          await tableService.default.updateTableStatus(prev.tableId, "occupied");
        } else if (updates.status === "completed" || updates.status === "cancelled" || updates.status === "no-show") {
          await tableService.default.updateTableStatus(prev.tableId, "available");
        } else if (updates.status === "reserved") {
          await tableService.default.updateTableStatus(prev.tableId, "reserved");
        }
      }
    } catch (e) {
      // non-fatal
    }
    try {
      if (global.io) {
        global.io.to("cashier").emit("booking:updated", updated);
        if (updated.restaurantId) global.io.to(`restaurant:${updated.restaurantId}`).emit("booking:updated", updated);
      }
    } catch (e) {
      console.warn("booking:updated emit failed", e.message);
    }
    return updated;
  }

  async cancelBooking(id) {
    const updated = await bookingRepository.update(id, { status: "cancelled" });
    try {
      if (global.io) {
        global.io.to("cashier").emit("booking:updated", updated);
        if (updated.restaurantId) global.io.to(`restaurant:${updated.restaurantId}`).emit("booking:updated", updated);
      }
    } catch (e) {}
    return updated;
  }

  async getTodayBookings(restaurantId) {
    const today = new Date().toISOString().slice(0, 10);
    return await bookingRepository.find({ restaurantId, date: today, status: { $ne: "cancelled" } });
  }

  async getUpcomingBookings(restaurantId, days = 7) {
    const result = [];
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayStr = d.toISOString().slice(0, 10);
      const list = await bookingRepository.find({ restaurantId, date: dayStr, status: { $ne: "cancelled" } });
      result.push(...list);
    }
    return result;
  }

  async getBookingsByDate(restaurantId, date) {
    return await bookingRepository.find({ restaurantId, date, status: { $ne: "cancelled" } });
  }

  async getBookingById(id) {
    return await bookingRepository.findById(id);
  }
}

export default new BookingService();
