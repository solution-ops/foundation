export const CATEGORY_COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export const MAX_CATEGORIES_PER_USER = 20;
export const MAX_CATEGORY_NAME_LENGTH = 50;
