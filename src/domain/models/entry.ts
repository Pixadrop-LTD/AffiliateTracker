/**
 * Entry model interfaces for AffiliateTracker
 * Defines data structures for affiliate tracking entries
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Entry status enumeration
 * Defines the lifecycle states of an entry
 */
export type EntryStatus = 'active' | 'archived';

/**
 * Complete entry document structure
 * Represents an entry as stored in Firestore
 */
export interface EntryDoc {
  /** Document ID (optional for creation) */
  id?: string;

  /** Owner user ID (foreign key to users collection) */
  uid: string;

  /** The business day of the record */
  date: Timestamp;

  /** Amount spent on this entry (must be >= 0) */
  spend: number;

  /** Amount earned from this entry (legacy; no longer persisted) */
  earnings?: number;

  /**
   * NEW: Total revenue for the day (preferred over legacy `earnings` when present)
   * This field will be populated from CPA networks (MaxBounty, PerformCB, CashNetwork)
   */
  revenue?: number;

  /** NEW: Persisted profit for convenience (redundant; derived as revenue - spend) */
  profit?: number;

  /**
   * NEW: Per-network ad spend breakdowns (legacy map for compatibility)
   * facebook and newsbreak store dynamic maps of accountId/accountName -> spend
   */
  adSpend?: {
    facebook?: Record<string, number>;
    newsbreak?: Record<string, number>;
    tiktok?: Record<string, number>;
  };

  /**
   * NEW: Detailed per-account ad spend with id/name/spend
   */
  adSpendDetails?: {
    facebook?: { id: string; name?: string; spend: number }[];
    newsbreak?: { id: string; name?: string; spend: number }[];
    tiktok?: { id: string; name?: string; spend: number }[];
  };

  /**
   * NEW: Per-network revenue breakdowns (totals per CPA network)
   */
  revenueSources?: {
    maxbounty?: number;
    performcb?: number;
    cashnetwork?: number;
    point2web?: number;
  };

  /** Currency code (3-letter ISO code, e.g., 'USD') */
  currency: string;

  /** Optional notes or description */
  notes?: string;

  /** Entry status for lifecycle management */
  status: EntryStatus;

  /** Timestamp when the entry was created */
  createdAt: Timestamp;

  /** Timestamp when the entry was last updated */
  updatedAt: Timestamp;
}

/**
 * Derived entry data computed on the client side
 * Contains calculated fields that are not stored in the database
 */
export interface EntryDerived {
  /** Profit calculated as earnings - spend */
  profit: number;

  /** ROI percentage calculated as (profit / spend) * 100, null if spend is 0 */
  roiPct: number | null;
}

/**
 * Complete entry with both stored and derived data
 * Combines the database document with calculated fields
 */
export type EntryWithDerived = Omit<EntryDoc, 'profit'> & EntryDerived & { id: string };

/**
 * Input type for creating a new entry
 * Excludes auto-generated fields like timestamps and derived data
 */
export interface CreateEntryInput {
  /** The business day of the record */
  date: Date | Timestamp;

  /** Amount spent (must be >= 0) */
  spend: number;

  /** NEW: Total revenue for the day (preferred over legacy `earnings` when present) */
  revenue?: number;

  /** NEW: Per-network ad spend breakdowns (legacy map for compatibility) */
  adSpend?: {
    facebook?: Record<string, number>;
    newsbreak?: Record<string, number>;
    tiktok?: Record<string, number>;
  };

  /** NEW: Detailed per-account ad spend */
  adSpendDetails?: {
    facebook?: { id: string; name?: string; spend: number }[];
    newsbreak?: { id: string; name?: string; spend: number }[];
    tiktok?: { id: string; name?: string; spend: number }[];
  };

  /** NEW: Per-network revenue breakdowns */
  revenueSources?: {
    maxbounty?: number;
    performcb?: number;
    cashnetwork?: number;
    point2web?: number;
  };

  /** Currency code (3-letter ISO) */
  currency: string;

  /** Optional notes */
  notes?: string;

  /** Entry status (defaults to 'active' if not provided) */
  status?: EntryStatus;
}

/**
 * Input type for updating an existing entry
 * All fields are optional except those that should never be updated
 */
export interface UpdateEntryInput {
  /** The business day of the record */
  date?: Date | Timestamp;

  /** Amount spent (must be >= 0) */
  spend?: number;

  /** NEW: Total revenue for the day (preferred over legacy `earnings` when present) */
  revenue?: number;

  /** NEW: Per-network ad spend breakdowns */
  adSpend?: {
    facebook?: Record<string, number>;
    newsbreak?: Record<string, number>;
    tiktok?: Record<string, number>;
  };

  /** NEW: Detailed per-account ad spend */
  adSpendDetails?: {
    facebook?: { id: string; name?: string; spend: number }[];
    newsbreak?: { id: string; name?: string; spend: number }[];
    tiktok?: { id: string; name?: string; spend: number }[];
  };

  /** NEW: Per-network revenue breakdowns */
  revenueSources?: {
    maxbounty?: number;
    performcb?: number;
    cashnetwork?: number;
    point2web?: number;
  };

  /** Currency code (3-letter ISO) */
  currency?: string;

  /** Optional notes */
  notes?: string;

  /** Entry status */
  status?: EntryStatus;
}

/**
 * Entry summary for aggregated views
 * Used for dashboard and reporting summaries
 */
export interface EntrySummary {
  /** Total number of entries */
  count: number;

  /** Total spend across all entries */
  totalSpend: number;

  /** Total earnings across all entries */
  totalEarnings: number;

  /** Total profit (totalEarnings - totalSpend) */
  totalProfit: number;

  /** Average ROI percentage */
  avgRoi: number | null;

  /** Currency for the summary (assumes single currency) */
  currency: string;

  /** Date range for the summary */
  dateRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Entry filters for querying and searching
 * Used in list views and reports
 */
export interface EntryFilters {
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };

  /** Filter by entry status */
  status?: EntryStatus[];

  /** Filter by ROI range */
  roiRange?: {
    min: number;
    max: number;
  };

  /** Filter by spend range */
  spendRange?: {
    min: number;
    max: number;
  };

  /** Filter by earnings range */
  earningsRange?: {
    min: number;
    max: number;
  };

  /** NEW: Filter by revenue range */
  revenueRange?: {
    min: number;
    max: number;
  };

  /** Text search in notes */
  searchText?: string;
}

/**
 * Entry sort options
 * Defines how entries can be sorted in lists
 */
export interface EntrySortOptions {
  /** Field to sort by */
  field: 'date' | 'spend' | 'earnings' | 'revenue' | 'profit' | 'roiPct' | 'createdAt';

  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Paginated entry results
 * Used for infinite scroll and pagination
 */
export interface EntryListResult {
  /** Array of entries */
  entries: EntryWithDerived[];

  /** Total count of entries matching the query */
  totalCount: number;

  /** Whether there are more entries to load */
  hasMore: boolean;

  /** Cursor for next page (if applicable) */
  nextCursor?: string;
}

/**
 * Entry validation result
 * Used for form validation and error handling
 */
export interface EntryValidationResult {
  /** Whether the entry data is valid */
  isValid: boolean;

  /** Array of validation errors */
  errors: {
    field: keyof CreateEntryInput | keyof UpdateEntryInput;
    message: string;
    code: string;
  }[];
}

/**
 * Entry analytics data
 * Used for charts and performance metrics
 */
export interface EntryAnalytics {
  /** Daily breakdown of entries */
  dailyData: {
    date: string;
    spend: number;
    earnings: number;
    profit: number;
    count: number;
  }[];

  /** Monthly breakdown of entries */
  monthlyData: {
    month: string;
    spend: number;
    earnings: number;
    profit: number;
    count: number;
  }[];

  /** Legacy performance sections (deprecated): kept for compatibility */
  sourcePerformance?: {
    source: string;
    spend: number;
    earnings: number;
    profit: number;
    roi: number | null;
    count: number;
  }[];

  campaignPerformance?: {
    campaign: string;
    spend: number;
    earnings: number;
    profit: number;
    roi: number | null;
    count: number;
  }[];

  verticalPerformance?: {
    vertical: string;
    spend: number;
    earnings: number;
    profit: number;
    roi: number | null;
    count: number;
  }[];

  /** NEW: Ad spend breakdowns by ad network */
  adNetworkSpend?: {
    network: 'facebook' | 'newsbreak' | 'tiktok';
    spend: number;
    count: number;
  }[];

  /** NEW: Revenue breakdowns by CPA network */
  cpaNetworkRevenue?: {
    network: 'maxbounty' | 'performcb' | 'cashnetwork' | 'point2web';
    revenue: number;
    count: number;
  }[];
}

/**
 * Helper: Prefer new `revenue` over legacy `earnings` and ensure a number is returned
 */
export function effectiveRevenue(entry: { revenue?: number; earnings?: number }): number {
  return (entry.revenue ?? entry.earnings ?? 0) as number;
}

/**
 * Utility function to calculate derived entry data
 * @param entry - Entry document from database
 * @returns Entry with derived calculations
 */
export function calculateEntryDerived(entry: EntryDoc & { id?: string }): EntryWithDerived {
  // Prefer new `revenue` field; fall back to legacy `earnings`
  const baseRevenue = effectiveRevenue(entry);
  const profit = entry.profit ?? baseRevenue - entry.spend;
  const roiPct = entry.spend > 0 ? (profit / entry.spend) * 100 : null;

  return {
    ...entry,
    profit,
    roiPct,
    id: entry.id ?? '', // Ensure ID is always present
  } as EntryWithDerived;
}

/**
 * Utility function to create entry summary from array of entries
 * @param entries - Array of entries to summarize
 * @param currency - Currency for the summary
 * @param dateRange - Date range for the summary
 * @returns Entry summary object
 */
export function createEntrySummary(
  entries: EntryWithDerived[],
  currency: string,
  dateRange: { start: Date; end: Date }
): EntrySummary {
  const count = entries.length;
  const totalSpend = entries.reduce((sum, entry) => sum + entry.spend, 0);
  const totalEarnings = entries.reduce((sum, entry) => sum + effectiveRevenue(entry), 0);
  const totalProfit = totalEarnings - totalSpend; // totalEarnings represents revenue when present

  // Calculate average ROI (excluding entries with zero spend)
  const entriesWithSpend = entries.filter((entry) => entry.spend > 0);
  const avgRoi =
    entriesWithSpend.length > 0
      ? entriesWithSpend.reduce((sum, entry) => sum + (entry.roiPct || 0), 0) /
      entriesWithSpend.length
      : null;

  return {
    count,
    totalSpend,
    totalEarnings,
    totalProfit,
    avgRoi,
    currency,
    dateRange,
  };
}

