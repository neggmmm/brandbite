import tableService from "./table.service.js";

class TableController {
  async create(req, res, next) {
    try {
      const data = req.body;
      const created = await tableService.createTable(data);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const { restaurantId } = req.query;
      const items = await tableService.listTables(restaurantId);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await tableService.updateTable(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const removed = await tableService.deleteTable(id);
      res.json({ success: true, removed });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await tableService.updateTableStatus(id, status);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async getFloorPlan(req, res, next) {
    try {
      const { restaurantId } = req.query;
      const plan = await tableService.getFloorPlan(restaurantId);
      res.json(plan);
    } catch (err) {
      next(err);
    }
  }

  async getAvailability(req, res, next) {
    try {
      const { restaurantId, date, time, guests } = req.query;
      const available = await tableService.checkAvailability({ restaurantId, date, time, guests });
      res.json(available);
    } catch (err) {
      next(err);
    }
  }

  async getByCapacity(req, res, next) {
    try {
      const { restaurantId, minCapacity } = req.query;
      const tables = await tableService.getByCapacity(restaurantId, minCapacity);
      res.json(tables);
    } catch (err) {
      next(err);
    }
  }
}

export default new TableController();
