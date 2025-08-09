# Family Tree Project Progress

## Phase 1: Project Setup ✅ COMPLETED
- [x] Next.js project initialized with TypeScript
- [x] Tailwind CSS configured
- [x] Basic project structure created
- [x] Repository setup and documentation

## Phase 2: Authentication & Database Setup ✅ COMPLETED

### Supabase Integration
- [x] Supabase client configured (`src/lib/supabase.ts`)
- [x] Database types defined (`src/types/supabase.ts`)
- [x] SQL schema created (`supabase-schema.sql`)
- [x] Environment variables template (`env.example`) ✅ FIXED

### Authentication Implementation
- [x] Google OAuth setup in Supabase client
- [x] Auth callback route implemented (`src/app/auth/callback/route.ts`)
- [x] Sign-in page created (`src/app/auth/signin/page.tsx`)
- [x] Protected dashboard layout (`src/app/dashboard/layout.tsx`)
- [x] Google OAuth sign-in working ✅ COMPLETED

### Database Schema
- [x] Trees table with admin_user relationship
- [x] Members table with tree_id foreign key
- [x] Relationships table for family connections
- [x] Invites table for collaboration
- [x] Row Level Security (RLS) policies configured
- [x] Database indexes for performance

### Protected Routes
- [x] Dashboard layout with authentication check
- [x] Main dashboard page (`src/app/dashboard/page.tsx`)
- [x] User session management
- [x] Sign out functionality

## Phase 3: Core Features ✅ COMPLETED

### Individual Tree Management
- [x] Individual tree view page - A dedicated page to view and manage a specific family tree (`src/app/dashboard/tree/[id]/page.tsx`)
- [x] Add/edit family members - Functionality to add, edit, and manage family member profiles (`src/components/MemberForm.tsx`)
- [x] Create family relationships - Tools to establish parent-child, spouse, and other family connections (`src/components/RelationshipForm.tsx`)

### Visualization & Media
- [x] Tree visualization component - Interactive family tree diagram/chart to visualize relationships (`src/components/TreeVisualization.tsx`)
- [x] Photo upload functionality - Ability to upload and manage photos for family members (`src/components/PhotoUpload.tsx`)

### Enhancements
- [x] Edit/delete members from Members tab
  - Edit: `src/components/MemberForm.tsx` now accepts `editingMember` and updates via `updateMember`
  - Delete: `src/app/dashboard/tree/[id]/page.tsx` adds Delete actions with confirmation, calls `deleteMember`
  - API: `src/lib/supabase.ts` `updateMember` now supports `location`

### Collaboration
- [x] Invite system implementation - Allow users to invite others to view or edit their family trees (`src/components/InviteForm.tsx`)

### Additional Features Implemented
- [x] Tabbed interface for tree management (View, Members, Relationships, Invite)
- [x] Modal forms for adding members and relationships
- [x] Photo upload with validation (file type, size limits)
- [x] Hierarchical tree visualization with parent-child and spouse relationships
- [x] Invite link generation with role-based permissions
- [x] Enhanced Supabase helper functions for member and relationship management

## Phase 4: Advanced Features (Future)
- [ ] Tree sharing and collaboration
- [ ] Advanced search and filtering
- [ ] Export/import functionality
- [ ] Mobile responsiveness
- [ ] Performance optimizations

## Phase 5: Tree Visualization Improvements ✅ COMPLETED

### Issues Identified
- [x] **Multiple cards for same person**: When adding multiple relationships, duplicate cards were being created
- [x] **Tree not forming correctly**: Current visualization logic had issues with relationship handling
- [x] **Need for free-flowing tree with lines**: Current visualization was too rigid and didn't look modern
- [x] **Limited interactivity**: Users couldn't easily add new family members directly from the visualization
- [x] **Relationships not displaying**: ReactFlow implementation wasn't properly showing parent-child and spouse relationships
- [x] **Relationship lines not visible**: Fixed edge rendering issues in React Flow component
- [x] **Sibling relationships not supported**: Database schema and form components didn't support sibling relationships

### Solutions Implemented
- [x] **React Flow-based approach**: Implemented interactive graph-based family tree builder
- [x] **Interactive node addition**: Click any node to add parent, child, or spouse
- [x] **Free-form growth**: Start anywhere and grow the tree in any direction
- [x] **Pan and zoom**: Built-in React Flow controls for navigation
- [x] **Custom node components**: Beautiful family member cards with photos and info
- [x] **Relationship differentiation**: Different line styles for parent-child vs spouse relationships
- [x] **Context menu**: Right-click or click nodes to add relatives
- [x] **Hierarchical layout algorithm**: Implemented proper positioning for parent-child relationships
- [x] **Spouse positioning**: Spouses positioned at same level horizontally
- [x] **Fixed edge rendering**: Added explicit edge type configuration and proper edge styling
- [x] **Sibling relationship support**: Updated database schema, types, and form components to support sibling relationships

### Sibling Relationship Fix ✅ COMPLETED
- [x] **Database Schema Update**: Updated `Relationships` table CHECK constraint to include 'sibling' as valid type
- [x] **TypeScript Types Update**: Updated Supabase types in `src/types/supabase.ts` to include sibling relationship type
- [x] **Form Component Update**: Updated `RelationshipForm.tsx` to include sibling option in dropdown
- [x] **Supabase Client Update**: Updated `createRelationship` function in `src/lib/supabase.ts` to accept sibling type
- [x] **UI Integration**: FamilyTreeBuilder component already supported sibling relationships in the UI

### Current Status
- [x] **New FamilyTreeBuilder component**: Replaced old TreeVisualization with React Flow-based builder
- [x] **Interactive features**: Click nodes to add relatives, pan, zoom, and navigate
- [x] **Modern design**: Custom node components with photos and member information
- [x] **Flexible growth**: No predefined root - start anywhere and grow in any direction
- [x] **Integration**: Updated tree page to use new component
- [x] **Hierarchical layout**: Fixed relationship display with proper parent-child positioning
- [x] **Relationship lines**: Parent-child and spouse relationships now display with appropriate styling
- [x] **Edge rendering fix**: Fixed React Flow edge configuration to ensure relationship lines are visible
- [x] **Handle configuration**: Added proper React Flow handles to custom node component for edge connections
- [x] **Relationship-specific handles**: Configured different colored handles for different relationship types:
  - 🟢 **Green (Top)**: Parent connections
  - 🔵 **Blue (Bottom)**: Child connections  
  - 🟣 **Purple (Right)**: Spouse connections
  - 🟠 **Orange (Left)**: Sibling connections

## Phase 6: Relationship Management ✅ COMPLETED

### Issues Identified
- [x] **No relationship editing**: Users couldn't modify existing relationships
- [x] **No relationship deletion**: Users couldn't remove incorrect relationships
- [x] **Limited relationship display**: Relationship text didn't handle all relationship types properly
- [x] **Missing CRUD operations**: Only create and read operations were available for relationships

### Solutions Implemented
- [x] **Edit functionality**: Added ability to edit existing relationships with modal form
- [x] **Delete functionality**: Added safe deletion with confirmation dialog
- [x] **Enhanced UI**: Added edit and delete buttons to relationship cards
- [x] **Backend support**: Added `updateRelationship` function to Supabase helpers
- [x] **Form reuse**: Extended RelationshipForm component to support both create and edit modes
- [x] **Better relationship display**: Improved relationship text to handle parent, spouse, and sibling types
- [x] **State management**: Added proper state management for editing and deleting relationships

### Technical Improvements
- **React Flow Integration**: Leveraged React Flow for professional graph visualization
- **Interactive Node Addition**: Context menu system for adding relatives
- **Custom Node Types**: Beautiful family member cards with photos and details
- **Free-form Layout**: No hierarchical constraints - grow tree in any direction
- **Modern UI**: Professional controls, minimap, and navigation features

## Setup Instructions

### 1. Supabase Project Setup
1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API to get your project URL and anon key
3. Copy `env.example` to `.env.local` and fill in your Supabase credentials
4. Replace the placeholder values in `.env.local` with your actual Supabase project URL and anon key

### 2. Database Setup
1. Go to your Supabase dashboard > SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create all tables and policies

### 3. Google OAuth Setup
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider by clicking the toggle switch
3. You'll need to create a Google OAuth application:
   - Go to https://console.cloud.google.com/apis/credentials
   - Create a new OAuth 2.0 Client ID
   - **Choose "External" audience** (allows users outside your organization)
   - Set the authorized redirect URI to: `https://pqxboqvdsztbpofyasxj.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret
4. Add your Google OAuth credentials (Client ID and Secret) to the Supabase Google provider settings
5. Save the configuration

**Note**: If you see "Unsupported provider: provider is not enabled" error, it means Google OAuth is not enabled in your Supabase project.

### 4. Run the Application
```bash
npm install
npm run dev
```

## Current Status
✅ **Phase 2 Complete**: Authentication and database setup is fully implemented and ready for use.
✅ **Phase 3 Complete**: Core family tree features are fully implemented and ready for use.
✅ **Phase 5 Complete**: Tree visualization improvements are fully implemented with React Flow-based interactive family tree builder.

**Next Priority**: Implement Phase 4 advanced features including tree sharing, advanced search, export/import functionality, and mobile responsiveness.

## Recent Improvements
- **React Flow Integration**: Implemented professional graph-based family tree builder using React Flow
- **Interactive Node Addition**: Click any node to add parent, child, or spouse with context menu
- **Free-form Growth**: No predefined root - start anywhere and grow tree in any direction
- **Modern UI**: Custom node components with photos, built-in pan/zoom controls, and minimap
- **Professional Controls**: React Flow's built-in navigation, controls, and background features
- **Flexible Layout**: No hierarchical constraints - grow family tree organically in any direction
- **Relationship Management**: Full CRUD operations for relationships with edit and delete functionality

## UI Enhancement: Gender-based Card Tint (Very Subtle)

- Added a slight background/border tint to member cards in the React Flow tree based on `gender`:
  - Male: light blue (`bg-blue-50`/`border-blue-100`)
  - Female: light pink (`bg-pink-50`/`border-pink-100`)
  - Other/unspecified: default white (`bg-white`/`border-gray-200`)
- Implementation: `src/components/FamilyTreeBuilder.tsx` custom node now derives tint from `data.gender`.
- Impact: Minimal visual cue without overpowering the UI.

## New Feature: Member Gender Attribute

- Added optional `gender` for family members.
- Changes:
  - Updated form UI in `src/components/MemberForm.tsx` to include a Gender select and send it with create/update.
  - Extended Supabase helpers in `src/lib/supabase.ts` to accept `gender` on `createMember` and `updateMember`.
  - Updated shared types in `src/types/index.ts` to include `gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'` on `Member`.
  - Database schema: added `gender` column with CHECK constraint to `Members` in `supabase-schema.sql`.

Impact: Users can record a member's gender. Backward-compatible; existing data unaffected.

## New Feature: Member Location Attribute

- Added optional `location` for family members.
- Changes:
  - Updated form UI in `src/components/MemberForm.tsx` to include a Location input and send it with member creation.
  - Extended Supabase helper `createMember` in `src/lib/supabase.ts` to accept `location`.
  - Updated shared types:
    - `src/types/index.ts` `Member` now has `location?: string`.
    - `src/types/supabase.ts` `Members` Row/Insert/Update include `location` fields.
  - Database schema: added `location` column to `Members` in `supabase-schema.sql` (included in CREATE TABLE and as an `ALTER TABLE ... IF NOT EXISTS`).

Impact: Users can record a member's city/country when adding them. Backward-compatible; existing data unaffected.

## UI Contrast Tweak: Form Inputs

- Increased default contrast of form inputs globally in `src/app/globals.css`:
  - Input/textarea text set to gray-900 for readability on white backgrounds
  - Placeholder text set to gray-600 at full opacity
- Affects Add Member modal and other forms for consistent legibility.

## UI Contrast Improvements

- Increased text contrast across key pages/components to improve readability while keeping the design simple:
  - `src/app/page.tsx`: Prominent body text and feature descriptions upgraded from `text-gray-600/500` to `text-gray-800/700`.
  - `src/app/auth/signin/page.tsx`: Subtitle and navigation link darkened for better visibility.
  - `src/app/dashboard/layout.tsx`: Loading text, user email, and sign-out link darkened.
  - `src/components/InviteForm.tsx`: Description and helper text darkened.
  - `src/components/PhotoUpload.tsx`: Success and helper text darkened.
  - `src/components/FamilyTreeBuilder.tsx`: Context menu header and legend text darkened.
  - `src/components/TreeVisualization.tsx`: Empty-state and legend text darkened.

Impact: Improves accessibility and readability without altering layout or flows.

## New Feature: Persisted Manual Layout (React Flow)

- Added optional `position_x` and `position_y` columns to `Members` so manual node positions can be saved.
- Extended Supabase TypeScript types to include `position_x`/`position_y` on `Members` Row/Insert/Update.
- Updated `FamilyTreeBuilder` to:
  - Initialize node positions from saved `position_x`/`position_y` when present.
  - Fall back to hierarchical layout only if positions are not saved.
  - Persist positions on drag stop via `updateMember`.
- Updated Supabase client `updateMember` to accept `position_x`/`position_y`.
- Outcome: Users can drag cards to align them and the layout is preserved across reloads.

## Fixes

- Resolved Supabase error when creating a tree: `infinite recursion detected in policy for relation "Trees"`.
  - Added defensive `DROP POLICY IF EXISTS` statements before recreating `Trees` RLS policies in `supabase-schema.sql` to avoid legacy/duplicate policy recursion.
  - Action required: Re-run the updated `supabase-schema.sql` in the Supabase SQL editor to apply policy resets and avoid recursion during inserts.

### Verification

Run this to inspect current `Trees` policies (corrected column name):

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'Trees';
```

You should see the admin-only CRUD policies, and optionally a read policy that allows users listed in `TreePermissions` to view trees.

## New Features Implemented
- **FamilyTreeBuilder Component**: New React Flow-based interactive family tree builder
- **Context Menu System**: Click nodes to add relatives with intuitive menu interface
- **Custom Node Types**: Beautiful family member cards with photos and member information
- **Professional Navigation**: Built-in pan, zoom, minimap, and control features
- **Flexible Growth**: Start with any person and build outward in any direction
- **Relationship CRUD Operations**: Complete create, read, update, and delete functionality for relationships
- **Edit Relationship Modal**: Reuse RelationshipForm component for editing existing relationships
- **Delete Confirmation**: Safe deletion with confirmation dialog to prevent accidental deletions
- **Enhanced Relationship Display**: Better relationship text display with proper type handling (parent, spouse, sibling)

## Code Review — Recommendations (Non-breaking, high impact)

- Types consolidation
  - Replace ad-hoc `Member`/`Relationship` interfaces declared inside components with shared types from `src/types/supabase.ts` or `src/types/index.ts`.
  - Update `src/types/index.ts` `Relationship.type` union to include `'sibling'` to match DB and UI.
  - Files to touch: `src/app/dashboard/tree/[id]/page.tsx`, `src/components/FamilyTreeBuilder.tsx`, `src/components/TreeVisualization.tsx`, `src/components/RelationshipForm.tsx`.

- Persist actions from FamilyTreeBuilder
  - Wire `onAddMember` and `onAddRelationship` in `src/app/dashboard/tree/[id]/page.tsx` to call `createMember` / `createRelationship` and then `loadTree()`.
  - Infer relationship type from handle ids in `FamilyTreeBuilder` `onConnect` instead of always defaulting to `parent`.

- Photo upload pathing
  - Store storage `path` (not public URL) in DB; resolve to public URL at render using `getPhotoUrl` to decouple storage location.
  - Optionally upload to a temporary key, then re-upload once a real `member.id` exists.

- Supabase client hygiene
  - Remove environment variable console logging and top-level throw in `src/lib/supabase.ts` for production builds; guard diagnostics behind `process.env.NODE_ENV !== 'production'`.

- Invite permissions (functional gap)
  - Add a `TreePermissions` (or `TreeMembers`) table mapping `tree_id`, `user_id`, `role`; extend RLS to allow `editor/viewer` access.
  - On accept, insert permission row, then mark invite accepted.

- Cleanup and consistency
  - Remove or archive legacy `src/components/TreeVisualization.tsx` if unused (React Flow is primary).
  - Replace `<img>` with Next `Image` for member photos for perf.
  - Remove debug `console.log`/`alert` from dashboard flows before production.
  - Either adopt `zustand` stores (`src/stores/*`) in pages or remove them to avoid dead code.

### Completed in this pass
- Unified types across components using Supabase row types; added `'sibling'` to shared `Relationship` type.
- Persisted builder actions and inferred relationship type from handles; persisted via Supabase and reloaded tree.
- Switched photo storage to save storage `path` and resolve to public URL at render with `getPhotoUrl`.
- Cleaned up Supabase client environment logging; guarded diagnostics in dev only.
- Implemented invite permissions: added `TreePermissions` table/schema, RLS, and updated `acceptInvite` to upsert permission then mark invite accepted.
- Marked legacy `TreeVisualization.tsx` as deprecated reference (React Flow builder is primary).

## Relationship Taxonomy Proposal (Planning)

We currently store three base relationship types: `parent`, `spouse`, `sibling`.

To support a “proper” family tree experience, users typically expect many additional labels. Most can be derived from the base edges; a few may need attributes or extra base types.

- Derived from existing edges (no schema change required): ~16
  - Direct line: `child`, `grandparent`, `grandchild`, `great-grandparent`, `great-grandchild` (repeatable to N)
  - Collateral: `aunt`, `uncle`, `niece`, `nephew`, `cousin` (n-th cousin, m-times removed)
  - In-law via spouse links: `parent-in-law`, `child-in-law`, `sibling-in-law`, `grandparent-in-law`, `aunt/uncle-in-law`, `niece/nephew-in-law`, `cousin-in-law`

- Relationship qualifiers (attributes on existing edges): ~9
  - On `parent`: `biological`, `adoptive`, `step`, `foster`, `guardian`
  - On `sibling`: `full`, `half`, `step`, `twin`

- Additional social/marital statuses (either attributes on `spouse` or separate base types): ~4
  - `ex-spouse` (or `spouse` with status=`divorced`/`separated`), `fiancé/fiancée` (engaged), `partner/domestic partner`, `co-parent` (non-spousal)

Minimal model recommendation:
- Keep base edges lean: `parent`, `spouse` (existing), retain `sibling` (for UX convenience), and add `partner` if we need non-marital unions.
- Add attributes on edges (not new types) to express: biological/adoptive/step/foster/guardian; marital status (married, engaged, divorced, separated); sibling type (full/half/step/twin).
- Compute all other labels as derived at render time.

Approximate count of “new” user-facing labels supported after derivation: 25–35, without expanding DB types beyond possibly adding `partner` and edge attributes.
