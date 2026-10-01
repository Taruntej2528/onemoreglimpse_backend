import { createBaseCrud } from '../../utiles/crud/base.crud.js';
import { ClientRequest } from '../../utiles/models/ClientRequest.js';
import { Notification } from '../../utiles/models/Notification.js';

const baseCrud = createBaseCrud(ClientRequest);

export const ClientRequestService = {
  ...baseCrud,

  async submitRequest(data) {
    const request = await baseCrud.create(data);

    // Automatically trigger notification for admin
    await Notification.create({
      title: 'New Client Inquiry Received',
      message: `${request.clientName} submitted a new inquiry for ${request.eventType || 'Wedding Celebration'} (${request.eventCity || 'Destination'}).`,
      type: 'BOOKING',
      category: 'inquiry',
      metadata: {
        requestId: request._id,
        email: request.email,
        phone: request.phone,
      },
    }).catch((err) => console.error(`[Notification Trigger Error] ${err.message}`));

    return request;
  },

  async getAllRequests(options = {}) {
    const filter = {};
    if (options.status) filter.status = options.status;
    return baseCrud.find(filter, {
      ...options,
      searchFields: ['clientName', 'partnerName', 'email', 'phone', 'eventCity', 'venue'],
    });
  },

  async updateStatus(id, status) {
    const valid = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CONFIRMED', 'DECLINED'];
    if (!valid.includes(status)) {
      const err = new Error(`Invalid status: ${status}. Allowed: ${valid.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    return baseCrud.updateById(id, { status });
  },
};
