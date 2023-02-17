/* Utility models for data payload passing purposes */

/**
 * Model for an object that contains array of items.
 */
export interface ItemsContainer<T> {
  items: T[];
}

/**
 * Model for an object that contains nullable item where 'null' represents (explicit) absent value.
 */
export interface ItemContainer<T> {
  item: T | null;
}

/**
 * Model for an object that contains error message.
 */
export interface ErrorContainer {
  error: string;
}

/**
 * Payload with 'id' field.
 */
export interface PayloadWithId<T> {
  id: T;
}

/**
 * Item with ordinal (number).
 */
export type ItemWithOrdinal<T> = T & {
  ordinal: number;
};
