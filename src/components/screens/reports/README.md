# Reports System

This document outlines the complete reports system implementation for the affiliate tracker web application.

## Overview

The reports system provides comprehensive analytics and data visualization with advanced filtering capabilities. It mirrors the functionality of the mobile app while leveraging web-optimized UI patterns and shadcn components.

## Features Implemented

### 1. Time Range Filters

-   **7d**: Last 7 days
-   **30d**: Last 30 days (default)
-   **90d**: Last 90 days
-   **MTD**: Month-to-Date
-   **QTD**: Quarter-to-Date
-   **YTD**: Year-to-Date
-   **Custom**: User-defined date range

### 2. Grouping Options

-   **Day**: Daily aggregation
-   **Week**: Weekly aggregation
-   **Month**: Monthly aggregation

### 3. Chart Types

-   **Bar Chart**: Horizontal bar chart with profit/loss coloring
-   **Pie Chart**: Donut-style pie chart with slice labels
-   **Table**: Detailed data table with columns

### 4. Summary Metrics

Four key metric cards displayed:

-   **Entries**: Total count of entries
-   **Total Spend**: Sum of all spending
-   **Total Earnings**: Sum of all earnings
-   **Net Profit**: Profit with ROI percentage

### 5. Advanced UI Features

-   Gradient backgrounds using color palette
-   Animated transitions with Framer Motion
-   Hover effects on cards and badges
-   Loading states with skeletons
-   Empty states with clear CTAs
-   Responsive grid layouts
-   Interactive filter chips

### 6. Zustand State Management

-   Filter persistence across sessions
-   Centralized filter store
-   Type-safe state updates
-   DevTools integration

## Components

### `/src/app/reports/page.tsx`

Main reports page component with:

-   Data fetching and processing
-   Chart rendering logic
-   Filter management
-   Summary calculations

### `/src/components/reports/reports-filters-sheet.tsx`

Advanced filter sheet component with:

-   Side panel design
-   Animated content sections
-   Filter badges
-   Reset and apply actions

### `/src/lib/utils/reports.ts`

Utility functions for:

-   Data processing and aggregation
-   Chart data formatting
-   Date range calculations
-   Currency formatting
-   Color scheme management

### `/src/stores/filter.store.ts`

Zustand store for filter state management:

-   Report filters state
-   Action methods
-   Persistence configuration

## Color Palette Usage

The implementation uses the theme color tokens from `globals.css`:

-   **Primary**: Indigo shades for main elements
-   **Secondary**: Emerald shades for earnings/profit
-   **Accent**: Violet shades for highlights
-   **Destructive**: Red shades for losses
-   **Neutral**: Slate shades for backgrounds

## Chart Implementation

Uses recharts library with shadcn chart container:

-   Responsive containers
-   Custom tooltips with formatting
-   Color-coded bars based on profit/loss
-   Accessible labels and legends

## Data Processing

1. **Fetch**: Get entries from Firebase (limit 250)
2. **Filter**: Apply date range and status filters
3. **Group**: Aggregate by time period (day/week/month)
4. **Calculate**: Compute totals, profit, ROI
5. **Render**: Display in selected chart type

## User Interactions

-   Click chips to cycle through options
-   Open filter sheet for advanced options
-   Reset filters with clear button
-   Toggle chart types with buttons
-   Responsive hover states

## Performance Optimizations

-   Memoized calculations with useMemo
-   Efficient data processing
-   Lazy loading of chart libraries
-   Optimized re-renders with Zustand selectors

## Future Enhancements

Potential improvements:

-   Custom date range picker
-   Export functionality (CSV, PDF)
-   More chart types (line, area)
-   Additional metrics
-   Comparison views
-   Drill-down details
