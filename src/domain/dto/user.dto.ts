import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

/**
 * User role validation schema
 */
export const UserRoleSchema = z.enum(['user', 'admin']);

/**
 * Theme validation schema
 */
export const ThemeSchema = z.enum(['light', 'dark', 'system']);

/**
 * Date range validation schema
 */
export const DateRangeSchema = z.enum(['1d', '7d', '30d', 'mtd', 'qtd', 'ytd', 'custom']);

/**
 * Chart type validation schema
 */
export const ChartTypeSchema = z.enum(['line', 'bar', 'area', 'pie']);

/**
 * KPI cards validation schema
 */
export const KpiCardsSchema = z.array(z.enum(['spend', 'earnings', 'profit', 'roi']));

/**
 * Base User schema that matches the model
 */
const BaseUserSchema = {
    uid: z.string().min(1, 'User ID is required'),
    email: z
        .string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters'),
    displayName: z.string().max(100, 'Display name must be less than 100 characters').optional(),
    photoURL: z.string().url('Invalid photo URL').optional(),
    role: UserRoleSchema.default('user'),
    defaultCurrency: z
        .string()
        .length(3, 'Currency must be a 3-letter ISO code')
        .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters only')
        .transform((val) => val.toUpperCase())
        .default('USD'),
    timezone: z.string().max(50, 'Timezone must be less than 50 characters').default('UTC'),
    preferences: z
        .object({
            theme: ThemeSchema.default('system'),
            dateFormat: z.string().default('MMM d, yyyy'),
            timeFormat: z.string().default('HH:mm'),
            currency: z.string().default('USD'),
            dateRange: DateRangeSchema.default('30d'),
            chartType: ChartTypeSchema.default('line'),
            visibleKpiCards: KpiCardsSchema.default(['spend', 'earnings', 'profit', 'roi']),
            notifications: z.object({
                email: z.boolean().default(true),
                push: z.boolean().default(true),
                weeklyReport: z.boolean().default(true),
                monthlyReport: z.boolean().default(true),
            }),
        })
        .default({
            theme: 'system',
            dateFormat: 'MMM d, yyyy',
            timeFormat: 'HH:mm',
            currency: 'USD',
            dateRange: '30d',
            chartType: 'line',
            visibleKpiCards: ['spend', 'earnings', 'profit', 'roi'],
            notifications: {
                email: true,
                push: true,
                weeklyReport: true,
                monthlyReport: true,
            },
        }),
    isActive: z.boolean().default(true),
    lastLoginAt: z.instanceof(Timestamp).optional(),
    createdAt: z.instanceof(Timestamp).default(() => Timestamp.now()),
    updatedAt: z.instanceof(Timestamp).default(() => Timestamp.now()),
};

/**
 * Create User DTO Schema
 */
export const CreateUserSchema = z.object({
    email: BaseUserSchema.email,
    displayName: BaseUserSchema.displayName,
    photoURL: BaseUserSchema.photoURL,
    role: BaseUserSchema.role,
    defaultCurrency: BaseUserSchema.defaultCurrency,
    timezone: BaseUserSchema.timezone,
    preferences: z
        .object({
            theme: ThemeSchema.default('system'),
            dateFormat: z.string().default('MMM d, yyyy'),
            timeFormat: z.string().default('HH:mm'),
            currency: z.string().default('USD'),
            dateRange: DateRangeSchema.default('30d'),
            chartType: ChartTypeSchema.default('line'),
            visibleKpiCards: KpiCardsSchema.default(['spend', 'earnings', 'profit', 'roi']),
            notifications: z.object({
                email: z.boolean().default(true),
                push: z.boolean().default(true),
                weeklyReport: z.boolean().default(true),
                monthlyReport: z.boolean().default(true),
            }),
        })
        .partial(),
});

/**
 * Update User DTO Schema
 */
export const UpdateUserSchema = z
    .object({
        displayName: BaseUserSchema.displayName.optional(),
        photoURL: BaseUserSchema.photoURL.optional(),
        role: BaseUserSchema.role.optional(),
        defaultCurrency: BaseUserSchema.defaultCurrency.optional(),
        timezone: BaseUserSchema.timezone.optional(),
        isActive: z.boolean().optional(),
        preferences: z
            .object({
                theme: ThemeSchema.optional(),
                dateFormat: z.string().optional(),
                timeFormat: z.string().optional(),
                currency: z
                    .string()
                    .length(3, 'Currency must be a 3-letter ISO code')
                    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters only')
                    .optional(),
                dateRange: DateRangeSchema.optional(),
                chartType: ChartTypeSchema.optional(),
                visibleKpiCards: KpiCardsSchema.optional(),
                notifications: z
                    .object({
                        email: z.boolean().optional(),
                        push: z.boolean().optional(),
                        weeklyReport: z.boolean().optional(),
                        monthlyReport: z.boolean().optional(),
                    })
                    .optional(),
            })
            .optional(),
    })
    .strict();

/**
 * Update User Preferences DTO Schema
 */
export const UpdateUserPreferencesSchema = z
    .object({
        theme: ThemeSchema.optional(),
        dateFormat: z.string().optional(),
        timeFormat: z.string().optional(),
        currency: z
            .string()
            .length(3, 'Currency must be a 3-letter ISO code')
            .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters only')
            .optional(),
        dateRange: DateRangeSchema.optional(),
        chartType: ChartTypeSchema.optional(),
        visibleKpiCards: KpiCardsSchema.optional(),
        notifications: z
            .object({
                email: z.boolean().optional(),
                push: z.boolean().optional(),
                weeklyReport: z.boolean().optional(),
                monthlyReport: z.boolean().optional(),
            })
            .optional(),
        // Integrations: Ads & CPA Networks (all fields optional and nested)
        adNetworks: z
            .object({
                facebook: z
                    .object({
                        appId: z.string().min(1, 'APP ID is required').optional(),
                        appSecret: z.string().min(1, 'APP SECRET is required').optional(),
                        accessToken: z.string().min(1, 'ACCESS TOKEN is required').optional(),
                        accessTokenExpiresAt: z.number().optional(),
                        // Automation selection: ad accounts to track
                        selectedAccountIds: z.array(z.string()).optional(),
                    })
                    .partial()
                    .optional(),
                newsbreak: z
                    .object({
                        token: z.string().min(1, 'TOKEN is required').optional(),
                        orgIds: z.array(z.string()).optional(),
                        // Automation selection: ad accounts to track
                        selectedAccountIds: z.array(z.string()).optional(),
                    })
                    .partial()
                    .optional(),
                tiktok: z
                    .object({
                        appId: z.string().min(1, 'APP ID is required').optional(),
                        appSecret: z.string().min(1, 'APP SECRET is required').optional(),
                        accessToken: z.string().min(1, 'ACCESS TOKEN is required').optional(),
                        refreshToken: z.string().min(1, 'REFRESH TOKEN is required').optional(),
                        accessTokenExpiresAt: z.number().optional(),
                        // Automation selection: ad accounts to track
                        selectedAccountIds: z.array(z.string()).optional(),
                    })
                    .partial()
                    .optional(),
            })
            .partial()
            .optional(),
        // Automation schedule preferences
        automation: z
            .object({
                enabled: z.boolean().optional(),
                dailyTime: z
                    .string()
                    .regex(/^\d{2}:\d{2}$/i, 'dailyTime must be HH:mm')
                    .optional(),
            })
            .partial()
            .optional(),
        cpaNetworks: z
            .object({
                maxBounty: z
                    .object({
                        email: z.string().email('Invalid email').optional(),
                        password: z.string().min(1, 'Password is required').optional(),
                    })
                    .partial()
                    .optional(),
                performCb: z
                    .object({
                        apiKey: z.string().min(1, 'API Key is required').optional(),
                        partnerId: z.string().min(1, 'Partner ID is required').optional(),
                    })
                    .partial()
                    .optional(),
                cashNetwork: z
                    .object({
                        apiKey: z.string().min(1, 'API Key is required').optional(),
                    })
                    .partial()
                    .optional(),
                point2Web: z
                    .object({
                        apiKey: z.string().min(1, 'API Key is required').optional(),
                    })
                    .partial()
                    .optional(),
            })
            .partial()
            .optional(),
    })
    .strict();

/**
 * User Filters DTO Schema
 */
export const UserFiltersSchema = z.object({
    role: z.array(UserRoleSchema).optional(),
    isActive: z.boolean().optional(),
    createdDateRange: z
        .object({
            start: z.date(),
            end: z.date(),
        })
        .optional(),
    searchText: z.string().optional(),
});

/**
 * User Sort Options DTO Schema
 */
export const UserSortOptionsSchema = z.object({
    field: z.enum(['email', 'displayName', 'role', 'createdAt', 'lastLoginAt']),
    direction: z.enum(['asc', 'desc']),
});

// Type exports
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UpdateUserPreferencesDto = z.infer<typeof UpdateUserPreferencesSchema>;
export type UserFiltersDto = z.infer<typeof UserFiltersSchema>;
export type UserSortOptionsDto = z.infer<typeof UserSortOptionsSchema>;

// Type guards
export const isCreateUserDto = (data: unknown): data is CreateUserDto => {
    return CreateUserSchema.safeParse(data).success;
};

export const isUpdateUserDto = (data: unknown): data is UpdateUserDto => {
    return UpdateUserSchema.safeParse(data).success;
};

export const isUpdateUserPreferencesDto = (data: unknown): data is UpdateUserPreferencesDto => {
    return UpdateUserPreferencesSchema.safeParse(data).success;
};

export const isUserFiltersDto = (data: unknown): data is UserFiltersDto => {
    return UserFiltersSchema.safeParse(data).success;
};

