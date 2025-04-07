/**
 * Represents an item in the inventory
 */
export const ITEM_TYPES = {
  ACTIVE: true,
  INACTIVE: false
};

// This would be a TypeScript interface in a .ts file
// Here we're using JSDoc for type documentation
/**
 * @typedef {Object} Item
 * @property {number} id - Unique identifier
 * @property {string} name - Item name
 * @property {string} description - Item description
 * @property {number} price - Item price in cents
 * @property {boolean} is_active - Whether the item is active
 * @property {string} created_at - ISO date string of creation time
 * @property {string} updated_at - ISO date string of last update time
 */ 