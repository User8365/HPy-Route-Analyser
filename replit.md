# GPX Route Analyzer

## Overview

This is a GPX file analysis application built for sailing/nautical route analysis. Users can upload GPX files containing sailing route data, and the application parses and analyzes the route to extract metrics like heading (HDG), true wind angle (TWA), speed over ground (SOG), sail configurations, foiling statistics, and more. The frontend displays route points in a table format with statistical summaries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme configuration
- **Animations**: Framer Motion for drag-and-drop and transitions
- **Build Tool**: Vite with hot module replacement

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/`
- Reusable components in `client/src/components/`
- UI primitives in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/`
- Path aliases: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **XML Parsing**: fast-xml-parser for GPX file processing

The server handles:
- GPX file upload and parsing via POST `/api/analyze`
- Static file serving in production
- Vite dev server middleware in development

### Shared Code
- `shared/schema.ts`: Drizzle ORM schema definitions and TypeScript types
- `shared/routes.ts`: API route definitions with input/output Zod schemas

### Data Flow
1. User drops/selects GPX file in DropZone component
2. File content is read as text and sent to backend
3. Server parses GPX XML, extracts waypoint data
4. Analysis results (points array + stats object) returned to frontend
5. RouteTable component displays the analyzed data

### Build System
- Development: `tsx` for TypeScript execution with Vite HMR
- Production: Custom build script using esbuild for server bundling, Vite for client
- Output: Server bundle to `dist/index.cjs`, client assets to `dist/public/`

## External Dependencies

### Database
- **PostgreSQL**: Primary database (connection via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database toolkit with schema in `shared/schema.ts`
- **Drizzle Kit**: Migration tooling configured in `drizzle.config.ts`

Currently using in-memory storage (`MemStorage` class) but database schema is defined for future persistence.

### Key NPM Packages
- **fast-xml-parser**: GPX file parsing
- **zod**: Runtime type validation for API contracts
- **drizzle-zod**: Zod schema generation from Drizzle schemas
- **express-session** + **connect-pg-simple**: Session management (available but not currently active)

### Fonts (External CDN)
- Google Fonts: Inter, Space Grotesk, JetBrains Mono