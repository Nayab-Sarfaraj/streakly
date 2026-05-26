# Project Structure

```
habit-tracker/
├── backend/
│   ├── models/
│   │   └── HabitLog.js        # Mongoose schema — one doc per user per day
│   ├── routes/
│   │   ├── logs.js            # GET/PUT today, week, month, year log endpoints
│   │   └── analytics.js       # GET /api/analytics/summary
│   ├── server.js              # Express app setup, MongoDB connection
│   ├── .env                   # MONGODB_URI, PORT
│   └── package.json
│
└── frontend/
    ├── app/                   # Next.js App Router pages
    │   ├── page.tsx           # Today view (habit toggle)
    │   ├── weekly/page.tsx
    │   ├── monthly/page.tsx
    │   ├── yearly/page.tsx
    │   └── analytics/page.tsx
    ├── components/
    │   ├── Charts/            # Recharts wrappers (one file per chart type)
    │   ├── ui/                # shadcn/ui base components (button, badge, separator)
    │   ├── Sidebar.tsx        # Desktop sidebar + mobile bottom nav
    │   ├── HabitCard.tsx
    │   ├── HabitGrid.tsx
    │   ├── HabitIcon.tsx      # Renders lucide icons by string name
    │   ├── Toast.tsx          # Lightweight toast + useToast hook
    │   ├── WeeklyTable.tsx
    │   ├── StatsCard.tsx
    │   ├── SkeletonCard.tsx
    │   └── CalendarHeatmap.tsx
    ├── lib/
    │   ├── api.ts             # All backend calls via axios; exports `api` object + TS interfaces
    │   ├── habits.ts          # HABITS array, HABIT_MAP, HABIT_IDS — single source of truth
    │   └── utils.ts           # cn() helper (clsx + tailwind-merge)
    ├── .env.local             # NEXT_PUBLIC_API_URL
    └── package.json
```

## Key Conventions

- **API layer:** All fetch logic lives in `lib/api.ts`. Pages and components never call axios directly.
- **Habit definitions:** `lib/habits.ts` is the frontend source of truth for habit IDs, names, icons, and colors. The backend duplicates the ID list inline — keep them in sync.
- **Date format:** Dates are always `YYYY-MM-DD` strings. Use `dayjs` for all date math; avoid `Date` directly.
- **Styling:** Use Tailwind utility classes. Use the `cn()` helper for conditional class merging. Inline `style` is acceptable for dynamic per-habit colors.
- **Components:** Pages are thin — data fetching and state live in the page file, presentational logic is extracted into `components/`.
- **Backend routes:** Follow the existing pattern — `router.get/put`, try/catch, `res.status(500).json({ error: err.message })` on failure.
- **No auth:** `userId` is always the hardcoded string `"default"`.
