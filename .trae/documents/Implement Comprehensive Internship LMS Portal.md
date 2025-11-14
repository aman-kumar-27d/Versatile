## Architecture Overview
- Monorepo-style app with `frontend (React + Vite + TS)` and `backend (Express + Supabase)`.
- API-first design: RESTful endpoints for internships, applications, courses, attendance, meetings, documents, notifications.
- Storage: Supabase Storage (or S3) for uploads and generated PDFs.
- Auth: Supabase auth for identities + server-issued JWT for API; RBAC via middleware.

## Tech Stack
- Frontend: React 18, TypeScript, Vite, react-router, react-hook-form + zod, Tailwind.
- Backend: Node.js, Express, Zod, Supabase JS clients (anon/service role), JWT, bcrypt.
- Docs/PDF: Handlebars templates + PDFKit (or HTML-to-PDF like Puppeteer) for offer letters/certificates.
- Notifications: Nodemailer (email) + Twilio/Nexmo (SMS).
- Testing: Jest (unit/integration), Cypress (E2E), Testing Library.
- CI/CD: GitHub Actions → Vercel deployments; Lighthouse performance checks.

## Data Model
- Users (admin/student), Internships, Applications, Courses, Lessons, Enrollments, Attendance, Meetings, Documents, Notifications.
- Verification codes on certificates; offer letters linked to applications.
- Supabase RLS for row-level authorization; storage buckets per document type.

## Backend APIs
- Auth: register/login/me/profile/change/reset password.
- Internships: CRUD (admin), browse (student), apply, list applications, approve/reject; mount missing routes.
- Courses: CRUD, assign to students, progress tracking, lesson completion.
- Documents: upload/download/list/delete; signed URLs; generate offer letters/certificates from templates.
- Attendance: mark, list by student/date range, summaries, reports.
- Meetings/Calendar: CRUD, invitees, reminders; ICS export.
- Notifications: send email/SMS, preferences, delivery logs.
- Reporting: aggregates for internships, applications, attendance, course progress.

## Frontend App Structure
- Global auth store and API client; consistent base URL.
- Route guards for admin/student; protected routes via layouts.
- Pages: Home, Login, Register, StudentDashboard, AdminDashboard, Courses, CourseDetail, Documents, Calendar, Attendance, Reporting.
- Forms with zod schemas; accessible components; responsive Tailwind design.

## Admin Functionality
- Internship management: create/edit with duration, organizer, institute, description/requirements.
- Application review: approve/reject, notes; auto-offer-letter generation and emailing.
- Scheduling: classes/meetings with calendar; notifications.
- Course assignment: attach learning materials; track progress.
- Attendance and progress tracking; export reports.

## Student Functionality
- Browse/enroll internships; apply with document upload.
- Dashboard with status, attendance, meetings/classes, courses/deadlines.
- Project/assignment submission with files; evaluation visibility.
- Offer letters: receive/download; completion certificates with verification.

## Core Systems
- Document generation: templates + data → PDF; stored and served via secure signed URLs.
- Attendance: daily marks; summaries; reporting.
- Scheduling: calendar views; reminders; meeting links.
- Course management: modules/lessons, progress; deadlines and alerts.

## Security & Compliance
- Middleware: JWT auth, role guards, ownership checks, input validation (zod), rate limiting, CORS, Helmet.
- Data protection: sanitize inputs, encrypt sensitive fields at rest (where applicable), audit logs.
- Secure downloads via signed URLs; CSP headers; GDPR features (export/delete).

## Notifications
- Email: transactional templates (application received, decision, offer letter, meeting reminder, assignment due).
- SMS: short alerts; opt-in preferences.
- Retry and error handling; logs for reporting.

## Testing Strategy
- Unit: utils/hooks/middleware; 80% coverage target.
- Integration: API routes with Supertest; Supabase test db.
- E2E: Cypress flows for admin/student key journeys.
- Accessibility: axe checks; WCAG AA validations.
- Performance: Lighthouse CI budgets.

## CI/CD & Deployment
- GitHub Actions: lint, typecheck, unit/integration, e2e, security scans, performance checks.
- Vercel: preview on PRs; staging on `develop`, prod on `main`.
- Env management via project secrets; build caches; health checks.

## Performance & Accessibility
- Code-splitting, lazy routes, image optimization, caching.
- UI semantics, ARIA, keyboard navigation, color contrast, focus management.
- Target 100+ concurrent users: connection pooling, efficient queries, CDN for assets.

## Leverage Existing Work & Fix Gaps
- Mount `api/routes/internships.ts` in `api/app.ts`; unify API base URL in `useAuth` and Vite proxy.
- Implement storage endpoints and integrate `Documents.tsx` with backend.
- Implement `notificationService.ts` and wire to routes.
- Build document generation service and templates (offer letters, certificates with verification codes).
- Complete `AttendanceTracking.tsx` and `ReportingAnalytics.tsx`; add backend endpoints.
- Add route guards/layouts for admin/student.
- Add missing test scripts and initial tests; scaffold Cypress specs; add `lighthouserc.json`.

## Milestones
1) Foundations: route guards, API base alignment, mount internships, storage buckets.
2) Admin: internships CRUD, applications decisions, offer letter generation + email.
3) Student: applications, dashboard data wiring, document downloads.
4) Courses: assignment, progress tracking, lesson completion persistence.
5) Attendance & Meetings: endpoints + UI, notifications.
6) Documents & Certificates: templates, PDF generation, verification portal.
7) Reporting & Analytics: aggregates, dashboards.
8) Testing & CI: unit/integration/e2e, coverage, Lighthouse, security scans.
9) Deployment: staging + prod with Vercel; monitoring.

## Deliverables
- Fully functional LMS portal meeting all specs.
- Documentation for APIs, deployment, and ops.
- Test suites with coverage reports; CI pipeline.
- Accessibility and performance reports.

Please confirm this plan to proceed with implementation aligned to your requirements.