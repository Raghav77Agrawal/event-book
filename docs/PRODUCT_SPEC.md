# EventBook Product Specification

## 1. Product Overview

EventBook is a polished event discovery and booking platform for general public audiences. It allows users to discover events, book a single ticket securely, and receive a digital ticket with QR validation. Event organizers can submit events for approval, and administrators review and approve them before public listing.

The system should feel trustworthy, production-ready, and easy to extend with AI-powered discovery features.

## 2. Product Vision

Build a secure and user-friendly event ecosystem that makes event browsing, booking, ticketing, and admin moderation simple and reliable.

The platform should follow a complete event lifecycle:

1. Organizer submits event
2. Admin approves event
3. User discovers event
4. User books a single ticket
5. Payment is confirmed
6. Ticket is generated
7. Ticket is redeemed or verified at the venue

## 3. Target Audience

### 3.1 Attendee
A user looking to browse and book events.

Goals:
- Explore approved public events
- Search and filter events
- View event details
- Book one ticket securely
- View own bookings
- Access ticket details and QR code

### 3.2 Organizer
A registered user who wants to publish an event.

Goals:
- Submit event details
- See review status
- Wait for admin approval
- Track event visibility after approval

### 3.3 Admin
A trusted platform moderator.

Goals:
- Review event submissions
- Approve or reject events
- Manage the public event catalog
- Moderate platform quality

### 3.4 Verifier / Scanner
A staff or admin role validating tickets at the venue.

Goals:
- Scan a QR ticket
- Validate payment status and redemption status
- Mark attendance as redeemed

## 4. Scope of Version 1

The first polished version should include:

- Secure authentication
- Event submission by authenticated organizers
- Admin review and approval flow
- Public event listing and event details
- Single-ticket booking only
- Stripe-based checkout flow
- Ticket generation and QR code
- Booking history for users
- Verified ticket redemption flow
- AI-powered natural-language event search
- Docker and CI/CD setup
- Automated tests and documentation

## 5. Core Business Rules

- Anyone can browse approved public events.
- Only authenticated users can submit events.
- Only admins can approve or reject events.
- Users can book only one ticket per booking.
- Price must be stored in integer minor currency units.
- Event must be approved before it is publicly visible.
- Users can only access their own bookings and tickets.
- Each ticket can only be redeemed once.
- The backend is the source of truth for payment, status, and redemption.
- AI cannot invent events or manipulate approval decisions.

## 6. User Roles and Permissions

### 6.1 Visitor
Permissions:
- View approved events
- Search and filter listings
- View basic event details

### 6.2 User
Permissions:
- Sign up and login
- Submit events for approval
- Book one ticket for an approved event
- View personal bookings
- View personal ticket details

### 6.3 Admin
Permissions:
- View pending events
- Approve or reject submitted events
- Review event details and metadata
- Manage platform moderation
- Access internal verification tools

### 6.4 Verifier
Permissions:
- Scan QR tickets
- Validate ticket status
- Mark ticket as redeemed

## 7. Event Lifecycle

Event state machine:

```
DRAFT
  -> PENDING_REVIEW
  -> APPROVED
  -> PUBLISHED
  -> COMPLETED
```

Alternate paths:

```
PENDING_REVIEW -> REJECTED
APPROVED -> CANCELLED
PUBLISHED -> CANCELLED
```

Rules:
- Only approved and published events are visible publicly.
- Rejected events must not appear in the public catalog.
- Cancelled events should remain visible with a cancelled status or be hidden based on business choice.

## 8. Booking and Ticket Lifecycle

Booking states:

```
CHECKOUT_STARTED
  -> PAYMENT_PENDING
  -> CONFIRMED
  -> FAILED
  -> EXPIRED
  -> REFUNDED
```

Ticket states:

```
ISSUED
  -> REDEEMED
  -> CANCELLED
  -> REFUNDED
```

Rules:
- Booking is not confirmed until payment succeeds.
- Ticket is issued only after a confirmed booking.
- A ticket can be redeemed only once.
- Tickets are associated with the correct user and event.

## 9. Functional Requirements

### 9.1 Event Discovery
Users should be able to:
- Browse approved events
- Search by title and description
- Filter by date, category, location, and price
- Sort by date or price
- Open event detail pages

Each event card should display:
- Event title
- Category
- Date and time
- Venue
- Price
- Short description
- Organizer name

### 9.2 Event Submission
Authenticated organizers should be able to submit events with:
- Title
- Description
- Category
- Date
- Start time
- End time
- Timezone
- Location
- Capacity
- Price
- Organizer name (backend-derived, not client-controlled)

Server-side validation must enforce:
- Required fields
- Valid dates and time ranges
- End time after start time
- Price not negative
- Capacity > 0
- Reasonable description length

### 9.3 Admin Review
Admins should be able to:
- View pending event submissions
- Open event submission details
- Approve or reject events
- Add rejection reason
- Track who approved/rejected the event

### 9.4 Booking and Payment
Users should be able to:
- Select an approved event
- Check availability
- Book one ticket
- Complete secure payment via Stripe
- Receive a booking confirmation page

The backend must ensure:
- Event exists and is approved
- Event has available capacity
- Booking totals are generated server-side
- Stripe webhook checks are verified
- Payment status is only marked confirmed after webhook verification

### 9.5 Ticket and QR Validation
Confirmed bookings must generate a digital ticket containing:
- Ticket ID
- Booking ID
- Event title
- Event date and time
- Venue
- Attendee name
- QR code
- Ticket status

The QR code must not contain sensitive user data like email or Firebase UID.

Verification should happen via backend API and should ensure:
- Ticket exists
- Ticket belongs to the event
- Ticket is not already redeemed
- Ticket is not cancelled or refunded
- Payment status is confirmed

## 10. AI Feature Specification

### 10.1 Natural Language Event Search Assistant
The first AI feature should help users discover real events through natural language.

Example prompts:
- “Show me music events this weekend under ₹800 in Bengaluru.”
- “Find technical workshops near me in the next 7 days.”
- “Suggest free events this month.”

Behavior:
1. Parse user intent
2. Extract filters such as category, date range, price, and location
3. Query the real database
4. Return only valid matching events
5. Present results with event links and metadata

Rules:
- The model must not fabricate events.
- It must stay grounded in DB records.
- It must not auto-approve or reject events.
- It should not expose backend secrets.

## 11. Non-Functional Requirements

### 11.1 Security
- All protected routes must verify authentication.
- Admin routes must verify role-based authorization.
- Users may only access their own bookings and tickets.
- Stripe webhook signatures must be verified.
- Secrets must remain on the backend.
- CORS must be restricted to allowed origins.
- Sensitive data must not be embedded in QR payloads.
- Server-side validation must be enforced for all requests.

### 11.2 Reliability
- Payment webhooks must be idempotent.
- Database updates must use transactions where needed.
- Errors should be centralized and consistent.
- Health-check endpoints should exist.
- The app should be able to start cleanly in dev and production modes.

### 11.3 Maintainability
- Code should be modular.
- Routes, services, validations, and models should be separated.
- Use migrations instead of ad hoc schema changes.
- Logging should be structured.
- Environment variables must be documented.

### 11.4 Performance
- Event listing should support pagination.
- Use indexes for frequently queried columns.
- Keep database queries efficient.
- AI calls should have timeouts and cost control.

### 11.5 Accessibility
- Forms must use labels and proper focus states.
- Buttons must be keyboard accessible.
- Loading and error states must be visible.
- Motion should respect reduced-motion settings.

## 12. Proposed Data Model

### 12.1 User
- id
- firebaseUid
- name
- email
- role

### 12.2 Event
- id
- title
- description
- category
- startsAt
- endsAt
- timezone
- location
- capacity
- priceInPaise
- status
- createdBy
- approvedBy

### 12.3 Booking
- id
- userId
- eventId
- stripeSessionId
- stripePaymentIntentId
- amount
- currency
- status
- createdAt

### 12.4 Ticket
- id
- bookingId
- ticketCode
- status
- redeemedAt
- redeemedBy

## 13. Success Metrics for Version 1

The product should be considered ready when:
- Authenticated organizers can submit valid event proposals
- Admins can approve or reject them securely
- Approved events appear publicly
- Users can book a ticket through Stripe test mode
- Tickets are only issued after successful payment
- Users cannot access other users' tickets
- A ticket can only be redeemed once
- AI event search returns database-grounded recommendations
- Docker and CI/CD setup is working
- Tests cover critical business rules

## 14. MVP Priority Order

1. Secure auth and roles
2. Event submission + admin approval
3. Public event listing
4. Single-ticket booking
5. Stripe checkout and webhook verification
6. QR ticket generation and redemption
7. AI search assistant
8. Docker and CI/CD
9. Testing
10. Documentation and cleanup

## 15. Open Questions

- Should the product include organizer profile pages in V1?
- Should the ticket verification page be part of the admin dashboard or a separate scanner interface?
- Should AI event search be exposed through a dedicated chat UI or a single search box?
- Do we want a local image upload feature in V1 or keep assets minimal?

## 16. Implementation Roadmap

### Phase 1: Foundation and Security
- Fix authorization and role validation
- Protect admin and ticket routes
- Add proper backend validation
- Correct Firebase service configuration
- Add environment variable structure

### Phase 2: Booking and Payment Reliability
- Refactor models and database schema
- Introduce proper booking + ticket flow
- Make Stripe webhook idempotent
- Add ticket ownership checks

### Phase 3: UX and Polish
- Improve event cards and detail pages
- Add consistent loading, empty, and error states
- Clean up CSS and component consistency
- Fix route logic and navigation

### Phase 4: AI and DevOps
- Add AI event search assistant
- Add unit and integration tests
- Add Docker Compose
- Add GitHub Actions CI
- Add deployment workflow and production README

## 17. Summary

EventBook should evolve from a prototype into a secure event platform with a clear event lifecycle, trustworthy payments, protected user data, and a grounded AI assistant. The first objective is to strengthen the core product foundation before adding larger features.

The most important product principle is:

> Build a trustworthy event lifecycle platform, not just a UI with multiple features.

This is the correct foundation for a strong portfolio project and a strong AI-native software engineering skill set.


