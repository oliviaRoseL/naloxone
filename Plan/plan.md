# Naloxone Finder Expo Web App Plan

## Mission
Build an Expo web app that helps people quickly find naloxone kits and emergency support resources to reduce overdose harm.

## Product Scope (MVP)

### 1) Locations of Kits
- Show nearby naloxone kit locations on a map.
- Support search by current location, postal code, or city.
- Display details: source, verification status, availability, and last updated time.

### 2) Emergency Section
- Prominent emergency call actions.
- Two groups:
  - **Basic Emergency** (e.g., 911)
  - **Crisis Lines** (regional mental health/overdose lines)
- Region-aware number list (start with Canada-only for v1).
- List of Crisis and Emergency information is in `./Data/CrsisAndEmergency.json`

### 3) Info Section
- Educational content on overdose response and support.
- Structured content:
  - What to do during overdose
  - Peer support resources
  - What to expect when calling crisis services
  - Good Samaritan guidance (regional)
- Path to guide section

### 4) Guide Section (First Aid + Naloxone Use)
- Step-by-step actionable guide:
  1. Check responsiveness
  2. Call emergency services
  3. Administer naloxone
  4. Rescue breathing/chest support guidance
  5. Monitor until help arrives
- Include timer/checklist UX for high-stress use.
- Make guide available offline.

### 5) Network of Kits
- Optional responder network of users carrying naloxone.
- Users can opt in as "available."
- Requesters can ping nearby responders.
- Responders can accept/decline.
- Privacy-preserving location sharing (approximate by default).

### 6) Responder Profile (Users Carrying Naloxone)
- Allow users who carry naloxone to create an optional responder profile.
- Profile includes:
  - Display name or alias
  - Approximate service area (not exact home location)
  - Availability status and schedule
  - Naloxone kit type and quantity on hand
  - Training/certification status (optional)
  - Preferred contact method in-app
- Users can enable/disable responder mode at any time.
- Show profile trust indicators (verified profile, response history) without exposing sensitive data.

---

## Recommended Technical Architecture

## Frontend
- **Expo + Expo Router + React Native Web + TypeScript**
- UI:
  - Emergency-first layout with fixed "Call Now" button
  - Mobile-first responsive design
- State and data:
  - **TanStack Query** for server/state sync
  - Lightweight client store (Zustand or Context) for session/UI state
- Mapping:
  - MapLibre GL with marker clustering and geolocation fallback

## Backend
- **Supabase** (recommended):
  - PostgreSQL + PostGIS for geo queries
  - Realtime for responder ping flow
  - Auth for user accounts
  - Row Level Security for privacy and access control

## Hosting / Delivery
- Expo web build on Vercel or Netlify
- Supabase-hosted database/API/realtime

---

## Data Model (MVP)

### users
- `id`, `display_name`, `role`, `trust_score`, `created_at`

### responder_profiles
- `user_id` (PK/FK), `alias`, `service_radius_km`, `training_status`, `is_verified`, `visibility_level`, `created_at`, `updated_at`

### responder_kit_inventory
- `id`, `user_id`, `kit_type`, `doses_available`, `expiry_date`, `last_confirmed_at`

### responder_availability
- `user_id`, `is_available`, `schedule_json`, `max_distance_km`, `updated_at`

### kit_locations
- `id`, `owner_id` (nullable), `geom` (geography point), `source_type`, `verified`, `stock_status`, `updated_at`

### emergency_contacts
- `id`, `country`, `province`, `city`, `contact_type`, `name`, `phone`, `priority`, `active`

### resources
- `id`, `category`, `title`, `body`, `region_tags`, `source_url`, `updated_at`

### guide_steps
- `id`, `order`, `title`, `instructions`, `media_url`, `duration_hint_sec`

### user_presence
- `user_id`, `geom_approx`, `is_available`, `expires_at`

### help_requests
- `id`, `requester_id`, `geom`, `urgency`, `status`, `created_at`

### pings
- `id`, `request_id`, `responder_id`, `status`, `responded_at`

### false_call_abuse_reports
- `id`, `reporter_id`, `target_user_id`, `reason`, `status`, `created_at`

---

## Security, Safety, and Privacy Requirements
- Emergency button visible on all primary screens.
- Exact user location hidden by default in responder network.
- Location precision reduction until responder accepts request.
- Presence auto-expiry (e.g., 15 minutes).
- Abuse prevention:
  - Rate limiting for pings
  - Block/report flows
  - Basic moderation dashboard
- Responder profiles default to privacy-safe settings (alias + approximate location only).
- Exact address/precise coordinates are never shown on public profile views.
- Require periodic re-confirmation of availability and kit inventory freshness.
- Clear medical/legal disclaimer:
  - App assists response and does not replace emergency services.
- Store minimal personal data and define retention windows.

---

## UX Principles
- Emergency-first navigation:
  - `Emergency` and `Guide` always reachable in one tap.
- Progressive disclosure for stressed users:
  - Short, high-contrast, low-cognitive-load steps.
- Accessibility:
  - Large tap targets, high contrast, screen-reader labels, keyboard support for web.
- Permission fallback:
  - If location denied, allow postal code/city entry.

---

## Rollout Plan

## Phase 1 (Core lifesaving MVP)
- Kit map + search
- Emergency contacts section
- Static first-aid guide (offline cache)
- Basic info resources
- Basic responder profile creation + availability toggle
- Analytics for usage and drop-off

## Phase 2 (Reliability + content quality)
- Regionalized emergency/contact dataset pipeline
- Verification workflow for kit locations
- Content management workflow for resources/guide

## Phase 3 (Responder network)
- Opt-in presence
- Nearby ping request flow
- Accept/decline workflow
- Verification and trust indicators for responder profiles
- Safety controls (rate limit, reporting, blocking)

## Phase 4 (Scale)
- Trust/reputation layer
- Partner onboarding (pharmacies/community orgs)
- Multilingual support
- Native mobile packaging from Expo codebase

---

## Success Metrics
- Time to first emergency action (call or guide open)
- Time to nearest kit discovery
- Successful responder ping acceptance rate
- Guide completion rate during incident flow
- Resource engagement and repeat usage

---

## Risks and Mitigations
- **Data accuracy risk:** stale kit info
  - Mitigation: verification status, last-updated timestamps, partner feeds
- **Privacy risk:** location misuse
  - Mitigation: obfuscated coordinates, TTL, rate limits, reporting
- **Operational risk:** incomplete regional emergency numbers
  - Mitigation: launch Canada-first, curated dataset with review process
- **Legal/medical risk:** misunderstood guidance
  - Mitigation: reviewed copy, citations, disclaimers, regular audits

---
