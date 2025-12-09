# Mock Data Removal Guide

This document tracks the removal of all mock data from the frontend and migration to API-based data fetching.

## Status: IN PROGRESS

## Completed ✅

1. **AuthModal.tsx** - Removed mock user creation, now uses `/api/auth/register` and `/api/auth/login`
2. **EventsSection.tsx** - Removed mockEvents array, now fetches from `/api/events`
3. **TicketsSection.tsx** - Removed mock tickets array, now fetches from `/api/tickets`
4. **FavoritesSection.tsx** - Removed localStorage favorites, now uses `/api/favorites`
5. **LiveEventsSection.tsx** - Updated favorites to use API
6. **Event Detail Page** - Updated to fetch event from `/api/events/:id` and favorites from API

## Remaining Mock Data to Remove ⚠️

### High Priority (Core Features)

1. **CheckoutFlow.tsx**
   - Remove localStorage tickets creation
   - Remove localStorage waitlist entries
   - Use `/api/payments/confirm` for ticket creation
   - Use `/api/waitlist` for waitlist entries

2. **OrganizerDashboard.tsx**
   - Remove localStorage organizer events
   - Fetch from `/api/events/organizer/my-events`
   - Remove localStorage notifications
   - Use `/api/notifications` (when implemented)

3. **EventFormModal.tsx**
   - Remove localStorage event saving
   - Use `/api/events` POST/PUT endpoints

4. **WaitlistManagement.tsx**
   - Remove localStorage waitlist
   - Use `/api/waitlist` endpoints

5. **SupportTickets.tsx & SupportModal.tsx**
   - Remove localStorage support tickets
   - Use `/api/support/tickets` endpoints

6. **NotificationCenter.tsx & NotificationBell.tsx**
   - Remove localStorage notifications
   - Use `/api/notifications` endpoints (when implemented)

### Medium Priority

7. **EmailNotifications.ts**
   - Remove localStorage email storage
   - Backend should handle email sending

8. **ShareEventModal.tsx**
   - Remove localStorage share tracking
   - Use `/api/social/track` endpoint

9. **CommunicationBoard.tsx**
   - Remove localStorage messages
   - Use API endpoint (when implemented)

10. **QRCodeScanner.tsx**
    - Remove localStorage ticket lookup
    - Use `/api/tickets/:id` endpoint

11. **ProfileSection.tsx**
    - Remove localStorage organizer applications
    - Use API endpoint (when implemented)

### Low Priority (Static Data)

12. **data/eventDetails.ts** - Keep for fallback or remove entirely
13. **data/events.ts** - Keep for homepage display or remove
14. **data/features.ts** - Static content, can keep
15. **data/pricing.ts** - Static content, can keep
16. **data/testimonials.ts** - Static content, can keep

## localStorage Keys to Remove

- `eventify_favorites` → Use `/api/favorites`
- `eventify_tickets` → Use `/api/tickets`
- `eventify_organizer_events` → Use `/api/events/organizer/my-events`
- `eventify_waitlist` → Use `/api/waitlist`
- `eventify_notifications` → Use `/api/notifications`
- `eventify_support_tickets` → Use `/api/support/tickets`
- `eventify_organizer_emails` → Backend handles emails
- `eventify_shares_*` → Use `/api/social/track`
- `eventify_messages_*` → Use API (when implemented)
- `eventify_refund_requests` → Use `/api/payments/refund`
- `eventify_organizer_applications` → Use API (when implemented)
- `eventify_approved_organizers` → Use API (when implemented)

## localStorage Keys to KEEP

- `eventify_user` → User authentication data (from API)
- `token` → JWT token (from API)
- `eventify_preferences_*` → User preferences (can keep or move to API)
- `eventify_welcome_seen_*` → UI state (can keep)

## Migration Steps

1. Update component to fetch from API instead of localStorage
2. Remove localStorage getItem/setItem calls
3. Handle loading states
4. Handle error states
5. Test API integration
6. Remove unused imports

## Notes

- Some features may need backend endpoints created first
- Keep error handling for API failures
- Consider caching strategies for frequently accessed data
- Remove mock data files after migration is complete

