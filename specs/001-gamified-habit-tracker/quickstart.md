# Quickstart: Gamified Habit Tracker

**Phase**: 1 - Design | **Date**: 2026-01-29

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Supabase account (free tier works)

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize
3. Go to **Settings → API** and copy:
   - Project URL (e.g., `https://xxx.supabase.co`)
   - Anon public key (starts with `eyJ...`)

### 2. Initialize Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy contents of `contracts/supabase-schema.sql`
4. Run the query

### 3. Configure Supabase Auth

1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled
3. Optional: Customize email templates under **Authentication → Email Templates**

### 4. Create Vite Project

```bash
# Create new Vite project with React + TypeScript
npm create vite@latest habit-tracker -- --template react-ts

cd habit-tracker

# Install dependencies
npm install @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom

# Initialize Tailwind
npx tailwindcss init -p
```

### 5. Environment Variables

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Add to `.gitignore`:

```
.env.local
```

### 6. Configure Tailwind

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 7. Initialize Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 8. TypeScript Config

Ensure `tsconfig.json` has strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    // ... other options
  }
}
```

### 9. Run Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

## Project Structure After Setup

```
habit-tracker/
├── .env.local           # Supabase credentials (gitignored)
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── lib/
    │   └── supabase.ts  # Supabase client
    ├── App.tsx
    ├── main.tsx
    └── index.css        # Tailwind imports
```

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] Tailwind classes work (test with `<div className="bg-blue-500">`)
- [ ] Supabase client initializes (no console errors)
- [ ] Can connect to Supabase (test with simple query)

## Test Supabase Connection

Add to `App.tsx` temporarily:

```typescript
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

function App() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('profiles').select('count');
      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('Supabase connected!', data);
      }
    }
    testConnection();
  }, []);

  return <div className="p-4 text-xl">Habit Tracker</div>;
}

export default App;
```

## Next Steps

After setup verification:

1. Run `/speckit.tasks` to generate implementation tasks
2. Start with P1 user story: Create and Track Daily Habits
3. Follow task order in generated `tasks.md`
