# Nuxt Timeline - Agent Development Guide

This guide provides essential information for agentic coding agents working in this Nuxt.js timeline project.

## Development Commands

### Core Commands
- **Development**: `pnpm dev` or `npm run dev` - Start development server on http://localhost:3000
- **Build**: `pnpm build` or `npm run build` - Build for production
- **Preview**: `pnpm preview` or `npm run preview` - Preview production build locally
- **Generate**: `pnpm generate` or `npm run generate` - Generate static site

### Testing Commands
- **All tests**: `pnpm test` or `npm run test` - Run all Vitest tests
- **Watch mode**: `pnpm test:watch` or `npm run test:watch` - Run tests in watch mode
- **Coverage**: `pnpm test:coverage` or `npm run test:coverage` - Run tests with coverage report
- **Unit tests only**: `pnpm test:unit` or `npm run test:unit` - Run unit tests (test/unit/*)
- **Nuxt tests only**: `pnpm test:nuxt` or `npm run test:nuxt` - Run Nuxt integration tests (test/nuxt/*)
- **E2E tests**: `pnpm test:e2e` or `npm run test:e2e` - Run Playwright E2E tests
- **E2E UI**: `pnpm test:e2e:ui` or `npm run test:e2e:ui` - Run E2E tests with Playwright UI

### Running Single Tests
- **Unit test**: `pnpm vitest run test/unit/filename.test.ts`
- **Nuxt test**: `pnpm vitest run --project nuxt test/nuxt/filename.test.ts`
- **E2E test**: `pnpm playwright test tests/filename.spec.ts`

### Database Commands
- **Generate migrations**: `pnpm db:generate` - Create migration files from schema changes
- **Run migrations**: `pnpm db:migrate` - Apply pending migrations to database
- **Push schema**: `pnpm db:push` - Push schema directly to database (for development)
- **Database studio**: `pnpm db:studio` - Open Drizzle Studio for database management

### Code Quality
- **Lint**: ESLint is configured via @nuxt/eslint. Run through Nuxt dev tools or setup specific script if needed
- **Type check**: Use `npx nuxi typecheck` or your IDE's TypeScript integration

## Project Structure

```
├── app/                 # App directory (Nuxt app.vue, etc.)
├── components/          # Vue components
├── pages/              # File-based routing
├── composables/        # Vue composables
├── server/             # Server routes/middleware
│   └── db/             # Database configuration and schema
├── test/
│   ├── unit/           # Unit tests (Node environment)
│   └── nuxt/           # Nuxt integration tests (happy-dom)
├── tests/              # E2E tests (Playwright)
└── public/             # Static assets
```

## Code Style Guidelines

### TypeScript & JavaScript
- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use `<script setup>` syntax in Vue components
- Import order: 1) Vue/Nuxt imports, 2) External libraries, 3) Local imports
- Use explicit returns in composables and functions

### Vue Components
- Use `<script setup lang="ts">` syntax
- Export component names using `defineOptions({ name: 'ComponentName' })`
- Use Nuxt UI components when available (@nuxt/ui is installed)
- Prefer composables over mixins
- Use proper TypeScript props definition with `defineProps<Props>()`

### imports
```typescript
// Vue/Nuxt imports first
import { ref, computed } from 'vue'
import { defineNuxtRouteMiddleware } from '#app'

// External libraries
import { format } from 'date-fns'

// Local imports last
import { useTimeline } from '~/composables/useTimeline'
import TimelineItem from '~/components/TimelineItem.vue'
```

### Naming Conventions
- **Components**: PascalCase (TimelineItem, UserProfile)
- **Composables**: camelCase with 'use' prefix (useTimeline, useAuth)
- **Files**: kebab-case (timeline-item.vue, use-timeline.ts)
- **Constants**: UPPER_SNAKE_CASE for exports (API_BASE_URL)
- **Functions/Variables**: camelCase (getUserData, isLoading)

### Error Handling
- Use try/catch blocks for async operations
- Create proper error types/interfaces
- Use Nuxt's `createError` for server errors
- Implement proper loading states and error boundaries

### Testing Patterns
- **Unit tests**: Test pure functions and composables in isolation
- **Component tests**: Use `mountSuspended` from @nuxt/test-utils/runtime
- **E2E tests**: Use Playwright with Nuxt integration
- Always include descriptive test names
- Use `describe`, `it`, `expect` from Vitest
- Test both happy paths and error cases

### Nuxt Specific
- Use Nuxt auto-imports (ref, computed, etc. don't need explicit imports)
- Leverage Nuxt composables (useFetch, useRoute, etc.)
- Use `#imports` for type-safe imports
- Follow Nuxt file-based routing conventions
- Use proper Nuxt 4 patterns and modules

### Database Patterns
- Use Drizzle ORM with better-sqlite3 driver
- Define tables in server/db/schema.ts using Drizzle schema
- Use migrations for schema changes (prefer `db:migrate` over `db:push` in production)
- Import database instance from server/db/index.ts
- Follow TypeScript best practices for database queries

### UI/UX
- Leverage @nuxt/ui components and design system
- Implement responsive design using Tailwind (included with @nuxt/ui)
- Use proper semantic HTML5 elements
- Include proper ARIA labels and accessibility features

## Dependencies & Tools
- **Framework**: Nuxt 4.x with Vue 3
- **UI Library**: @nuxt/ui (includes Tailwind CSS)
- **Database**: Drizzle ORM with SQLite (better-sqlite3)
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Linting**: ESLint with @nuxt/eslint configuration
- **Image Optimization**: @nuxt/image
- **Package Manager**: pnpm (preferred)

## Important Notes
- This project uses pnpm as the package manager
- All dependencies are managed through pnpm-lock.yaml
- The project follows Nuxt 4 conventions and patterns
- Test coverage is configured and available via `pnpm test:coverage`
- E2E tests use Chromium by default via Playwright