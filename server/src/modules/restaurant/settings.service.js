// settings.service.js - ENHANCED VERSION
import restaurantRepository from "./restaurant.repository.js";

class SettingsService {
  // ========== SERVICE SETTINGS ==========
  async getServiceSettings(selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant.services || {};
  }

  async updateServices(services, selector = {}) {
    try {
      const restaurant = await restaurantRepository.findOne(selector);
      if (!restaurant) throw new Error('Restaurant not found');

      const updateData = { services: { ...restaurant.services, ...services } };
      return await restaurantRepository.update(restaurant._id, updateData);
    } catch (err) {
      console.error('updateServices error', err);
      throw err;
    }
  }

  async toggleService(service, enabled, selector = {}) {
    try {
      const restaurant = await restaurantRepository.findOne(selector);
      if (!restaurant) throw new Error('Restaurant not found');

      if (!restaurant.services[service]) throw new Error(`Invalid service: ${service}`);

      const updateData = { services: { ...restaurant.services, [service]: { ...restaurant.services[service], enabled } } };

      return await restaurantRepository.update(restaurant._id, updateData);
    } catch (err) {
      console.error('toggleService error', err);
      throw err;
    }
  }

  // ========== PAYMENT SETTINGS ==========
  async getPaymentSettings(selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant.paymentMethods || [];
  }

  async addPaymentMethod(method, selector = {}) {
    try {
      const restaurant = await restaurantRepository.findOne(selector);
      if (!restaurant) throw new Error('Restaurant not found');

      const exists = restaurant.paymentMethods.find(pm => pm.name.toLowerCase() === method.name.toLowerCase());
      if (exists) throw new Error('Payment method already exists');

      return await restaurantRepository.addToArray('paymentMethods', method, selector);
    } catch (err) {
      console.error('addPaymentMethod error', err);
      throw err;
    }
  }

  async updatePaymentMethod(methodId, updates, selector = {}) {
    // Support both numeric index IDs (legacy) and Mongo _id strings
    const maybeIndex = parseInt(methodId);
    if (!isNaN(maybeIndex)) {
      return await restaurantRepository.updateInArrayByIndex("paymentMethods", maybeIndex, updates, selector);
    }

    // Treat as _id
    return await restaurantRepository.updateInArrayById("paymentMethods", methodId, updates, selector);
  }

  async removePaymentMethod(methodId) {
    const maybeIndex = parseInt(methodId);
    if (!isNaN(maybeIndex)) {
      return await restaurantRepository.removeFromArrayByIndex("paymentMethods", maybeIndex);
    }

    // Treat as _id
    return await restaurantRepository.removeFromArrayById("paymentMethods", methodId);
  }

  async togglePaymentMethod(methodId, enabled) {
    return await this.updatePaymentMethod(methodId, { enabled });
  }

  // ========== WEBSITE DESIGN ==========
  async getWebsiteDesign(selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant.websiteDesign || {};
  }

  async updateWebsiteDesign(design, selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');

    const updateData = { websiteDesign: { ...restaurant.websiteDesign, ...design } };
    return await restaurantRepository.update(restaurant._id, updateData);
  }

  async updateWebsiteColors(colors, selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');

    const updateData = { websiteDesign: { ...restaurant.websiteDesign, colors: { ...restaurant.websiteDesign.colors, ...colors } } };
    return await restaurantRepository.update(restaurant._id, updateData);
  }

  // ========== INTEGRATIONS ==========
  async getIntegrations(selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant.integrations || {};
  }

  async updateIntegration(integration, settings, selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');

    if (!restaurant.integrations[integration]) throw new Error(`Invalid integration: ${integration}`);

    const updateData = { integrations: { ...restaurant.integrations, [integration]: { ...restaurant.integrations[integration], ...settings } } };
    return await restaurantRepository.update(restaurant._id, updateData);
  }

  async toggleIntegration(integration, enabled) {
    return await this.updateIntegration(integration, { enabled });
  }

  // ========== CONTENT MANAGEMENT ==========
  async getFAQs(selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant.faqs || [];
  }

  async updateFAQs(faqs, selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');
    const updateData = { faqs };
    return await restaurantRepository.update(restaurant._id, updateData);
  }

  async addFAQ(faq, selector = {}) {
    return await restaurantRepository.addToArray("faqs", faq, selector);
  }

  async updateFAQ(faqId, faqUpdates, selector = {}) {
    try {
      return await restaurantRepository.updateInArrayById('faqs', faqId, faqUpdates, selector);
    } catch (err) {
      console.error('updateFAQ error', err);
      throw err;
    }
  }

  async removeFAQ(faqId, selector = {}) {
    try {
      return await restaurantRepository.removeFromArrayById('faqs', faqId, selector);
    } catch (err) {
      console.error('removeFAQ error', err);
      throw err;
    }
  }

  async getPolicies(selector = {}) {
    const restaurant = await restaurantRepository.findOne(selector);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant.policies || {};
  }

  async updatePolicies(policies, selector = {}) {
    try {
      const restaurant = await restaurantRepository.findOne(selector);
      if (!restaurant) throw new Error('Restaurant not found');

      const updateData = { policies: { ...restaurant.policies, ...policies } };
      return await restaurantRepository.update(restaurant._id, updateData);
    } catch (err) {
      console.error('updatePolicies error', err);
      throw err;
    }
  }

  
}

export default new SettingsService();