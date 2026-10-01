import { createBaseCrud } from '../../utiles/crud/base.crud.js';
import { Event } from '../../utiles/models/Event.js';

const baseCrud = createBaseCrud(Event);

export const EventService = {
  ...baseCrud,

  async getAllEvents(options = {}) {
    const filter = {};
    if (options.type) filter.type = options.type;
    return baseCrud.find(filter, {
      ...options,
      searchFields: ['name', 'couple', 'venue', 'city', 'eventType', 'package', 'badge', 'idealFor', 'team', 'description'],
    });
  },

  async getActivePackages() {
    return Event.find({ type: 'package', isActive: true });
  },

  async getActiveEventTypes() {
    return Event.find({ type: 'event_type', isActive: true });
  },
};
