# EventBook Engineering Specification

## 1. Objective

This document defines the engineering blueprint for EventBook so the team can build a secure, polished, testable, and AI-enhanced event booking platform without drifting into a prototype structure.

The system must be built with a strong backend-first foundation, clean frontend flows, and clear APIs. AI should be integrated as a grounded assistant that searches real event data rather than generating fake events.

## 2. Product Principles

- Security before feature count
- Server-side truth before frontend assumptions
- One-ticket flow for version 1
- Admin approval before public visibility
- Stripe-verified payment before ticket issuance
- Data-backed AI instead of hallucinated recommendations
- Strong dev experience with tests and CI

## 3. Architecture Overview

### 3.1 High-level structure

```text
Frontend (React)
  -> routes for event discovery, auth, booking, tickets, admin review
  -> calls backend REST APIs

Backend (Node.js + Express)
  -> authentication middleware
  -> route layer
  -> validation and controller layer
  -> service layer
  -> database layer
  -> Stripe integration
  -> AI search service

Database (PostgreSQL)
  -> users, events, bookings, tickets

External services
  -> Firebase Auth
  -> Stripe Checkout and Webhooks
  -> AI provider (future)
```

### 3.2 Recommended backend structure

```text
backend/
  src/
    app.js
    server.js
    config/
      env.js
      db.js
      firebase.js
      stripe.js
    middleware/
      auth.js
      admin.js
      validate.js
      errorHandler.js
    routes/
      auth.routes.js
      user.routes.js
      event.routes.js
      booking.routes.js
      ticket.routes.js
      admin.routes.js
      ai.routes.js
    controllers/
      auth.controller.js
      event.controller.js
      booking.controller.js
      ticket.controller.js
      admin.controller.js
      ai.controller.js
    services/
      auth.service.js
      event.service.js
      booking.service.js
      ticket.service.js
      stripe.service.js
      ai.service.js
    validators/
      event.validator.js
      booking.validator.js
      ticket.validator.js
    models/
      User.js
      Event.js
      Booking.js
      Ticket.js
    repositories/
      event.repo.js
      booking.repo.js
      ticket.repo.js
    utils/
      response.js
      logger.js
      crypto.js
```

### 3.3 Recommended frontend structure

```text
frontend/src/
  app/
    App.js
    routes.js
    providers/
      AuthProvider.js
  features/
    auth/
      Login.jsx
      Signup.jsx
    events/
      EventsList.jsx
      EventDetails.jsx
      AddEvent.jsx
    bookings/
      MyBookings.jsx
      TicketDetails.jsx
    payment/
      PaymentSuccess.jsx
      PaymentCancel.jsx
    admin/
      AdminLogin.jsx
      AdminDashboard.jsx
      AdminEventPage.jsx
      ScannerView.jsx
    ai/
      EventAssistant.jsx
  components/
    Navbar.jsx
    LoadingState.jsx
    EmptyState.jsx
    Toast.jsx
  hooks/
    useAuth.js
  services/
    api.js
    auth.js
    eventApi.js
    bookingApi.js
    ticketApi.js
    aiApi.js
  styles/
    global.css
    design-system.css
```

## 4. Functional Architecture

### 4.1 Authentication architecture

- Use Firebase Authentication for user login/signup.
- Exchange Firebase ID token for backend auth.
- Store Firebase UID in the database user record.
- Store user role in the database.
- Use middleware to validate access tokens and attach `req.user`.

### 4.2 Authorization architecture

- `requireAuth` checks the token and loads the user.
- `requireAdmin` checks `user.role === 'admin'`.
- `requireOwnerOrAdmin` for ticket/booking access.
- No route should trust client-side role flags.

### 4.3 Event approval flow

```text
Organizer submits event
  -> event status = pending_review
  -> Admin reviews event
  -> Approve -> status = approved
  -> Reject -> status = rejected
  -> Approved event becomes publicly visible
```

### 4.4 Booking flow

```text
User chooses approved event
  -> backend validates availability and price
  -> create booking row with status = checkout_started
  -> create Stripe Checkout session
  -> redirect user to Stripe
  -> Stripe webhook calls backend
  -> backend verifies payment signature and amount
  -> booking status = confirmed
  -> ticket generated
```

## 5. Database Design

### 5.1 Entity relationships

```text
User 1 --- * Event
User 1 --- * Booking
Event 1 --- * Booking
Booking 1 --- 1 Ticket
```

### 5.2 User table

```sql
users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 5.3 Event table

```sql
events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  timezone VARCHAR(80) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL,
  price_in_paise INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'pending_review',
  created_by INTEGER NOT NULL REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 5.4 Booking table

```sql
bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  event_id INTEGER NOT NULL REFERENCES events(id),
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  amount_in_paise INTEGER NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'inr',
  status VARCHAR(30) NOT NULL DEFAULT 'checkout_started',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 5.5 Ticket table

```sql
tickets (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id),
  ticket_code VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'issued',
  redeemed_at TIMESTAMP,
  redeemed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 5.6 Indexes

Add indexes for:
- users.email
- users.firebase_uid
- events.status
- events.starts_at
- events.category
- bookings.user_id
- bookings.event_id
- bookings.stripe_session_id
- tickets.ticket_code
- tickets.status

## 6. API Specification

### 6.1 Auth routes

#### POST /api/auth/login
- Input: email, password
- Returns: token or user session

#### POST /api/auth/google
- Input: Google token
- Returns: authenticated user session

#### POST /api/auth/me
- Requires auth
- Returns current user profile

### 6.2 Event routes

#### GET /api/events
- Returns approved public events
- Query params: category, location, date, priceMax, search, page, limit

#### GET /api/events/:id
- Returns event details
- Requires event to be approved

#### POST /api/events
- Requires auth
- Creates event with pending_review status
- Organizer is derived from auth user

#### GET /api/events/admin/pending
- Requires admin
- Returns pending events

#### PATCH /api/events/:id/approve
- Requires admin
- Approves event

#### PATCH /api/events/:id/reject
- Requires admin
- Rejects event with reason

### 6.3 Booking routes

#### POST /api/bookings/checkout
- Requires auth
- Validates event and availability
- Creates Stripe Checkout session
- Returns checkout URL and booking ID

#### GET /api/bookings/me
- Requires auth
- Returns user bookings

#### GET /api/bookings/:id
- Requires auth or admin
- Returns booking detail
- User can only view own bookings

#### GET /api/bookings/:id/ticket
- Requires auth
- Returns ticket detail if owned by user

### 6.4 Ticket routes

#### GET /api/tickets/:code
- Requires verifier/admin auth
- Returns ticket detail and validation status

#### POST /api/tickets/:code/redeem
- Requires verifier/admin auth
- Marks ticket as redeemed once

### 6.5 AI routes

#### POST /api/ai/search-events
- Requires auth
- Input: natural language query
- Output: structured event recommendations from database

Example response:

```json
{
  "query": "Tech events under 500 near Indore this weekend",
  "filters": {
    "category": "tech",
    "city": "Indore",
    "priceMax": 500,
    "dateRange": "this_weekend"
  },
  "results": [
    {
      "id": 12,
      "title": "AI Workshop",
      "date": "2026-09-26T10:00:00Z",
      "location": "Indore",
      "priceInPaise": 49900
    }
  ]
}
```

## 7. Frontend Pages and Requirements

### 7.1 Home / Event Discovery
- Search bar
- Filters
- Event cards
- Sort options
- CTA to event details

### 7.2 Event Details page
- Title and category
- Date and time
- Organizer info
- Price
- Capacity and remaining seats
- Description
- Booking button

### 7.3 Login and Signup
- Firebase email/password auth
- Google OAuth option
- Clear validation and errors
- Redirect properly after login

### 7.4 Add Event page
- Form for creating event submission
- Validation states
- Response messages
- Submit for admin review

### 7.5 My Bookings page
- List of user bookings
- Ticket status badges
- Link to ticket details

### 7.6 Ticket Details page
- Ticket summary
- QR code
- Booking metadata
- Easy venue entry flow

### 7.7 Admin Dashboard
- Pending events list
- Approve/reject actions
- Rejection reason fields
- Event detail review page

### 7.8 Payment pages
- Payment success screen
- Payment cancel screen
- Redirect to booking dashboard

### 7.9 AI Search UI
- Chat/search input
- Structured suggestion display
- “View event” CTA for matches

## 8. Security Design

### 8.1 Middleware

```text
requireAuth
  -> validates Firebase token
  -> attaches req.user

requireAdmin
  -> ensures role = admin

requireOwnerOrAdmin
  -> allows user to access own booking/ticket
```

### 8.2 Rules
- No administrative action should be allowed from the frontend alone.
- Never trust `localStorage` as role data.
- Do not trust event or booking IDs from the client to authorize actions.
- Use a server-side DB query to check ownership.
- Validate all IDs and request payloads server-side.

## 9. Payment and Stripe Requirements

### 9.1 Stripe flow

- Create checkout session on backend
- Store booking record before redirecting to Stripe
- Save `stripeSessionId` and `stripePaymentIntentId`
- Verify webhook signature using Stripe secret
- On success, mark booking confirmed and issue ticket
- On failure, mark booking failed or expired

### 9.2 Webhook handling rules
- Idempotency via Stripe event ID or session ID
- Ignore duplicate events
- Transactional update to booking + ticket states
- No payment confirmation from frontend success page alone

## 10. AI Engineering Design

### 10.1 Constraints
- AI must be backend-only
- Keep all prompts grounded in database data
- Validate all filters before sending to model
- Use a deterministic search layer before AI reasoning
- Log prompts and outputs for evaluation

### 10.2 Recommended flow

```text
User query
  -> parse filters with AI or simple rules
  -> validate filters server-side
  -> query Postgres for approved events only
  -> format results
  -> return safe structured recommendation
```

This is “RAG-lite” architecture: query DB, then use model to explain and summarize, not invent.

## 11. Testing Strategy

### 11.1 Backend tests
- Auth middleware tests
- Admin authorization tests
- Event validation tests
- Booking creation tests
- Stripe webhook verification tests
- Ticket ownership tests
- Redeem-once logic

### 11.2 Frontend tests
- Login and signup flows
- Event listing rendering
- Booking button leads to checkout
- Payment success/cancel flows
- Admin approval flow
- Ticket details rendering

### 11.3 E2E tests
- User signs up
- Searches events
- Books a ticket
- Verifies payment confirmation
- Views ticket
- Scanner marks redeemed
- Admin approves an event

## 12. CI/CD Design

### 12.1 GitHub Actions workflows

Workflow 1: pull request validation
- Install backend dependencies
- Install frontend dependencies
- Run backend tests
- Run frontend tests
- Build frontend
- Run linting

Workflow 2: deploy
- Build container images
- Push to registry
- Run database migrations
- Deploy backend and frontend
- Run health checks

### 12.2 Docker

Add:
- backend Dockerfile
- frontend Dockerfile
- docker-compose.yml
- postgres service
- environment variable file

## 13. Implementation Order

### Phase 1: Security + foundational API
- Firebase Auth setup validation
- `requireAuth` and `requireAdmin`
- Fix user and role handling
- Protect event submission
- Protect ticket ownership endpoints

### Phase 2: Models and DB integrity
- Replace string dates with timestamp fields
- Add proper foreign keys
- Add booking and ticket table schema
- Update event state model
- Add migration scripts

### Phase 3: Payment reliability
- Stripe checkout session creation
- Webhook verification
- Booking confirmation and ticket issuance
- Error handling and idempotency

### Phase 4: Frontend polish
- Fix route logic
- Clean up auth flows
- Improve event cards and details
- Add loading and error states
- Standardize CSS

### Phase 5: AI assistant
- Build backend AI event search API
- Query approved events only
- Create frontend search assistant UI

### Phase 6: Tests + CI/CD + Docker
- Add Jest/Vitest tests
- Add Playwright tests
- Containerize app
- Add GitHub Actions

## 14. Engineering Rules for This Project

- No frontend-only authorization
- No payment success based only on client-side redirect
- No user data in QR payloads
- No AI results without DB grounding
- No hard-coded secrets in the repo
- No inconsistent state names across backend and frontend
- No route-level logic that bypasses the service layer

## 15. Next Execution Plan

We will start with the following concrete tasks:

1. Fix backend auth and role middleware
2. Create a consistent database schema migration
3. Rebuild event and booking models
4. Protect all admin routes
5. Fix ticket ownership logic
6. Create the booking + Stripe flow with webhook confirmation
7. Improve frontend auth and routing flows
8. Add the AI event search assistant
9. Add tests and CI

This is the correct engineering sequence for making EventBook production-ready and internship-grade.

