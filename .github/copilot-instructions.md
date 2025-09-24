# Copilot Instructions for CleanStreet_Group3

## Project Overview
- **Architecture:**
  - Monorepo with `backend/` (Node.js/Express) and `client/` (React + Vite + Tailwind)
  - Backend handles authentication, admin/user management, issue reporting, notifications, and file uploads.
  - Frontend provides user/admin dashboards, reporting, maps, and UI components.

## Key Directories & Files
- `backend/`
  - `controllers/`: Route logic for admin, auth, issues
  - `models/`: Mongoose models for User, Issue, Notification
  - `routes/`: Express route definitions
  - `middleware/`: Auth, upload, validation logic
  - `utils/`: Email, geocoding, helpers
  - `server.js`: Main Express app entrypoint
- `client/`
  - `pages/`: Main screens (Dashboard, Login, Register, Welcome, etc.)
  - `components/`: UI and layout components
  - `lib/`: API utilities, auth context
  - `hooks/`: Custom React hooks
  - `global.css`, `tailwind.config.ts`: Styling

## Developer Workflows
- **Backend:**
  - Install: `cd backend && npm install`
  - Start: `npm start` (runs `server.js`)
  - Test: `node test.js` (manual test script)
- **Frontend:**
  - Install: `cd client && npm install`
  - Start: `npm run dev` (Vite dev server)

## Patterns & Conventions
- **Authentication:**
  - JWT-based, with middleware in `backend/middleware/auth.js`
  - Separate admin and user login flows
- **Issue Reporting:**
  - Issues stored in MongoDB via `models/Issue.js`
  - File uploads handled via `middleware/upload.js` and stored in `uploads/images/`
- **Notifications:**
  - Email logic in `utils/emailService.js`
- **Frontend Routing:**
  - React Router, with protected routes via `components/ProtectedRoute.tsx`
- **UI:**
  - Tailwind CSS, custom button and dialog components in `components/ui/`

## Integration Points
- **API Communication:**
  - Frontend uses `lib/api.ts` for backend requests
  - Auth context in `lib/auth-context.tsx` manages user state
- **Map Features:**
  - Map display via `components/MapComponent.tsx` and `MiniMap.tsx`

## Project-Specific Notes
- **Admin login is separate (`/admin-login` route and button)**
- **Community reports available at `/reports`**
- **SVG logo and branding in `pages/Welcome.tsx`**
- **Manual test scripts (`test.js`, `test-email.js`) for backend features**

## Example: Adding a New Issue Type
- Update `models/Issue.js` schema
- Add logic in `controllers/issueController.js`
- Update frontend form in `pages/Report.tsx`

---
For more details, see `README.md` and key files above. If any section is unclear or missing, please provide feedback to improve these instructions.