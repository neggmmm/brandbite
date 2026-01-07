import bookingService from "./booking.service.js";

class BookingController {
  async create(req, res, next) {
    try {
      const created = await bookingService.createBooking(req.body);
      res.status(201).json(created);
    } catch (err) {
      // Log full stack for easier debugging of server 500s
      try {
        console.error("Booking create error:", err && err.stack ? err.stack : err);
      } catch (logErr) {
        console.error("Error logging booking error:", logErr);
      }
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const { restaurantId, date } = req.query;
      const items = await bookingService.listBookings(restaurantId, date);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await bookingService.updateBookingStatus(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const cancelled = await bookingService.cancelBooking(id);
      res.json(cancelled);
    } catch (err) {
      next(err);
    }
  }

  async getToday(req, res, next) {
    try {
      const { restaurantId } = req.query;
      const items = await bookingService.getTodayBookings(restaurantId);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getUpcoming(req, res, next) {
    try {
      const { restaurantId } = req.query;
      const items = await bookingService.getUpcomingBookings(restaurantId);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getByDate(req, res, next) {
    try {
      const { date } = req.params;
      const { restaurantId } = req.query;
      const items = await bookingService.getBookingsByDate(restaurantId, date);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await bookingService.getBookingById(id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await bookingService.updateBookingStatus(id, { status });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

export default new BookingController();
