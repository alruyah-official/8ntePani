# 8ntePani — Comprehensive Technical Documentation & Architecture Reference

> **Project Name:** 8ntePani  
> **Platform Type:** Full-Stack Freelance Marketplace & Job Board Platform  
> **Documentation Version:** 1.0.0  
> **Target Audience:** Core Developers, Technical Auditors, Project Handover Teams, Future Maintainers, Open Source Contributors  

---

## Table of Contents
1. [SECTION 1 — PROJECT OVERVIEW](#section-1--project-overview)
2. [SECTION 2 — TECHNOLOGY STACK](#section-2--technology-stack)
3. [SECTION 3 — COMPLETE FOLDER STRUCTURE](#section-3--complete-folder-structure)
4. [SECTION 4 — FRONTEND ARCHITECTURE](#section-4--frontend-architecture)
5. [SECTION 5 — BACKEND ARCHITECTURE](#section-5--backend-architecture)
6. [SECTION 6 — DATABASE](#section-6--database)
7. [SECTION 7 — API DOCUMENTATION](#section-7--api-documentation)
8. [SECTION 8 — AUTHENTICATION FLOW](#section-8--authentication-flow)
9. [SECTION 9 — COMPLETE REQUEST FLOW](#section-9--complete-request-flow)
10. [SECTION 10 — COMPONENT DOCUMENTATION](#section-10--component-documentation)
11. [SECTION 11 — STATE MANAGEMENT](#section-11--state-management)
12. [SECTION 12 — FILE BY FILE EXPLANATION](#section-12--file-by-file-explanation)
13. [SECTION 13 — SECURITY](#section-13--security)
14. [SECTION 14 — PERFORMANCE](#section-14--performance)
15. [SECTION 15 — DEPLOYMENT](#section-15--deployment)
16. [SECTION 16 — FEATURE DOCUMENTATION](#section-16--feature-documentation)
17. [SECTION 17 — CODE QUALITY REVIEW](#section-17--code-quality-review)
18. [SECTION 18 — COMPLETE PROJECT WORKFLOW](#section-18--complete-project-workflow)
19. [SECTION 19 — FUTURE IMPROVEMENTS](#section-19--future-improvements)

---

## SECTION 1 — PROJECT OVERVIEW

### 1.1 Project Name & Purpose
**8ntePani** is a modern, high-performance web platform designed to operate as a dual-sided freelance marketplace and job board. It bridges the gap between client businesses seeking talent and skilled freelancers (with a special emphasis on student and emerging professional talent) offering services or bidding on job postings.

### 1.2 Main Objective
The primary objective of 8ntePani is to provide a seamless, secure, transparent, and responsive ecosystem for:
- **Freelancers**: Presenting services with custom pricing and delivery timelines, managing profiles with skills and location data, receiving order requests, and conversing directly with clients.
- **Clients**: Posting job listings with defined budgets, browsing categorized fixed-price freelancer services, placing orders, communicating via messaging, and approving completed work.

### 1.3 Target Users
1. **Clients (Businesses / Startups / Individuals)**: Users looking to outsource technical, creative, or business tasks (e.g. web development, UI/UX design, marketing).
2. **Freelancers (Student Talent / Independent Professionals)**: Users looking to offer Gigs/Services, manage their portfolio, bid on job listings, and monetize their skills.

### 1.4 Main Features
- **Role-Based Access Control (RBAC)**: Strict separation of privileges between `CLIENT` and `FREELANCER`.
- **Gig & Service Directory**: Searchable, filterable marketplace for fixed-price freelancer services with image galleries.
- **Job Board**: Client-created job listings with status tracking (`OPEN`, `IN_PROGRESS`, `COMPLETED`), custom budget definitions, and interactive proposal initiation.
- **Order Lifecycle Engine**: End-to-end transaction state machine (`PENDING` → `ACTIVE` → `DELIVERED` → `COMPLETED` / `REJECTED` / `CANCELLED`).
- **Direct Messaging System**: Threads connecting clients and freelancers with instant updates and polling support.
- **Real-Time Notification System**: Unread badges, read/unread status toggling, and automated email notifications (powered by Resend).
- **Profile Management & Avatar Processing**: Cloudinary-backed image uploads, skill tagging, and public freelancer profile showcases.
- **Review & Rating Engine**: Client reviews with 1–5 star ratings and automated aggregate average calculations.

### 1.5 Overall Architecture & High Level Workflow
8ntePani follows a decoupled, client-server SPA architecture:
- **Frontend**: React 19 Single Page Application (SPA) bundled with Vite, styled with custom Vanilla CSS variables, and powered by React Router v7.
- **Backend**: Node.js REST API with Express 5, utilizing Prisma ORM (v7 with Driver Adapters) connected to a PostgreSQL database hosted on cloud providers (e.g., Supabase / Neon / Render Postgres).
- **Cloud Infrastructure**: Cloudinary for image storage, Resend for transactional emails, Render for backend service hosting, Vercel for SPA deployment.

```mermaid
graph TD
    Client[Browser / Client SPA - React 19 + Vite]
    API[Backend API - Node.js + Express 5]
    DB[(PostgreSQL Database)]
    Cloudinary[Cloudinary CDN - Image Uploads]
    Resend[Resend API - Email Engine]

    Client <-->|HTTP / REST JSON + Bearer JWT| API
    API <-->|Prisma ORM v7 / pg Adapter| DB
    API <-->|HTTP / SDK| Cloudinary
    API <-->|HTTP / Resend SDK| Resend
```

---

## SECTION 2 — TECHNOLOGY STACK

This section covers every core technology and npm dependency utilized across the project.

### 2.1 Backend Technologies & Dependencies
Located in `backend/package.json`:

| Technology / Library | Version | Purpose | Why Used | Where Used | Key Advantages |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Node.js** | v18+ | JavaScript Runtime | Event-driven non-blocking I/O for scalable API operations | Entire backend environment | High throughput, unified language across stack |
| **Express** | `^5.2.1` | Web Application Framework | Handles HTTP routing, middleware processing, request parsing | [server.js](file:///c:/Users/msina/Desktop/8ntePani/backend/server.js) & `src/routes/*` | Express 5 has improved promise error handling and route matching |
| **Prisma ORM** | `^7.8.0` | Database ORM & Query Builder | Type-safe SQL querying, auto-generated migrations, schema declaration | [prisma/schema.prisma](file:///c:/Users/msina/Desktop/8ntePani/backend/prisma/schema.prisma) & [src/config/prisma.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/config/prisma.js) | Prevents SQL injection, compile-time type safety, effortless joins |
| **@prisma/adapter-pg** | `^7.8.0` | Driver Adapter for PostgreSQL | Required in Prisma 7 to utilize standard Node `pg` pool adapters | [src/config/prisma.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/config/prisma.js) | Allows serverless-friendly connection pooling and edge compatibility |
| **pg** | `^8.22.0` | PostgreSQL Driver | Low-level driver for PostgreSQL database communication | Used internally by `@prisma/adapter-pg` | Robust connection pooling, industry standard for Node Postgres |
| **bcrypt** | `^6.0.0` | Password Hashing | Cryptographic hashing of user passwords with salt | [src/services/auth.service.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/services/auth.service.js) | One-way hashing algorithm resistant to rainbow table attacks |
| **jsonwebtoken** | `^9.0.3` | Authentication Tokens | Creates and verifies stateless JWT tokens for API auth | [src/utils/jwt.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/utils/jwt.js), [src/middlewares/auth.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/auth.middleware.js) | Stateless authentication; no server session storage required |
| **zod** | `^4.4.3` | Schema Validation | Data validation for request body payloads | `src/validators/*` & [src/middlewares/validate.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/validate.middleware.js) | Guarantees clean input types, auto-generates error messages |
| **cloudinary** | `^2.10.0` | Cloud Media Management | Image processing, hosting, and global CDN delivery | [src/config/cloudinary.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/config/cloudinary.js), [src/utils/cloudinary.utils.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/utils/cloudinary.utils.js) | Automatic image optimization, resizing, secure HTTPS hosting |
| **multer** | `^2.2.0` | Multipart Form Parser | Parses `multipart/form-data` uploads in memory buffers | [src/middlewares/upload.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/upload.middleware.js) | Handles file memory buffers without writing files to local disk |
| **streamifier** | `^0.1.1` | Buffer to Stream Conversion | Converts Node.js memory buffers into readable streams | [src/utils/cloudinary.utils.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/utils/cloudinary.utils.js) | Pipes Multer memory buffers directly into Cloudinary upload streams |
| **resend** | `^6.18.0` | Transactional Email API | Delivers order notifications and lifecycle email alerts | [src/config/resend.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/config/resend.js), [src/utils/email.utils.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/utils/email.utils.js) | High deliverability, clean HTML email templates |
| **cors** | `^2.8.6` | Cross-Origin Middleware | Controls allowed origins, headers, and HTTP methods | [server.js](file:///c:/Users/msina/Desktop/8ntePani/backend/server.js) | Protects API against unauthorized cross-site browser requests |
| **dotenv** | `^17.4.2` | Environment Loader | Loads environment variables from `.env` files into `process.env` | [server.js](file:///c:/Users/msina/Desktop/8ntePani/backend/server.js) | Keeps credentials separate from source code |
| **nodemon** | `^3.1.14` | Dev Live Reloading | Automatically restarts backend process on code modifications | Package scripts (`pnpm dev`) | Enhances developer experience during development |

### 2.2 Frontend Technologies & Dependencies
Located in `frontend/package.json`:

| Technology / Library | Version | Purpose | Why Used | Where Used | Key Advantages |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **React** | `^19.2.7` | UI Component Library | Concurrent rendering, declarative component tree construction | Entire `frontend/src/*` codebase | High performance, component reusability, rich ecosystem |
| **React DOM** | `^19.2.7` | DOM Renderer | Renders React component tree into browser DOM nodes | [frontend/src/main.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/main.jsx) | Official React DOM bindings for web web browsers |
| **Vite** | `^8.1.1` | Frontend Build Tool | ESM-native dev server and Rollup production bundler | Root build environment & dev server | Fast HMR (Hot Module Replacement), optimized production builds |
| **React Router DOM** | `^7.18.1` | Client Routing | SPA client-side routing, page parameters, protected route guards | [frontend/src/App.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/App.jsx) & across pages | Seamless navigation without page reloads |
| **Axios** | `^1.18.1` | HTTP Client | Promise-based API request library with interceptors | [frontend/src/api/axios.js](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/api/axios.js) & page views | Automatic JWT Bearer token attachment & 401 handling |
| **Oxlint** | `^1.71.0` | JavaScript Linter | High-speed code quality checking | Package scripts (`pnpm lint`) | Extremely fast Rust-based linting |

---

## SECTION 3 — COMPLETE FOLDER STRUCTURE

Below is the complete file and folder inventory for the repository:

```
8ntePani/
├── docs/
│   ├── API.md                              # Pre-existing API specification reference
│   └── TECHNICAL_DOCUMENTATION.md          # Technical documentation and system architecture
├── backend/
│   ├── .env                                # Active local environment configuration
│   ├── .env.example                        # Template environment variables
│   ├── .gitignore                          # Git exclusions for backend
│   ├── package.json                        # Backend package dependencies and scripts
│   ├── pnpm-lock.yaml                      # Locked dependency tree for pnpm
│   ├── pnpm-workspace.yaml                 # pnpm workspace definition
│   ├── prisma.config.ts                    # Prisma setup options
│   ├── render.yaml                         # Render deployment blueprint specification
│   ├── server.js                           # Server entrypoint and Express routing assembly
│   ├── prisma/
│   │   ├── schema.prisma                   # Database schema definition (Models, Enums, Relations)
│   │   ├── seed.js                         # Database seed script for initial testing data
│   │   └── migrations/                     # SQL migration history
│   └── src/
│       ├── config/
│       │   ├── cloudinary.js               # Cloudinary API configuration
│       │   ├── prisma.js                   # PrismaClient instance with pg adapter
│       │   └── resend.js                   # Resend API mailer instance
│       ├── controllers/
│       │   ├── auth.controller.js          # Authentication endpoint logic (register/login)
│       │   ├── category.controller.js      # Category endpoint logic (create/get)
│       │   ├── conversation.controller.js  # Direct messaging thread logic
│       │   ├── job.controller.js           # Client job board posting & status management logic
│       │   ├── notification.controller.js  # Notifications list and read toggle logic
│       │   ├── order.controller.js         # Order lifecycle stage management logic
│       │   ├── profile.controller.js       # Freelancer profile creation & update logic
│       │   ├── review.controller.js        # Service rating & review submission logic
│       │   ├── service.controller.js       # Service catalog CRUD & search filtering logic
│       │   └── upload.controller.js        # Media file upload controller
│       ├── middlewares/
│       │   ├── auth.middleware.js          # JWT Bearer verification guard
│       │   ├── error.middleware.js         # Global Express operational & database error handler
│       │   ├── role.middleware.js          # Role-based restriction middleware factory
│       │   ├── upload.middleware.js        # Multer in-memory upload processor
│       │   └── validate.middleware.js      # Zod request body validation wrapper
│       ├── routes/
│       │   ├── auth.routes.js              # Auth endpoints (/api/auth)
│       │   ├── category.routes.js          # Category endpoints (/api/categories)
│       │   ├── conversation.routes.js      # Conversation endpoints (/api/conversations)
│       │   ├── job.routes.js               # Job board endpoints (/api/jobs)
│       │   ├── notification.routes.js      # Notification endpoints (/api/notifications)
│       │   ├── order.routes.js             # Order endpoints (/api/orders)
│       │   ├── profile.routes.js           # Profile endpoints (/api/profile)
│       │   ├── review.routes.js            # Review endpoints (/api/reviews)
│       │   ├── service.routes.js           # Service endpoints (/api/services)
│       │   └── upload.routes.js            # Upload endpoints (/api/upload)
│       ├── services/
│       │   ├── auth.service.js            # User registration & password verify logic
│       │   ├── category.service.js        # Category database operations
│       │   ├── conversation.service.js    # Message thread creation & messaging operations
│       │   ├── job.service.js             # Job posting, status transitions, filtering
│       │   ├── notification.service.js    # Notification persistence & unread counts
│       │   ├── order.service.js           # Order creation, notifications, emails, state transitions
│       │   ├── profile.service.js         # Freelancer profile queries & mutations
│       │   ├── review.service.js          # Review creation, deletion & aggregate star rating
│       │   ├── service.service.js         # Service CRUD, search filtering, joins
│       ├── utils/
│       │   ├── AppError.js                # Operational Error class for expected 4xx/5xx status
│       │   ├── cloudinary.utils.js        # Buffer-to-stream uploader & deletion helper
│       │   ├── email.utils.js             # Resend HTML email template senders
│       │   └── jwt.js                     # JWT token signing & verification utilities
│       └── validators/
│           ├── auth.validator.js          # Zod schemas for register & login
│           ├── conversation.validator.js  # Zod schemas for start convo & send message
│           ├── job.validator.js           # Zod schemas for job creation & status update
│           ├── order.validator.js         # Zod schemas for order creation & delivery
│           ├── profile.validator.js       # Zod schemas for freelancer profile creation/update
│           ├── review.validator.js        # Zod schemas for service review submission
│           └── service.validator.js       # Zod schemas for service listing creation/update
└── frontend/
    ├── .env                                # Frontend environment config (VITE_API_URL)
    ├── .gitignore                          # Git exclusions for frontend
    ├── .oxlintrc.json                      # Oxlint linter rules configuration
    ├── index.html                          # SPA HTML entry point
    ├── package.json                        # Frontend package definition
    ├── pnpm-lock.yaml                      # Locked dependency tree for frontend
    ├── README.md                           # Frontend setup readme
    ├── vercel.json                         # Vercel deployment SPA rewrite config
    ├── vite.config.js                      # Vite plugin & dev server setup
    ├── public/                             # Public static assets (Logos, icons)
    └── src/
        ├── App.jsx                         # Main Router setup & Auth Provider wrapper
        ├── index.css                       # Global Design Tokens & Tailwind-like CSS utility variables
        ├── main.jsx                        # React 19 root mounting file
        ├── api/
        │   └── axios.js                    # Axios instance with Bearer interceptor & 401 redirect
        ├── assets/                         # SVG & image assets
        ├── components/
        │   ├── ConfirmModal.jsx            # Reusable confirmation modal dialog
        │   ├── Footer.jsx                  # Main application footer
        │   ├── JobCard.jsx                 # Reusable job card component for jobs list
        │   ├── Navbar.jsx                  # Main application navigation bar with notifications
        │   ├── PostJobModal.jsx            # Modal dialog for posting a new job listing
        │   ├── ProtectedRoute.jsx          # Route guard redirecting unauthorized users to /login
        │   ├── ServiceCard.jsx             # Reusable service card component
        │   └── StarRating.jsx              # Star rating display and interactive input
        ├── context/
        │   └── AuthContext.jsx             # React Context for user session state & token persistence
        ├── pages/
        │   ├── ClientDashboard.jsx         # Dashboard for client users (analytics, settings)
        │   ├── Company.jsx                 # About, Careers, Support static page
        │   ├── Dashboard.jsx               # Freelancer dashboard (services, orders, profile edit)
        │   ├── Explore.jsx                 # Service exploration page with filters & search
        │   ├── FreelancerProfile.jsx       # Public profile page for freelancers
        │   ├── Home.jsx                    # Landing page with hero banner & category grid
        │   ├── JobDetail.jsx               # Job view page with proposal submission
        │   ├── Jobs.jsx                    # Job board page with search & filters
        │   ├── Legal.jsx                   # Terms of service and privacy policy page
        │   ├── Login.jsx                   # User login page
        │   ├── Messages.jsx                # Direct messaging chat interface
        │   ├── Notifications.jsx           # Notification center page
        │   ├── Orders.jsx                  # Order tracking & management page
        │   ├── Register.jsx                # User account registration page
        │   └── ServiceDetail.jsx           # Detailed view for a service with reviews & ordering
        └── styles/                         # Vanilla CSS style sheets organized by feature area
```

---

## SECTION 4 — FRONTEND ARCHITECTURE

### 4.1 Entry Point & App Structure
- **[main.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/main.jsx)**: Mounts `<App />` within React `StrictMode` into the `#root` element in `index.html`. Imports [index.css](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/index.css) to establish global styling rules.
- **[App.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/App.jsx)**: Wraps the application inside `<AuthProvider>` and `<BrowserRouter>`. Contains the top-level persistent `<Navbar />` and `<Footer />`, rendering pages dynamically via `<Routes>`.

### 4.2 Route Definitions & Guards

```mermaid
graph TD
    User([Browser Navigation]) --> AppRoutes{App Router}
    
    AppRoutes -->|Public| Home["/"]
    AppRoutes -->|Public| Explore["/explore"]
    AppRoutes -->|Public| Jobs["/jobs"]
    AppRoutes -->|Public| ServiceDetail["/services/:serviceId"]
    AppRoutes -->|Public| FreelancerProfile["/profile/:userId"]
    AppRoutes -->|Public| Login["/login"]
    AppRoutes -->|Public| Register["/register"]
    AppRoutes -->|Public| Company["/company"]
    AppRoutes -->|Public| Legal["/legal"]
    
    AppRoutes -->|Protected| ProtectedCheck{Is Authenticated?}
    ProtectedCheck -->|No| RedirectLogin["Redirect to /login"]
    ProtectedCheck -->|Yes| JobDetail["/jobs/:jobId"]
    ProtectedCheck -->|Yes| Dashboard["/dashboard (Freelancer)"]
    ProtectedCheck -->|Yes| ClientDashboard["/client-dashboard (Client)"]
    ProtectedCheck -->|Yes| Messages["/messages & /messages/:id"]
    ProtectedCheck -->|Yes| Notifications["/notifications"]
    ProtectedCheck -->|Yes| Orders["/orders & /orders/:id"]
```

### 4.3 Component Directory Breakdown
1. **[Navbar.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/components/Navbar.jsx)**: Header navigation displaying brand logo, search bar (redirects to `/explore?search=...`), quick navigation links, unread notification bell with live polling (every 30s) and drop-down menu, user avatar menu with Role badge, and conditional modal triggering for posting jobs (`PostJobModal`).
2. **[Footer.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/components/Footer.jsx)**: Persistent footer with brand info, category quick links, company pages, legal links, and social media handles. Hidden on `/login` and `/register`.
3. **[ServiceCard.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/components/ServiceCard.jsx)**: Display card for services showcasing freelancer avatar, name, location, service title, fixed price, experience level, relative posting time, and link to service details.
4. **[JobCard.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/components/JobCard.jsx)**: Display card for client job postings showcasing budget, status badges, title, description excerpt, client details, and click-through protection (redirects unauthenticated users to `/login`).
5. **[PostJobModal.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/components/PostJobModal.jsx)**: Modal dialog available to `CLIENT` users to create a new job listing. Validates title, category, budget, and description. Fires a global window event `jobPosted` to trigger immediate list refresh in components listening to job creation.
6. **[StarRating.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/components/StarRating.jsx)**: Reusable star rating renderer. Supports static rating presentation or interactive star selection for writing service reviews.
7. **[ConfirmModal.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/components/ConfirmModal.jsx)**: Portal-rendered modal dialog used for destructive action confirmation (e.g. service deletion). Supports loading state disabled buttons and danger styling.
8. **[ProtectedRoute.jsx](file:///c:/Users/msina/Desktop/8ntePani/frontend/src/components/ProtectedRoute.jsx)**: Higher-Order Component wrapping protected views. Evaluates `isAuthenticated` from `AuthContext` and redirects to `/login` if unauthenticated.

---

## SECTION 5 — BACKEND ARCHITECTURE

### 5.1 Server Bootstrapping Flow
The backend entry point is [server.js](file:///c:/Users/msina/Desktop/8ntePani/backend/server.js). It initializes Express, configures global middleware, registers API domain routers under `/api/*`, attaches global error handlers, and listens on `process.env.PORT || 5000`.

```mermaid
sequenceDiagram
    autonumber
    participant Node as Node Engine
    participant Server as server.js
    participant App as Express App
    participant Middleware as Express Middlewares
    participant Router as API Domain Routers

    Node->>Server: Start Process (node server.js)
    Server->>App: express() instance created
    Server->>Middleware: app.use(express.json())
    Server->>Middleware: app.use(express.urlencoded())
    Server->>Middleware: app.use(cors(allowedOrigins))
    Server->>Router: app.use('/api/auth', authRoutes)
    Server->>Router: app.use('/api/profile', profileRoutes)
    Server->>Router: app.use('/api/services', serviceRoutes)
    Server->>Router: app.use('/api/jobs', jobRoutes)
    Server->>Router: app.use('/api/orders', orderRoutes)
    Server->>Router: app.use('/api/conversations', conversationRoutes)
    Server->>Router: app.use('/api/reviews', reviewRoutes)
    Server->>Router: app.use('/api/notifications', notificationRoutes)
    Server->>Router: app.use('/api/upload', uploadRoutes)
    Server->>Middleware: app.use(globalErrorHandler)
    Server->>Node: app.listen(PORT) -> Server Online 🚀
```

### 5.2 Middlewares Layer
- **[auth.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/auth.middleware.js)** (`protect`): Reads `Authorization: Bearer <token>`, verifies JWT signature via `verifyToken`, and attaches decoded payload (`{ id, role }`) to `req.user`. Responds with 401 if missing or invalid.
- **[role.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/role.middleware.js)** (`restrictTo(...roles)`): Factory function generating role-checking middleware. Asserts `req.user.role` matches allowed roles (e.g. `CLIENT`, `FREELANCER`); returns 403 Forbidden on failure.
- **[validate.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/validate.middleware.js)** (`validate(schema)`): Executes Zod schema `safeParse(req.body)`. On failure, extracts formatted error array and returns 400 Bad Request; on success, replaces `req.body` with parsed data.
- **[upload.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/upload.middleware.js)** (`uploadSingle`, `uploadMultiple`): Configured Multer instance with memory storage. Restricts MIME types to JPG, PNG, WEBP and limits individual file size to 5MB.
- **[error.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/error.middleware.js)** (`globalErrorHandler`): Catches thrown exceptions. Distinguishes `AppError` operational instances, Prisma database error codes (e.g., `P2002` unique constraint violation, `P2025` record not found), and unhandled 500 errors.

---

## SECTION 6 — DATABASE

### 6.1 Schema Models & Relations
The database schema defined in [prisma/schema.prisma](file:///c:/Users/msina/Desktop/8ntePani/backend/prisma/schema.prisma) uses PostgreSQL as the underlying relational engine.

#### 1. `User` Model
Represents accounts on the platform.
- **Fields**: `id` (String CUID, PK), `name` (String), `email` (String Unique), `password` (String Hashed), `role` (Enum: `CLIENT`, `FREELANCER`), `avatar` (String Nullable), `createdAt` (DateTime), `updatedAt` (DateTime).
- **Relations**: Has optional 1-to-1 `FreelancerProfile`, 1-to-Many `services`, `reviewsGiven`, `conversationsAsClient`, `conversationsAsFreelancer`, `messagesSent`, `jobsPosted`, `ordersAsClient`, `ordersAsFreelancer`, `notifications`.

#### 2. `FreelancerProfile` Model
Holds freelancer-specific metadata.
- **Fields**: `id` (String CUID, PK), `userId` (String Unique, FK to `User.id`), `bio` (String Nullable), `skills` (String Array), `location` (String Nullable), `languages` (String Array), `createdAt`, `updatedAt`.
- **Relations**: Belongs to `User` (1-to-1).

#### 3. `Category` Model
Grouping container for services and jobs.
- **Fields**: `id` (String CUID, PK), `name` (String Unique), `slug` (String Unique).
- **Relations**: Has 1-to-Many `services` and `jobs`.

#### 4. `Service` Model
A gig or listing posted by a freelancer.
- **Fields**: `id` (String CUID, PK), `freelancerId` (String FK to `User.id`), `categoryId` (String FK to `Category.id`), `title` (String), `description` (String), `price` (Decimal), `deliveryDays` (Int), `images` (String Array), `createdAt`, `updatedAt`.
- **Relations**: Belongs to `freelancer` (`User`), belongs to `category` (`Category`), has 1-to-Many `reviews` and `orders`.

#### 5. `Review` Model
Rating and feedback left by a client on a service.
- **Fields**: `id` (String CUID, PK), `clientId` (String FK to `User.id`), `serviceId` (String FK to `Service.id`), `rating` (Int 1-5), `comment` (String Nullable), `createdAt`.
- **Relations**: Belongs to `client` (`User`) and `service` (`Service`).

#### 6. `Conversation` Model
Messaging container between a client and freelancer.
- **Fields**: `id` (String CUID, PK), `clientId` (String FK to `User.id`), `freelancerId` (String FK to `User.id`), `createdAt`.
- **Relations**: Belongs to `client` (`User`), belongs to `freelancer` (`User`), has 1-to-Many `messages`.

#### 7. `Message` Model
A single chat message inside a conversation.
- **Fields**: `id` (String CUID, PK), `conversationId` (String FK to `Conversation.id`), `senderId` (String FK to `User.id`), `content` (String), `createdAt`.
- **Relations**: Belongs to `conversation` (`Conversation`) and `sender` (`User`).

#### 8. `Job` Model
Job posting created by a client looking to hire.
- **Fields**: `id` (String CUID, PK), `clientId` (String FK to `User.id`), `categoryId` (String FK to `Category.id`), `title` (String), `description` (String), `budget` (Decimal Nullable), `status` (Enum: `OPEN`, `IN_PROGRESS`, `COMPLETED`), `createdAt`, `updatedAt`.
- **Relations**: Belongs to `client` (`User`) and `category` (`Category`).

#### 9. `Order` Model
Transaction record tracking a service purchase.
- **Fields**: `id` (String CUID, PK), `clientId` (String FK to `User.id`), `freelancerId` (String FK to `User.id`), `serviceId` (String FK to `Service.id`), `status` (Enum: `PENDING`, `ACTIVE`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `REJECTED`), `requirements` (String), `deliveryNote` (String Nullable), `price` (Decimal), `createdAt`, `updatedAt`.
- **Relations**: Belongs to `client` (`User`), `freelancer` (`User`), and `service` (`Service`).

#### 10. `Notification` Model
In-app alert for order or message updates.
- **Fields**: `id` (String CUID, PK), `userId` (String FK to `User.id`), `type` (Enum: `NEW_ORDER`, `ORDER_ACCEPTED`, `ORDER_REJECTED`, `ORDER_DELIVERED`, `ORDER_COMPLETED`, `ORDER_CANCELLED`, `NEW_MESSAGE`), `title` (String), `message` (String), `isRead` (Boolean Default `false`), `relatedId` (String Nullable), `createdAt`.
- **Relations**: Belongs to `user` (`User`).

### 6.2 Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o| FreelancerProfile : "has profile"
    User ||--o{ Service : "creates services"
    User ||--o{ Review : "writes reviews"
    User ||--o{ Conversation : "participates client/freelancer"
    User ||--o{ Message : "sends messages"
    User ||--o{ Job : "posts jobs"
    User ||--o{ Order : "places/receives orders"
    User ||--o{ Notification : "receives notifications"

    Category ||--o{ Service : "categorizes"
    Category ||--o{ Job : "categorizes"

    Service ||--o{ Review : "receives reviews"
    Service ||--o{ Order : "purchased via"

    Conversation ||--o{ Message : "contains"
```

---

## SECTION 7 — API DOCUMENTATION

This section details all API endpoints implemented in the 8ntePani API backend.

### 7.1 Authentication Endpoints (`/api/auth`)
- **`POST /api/auth/register`**
  - **Purpose**: Creates a new user account (`CLIENT` or `FREELANCER`).
  - **Auth**: None (Public).
  - **Request Body**: `{ "name": "Jane Doe", "email": "jane@example.com", "password": "secretpassword", "role": "FREELANCER" }`
  - **Response 201**: `{ "success": true, "message": "Account created successfully", "data": { "user": { "id": "...", "name": "...", "email": "...", "role": "..." } } }`
  - **Errors**: 400 (Validation failed), 409 (Email already exists).

- **`POST /api/auth/login`**
  - **Purpose**: Authenticates credentials and returns a signed JWT token.
  - **Auth**: None (Public).
  - **Request Body**: `{ "email": "jane@example.com", "password": "secretpassword" }`
  - **Response 200**: `{ "success": true, "message": "Login successful", "data": { "token": "eyJhbG...", "user": { ... } } }`
  - **Errors**: 400 (Validation failed), 401 (Invalid email or password).

### 7.2 Profile Endpoints (`/api/profile`)
- **`POST /api/profile`**: Authenticated `FREELANCER` only. Creates a `FreelancerProfile` record.
- **`PUT /api/profile`**: Authenticated `FREELANCER` only. Updates an existing profile.
- **`GET /api/profile/me`**: Authenticated user. Retrieves own profile details.
- **`GET /api/profile/:userId`**: Public. Retrieves public freelancer profile, listed services, and completed order count.
- **`POST /api/profile/avatar`**: Authenticated user. Uploads profile picture to Cloudinary and updates `User.avatar`.

### 7.3 Category Endpoints (`/api/categories`)
- **`POST /api/categories`**: Authenticated user. Creates a new category (`name`, `slug`).
- **`GET /api/categories`**: Public. Fetches all categories ordered alphabetically.

### 7.4 Service Endpoints (`/api/services`)
- **`POST /api/services`**: Authenticated `FREELANCER` with an active profile. Creates a new service.
- **`PUT /api/services/:serviceId`**: Authenticated `FREELANCER` (owner). Updates service listing.
- **`DELETE /api/services/:serviceId`**: Authenticated `FREELANCER` (owner). Deletes service.
- **`GET /api/services`**: Public. Queries services with optional filters (`categoryId`, `minPrice`, `maxPrice`, `search`).
- **`GET /api/services/freelancer/:userId`**: Public. Lists all services posted by a specific freelancer.
- **`GET /api/services/:serviceId`**: Public. Fetches complete service details, freelancer info, category, and review list.

### 7.5 Job Board Endpoints (`/api/jobs`)
- **`POST /api/jobs`**: Authenticated `CLIENT` only. Posts a new job listing.
- **`GET /api/jobs`**: Public. Lists open jobs with optional filters (`categoryId`, `status`, `search`).
- **`GET /api/jobs/:jobId`**: Public/Authenticated. Retrieves specific job details.
- **`PUT /api/jobs/:jobId`**: Authenticated `CLIENT` (owner). Updates job listing (OPEN jobs only).
- **`PATCH /api/jobs/:jobId/status`**: Authenticated `CLIENT` (owner). Updates status (`OPEN` → `IN_PROGRESS` → `COMPLETED`).
- **`DELETE /api/jobs/:jobId`**: Authenticated `CLIENT` (owner). Deletes job posting.

### 7.6 Order Endpoints (`/api/orders`)
- **`POST /api/orders`**: Authenticated `CLIENT` only. Places order on a service. Automatically triggers notification, email, and first message thread.
- **`GET /api/orders/my-orders`**: Authenticated user. Retrieves orders where user is client or freelancer.
- **`GET /api/orders/:orderId`**: Authenticated participant. Retrieves detailed order object.
- **`PATCH /api/orders/:orderId/accept`**: Authenticated `FREELANCER`. Transitions pending order to `ACTIVE`.
- **`PATCH /api/orders/:orderId/reject`**: Authenticated `FREELANCER`. Transitions pending order to `REJECTED`.
- **`PATCH /api/orders/:orderId/deliver`**: Authenticated `FREELANCER`. Submits delivery note and transitions to `DELIVERED`.
- **`PATCH /api/orders/:orderId/complete`**: Authenticated `CLIENT`. Approves delivery and transitions to `COMPLETED`.
- **`PATCH /api/orders/:orderId/cancel`**: Authenticated client/freelancer. Cancels uncompleted order (`CANCELLED`).

### 7.7 Conversation Endpoints (`/api/conversations`)
- **`POST /api/conversations`**: Authenticated user. Starts or returns an existing chat thread between client and freelancer.
- **`GET /api/conversations`**: Authenticated user. Retrieves user inbox threads with last-message preview.
- **`GET /api/conversations/:conversationId`**: Authenticated participant. Fetches full message log.
- **`POST /api/conversations/:conversationId/messages`**: Authenticated participant. Posts a new message into thread.

### 7.8 Review Endpoints (`/api/reviews`)
- **`POST /api/reviews`**: Authenticated `CLIENT`. Leaves 1–5 star review and comment on a service.
- **`GET /api/reviews/service/:serviceId`**: Public. Fetches all reviews and calculated average rating.
- **`DELETE /api/reviews/:reviewId`**: Authenticated `CLIENT` (author). Deletes review.

### 7.9 Notification & Upload Endpoints
- **`GET /api/notifications`**: Retrieves notifications list.
- **`GET /api/notifications/unread-count`**: Gets unread count.
- **`PATCH /api/notifications/read-all`**: Marks all notifications read.
- **`PATCH /api/notifications/:id/read`**: Marks single notification read.
- **`POST /api/upload/single`** & **`POST /api/upload/multiple`**: In-memory Multer to Cloudinary stream uploaders.

---

## SECTION 8 — AUTHENTICATION FLOW

### 8.1 JWT Lifecycle & Role Authorization
1. **Registration/Login**: User supplies credentials. On verification, `generateToken({ id: user.id, role: user.role })` produces a JWT signed with `JWT_SECRET` valid for 7 days.
2. **Storage**: The SPA stores the token in `localStorage` alongside serialized user metadata.
3. **API Authorization**: Axios interceptor injects header `Authorization: Bearer <token>` on all HTTP calls.
4. **Backend Guard**: `protect` middleware decodes token, assigns claims to `req.user`, and passes execution to `restrictTo(...roles)` for fine-grained permission control.

### 8.2 Authentication Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / Freelancer
    participant SPA as React SPA (AuthContext)
    participant API as Express API (/api/auth)
    participant Service as auth.service.js
    participant DB as PostgreSQL Database

    User->>SPA: Enters Email & Password
    SPA->>API: POST /api/auth/login
    API->>Service: loginUser(email, password)
    Service->>DB: findUnique({ where: { email } })
    DB-->>Service: User Record (with hashed password)
    Service->>Service: bcrypt.compare(password, user.password)
    
    alt Credentials Invalid
        Service-->>API: Throw Error 401
        API-->>SPA: 401 Unauthorized Response
        SPA-->>User: Display Error Banner
    else Credentials Valid
        Service->>Service: generateToken({ id, role })
        Service-->>API: Return { token, userWithoutPassword }
        API-->>SPA: 200 OK + JWT Token & User Data
        SPA->>SPA: Save to localStorage & AuthContext State
        SPA-->>User: Redirect to Dashboard / Homepage
    end
```

---

## SECTION 9 — COMPLETE REQUEST FLOW

Below is an end-to-end trace of a client placing an order on a freelancer's service:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client User
    participant UI as React UI (ServiceDetail.jsx)
    participant Axios as Axios API Client
    participant Route as Express Router (/api/orders)
    participant MW as Middlewares (protect + restrictTo)
    participant Ctrl as order.controller.js
    participant Service as order.service.js
    participant DB as PostgreSQL Database
    participant Email as Resend Email Service

    Client->>UI: Clicks "Confirm Order" (Inputs requirements)
    UI->>Axios: api.post('/api/orders', { serviceId, requirements })
    Axios->>Route: POST /api/orders (Authorization: Bearer JWT)
    Route->>MW: Execute protect & restrictTo('CLIENT')
    MW->>Ctrl: createOrder(req, res)
    Ctrl->>Service: createOrder(clientId, { serviceId, requirements })
    
    Service->>DB: findUnique(Service with Freelancer details)
    Service->>DB: create(Order record in PENDING state)
    Service->>DB: createNotification(for Freelancer)
    Service->>DB: findOrCreate Conversation & create Message
    Service->>Email: sendNewOrderEmail(freelancerEmail, details)
    
    DB-->>Service: Created Order Object
    Service-->>Ctrl: Return Order
    Ctrl-->>Axios: 201 Created Response
    Axios-->>UI: Promise Resolved
    UI->>Client: Show Success Banner & Redirect to /orders
```

---

## SECTION 10 — COMPONENT DOCUMENTATION

### Component Matrix

| Component | Purpose | Key Props | Core State | Triggered API Calls |
| :--- | :--- | :--- | :--- | :--- |
| **Navbar** | Primary header & nav | None | `unreadCount`, `notifications`, `showNotifDropdown`, `showPostJobModal` | `GET /api/notifications/unread-count`, `GET /api/notifications`, `PATCH /api/notifications/read-all` |
| **Footer** | Global footer links | None | None | None |
| **ServiceCard** | Marketplace gig card | `service` (Object) | Dynamic relative date & experience fallback state | None |
| **JobCard** | Job board posting card | `job` (Object) | Relative time, budget formatting | None |
| **PostJobModal** | Job posting modal dialog | `onClose` (Func) | `jobForm`, `categories`, `loading`, `error`, `success` | `GET /api/categories`, `POST /api/jobs` |
| **StarRating** | Star rating display/picker | `rating`, `size`, `interactive`, `onRate` | Interactive star hover/selection | None |
| **ConfirmModal** | Deletion confirmation modal | `isOpen`, `title`, `message`, `onConfirm`, `onCancel`, `loading` | Modal backdrop capture | None |
| **ProtectedRoute** | Route security guard | `children` (React Node) | Evaluates `isAuthenticated` | None |

---

## SECTION 11 — STATE MANAGEMENT

### 11.1 Context API (`AuthContext.jsx`)
App-wide state management is driven by `AuthContext`. It manages:
- **`user`**: Currently authenticated user object (sanitized, contains `id`, `name`, `email`, `role`, `avatar`). Initialized lazily from `localStorage.getItem('user')`.
- **`token`**: JWT authorization string. Initialized lazily from `localStorage.getItem('token')`.
- **`isAuthenticated`**: Boolean getter (`!!token`).
- **`login(userData, authToken)`**: Persists token and user object into `localStorage` and updates React state.
- **`logout()`**: Clears `localStorage` items, resets state to `null`, and redirects to `/login`.

### 11.2 Page Local State & React Lifecycle
- **Filtering & Search**: Managed locally in pages like `Explore.jsx` and `Jobs.jsx` with a 400ms setTimeout debouncing pattern on input changes to minimize unnecessary API requests.
- **Form State**: Managed using local controlled inputs with inline error messaging.

---

## SECTION 12 — FILE BY FILE EXPLANATION

This section provides a granular reference of every code file in the repository.

### Backend Source Files (`backend/src/`)
- **[server.js](file:///c:/Users/msina/Desktop/8ntePani/backend/server.js)**: Configures Express app, registers all 10 endpoint routes, mounts global CORS, 404 fallback, error handler, and starts HTTP server on configured port.
- **[src/config/prisma.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/config/prisma.js)**: Initializes `@prisma/adapter-pg` driver pool using `DATABASE_URL` and exports shared `PrismaClient` instance.
- **[src/config/cloudinary.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/config/cloudinary.js)**: Configures Cloudinary v2 SDK using cloud credentials.
- **[src/config/resend.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/config/resend.js)**: Initializes Resend client using `RESEND_API_KEY`.
- **[src/middlewares/auth.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/auth.middleware.js)**: Middleware extracting Bearer JWT token and setting `req.user`.
- **[src/middlewares/role.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/role.middleware.js)**: Factory restricting routes to specific roles (`CLIENT` / `FREELANCER`).
- **[src/middlewares/validate.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/validate.middleware.js)**: Zod body validation middleware.
- **[src/middlewares/upload.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/upload.middleware.js)**: Multer image upload memory processor.
- **[src/middlewares/error.middleware.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/middlewares/error.middleware.js)**: Global error handling middleware formatting error responses.
- **[src/services/auth.service.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/services/auth.service.js)**: Contains `registerUser` and `loginUser` logic using `bcrypt` and `jwt`.
- **[src/services/service.service.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/services/service.service.js)**: Full CRUD and dynamic query builder for freelancer services.
- **[src/services/job.service.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/services/job.service.js)**: Job posting CRUD, status machine, and category validation.
- **[src/services/order.service.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/services/order.service.js)**: Order lifecycle engine managing state transitions (`accept`, `reject`, `deliver`, `complete`, `cancel`), automated messaging, in-app notifications, and Resend email alerts.
- **[src/services/conversation.service.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/services/conversation.service.js)**: Direct chat thread creation, participant authorization, message posting.
- **[src/services/profile.service.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/services/profile.service.js)**: Freelancer profile creation, update, and public fetch with completed job counts.
- **[src/services/review.service.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/services/review.service.js)**: Review creation, duplicate prevention, and average star calculation.
- **[src/services/notification.service.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/services/notification.service.js)**: Notification generation, read toggle, and unread counts.
- **[src/utils/AppError.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/utils/AppError.js)**: Operational error class with custom status codes.
- **[src/utils/cloudinary.utils.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/utils/cloudinary.utils.js)**: Converts buffer to stream for Cloudinary uploads and handles image deletion.
- **[src/utils/email.utils.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/utils/email.utils.js)**: Safe HTML email sender utilizing Resend API.
- **[src/utils/jwt.js](file:///c:/Users/msina/Desktop/8ntePani/backend/src/utils/jwt.js)**: Wraps JWT sign and verify methods.

---

## SECTION 13 — SECURITY

### Security Implementation Highlights
1. **Password Safety**: Hashed using `bcrypt` with 10 salt rounds before storage. Plain-text passwords are never logged or stored.
2. **SQL Injection Defense**: All database queries are executed via Prisma ORM parameterized queries, completely eliminating SQL injection vectors.
3. **Stateless JWT Security**: Signed using `JWT_SECRET` with explicit 7-day expiration (`7d`).
4. **CORS Control**: Access restricted to authorized domain origins configured via `process.env.FRONTEND_URL` and specified local dev ports.
5. **Request Body Sanitization**: Input fields validated via Zod schemas before reaching service layers.
6. **File Upload Verification**: Multer filters incoming upload requests by MIME type (`image/jpeg`, `image/png`, `image/webp`) and enforces a 5MB size limit.

---

## SECTION 14 — PERFORMANCE

### Optimization Strategies Implemented
- **Dynamic Database Queries**: Prisma queries construct minimal `where` and `include` objects dynamically, avoiding bloated queries.
- **Image Optimization & Streaming**: Uploaded media is processed via Cloudinary CDN streams rather than disk writes, serving optimized web formats.
- **Debounced Search Inputs**: Search filters on `/explore` and `/jobs` use a 400ms debounce timer to prevent redundant API requests.
- **Selective Column Inclusion**: User database lookups explicitly omit password hashes using reusable projection objects (`USER_SAFE_SELECT`).

---

## SECTION 15 — DEPLOYMENT

### 15.1 Environment Variables Reference

#### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/8ntepani?schema=public"
JWT_SECRET="super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
RESEND_API_KEY="re_123456789"
EMAIL_FROM="onboarding@resend.dev"
FRONTEND_URL="http://localhost:5173"
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:5000"
```

### 15.2 Local Development Guide
1. **Install Dependencies**:
   ```bash
   # In root directory or subfolders
   cd backend && pnpm install
   cd ../frontend && pnpm install
   ```
2. **Database Setup**:
   ```bash
   cd backend
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```
3. **Run Development Servers**:
   ```bash
   # Terminal 1 (Backend API)
   cd backend && pnpm dev

   # Terminal 2 (Frontend SPA)
   cd frontend && pnpm dev
   ```

### 15.3 Deployment Setup
- **Frontend Deployment (Vercel)**: Point Vercel to `frontend/` directory. Configure `vercel.json` rewrites for SPA routing. Set `VITE_API_URL` to backend domain.
- **Backend Deployment (Render)**: Blueprint defined in [backend/render.yaml](file:///c:/Users/msina/Desktop/8ntePani/backend/render.yaml). Runs `pnpm install`, `pnpm prisma migrate deploy`, and starts `server.js`.

---

## SECTION 16 — FEATURE DOCUMENTATION

| Feature | Primary Files Involved | Backend Route / Controller | Database Tables |
| :--- | :--- | :--- | :--- |
| **Authentication** | `Login.jsx`, `Register.jsx`, `AuthContext.jsx` | `POST /api/auth/register`, `POST /api/auth/login` | `User` |
| **Services Directory** | `Explore.jsx`, `ServiceDetail.jsx`, `ServiceCard.jsx` | `GET /api/services`, `GET /api/services/:id` | `Service`, `Category`, `User` |
| **Job Board** | `Jobs.jsx`, `JobDetail.jsx`, `PostJobModal.jsx` | `GET /api/jobs`, `POST /api/jobs`, `PATCH /api/jobs/:id/status` | `Job`, `Category`, `User` |
| **Order Lifecycle** | `Orders.jsx`, `ServiceDetail.jsx` | `POST /api/orders`, `PATCH /api/orders/:id/*` | `Order`, `Service`, `User`, `Notification` |
| **Messaging** | `Messages.jsx` | `GET /api/conversations`, `POST /api/conversations/:id/messages` | `Conversation`, `Message`, `User` |
| **Notifications** | `Navbar.jsx`, `Notifications.jsx` | `GET /api/notifications`, `PATCH /api/notifications/*` | `Notification` |
| **Profile Management** | `Dashboard.jsx`, `FreelancerProfile.jsx` | `GET/POST/PUT /api/profile/*` | `FreelancerProfile`, `User` |

---

## SECTION 17 — CODE QUALITY REVIEW

### Observations & Recommendations
1. **Unused Files / Cleanups**:
   - Empty `.gitkeep` files exist in backend folders (`controllers/`, `models/`, `routes/`, `services/`, `utils/`, `middlewares/`). These can be retained or removed as needed.
2. **Duplicate Code / Hardcoded Fallbacks**:
   - `ServiceDetail.jsx` and `JobDetail.jsx` contain small inline helper utilities (`getInitials`, `relativeDate`). Consider extracting these into a shared frontend utility file (`frontend/src/utils/formatters.js`).
3. **Route Ordering Precautions**:
   - Dynamic routes (e.g. `/api/profile/me` vs `/api/profile/:userId` or `/api/notifications/read-all` vs `/api/notifications/:id/read`) are correctly declared before parameterized routes in Express router files to prevent parameter collision. Maintain this convention for future route additions.

---

## SECTION 18 — COMPLETE PROJECT WORKFLOW

```mermaid
workflow
    title 8ntePani Complete End-to-End User Journey
    
    user_starts[User Visits 8ntePani] --> choice{Account Role?}
    
    choice -->|Register as CLIENT| client_reg[Fills Register Form -> CLIENT role]
    choice -->|Register as FREELANCER| free_reg[Fills Register Form -> FREELANCER role]
    
    client_reg --> client_dash[Client Dashboard / Explore Page]
    free_reg --> free_dash[Freelancer Dashboard -> Creates Profile & Lists Services]
    
    client_dash --> browse_action{Client Choice}
    browse_action -->|Browse Services| browse_svc[Finds Freelancer Service on /explore]
    browse_action -->|Post Job| post_job[Opens PostJobModal -> Submits Job on /jobs]
    
    post_job --> job_board[Job Appears on Board]
    job_board --> free_bid[Freelancer Views Job -> Clicks Apply Now]
    free_bid --> chat_start[Auto-creates Conversation Thread]
    
    browse_svc --> place_order[Client Clicks Hire Freelancer -> Inputs Requirements]
    place_order --> order_created[Order Created in PENDING State]
    order_created --> alerts[Auto Notification + Email Sent to Freelancer]
    
    alerts --> free_action{Freelancer Response}
    free_action -->|Reject| order_rejected[Order Marked REJECTED]
    free_action -->|Accept| order_active[Order Marked ACTIVE]
    
    order_active --> work[Freelancer Performs Work & Uploads Delivery Note]
    work --> order_delivered[Order Marked DELIVERED]
    
    order_delivered --> client_review{Client Approves?}
    client_review -->|Approve| order_complete[Order Marked COMPLETED]
    order_complete --> leave_review[Client Submits 1-5 Star Review & Feedback]
    leave_review --> updated_rating[Service Aggregate Star Rating Updated]
```

---

## SECTION 19 — FUTURE IMPROVEMENTS

1. **WebSocket Integration**: Upgrade messaging polling (currently 3s interval) to Socket.io or WebSockets for real-time instant messaging.
2. **Escrow & Payment Gateway Integration**: Connect Stripe or Razorpay SDKs for secure payment holding during active order states.
3. **Advanced Search Engine**: Integrate Meilisearch or PostgreSQL Full-Text Search for fuzzy search and instant autocomplete.
4. **Automated End-to-End Testing**: Add Playwright / Cypress integration tests for order flow verification.

---
*Documentation Compiled for 8ntePani Project — All Rights Reserved.*
