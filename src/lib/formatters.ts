/**
 * Formatters - Utility functions for formatting values
 */

/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @param locale - The locale (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = "USD", locale: string = "en-US"): string => {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).format(value);
};

/**
 * Format a number with locale-specific number formatting
 * @param value - The number to format
 * @param locale - The locale (default: 'en-US')
 * @returns Formatted number string
 */
export const formatNumber = (value: number, locale: string = "en-US"): string => {
    return new Intl.NumberFormat(locale).format(value);
};

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param format - The format style ('short', 'long', 'medium')
 * @returns Formatted date string
 */
export const formatDate = (date: Date, format: "short" | "long" | "medium" = "short"): string => {
    const formatOptions: Record<"short" | "medium" | "long", Intl.DateTimeFormatOptions> = {
        short: { month: "short", day: "numeric", year: "numeric" },
        medium: { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" },
        long: { weekday: "long", year: "numeric", month: "long", day: "numeric" },
    };

    return new Intl.DateTimeFormat("en-US", formatOptions[format]).format(date);
};

/**
 * Format a date range to a readable string
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
    const start = formatDate(startDate, "short");
    const end = formatDate(endDate, "short");
    return `${start} - ${end}`;
};

/**
 * Format a percentage value
 * @param value - The number to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format a number with abbreviation (K, M, B)
 * @param value - The number to format
 * @returns Formatted abbreviated number string
 */
export const formatAbbreviatedNumber = (value: number): string => {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
};

