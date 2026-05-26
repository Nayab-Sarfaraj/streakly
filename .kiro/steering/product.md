# Product: Streakly

Streakly is a personal daily habit tracker for a single user. It lets the user log 9 fixed habits each day, track streaks, and review progress across weekly, monthly, and yearly views.

## Core Features
- **Today view** — toggle each habit on/off; shows live progress bar and score
- **Weekly view** — grid of the current week's habit completions
- **Monthly view** — calendar-style breakdown of daily scores
- **Yearly view** — heatmap and bar chart of monthly aggregates
- **Analytics** — summary stats: best habit, needs-work habit, current streak, longest streak, avg score

## Habits (fixed, 9 total)
`gym`, `reading`, `company`, `learning`, `sideproject`, `pixlreel`, `kastreel`, `post`, `jobhunt`

The habit list is defined in `frontend/lib/habits.ts` and mirrored in the backend model and route files. Adding or removing habits requires updating all three locations.

## Single-user
There is no authentication. All data is stored under `userId: "default"`.
