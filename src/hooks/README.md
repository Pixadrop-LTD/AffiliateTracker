# Hooks

This directory contains custom React hooks for the web application.

## Available Hooks

### useAuth

Authentication hook providing auth state and methods.

```tsx
import { useAuth } from '@/hooks';

const { user, loading, error, isAuthenticated, signIn, signOut } = useAuth();
```

**Returns:**
- `user` - Current user document
- `loading` - Loading state
- `error` - Error message
- `isAuthenticated` - Authentication status
- `isAdmin` - Admin status
- `signIn` - Sign in method
- `signUp` - Sign up method
- `signOut` - Sign out method
- `signInWithGoogle` - Google sign in
- `resetPassword` - Password reset
- `clearError` - Clear error

### useUser

User management hook providing user data and actions.

```tsx
import { useUser } from '@/hooks';

const { user, preferences, updateProfile, updatePreferences } = useUser();
```

**Returns:**
- `user` - User document
- `preferences` - User preferences
- `isLoading` - Loading state
- `error` - Error message
- `isAuthenticated` - Auth status
- `updateProfile` - Update user profile
- `updatePreferences` - Update preferences
- `refreshUserData` - Refresh user data

### useEntries

Entries management hook.

```tsx
import { useEntries } from '@/hooks';

const { entries, loading, createEntry, updateEntry, deleteEntry } = useEntries();
```

**Returns:**
- `entries` - Array of entries
- `loading` - Loading state
- `error` - Error message
- `loadEntries` - Load entries
- `loadEntriesByDateRange` - Load by date range
- `createEntry` - Create entry
- `updateEntry` - Update entry
- `deleteEntry` - Delete entry
- `refreshEntries` - Refresh entries

### useTheme

Theme management hook.

```tsx
import { useTheme } from '@/hooks';

const { theme, toggleTheme, isDark, isLight } = useTheme();
```

**Returns:**
- `theme` - Current theme
- `setTheme` - Set theme
- `toggleTheme` - Toggle theme
- `isDark` - Is dark mode
- `isLight` - Is light mode
- `mounted` - Component mounted state

## Usage Example

```tsx
'use client';

import { useAuth, useUser, useTheme } from '@/hooks';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { preferences, updateProfile } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <h1>{user?.displayName}</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

