import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

/**
 * Entry status validation schema
 */
export const EntryStatusSchema = z.enum(['active', 'archived']);

/**
 * Currency validation schema (3-letter ISO codes)
 */
export const CurrencySchema = z
    .string()
    .length(3, 'Currency must be a 3-letter ISO code')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters only')
    .transform((val) => val.toUpperCase());

/**
 * Date validation schema that accepts Date or Timestamp
 */
export const DateInputSchema = z.union([
    z.date(),
    z.instanceof(Timestamp),
    z
        .string()
        .datetime()
        .transform((str) => new Date(str)),
]);

/**
 * Base Entry schema that matches the model
 */
const BaseEntrySchema = {
    uid: z.string().min(1, 'User ID is required'),
    date: DateInputSchema,
    spend: z
        .number()
        .min(0, 'Spend must be greater than or equal to 0')
        .max(1000000, 'Spend must be less than 1,000,000')
        .default(0),
    // NEW: Total revenue (preferred over earnings when present)
    revenue: z
        .number()
        .min(0, 'Revenue must be greater than or equal to 0')
        .max(1000000, 'Revenue must be less than 1,000,000')
        .optional(),
    // NEW: Persisted profit for convenience (redundant, derived from revenue - spend)
    profit: z
        .number()
        .min(-1000000, 'Profit must be greater than or equal to -1,000,000')
        .max(1000000, 'Profit must be less than 1,000,000')
        .optional(),
    // NEW: Per-network ad spend breakdowns (legacy map for backward compatibility)
    adSpend: z
        .object({
            facebook: z.record(z.string(), z.number().nonnegative()).optional(),
            newsbreak: z.record(z.string(), z.number().nonnegative()).optional(),
            tiktok: z.record(z.string(), z.number().nonnegative()).optional(),
        })
        .partial()
        .optional(),
    // NEW: Detailed per-account ad spend with id/name/spend
    adSpendDetails: z
        .object({
            facebook: z
                .array(
                    z.object({
                        id: z.string().min(1),
                        name: z.string().trim().optional(),
                        spend: z.number().nonnegative(),
                    })
                )
                .optional(),
            newsbreak: z
                .array(
                    z.object({
                        id: z.string().min(1),
                        name: z.string().trim().optional(),
                        spend: z.number().nonnegative(),
                    })
                )
                .optional(),
            tiktok: z
                .array(
                    z.object({
                        id: z.string().min(1),
                        name: z.string().trim().optional(),
                        spend: z.number().nonnegative(),
                    })
                )
                .optional(),
        })
        .partial()
        .optional(),
    // NEW: Per-network revenue breakdowns
    revenueSources: z
        .object({
            maxbounty: z.number().nonnegative().optional(),
            performcb: z.number().nonnegative().optional(),
            cashnetwork: z.number().nonnegative().optional(),
            point2web: z.number().nonnegative().optional(),
        })
        .partial()
        .optional(),
    currency: z.literal('USD').default('USD'),
    status: EntryStatusSchema.default('active'),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').trim().optional(),
} as const;

/**
 * Create Entry DTO Schema
 */
export const CreateEntrySchema = z.object({
    ...BaseEntrySchema,
    date: BaseEntrySchema.date, // Required for creation
    spend: BaseEntrySchema.spend,
    revenue: BaseEntrySchema.revenue.optional(),
    profit: BaseEntrySchema.profit.optional(),
    adSpend: BaseEntrySchema.adSpend.optional(),
    adSpendDetails: BaseEntrySchema.adSpendDetails.optional(),
    revenueSources: BaseEntrySchema.revenueSources.optional(),
    status: EntryStatusSchema.optional().default('active'),
});

/**
 * Update Entry DTO Schema
 */
export const UpdateEntrySchema = z.object({
    date: DateInputSchema.optional(),
    spend: z
        .number()
        .min(0, 'Spend must be greater than or equal to 0')
        .max(1000000, 'Spend must be less than 1,000,000')
        .optional(),
    revenue: z
        .number()
        .min(0, 'Revenue must be greater than or equal to 0')
        .max(1000000, 'Revenue must be less than 1,000,000')
        .optional(),
    profit: z
        .number()
        .min(-1000000, 'Profit must be greater than or equal to -1,000,000')
        .max(1000000, 'Profit must be less than 1,000,000')
        .optional(),
    adSpend: z
        .object({
            facebook: z.record(z.string(), z.number().nonnegative()).optional(),
            newsbreak: z.record(z.string(), z.number().nonnegative()).optional(),
            tiktok: z.record(z.string(), z.number().nonnegative()).optional(),
        })
        .partial()
        .optional(),
    adSpendDetails: z
        .object({
            facebook: z
                .array(
                    z.object({
                        id: z.string().min(1),
                        name: z.string().trim().optional(),
                        spend: z.number().nonnegative(),
                    })
                )
                .optional(),
            newsbreak: z
                .array(
                    z.object({
                        id: z.string().min(1),
                        name: z.string().trim().optional(),
                        spend: z.number().nonnegative(),
                    })
                )
                .optional(),
            tiktok: z
                .array(
                    z.object({
                        id: z.string().min(1),
                        name: z.string().trim().optional(),
                        spend: z.number().nonnegative(),
                    })
                )
                .optional(),
        })
        .partial()
        .optional(),
    revenueSources: z
        .object({
            maxbounty: z.number().nonnegative().optional(),
            performcb: z.number().nonnegative().optional(),
            cashnetwork: z.number().nonnegative().optional(),
            point2web: z.number().nonnegative().optional(),
        })
        .partial()
        .optional(),
    currency: z.literal('USD').optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
    status: EntryStatusSchema.optional(),
});

/**
 * Entry Filters DTO Schema
 */
export const EntryFiltersSchema = z.object({
    dateRange: z
        .object({
            start: z.date(),
            end: z.date(),
        })
        .optional(),
    status: z.array(EntryStatusSchema).optional(),
    roiRange: z
        .object({
            min: z.number(),
            max: z.number(),
        })
        .optional(),
    spendRange: z
        .object({
            min: z.number().min(0),
            max: z.number().min(0),
        })
        .optional(),
    earningsRange: z
        .object({
            min: z.number().min(0),
            max: z.number().min(0),
        })
        .optional(),
    revenueRange: z
        .object({
            min: z.number().min(0),
            max: z.number().min(0),
        })
        .optional(),
    searchText: z.string().optional(),
});

/**
 * Entry Sort Options DTO Schema
 */
export const EntrySortOptionsSchema = z.object({
    field: z.enum(['date', 'spend', 'earnings', 'revenue', 'profit', 'roiPct', 'createdAt']),
    direction: z.enum(['asc', 'desc']),
});

/**
 * Dashboard Data Request DTO Schema
 */
export const DashboardDataRequestSchema = z.object({
    uid: z.string().min(1, 'User ID is required'),
    startDate: DateInputSchema,
    endDate: DateInputSchema,
    filters: EntryFiltersSchema.optional(),
    groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

// Type guards
export const isCreateEntryDto = (data: unknown): data is CreateEntryDto => {
    return CreateEntrySchema.safeParse(data).success;
};

export const isUpdateEntryDto = (data: unknown): data is UpdateEntryDto => {
    return UpdateEntrySchema.safeParse(data).success;
};

export const isEntryFiltersDto = (data: unknown): data is EntryFiltersDto => {
    return EntryFiltersSchema.safeParse(data).success;
};

// Type exports
export type CreateEntryDto = z.infer<typeof CreateEntrySchema>;
export type UpdateEntryDto = z.infer<typeof UpdateEntrySchema>;
export type EntryFiltersDto = z.infer<typeof EntryFiltersSchema>;
export type EntrySortOptionsDto = z.infer<typeof EntrySortOptionsSchema>;
export type DashboardDataRequestDto = z.infer<typeof DashboardDataRequestSchema>;

