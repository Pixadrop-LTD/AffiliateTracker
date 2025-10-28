/**
 * Services barrel export for AffiliateTracker
 * Provides convenient access to all service classes
 */

// Entries service
export { EntriesService } from './entries';

// User service
export { UserService } from './user';

// Re-export commonly used types from domain
export type {
    CreateEntryInput,
    EntryDerived,
    EntryDoc,
    EntryStatus,
    UpdateEntryInput,
    UserDoc, UserPrefsDoc, UserProfile
} from '@/domain';

// Service response types
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface PaginatedServiceResponse<T> {
    items: T[];
    hasMore: boolean;
    lastDoc?: any;
}

// Dashboard data types
export interface DashboardData {
    totalSpend: number;
    totalEarnings: number;
    totalProfit: number;
    avgROI: number;
    entriesCount: number;
    dailyData: {
        date: string;
        spend: number;
        earnings: number;
        profit: number;
    }[];
}

// Service utility functions
export const ServiceUtils = {
    /**
     * Create a standardized service response
     */
    createResponse: <T>(data?: T, error?: string): ServiceResponse<T> => ({
        success: !error,
        data,
        error,
    }),

    /**
     * Create a paginated service response
     */
    createPaginatedResponse: <T>(
        items: T[],
        hasMore: boolean,
        lastDoc?: any
    ): PaginatedServiceResponse<T> => ({
        items,
        hasMore,
        lastDoc,
    }),

    /**
     * Handle service errors consistently
     */
    handleError: (error: unknown, context: string): never => {
        console.error(`Error in ${context}:`, error);
        throw new Error(`Failed to ${context.toLowerCase()}`);
    },

    /**
     * Validate required fields
     */
    validateRequired: (data: Record<string, any>, fields: string[]): void => {
        const missing = fields.filter((field) => !data[field]);
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    },
};

