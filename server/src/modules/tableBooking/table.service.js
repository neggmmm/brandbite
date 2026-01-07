import tableRepository from "./table.repository.js";

class TableService {
  async createTable(data) {
    return await tableRepository.create(data);
  }

  async listTables(restaurantId) {
    return await tableRepository.find({ restaurantId });
  }

  async updateTable(id, updates) {
    return await tableRepository.update(id, updates);
  }

  async deleteTable(id) {
    return await tableRepository.delete(id);
  }

  async updateTableStatus(id, status) {
    const updated = await tableRepository.update(id, { status });
    try {
      if (global.io) {
        global.io.emit("table:updated", updated);
        if (updated.restaurantId) global.io.to(`restaurant:${updated.restaurantId}`).emit("table:updated", updated);
      }
    } catch (e) {
      console.warn("table:updated emit failed", e.message);
    }
    return updated;
  }

  async getFloorPlan(restaurantId) {
    // return all tables for floor plan (includes position fields if present)
    return await tableRepository.find({ restaurantId });
  }

  async getByCapacity(restaurantId, minCapacity) {
    const filter = { restaurantId };
    if (minCapacity) filter.capacity = { $gte: Number(minCapacity) };
    return await tableRepository.find(filter);
  }

  async checkAvailability({ restaurantId, date, time, guests }) {
    // naive availability: find tables with capacity >= guests and not booked at that date/time
    const candidates = await tableRepository.find({ restaurantId, capacity: { $gte: Number(guests) }, isActive: true });
    const bookingRepo = await import("./booking.repository.js");
    const bookings = await bookingRepo.default.find({ restaurantId, date, status: { $ne: "cancelled" } });

    const { overlaps } = await import("./time.utils.js");
    const available = candidates.filter((t) => {
      const conflict = bookings.some((b) => String(b.tableId) === String(t._id) && overlaps(b.startTime, b.endTime, time, time));
      return !conflict;
    });
    return available;
  }
}

export default new TableService();
