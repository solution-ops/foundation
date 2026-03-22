import { itemAuditActionEnum } from "@foundation/db/schemas/item-audit-logs";
import { z } from "zod";

// --- Enums ---

export const itemAuditActionValues = itemAuditActionEnum.enumValues;
export const itemAuditActionSchema = z.enum(itemAuditActionValues);

export type ItemAuditAction = z.infer<typeof itemAuditActionSchema>;

// --- Response schemas ---

export const itemAuditLogSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  userId: z.string(),
  action: itemAuditActionSchema,
  beforeState: z.unknown().nullable(),
  afterState: z.unknown().nullable(),
  timestamp: z.string().datetime(),
});

export const itemActivityResponseSchema = z.object({
  activity: z.array(itemAuditLogSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});

// --- Query schema ---

export const itemActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

export type ItemActivityQuery = z.infer<typeof itemActivityQuerySchema>;
