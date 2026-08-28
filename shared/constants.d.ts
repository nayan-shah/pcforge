export const COMPONENT_CATEGORIES: readonly string[];

export interface BuilderSlot {
  key: string;
  title: string;
  description: string;
  accepts: string[];
}

export const BUILDER_SLOTS: readonly BuilderSlot[];

export const STOCK_STATUSES: readonly string[];

export const USER_ROLES: readonly string[];
