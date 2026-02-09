# FlowBoard — Project Log

## Session 1: Initial Build (2026-02-09)

### What We Built
**FlowBoard** — a full-featured project management app built with a 5-agent parallel team.

### Tech Stack
Next.js 16 + Prisma 7/SQLite + shadcn/ui + Tailwind CSS 4 + @dnd-kit + Recharts + Framer Motion + next-intl (EN/ZH) + next-themes (dark mode)

### Features Completed (v1)
- **Dashboard**: 4 stats cards, 30-day completion area chart, priority donut chart, upcoming deadlines list, project progress bars
- **Kanban Board**: @dnd-kit drag-and-drop, per-project columns (Backlog/In Progress/Review/Done), card filters
- **Calendar**: Custom month + week grids, task pills on due dates, standalone calendar events with CRUD modal
- **Todo List**: Quick-add input, P1-P4 priority badges, labels, subtasks, task detail side panel (Sheet)
- **Projects**: CRUD with color picker, auto-creates 4 default columns per project
- **Settings**: Theme toggle (light/dark/system), language toggle (EN/ZH)
- **Layout**: Collapsible sidebar (240px/64px), top bar with breadcrumbs, mobile-responsive Sheet sidebar
- **Database**: 6 Prisma models (Project, Column, Task, Label, TaskLabel, CalendarEvent), seed script with demo data (3 projects, 18 tasks, 5 labels, 4 events)
- **86 files, 18,077 lines of code**

### Architecture
- **Server Actions** (not API routes) for all mutations — 6 action files
- **Server Components** fetch data via Prisma, Client Components for interactivity
- **i18n** via `[locale]` route segment (next-intl) — full EN + ZH translations
- **Prisma 7** with SQLite via PrismaLibSql driver adapter
- **System fonts** (no Google Fonts — times out in China)
- **CSS variables** for theming (oklch colors, indigo primary)

### File Structure
```
src/
  actions/          — 6 server action files (project, task, column, label, calendar, dashboard)
  app/[locale]/     — 8 route pages (dashboard, board, board/[id], calendar, todos, projects, settings)
  components/
    layout/         — 4 components (sidebar, top bar, theme toggle, locale switcher)
    kanban/         — 6 components (board, column, card, column header, filters, add column)
    calendar/       — 8 components (view, header, month grid, week grid, day cell, task pill, event pill, event modal)
    dashboard/      — 5 components (stats cards, completion chart, priority chart, deadlines, progress)
    shared/         — 5 components (task detail sheet, priority badge, label badge, confirm dialog, empty state)
    ui/             — 19 shadcn/ui components
  i18n/             — routing + request config
  lib/              — prisma client, utils, constants
  types/            — shared TypeScript types
messages/           — en.json + zh.json translations
prisma/             — schema, migrations, seed script
```

### Known Issues / Next Steps (Prioritized)
1. **Test in browser and fix runtime errors** — pages compile but interactive features need browser testing
2. **Wire up Command Palette** (Cmd+K) — UI skeleton exists but search not connected
3. **Keyboard shortcuts** — J/K navigation, N for new task, 1-4 for priority
4. **Loading skeletons** for all pages
5. **Mobile responsive polish** — test on small screens
6. **Recharts sizing** — chart containers show width/height warnings
7. **Calendar drag-to-reschedule** — needs full wiring
8. **Page transition animations** with Framer Motion
9. **Data export/import** in settings
10. **Onboarding flow** for new users (empty database state)

### Key Commands
```bash
cd ~/Desktop/flowboard
npm run dev              # Start dev server (http://localhost:3000)
npx tsx prisma/seed.ts   # Re-seed demo data
npx prisma migrate dev   # Run migrations
npx next build           # Production build
```

### Lessons Learned
- **Prisma 7**: No `url` in schema.prisma (goes in prisma.config.ts), requires `{ adapter }` in constructor, import from `@/generated/prisma/client`, class is `PrismaLibSql` (lowercase 'ql')
- **China network**: Google Fonts via next/font/google will timeout — use system fonts
- **Next.js 16 + Turbopack**: First compile takes ~2-3 min on Mac mini M4
- **Agent team approach**: Scaffold first, then parallelize independent features — works well for large apps
