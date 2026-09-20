# PCForge — Complete Project Architecture & Review Document

> **Project Name:** PCForge (`nayan-shah/pcforge`)  
> **Repository Type:** Full-Stack Monorepo (npm workspaces: `client`, `server`, `shared`)  
> **Domain:** PC Hardware E-commerce, Real-Time Price Comparison & Custom PC Builder (Indian Market)  
> **Review Date:** September 2026  
> **Current Version:** v0.1.0  

---

## 1. Executive Summary

**PCForge** is a full-stack web application designed for the Indian PC hardware ecosystem. It addresses fragmented hardware pricing across prominent Indian retailers (MDComputers, Vedant Computers, PrimeABGB, PCStudio, Amazon India) by providing:
1. **Aggregated Catalog:** 12-category PC hardware catalog with specifications, compatibility metadata, and image galleries.
2. **Multi-Store Price Comparison:** Real-time and normalized price tracking across 5 major Indian computer hardware retailers with stock status.
3. **Live Web Scraping:** Parallel on-demand scraping engine using Cheerio and Playwright with token-based deduplication and relevance ranking.
4. **Interactive Custom PC Builder:** 8-slot modular system builder calculating real-time TDP power draw and cumulative pricing.
5. **AI Hardware Consultant:** Workload- and budget-driven build recommendations (currently archetype-driven with deterministic matching).
6. **Administrative Dashboard:** Role-based component inventory management, Cloudinary media pipeline, and catalog maintenance.

---

## 2. High-Level Architecture & Tech Stack

```
                              [ Client (Browser) ]
                                      │
                         React 18 + TypeScript + Vite
                       TailwindCSS + Framer Motion + Axios
                                      │
                                      ▼
                        [ Express.js REST API Server ]
                             (Node.js + ES Modules)
                                      │
        ┌───────────────────┬─────────┴─────────┬───────────────────┐
        ▼                   ▼                   ▼                   ▼
 [ Auth & Security ] [ Component Engine ] [ Builder API ]   [ Scraping Engine ]
 • JWT + bcrypt      • MongoDB/Mongoose   • Build Snapshots • Cheerio / Playwright
 • Role DB-Check     • Full-Text Search   • Wattage/Cost    • Multi-Store Scrapers
 • Helmet + CORS     • Auto-Spec Resolver                     (MD, Vedant, Prime, PCStudio)
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    [ MongoDB Database ]
                    + [ Cloudinary CDN ]
```

### Technology Breakdown

| Layer | Technologies | Rationale & Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, React Router v6, React Hook Form, Framer Motion, React Icons | Fast HMR, type-safe UI, responsive UI design, accessible client-side routing and animated feedback. |
| **Backend** | Node.js, Express.js (ESM), Mongoose 7, express-validator | Asynchronous REST service, MongoDB document modeling, request validation. |
| **Database** | MongoDB | Document-based store suitable for heterogeneous component specifications and price arrays. |
| **Media / Storage** | Cloudinary + Multer | Cloud-hosted image storage with automatic URL transformation and cleanup. |
| **Scraping** | Cheerio, Playwright, Axios | Hybrid scraping pipeline (HTML parsing for static pages, headless browser for JS-rendered targets). |
| **Shared** | `shared/types.d.ts`, `shared/constants.js` | Single source of truth for categories, slots, statuses, and DTO contracts. |

---

## 3. Directory & Monorepo Structure

```
pcforge/
├── package.json                   # Root monorepo workspace configuration
├── shared/                        # Shared DTOs and business constants
│   ├── types.d.ts                 # PriceOffer, ComponentDetail, BuilderSelections
│   ├── constants.js               # COMPONENT_CATEGORIES, BUILDER_SLOTS, USER_ROLES
│   └── constants.d.ts
├── client/                        # React frontend workspace (Vite)
│   ├── src/
│   │   ├── api/                   # Centralized Axios instance & API services
│   │   │   ├── axios.ts           # Interceptors (JWT injection, 401 handling)
│   │   │   ├── authApi.ts
│   │   │   ├── componentApi.ts
│   │   │   ├── buildApi.ts
│   │   │   └── searchApi.ts
│   │   ├── components/            # Domain-driven component structure
│   │   │   ├── admin/             # Admin table, CRUD modals, image uploaders
│   │   │   ├── auth/              # ProtectedRoute, GuestRoute guards
│   │   │   ├── builder/           # BuildSummary, ComponentSelector
│   │   │   ├── catalog/           # ProductCard, PriceComparisonTable, SpecsTable
│   │   │   ├── common/            # Navbar, Footer, DataTable, LoadingState
│   │   │   ├── landing/           # Hero, Features, Trending sections
│   │   │   └── layout/            # MainLayout wrapper
│   │   ├── context/               # Global state (AuthContext, BuilderContext)
│   │   ├── hooks/                 # Custom queries (useComponents, useRetailerSearch)
│   │   ├── pages/                 # Route endpoints (Home, Builder, AI, Admin, etc.)
│   │   ├── utils/                 # Specification parser (specs.ts), price formatters
│   │   └── types/                 # Frontend-specific types
└── server/                        # Express backend workspace
    ├── src/
    │   ├── api/v1/
    │   │   ├── controllers/       # authController, componentController, buildController, searchController
    │   │   ├── middleware/        # authMiddleware, adminMiddleware, uploadMiddleware, errorHandler
    │   │   └── routes/            # Versioned route files
    │   ├── config/                # db.js (Mongoose connection), cloudinary.js
    │   ├── models/                # User.js, Component.js, Build.js
    │   ├── services/
    │   │   ├── priceComparisonService.js      # Normalization & synthetic multi-store generation
    │   │   ├── searchOrchestratorService.js  # Concurrent scraping & deduplication
    │   │   └── scrapers/                     # Retailer adapters (MDComputers, Vedant, PrimeABGB, PCStudio)
    │   ├── scripts/               # Seeders (seedComponents.js) & migrations
    │   └── utils/                 # apiResponse.js, apiError.js, specs.js
```

---

## 4. Key Functional Modules

### 4.1. Authentication & Role-Based Authorization
- **JWT Authentication:** Stateful user session management using JWT stored in `localStorage`, sent via `Authorization: Bearer <token>`.
- **Database-Verified RBAC:** The `adminMiddleware` validates the user role against MongoDB rather than relying on tamperable JWT claims.
- **Route Guards:** `ProtectedRoute`, `GuestRoute`, and `AdminRoute` enforce access control before component rendering.
- **User Features:** Registration, login, profile updating, password change, and stored build history.

### 4.2. Component Catalog & Auto-Specification Parser
- **Categories:** CPU, GPU, Motherboard, RAM, SSD, HDD, PSU, Cabinet, Cooler, Monitor, Keyboard, Mouse.
- **Auto-Resolution (`specs.ts` / `specs.js`):** Ingests raw hardware titles (e.g., *"AMD Ryzen 5 7600X"*) and automatically extracts socket (`AM5`), memory type (`DDR5`), wattage (`105W`), form factor, and bus standard.
- **Search & Filters:** Case-insensitive regex matching, category filtering, brand boundaries, and price filtering with pagination.

### 4.3. Multi-Retailer Price Comparison Engine
- **Tracked Stores:** PCStudio, Vedant Computers, MDComputers, PrimeABGB, Amazon India.
- **Fallback Heuristics:** If real-time scraped pricing is unavailable, deterministic hashing produces stable, realistic market pricing (with human retail ending numbers like ₹X,499 or ₹X,999) to provide uninterrupted price comparison data.
- **Stock Tracking:** Distinguishes between In-Stock, Out-of-Stock, and Preorder states.

### 4.4. Live Concurrent Web Scraping
- **Search Orchestration:** `searchOrchestratorService.js` fires non-blocking parallel queries using `Promise.allSettled`.
- **Fuzzy Token Matching:** Employs Jaccard similarity (0.78 threshold) and brand-model token isolation to filter out catalog dump false positives from retailers that return all items when exact search misses.

### 4.5. Custom PC Builder & Wattage Calculator
- **Slots:** CPU, Motherboard, Memory, GPU, Storage, Power Supply, Cabinet, Cooler.
- **Dynamic Aggregation:** React `useMemo` computes aggregate cost and estimated power consumption (TDP in Watts).
- **Snapshot Persistence:** Saving a build persists snapshot copies of component names, prices, and brands into the `Build` document, preventing historical price fluctuations from altering saved configurations.

### 4.6. AI Hardware Architect (Consultant)
- Features curated benchmark archetypes (1440p High Refresh AAA, Esports Budget, 4K Creator Workstation).
- Analyzes custom user prompts (target budget, games, rendering workloads) and matches hardware configurations with thermal design power (TDP) calculations.

---

## 5. API Route Specification (`/api/v1`)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create new account & issue JWT |
| `POST` | `/auth/login` | Public | Verify credentials & issue JWT |
| `GET` | `/auth/me` | User | Retrieve current user profile |
| `PUT` | `/auth/profile` | User | Update display name and avatar URL |
| `PUT` | `/auth/password` | User | Verify old password and set new password |
| `GET` | `/components` | Public | Filtered, sorted, paginated component list |
| `GET` | `/components/featured` | Public | Sampled components with images & prices |
| `GET` | `/components/:id` | Public | Component details + multi-store comparison |
| `GET` | `/components/:id/prices` | Public | Standalone price offers from all stores |
| `GET` | `/components/:id/related` | Public | Recommendation based on brand/category |
| `POST` | `/components` | Admin | Upload images and create component |
| `PUT` | `/components/:id` | Admin | Update component and adjust images |
| `DELETE` | `/components/:id` | Admin | Remove component and delete Cloudinary assets |
| `GET` | `/builds` | User | Retrieve user's saved build history |
| `POST` | `/builds` | User | Save current builder configuration |
| `DELETE` | `/builds/:id` | User | Remove saved build |
| `GET` | `/search?q=...` | Public | Trigger live concurrent scraper execution |
| `GET` | `/health` | Public | Healthcheck endpoint |

---

## 6. Security & Vulnerability Assessment

### Strengths
- **Secure Password Storage:** Uses `bcrypt` with salt rounds = 10.
- **Hidden Password Field:** `User.password` has `select: false` in Mongoose schema to prevent accidental serialization.
- **Admin Verification:** Enforced at the database level (`User.findById`) rather than trusting the JWT payload.
- **Security Headers:** `helmet` active on Express pipeline.
- **CORS Restriction:** Configurable origin via `CLIENT_URL`.

### Critical Findings & Gaps
1. **No Rate Limiting:** Auth endpoints (`/login`, `/register`) and heavy scraping endpoints (`/search`) lack rate limiters, leaving them vulnerable to credential stuffing and denial of service.
2. **Missing NoSQL Injection Defense:** Direct object queries should be protected with `express-mongo-sanitize`.
3. **Playwright in Production Dependencies:** Heavy browser binaries increase container size and memory footprints; should be decoupled into a dedicated scraping worker.
4. **Token Expiry Management:** No refresh token rotation or revocation blacklist for expired JWTs.

---

## 7. Code Quality & Technical Debt Review

| Area | Current Observation | Actionable Recommendation |
|---|---|---|
| **Testing** | Zero unit, integration, or end-to-end tests present. | Implement Vitest for React hooks and components; Jest/Supertest for API endpoints. |
| **Server Typing** | Client is 100% TypeScript; server is standard JavaScript (ESM). | Migrate server code to TypeScript or enable JSDoc type checking to guarantee contract parity. |
| **AI Implementation** | AI builder logic uses client-side keyword matching against predefined presets. | Connect a backend endpoint to Google Gemini or Claude API to provide true dynamic hardware analysis. |
| **Legacy Artifacts** | Unused empty directories (`server/src/controllers`, `routes`) and large debug logs (`vedant_debug.html`, 1.8 MB). | Prune dead folders and add scraping debug output to `.gitignore`. |
| **Schema Field Redundancy** | Price sub-schema has overlapping keys (`price` vs `currentPrice`, `store` vs `storeName`). | Unify field naming to a single canonical schema definition. |

---

## 8. Prioritized Roadmap & Recommendations

```
[Phase 1: Hardening & Security]
├── Add express-rate-limit to auth and search endpoints
├── Add express-mongo-sanitize
└── Delete 1.8MB debug dumps and empty server directories

[Phase 2: Real AI & Scraper Reliability]
├── Connect Gemini / Claude API for genuine build generation
├── Implement Redis caching for search & price scraping
└── Decouple Playwright scraper into an asynchronous worker queue

[Phase 3: Testing & Infrastructure]
├── Setup Vitest + React Testing Library for frontend
├── Setup Supertest + MongoMemoryServer for backend API tests
└── Migrate server to TypeScript for end-to-end type safety
```

---
*Document prepared for technical evaluation, code review, and cloud agent consumption.*
