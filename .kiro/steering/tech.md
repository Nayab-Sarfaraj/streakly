# Tech Stack

## Backend
- **Runtime:** Node.js (CommonJS modules)
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose 9
- **Key libs:** `dayjs` (date handling), `dotenv`, `cors`, `nodemon` (dev)
- **Entry point:** `backend/server.js`
- **Config:** `backend/.env` — requires `MONGODB_URI` and optionally `PORT` (default 5000)

## Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **UI primitives:** Radix UI (`@radix-ui/react-*`), shadcn/ui conventions
- **Charts:** Recharts
- **HTTP client:** Axios (centralized in `frontend/lib/api.ts`)
- **Date handling:** dayjs
- **Icons:** lucide-react
- **Utilities:** `clsx` + `tailwind-merge` via `cn()` helper in `frontend/lib/utils.ts`
- **Config:** `frontend/.env.local` — requires `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`)

## Common Commands

### Backend
```bash
cd backend
npm run dev      # nodemon — development with auto-reload
npm start        # node server.js — production
```

### Frontend
```bash
cd frontend
npm run dev      # Next.js dev server (http://localhost:3000)
npm run build    # production build
npm start        # serve production build
npm run lint     # ESLint
```
