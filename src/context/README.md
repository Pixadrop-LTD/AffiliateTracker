# Context Providers

This directory contains context providers for the web application.

## Structure

- `auth-provider.tsx` - Authentication provider with Firebase integration
- `theme-provider.tsx` - Theme provider wrapper for next-themes
- `app-providers.tsx` - Combined provider that wraps all necessary contexts

## Usage

All providers are automatically set up in `src/app/layout.tsx`:

```tsx
import { AppProviders } from '@/context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

## Available Hooks

### useAuth

Provides authentication methods and state:

```tsx
import { useAuth } from '@/hooks';

function Component() {
  const { user, loading, error, isAuthenticated, signIn, signOut } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <LoginForm onSignIn={signIn} />
      )}
    </div>
  );
}
```

### useUser

Provides user data and management:

```tsx
import { useUser } from '@/hooks';

function Component() {
  const { user, preferences, updateProfile, updatePreferences } = useUser();
  
  return (
    <div>
      <h1>{user?.displayName}</h1>
      <button onClick={() => updateProfile({ displayName: 'New Name' })}>
        Update Profile
      </button>
    </div>
  );
}
```

### useEntries

Provides entries management:

```tsx
import { useEntries } from '@/hooks';

function Component() {
  const { entries, loading, createEntry, updateEntry, deleteEntry } = useEntries();
  
  return (
    <div>
      {entries.map(entry => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
```

### useTheme

Provides theme management:

```tsx
import { useTheme } from '@/hooks';

function Component() {
  const { theme, toggleTheme, isDark, isLight } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

## Provider Order

Providers are wrapped in the following order (innermost to outermost):

1. `ThemeProvider` - Theme context
2. `AuthProvider` - Authentication context

This order ensures proper access to contexts throughout the app.

