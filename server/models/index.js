/**
 * models/index.js
 * Central barrel export for all Mongoose models.
 * Import from here: import { User, Pet, Appointment } from '../models/index.js';
 */

export { default as User }             from './User.js';
export { default as Pet }              from './Pet.js';
export { default as HealthRecord }     from './HealthRecord.js';
export { default as Appointment }      from './Appointment.js';
export { default as Product }          from './Product.js';
export { default as Order }            from './Order.js';
export { default as AdoptionListing }  from './AdoptionListing.js';
export { default as AdoptionInterest } from './AdoptionInterest.js';
export { default as Review }           from './Review.js';
export { default as Notification }     from './Notification.js';
export { default as CareArticle }      from './CareArticle.js';
