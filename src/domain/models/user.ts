/**
 * User model interfaces for AffiliateTracker
 * Defines data structures for user management and authentication
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * User role enumeration
 * Defines the permission levels within the application
 */
export type UserRole = 'user' | 'admin';

/**
 * Complete user document structure
 * Represents a user as stored in Firestore
 */
export interface UserDoc {
  /** Firebase Auth UID (document ID mirrors this value) */
  uid: string;

  /** User's email address (required, unique) */
  email: string;

  /** Optional display name for the user */
  displayName?: string;

  /** Optional profile photo URL */
  photoURL?: string;

  /** User's role in the system */
  role: UserRole;

  /** Default currency for the user's entries (3-letter ISO code) */
  defaultCurrency?: string;

  /** User's timezone (IANA timezone identifier, e.g., 'America/New_York') */
  timezone?: string;

  /** Timestamp when the user account was created */
  createdAt: Timestamp;

  /** Timestamp when the user account was last updated */
  updatedAt: Timestamp;
}

/**
 * Input type for creating a new user
 * Used during registration process
 */
export interface CreateUserInput {
  /** Firebase Auth UID */
  uid: string;

  /** User's email address */
  email: string;

  /** Optional display name */
  displayName?: string;

  /** Optional profile photo URL */
  photoURL?: string;

  /** User role (defaults to 'user' if not provided) */
  role?: UserRole;

  /** Default currency preference */
  defaultCurrency?: string;

  /** Timezone preference */
  timezone?: string;
}

/**
 * Input type for updating an existing user
 * All fields are optional except uid which is used for identification
 */
export interface UpdateUserInput {
  /** Optional display name update */
  displayName?: string;

  /** Optional profile photo URL update */
  photoURL?: string;

  /** Optional role update (admin only) */
  role?: UserRole;

  /** Optional default currency update */
  defaultCurrency?: string;

  /** Optional timezone update */
  timezone?: string;
}

/**
 * User profile data for display purposes
 * Excludes sensitive information and includes computed fields
 */
export interface UserProfile {
  /** User ID */
  uid: string;

  /** Email address */
  email: string;

  /** Display name or fallback to email */
  displayName: string;

  /** Profile photo URL or null */
  photoURL: string | null;

  /** User role */
  role: UserRole;

  /** Default currency */
  defaultCurrency: string;

  /** Timezone */
  timezone: string;

  /** Account creation date */
  createdAt: Date;

  /** Initials derived from display name or email */
  initials: string;

  /** Whether the user is an admin */
  isAdmin: boolean;
}

/**
 * User preferences document structure
 * Stored separately for better organization and performance
 * Note: Supports both legacy and new fields to ensure backward compatibility
 */
export interface UserPrefsDoc {
  /** User ID (document ID mirrors this value) */
  uid: string;

  /** Theme preference */
  theme: 'light' | 'dark' | 'system';

  /** LEGACY: Default date range for dashboard and reports */
  defaultDateRange?: '7d' | '30d' | 'MTD' | 'QTD' | 'YTD';

  /** NEW: Default date range (normalized lowercase + custom) */
  dateRange?: '1d' | '7d' | '30d' | 'mtd' | 'qtd' | 'ytd' | 'custom';

  /** CSV export delimiter preference */
  csvDelimiter?: ',' | ';' | '\t';

  /** NEW: Date/time format and currency preferences */
  dateFormat?: string;
  timeFormat?: string;
  currency?: string; // 3-letter ISO code

  /** Notifications */
  notifications?: {
    /** LEGACY: Daily reminder to log entries */
    dailyReminder?: boolean;
    /** LEGACY: Weekly performance summary */
    weeklySummary?: boolean;
    /** LEGACY: Email notifications enabled */
    emailEnabled?: boolean;
    /** LEGACY: Push notifications enabled */
    pushEnabled?: boolean;

    /** NEW: Fine-grained notification toggles */
    email?: boolean;
    push?: boolean;
    weeklyReport?: boolean;
    monthlyReport?: boolean;
  };

  /** Dashboard widget preferences */
  dashboard?: {
    /** Preferred chart type for main chart */
    chartType?: 'line' | 'bar' | 'area';

    /** KPI cards to show */
    kpiCards?: ('spend' | 'earnings' | 'profit' | 'roi')[];

    /** Default time period for dashboard */
    defaultPeriod?: '7d' | '30d' | 'MTD';
  };

  /** NEW: Flattened dashboard fields */
  chartType?: 'line' | 'bar' | 'area';
  visibleKpiCards?: ('spend' | 'earnings' | 'profit' | 'roi')[];

  /** Timestamp when preferences were created */
  createdAt: Timestamp;

  /** Timestamp when preferences were last updated */
  updatedAt: Timestamp;

  /** Integrations: Ads Networks credentials (optional) */
  adNetworks?: {
    facebook?: {
      appId?: string;
      appSecret?: string;
      accessToken?: string;
      accessTokenExpiresAt?: number;
      /** Selected Facebook ad account ids to track (e.g., act_123...) */
      selectedAccountIds?: string[];
    };
    newsbreak?: {
      token?: string;
      orgIds?: string[];
      /** Selected Newsbreak ad account ids to track */
      selectedAccountIds?: string[];
    };
    tiktok?: {
      appId?: string;
      appSecret?: string;
      accessToken?: string;
      refreshToken?: string;
      accessTokenExpiresAt?: number;
      /** Selected TikTok ad account ids to track */
      selectedAccountIds?: string[];
    };
  };

  /** Integrations: CPA Networks credentials (optional) */
  cpaNetworks?: {
    maxBounty?: {
      email?: string;
      password?: string;
    };
    performCb?: {
      apiKey?: string;
      partnerId?: string;
    };
    cashNetwork?: {
      apiKey?: string;
    };
    point2Web?: {
      apiKey?: string;
    };
  };

  /** Automation schedule preferences */
  automation?: {
    /** Whether daily automation is enabled */
    enabled?: boolean;
    /** Time of day in HH:mm (24h) to run automation, default '00:00' */
    dailyTime?: string;
  };
}

/**
 * Input type for updating user preferences
 */
export interface UpdateUserPrefsInput {
  /** Theme preference */
  theme?: 'light' | 'dark' | 'system';

  /** Default date range */
  defaultDateRange?: '7d' | '30d' | 'MTD' | 'QTD' | 'YTD';

  /** CSV delimiter */
  csvDelimiter?: ',' | ';' | '\t';

  /** Notification preferences */
  notifications?: {
    dailyReminder?: boolean;
    weeklySummary?: boolean;
    emailEnabled?: boolean;
    pushEnabled?: boolean;
  };

  /** Dashboard preferences */
  dashboard?: {
    chartType?: 'line' | 'bar' | 'area';
    kpiCards?: ('spend' | 'earnings' | 'profit' | 'roi')[];
    defaultPeriod?: '7d' | '30d' | 'MTD';
  };
}

/**
 * User statistics for admin dashboard
 * Aggregated data about user activity
 */
export interface UserStats {
  /** User ID */
  uid: string;

  /** User email */
  email: string;

  /** Display name */
  displayName: string;

  /** User role */
  role: UserRole;

  /** Total number of entries created */
  totalEntries: number;

  /** Date of last entry */
  lastEntryDate: Date | null;

  /** Total spend across all entries */
  totalSpend: number;

  /** Total earnings across all entries */
  totalEarnings: number;

  /** Account creation date */
  createdAt: Date;

  /** Last login date */
  lastLoginAt: Date | null;

  /** Whether the user is active (has entries in last 30 days) */
  isActive: boolean;
}

/**
 * User list result for admin views
 * Paginated list of users with metadata
 */
export interface UserListResult {
  /** Array of user profiles */
  users: UserProfile[];

  /** Total count of users */
  totalCount: number;

  /** Whether there are more users to load */
  hasMore: boolean;

  /** Cursor for next page */
  nextCursor?: string;
}

/**
 * User validation result
 * Used for form validation and error handling
 */
export interface UserValidationResult {
  /** Whether the user data is valid */
  isValid: boolean;

  /** Array of validation errors */
  errors: {
    field: keyof CreateUserInput | keyof UpdateUserInput;
    message: string;
    code: string;
  }[];
}

/**
 * Authentication state
 * Represents the current user's authentication status
 */
export interface AuthState {
  /** Current user document */
  user: UserDoc | null;

  /** User preferences */
  preferences: UserPrefsDoc | null;

  /** Whether authentication is loading */
  loading: boolean;

  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** Whether the user is an admin */
  isAdmin: boolean;

  /** Authentication error if any */
  error: string | null;
}

/**
 * User activity log entry
 * For tracking user actions (optional feature)
 */
export interface UserActivity {
  /** Activity ID */
  id: string;

  /** User ID */
  uid: string;

  /** Activity type */
  type:
  | 'login'
  | 'logout'
  | 'entry_created'
  | 'entry_updated'
  | 'entry_deleted'
  | 'profile_updated';

  /** Activity description */
  description: string;

  /** Additional metadata */
  metadata?: Record<string, any>;

  /** IP address (if available) */
  ipAddress?: string;

  /** User agent (if available) */
  userAgent?: string;

  /** Timestamp of the activity */
  timestamp: Timestamp;
}

/**
 * Utility function to create user profile from user document
 * @param user - User document from database
 * @returns User profile with computed fields
 */
export function createUserProfile(user: UserDoc): UserProfile {
  const displayName = user.displayName || user.email.split('@')[0];
  const initials = getInitials(displayName);

  return {
    uid: user.uid,
    email: user.email,
    displayName,
    photoURL: user.photoURL || null,
    role: user.role,
    defaultCurrency: user.defaultCurrency || 'USD',
    timezone: user.timezone || 'UTC',
    createdAt: user.createdAt.toDate(),
    initials,
    isAdmin: user.role === 'admin',
  };
}

/**
 * Utility function to generate initials from a name
 * @param name - Full name or display name
 * @returns Initials (max 2 characters)
 */
function getInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Utility function to get default user preferences
 * @param uid - User ID
 * @returns Default preferences object
 */
export function getDefaultUserPrefs(uid: string): Omit<UserPrefsDoc, 'createdAt' | 'updatedAt'> {
  return {
    uid,
    theme: 'system',
    defaultDateRange: '30d',
    csvDelimiter: ',',
    notifications: {
      dailyReminder: false,
      weeklySummary: true,
      emailEnabled: true,
      pushEnabled: true,
    },
    dashboard: {
      chartType: 'line',
      kpiCards: ['spend', 'earnings', 'profit', 'roi'],
      defaultPeriod: '30d',
    },
  };
}

/**
 * Utility function to check if user has admin privileges
 * @param user - User document or null
 * @returns True if user is admin
 */
export function isUserAdmin(user: UserDoc | null): boolean {
  return user?.role === 'admin';
}

/**
 * Utility function to check if user can perform admin actions
 * @param currentUser - Current user
 * @param targetUser - Target user (for user management actions)
 * @returns True if action is allowed
 */
export function canManageUser(currentUser: UserDoc | null, targetUser: UserDoc): boolean {
  if (!currentUser || !isUserAdmin(currentUser)) {
    return false;
  }

  // Admins can manage regular users, but not other admins (unless it's themselves)
  if (targetUser.role === 'admin' && currentUser.uid !== targetUser.uid) {
    return false;
  }

  return true;
}

