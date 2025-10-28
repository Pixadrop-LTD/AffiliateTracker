/**
 * Models barrel export for AffiliateTracker
 * Provides convenient access to all data model interfaces and types
 */

// Entry model exports
export {
    calculateEntryDerived,
    createEntrySummary, effectiveRevenue, type CreateEntryInput,
    type EntryAnalytics,
    type EntryDerived,
    type EntryDoc,
    type EntryFilters,
    type EntryListResult,
    type EntrySortOptions,
    type EntryStatus,
    type EntrySummary,
    type EntryValidationResult,
    type EntryWithDerived,
    type UpdateEntryInput
} from './entry';

// User model exports
export {
    canManageUser,
    createUserProfile,
    getDefaultUserPrefs,
    isUserAdmin,
    type AuthState,
    type CreateUserInput,
    type UpdateUserInput,
    type UpdateUserPrefsInput,
    type UserActivity,
    type UserDoc,
    type UserListResult,
    type UserPrefsDoc,
    type UserProfile,
    type UserRole,
    type UserStats,
    type UserValidationResult
} from './user';

