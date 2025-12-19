# User Content Moderation — Feature Completion Requirements (DevDogs)

## Contributions (general functionality / overarching accomplishments)

- Added **user-facing post reporting** via a Flag button (users can flag/unflag posts).
- Added an **Admin Moderation Dashboard** under `src/app/admin/*` so admins can review and act on posts:
  - **Flagged tab**: admins can Keep or Archive reported posts
  - **Archived tab**: admins can Keep (Unarchive) or Remove posts
  - **Comments tab**: view comments now; moderation/reporting is planned next
- Updated the DB/schema to support moderation state + reporting:
  - Added `posts.archived` and `posts.flagCount`
  - Added `flags` table + relations (user ↔ post flags)

## Admin Dashboard Access

- Admin dashboard: `http://localhost:3000/admin`

## API Routes created (by feature group)

- `src/app/api/flags/route.ts`
  - Purpose: user post flagging/unflagging (updates `flags` table and `posts.flagCount`)
  - Required input (JSON): `{ userId: string, postId: string }`
  - Methods:
    - `POST` = create flag
    - `DELETE` = delete flag
- `src/app/api/removeFlag/route.ts`
  - Purpose: moderation helper for resolving a post’s flagged/archived state
  - Required input (JSON): `{ userId: string, postId: string }`

## Components affected/created (by feature group)

**Created/modified in `src/components/`:**

- `Post.tsx` — centralized post rendering/actions (reduced logic in feed page)
- `FlagButton.tsx` — user report/unreport button (calls the flags APIs)
- `KeepPost.tsx` — admin action used on Flagged tab
- `ArchivePost.tsx` — admin action used on Flagged tab
- `RemovePost.tsx` — admin action used on Archived tab

**Admin pages created under `src/app/admin/`:**

- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/flagged/page.tsx`
- `src/app/admin/archived/page.tsx`

**Other affected files:**

- The main posts feed `page.tsx` (updated to use the new Post/FlagButton components)

## Libraries installed

- No new libraries required specifically for this feature (uses the existing Next.js + Drizzle stack already in the repo).

## Functions / interfaces for others to use (including required parameters)

### API usage (for any future UI)

- **Flag a post**
  - Route: `POST /api/flags`
  - Required body: `{ userId: string, postId: string }`
- **Unflag a post**
  - Route: `DELETE /api/flags`
  - Required body: `{ userId: string, postId: string }`
- **Resolve flagged/archived state (moderation helper)**
  - Route: `POST /api/removeFlag`
  - Required body: `{ userId: string, postId: string }`

### Reusable UI building blocks

- `<FlagButton postId={string} />`
  - Requires: `postId`
  - Purpose: toggles reporting state using the two API routes above
- `<KeepPost postId={string} />`, `<ArchivePost postId={string} />`, `<RemovePost postId={string} />`
  - Require: `postId`
  - Purpose: admin moderation actions used throughout `src/app/admin/*`
- `<Post ... />`
  - Purpose: shared post display component used to keep feed/admin UI consistent

## Known gaps / next steps (not yet implemented)

- Add **overlay** when a post is kept/archived/unarchived/removed to prevent keeping and archiving a post (must disable other buttons when one is clicked).
- Add **comment moderation/reporting** (Comments tab exists; moderation flow is the next planned work).
