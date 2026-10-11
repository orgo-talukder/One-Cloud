# Telegram-Powered Cloud Drive — Product Requirements Document (PRD)

> **Document type:** Product + UX + Architecture + Security + Implementation Specification  
> **Status:** MVP specification  
> **Product language:** English only  
> **Frontend:** Next.js + TypeScript  
> **Database / website authentication:** Firebase  
> **File cloud:** Each user's own Telegram account, accessed through TDLib  
> **Primary goal:** Build a user-friendly personal cloud-drive web app that lets users connect their own Telegram account and manage files through a familiar Drive-like interface.

---

## 0. Instructions to the Vibe-Coding AI

Read this document completely before changing or generating project code.

1. **Inspect the existing repository first.** Identify the framework version, package manager, app-router/pages-router choice, existing UI components, routes, Firebase setup, tests, and current features. Do not overwrite working code or replace the project with a fresh template.
2. **Do not invent product capabilities.** If a requirement depends on Telegram/TDLib API behavior, a Telegram limitation, Firebase plan limits, or a package's actual API, verify it against official documentation before implementing it.
3. **Do not fake success.** No fake files, fake storage quotas, simulated completed uploads, hard-coded connected status, fake progress, or demo dashboard data in production. Use realistic loading, empty, error, offline, syncing, and unsupported states.
4. **Preserve existing features** unless they conflict with this document or the user explicitly asks to remove them. Explain any necessary breaking change before applying it.
5. **Work incrementally.** First produce a repository audit and implementation plan; then implement in small tested milestones. Do not attempt a risky all-at-once rewrite.
6. **Use English throughout the product UI.** All visible UI text, labels, buttons, validation, empty states, error messages, tooltips, accessibility labels, onboarding, and emails must be English. Technical code comments may be English too.
7. **Do not claim E2EE** unless end-to-end encryption is genuinely implemented and reviewed. Telegram Cloud Chats and a custom web app's client-side encryption are not the same thing.
8. **Never put Telegram session secrets, Firebase Admin credentials, private service-account keys, or other server secrets in client code, public environment variables, Git, analytics, logs, or error reports.**
9. Before installing a dependency, verify that it is maintained, compatible with the chosen runtime, and actually required. Avoid duplicate packages and unnecessary dependencies.
10. If any requirement cannot be safely or reliably implemented, explain the blocker and propose the smallest honest alternative instead of quietly faking it.

---

## 1. Product Overview

### 1.1 Product concept

A personal cloud-drive web application inspired by familiar file managers such as Google Drive. A user signs up to this website, connects their own Telegram account, and uses the website to upload, organize, search, preview, download, rename, move, star, and manage files.

- **Telegram** stores the actual uploaded file messages in the user's own Telegram account, using a deliberately chosen Telegram chat such as Saved Messages where supported.
- **Firebase Authentication** authenticates the user to this website.
- **Cloud Firestore** stores website metadata and user-specific organization data, not the authoritative file bytes.
- **Next.js** provides the website UI and appropriate server-side endpoints.
- **TDLib** is the preferred Telegram client library for user-account workflows if it passes the technical proof-of-concept and Telegram's current terms/limits. It is not the Telegram Bot API and is not a cloud storage provider itself.

### 1.2 Product promise

Tagline: **Your Files. Your Cloud. Your Control.**

Suggested landing-page subtitle:

> A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.

Do not advertise “unlimited forever”, “100% secure”, “zero knowledge”, or “end-to-end encrypted” unless the product can prove the claim and the technical implementation supports it.

### 1.3 Target users

People who want a convenient web interface to organize files in their own Telegram account. The MVP is for personal file management, not team collaboration or a replacement for every Google Drive feature.

### 1.4 MVP success criteria

- Users can create a website account and securely connect their own Telegram account.
- Uploading a file results in an actual Telegram upload and a matching Firestore metadata record.
- Users can browse folders, search metadata, preview supported files, download, rename, move, star, trash, restore, and permanently delete supported items.
- Storage figures are honest, explain what is counted, and update after confirmed operations.
- User A cannot read or modify User B's metadata or sessions.
- The app recovers safely from upload failures, network interruptions, expired authentication, and Telegram connection issues.
- The interface works on mobile, tablet, and desktop, with accessible English UI.

---

## 2. MVP Scope

### 2.1 Required features

- Website sign up, sign in, sign out, and account deletion flow.
- Telegram account connect/disconnect and connection status.
- Home/Dashboard with storage summary, file/folder counts, recent items, and upload activity.
- My Drive with nested folders and breadcrumbs.
- Upload manager: queue, progress where available, pause only if genuinely supported, retry, cancel where supported, and clear errors.
- File operations: download, rename in the Drive metadata, move, star/unstar, trash, restore, permanent delete with confirmation, and bulk selection.
- Basic preview for image, PDF, audio, and video where safe and technically supported.
- Search by filename, extension/type, folder, and upload/modified date using indexed metadata.
- Recent and Starred pages.
- Trash with restore and explicit permanent deletion.
- Settings for appearance, default view, sort order, upload preferences, connected Telegram account, session security, and account actions.
- Responsive navigation, skeleton loading, empty states, offline/error states, keyboard support, and clear accessibility labels.
- Privacy Policy, Terms, Acceptable Use, and Help/FAQ pages.
- A way to export website metadata and delete the website account, with explicit explanation of what happens to Telegram files.

### 2.2 Out of scope for MVP

Do not implement these unless separately approved:
- Google Docs/Sheets-style editing or real-time collaboration.
- Shared drives, team workspaces, and complex multi-user permissions.
- Public file-sharing links.
- Desktop folder sync.
- OCR/full-text search over file contents.
- AI file search.
- Duplicate detection based on file content, unless designed and tested separately.
- ZIP extraction or execution of uploaded files.
- Guaranteed “unlimited storage” or a claim that Telegram offers a particular total storage quota.
- Admin access to users' personal files or Telegram account sessions.
- A Telegram bot as a substitute for a user-account client.
- Any feature that violates Telegram's current terms, API rules, rate limits, or account protections.

---

## 3. Core Product and Storage Semantics

### 3.1 Three separate concepts

The app must distinguish:

1. **Tracked Drive size:** sum of the file sizes of the records the website currently tracks, with a clearly documented rule about Trash.
2. **Telegram account's total storage usage:** do not show unless Telegram provides a reliable, supported way to determine it.
3. **Telegram account's remaining capacity:** do not show unless a reliable authoritative value is available.

Recommended UI label: **Storage Used in Your Drive**. Help text:

> Calculated from files indexed in your Drive. This is not a measurement of all storage used by your Telegram account.

Do not show a quota bar, “X GB of unlimited”, remaining capacity, or a storage percentage without reliable source data.

### 3.2 File record and size

Each file record must retain the actual byte size as an integer (`fileSizeBytes`). Calculate total usage from eligible records. Avoid repeatedly incrementing/decrementing a cached total without idempotency, because retries or duplicate Telegram updates can corrupt the total.

Prefer an authoritative recalculation or a transaction-safe aggregation strategy. For large accounts, use a carefully designed summary document plus idempotent event handling and periodic reconciliation. Document the exact semantics for active, trashed, and permanently deleted files.

Recommended display:
- Tracked files count
- Folder count
- Storage Used in Your Drive
- Uploading / queued / failed items

### 3.3 Trash semantics

Recommended MVP policy:
- Moving an item to Trash marks its website metadata as trashed; it does **not** automatically delete the original Telegram message.
- Restoring returns the metadata to the active Drive.
- Permanent Delete must explain whether it deletes the corresponding Telegram message, only removes the website record, or could not verify the result.
- Never claim Telegram content was deleted until the deletion operation has been confirmed as far as the supported Telegram client API permits.
- If the website removes its metadata but the Telegram file remains, clearly warn the user and provide a documented recovery limitation.
- A future “Delete from Telegram too” action may be added only after the actual permission and API behavior are verified.

### 3.4 Rename and move semantics

- **Rename** may update only the website metadata/display name unless the Telegram message/file can genuinely be renamed through a supported operation. UI/help must explain the behavior.
- **Move** changes the website folder relationship. Do not imply the original Telegram message was moved between Telegram chats.
- **Copy reference** creates another metadata reference only if duplicate-reference behavior is explicitly designed. It must not falsely claim the bytes were copied.

### 3.5 External deletion and synchronization

The app must account for users deleting or changing Telegram messages outside the website.

- If using TDLib, investigate and implement supported message deletion/update events, including handling permanent deletion versus cache-related disappearance according to the actual API contract.
- Do not assume every Telegram action produces an event the app can observe.
- Maintain a `lastSyncedAt` / sync state and perform reconciliation after reconnect and at an appropriate cadence.
- Treat missing/unavailable messages as “needs verification” until confirmed; do not immediately subtract storage based on a transient network error.
- Handle duplicate events idempotently.
- If a browser-only TDLib client is chosen, state clearly that sync cannot run while the browser/app is closed. Reconcile on the next visit.
- If continuous synchronization is required, use a persistent backend worker only after a secure session-storage architecture has been designed.

---

## 4. Technical Architecture

### 4.1 High-level components

1. **Next.js frontend**
   - English UI, routing, components, client-side interaction, accessible responsive design.
   - Firebase client SDK for website authentication and allowed client-side reads/writes.
   - No direct access to another user's records.
   - No Telegram session secrets in localStorage, URL parameters, analytics, or frontend logs.

2. **Next.js server-side code / backend API**
   - Server-only routes or a separate persistent service, depending on the TDLib architecture selected.
   - Validate Firebase ID tokens for every protected operation.
   - Validate input, enforce ownership, rate-limit sensitive actions, return safe errors.
   - Never accept a client-provided `uid` as proof of ownership; derive it from verified authentication.
   - Never expose Firebase Admin credentials or session encryption keys.

3. **Firebase Authentication**
   - Website identity and session lifecycle.
   - Use supported sign-in methods selected during implementation.
   - Email verification/password reset if email/password is enabled.
   - Consider Google sign-in only if it materially improves onboarding and is configured securely.

4. **Cloud Firestore**
   - User-scoped file/folder metadata, preferences, upload task metadata, sync status, and audit events with minimal data.
   - Never store raw file bytes in Firestore.
   - Never store Telegram login codes, 2FA passwords, or plaintext Telegram session databases in Firestore.
   - Enforce least privilege in Security Rules and server-side checks.

5. **Telegram connector using TDLib**
   - Chosen only after a technical proof-of-concept.
   - Handle Telegram authorization, session/database lifecycle, file upload/download, message references, and updates.
   - Keep each user's Telegram client/session isolated.
   - Use official Telegram documentation and the actual installed TDLib/tdweb API version; do not invent method names.
   - Use Telegram's own API credentials obtained for the app; never use credentials from a third-party tutorial or sample project.

6. **Observability**
   - Structured logs with no file contents, auth codes, passwords, session strings, API hashes, encryption keys, or sensitive file names unless essential and explicitly protected.
   - Error reporting must scrub tokens and secrets.
   - Metrics for upload success/failure, retries, sync lag, and safe operational health.

### 4.2 Architecture decision: TDLib in browser vs persistent backend

This is a critical decision. Do not quietly pick an approach without a proof-of-concept.

**Option A — Browser-based TDLib/tdweb**
- The user's browser runs the Telegram client.
- Can reduce server-side custody of Telegram sessions.
- A browser is generally not running when the user closes it, so continuous external-deletion sync is not possible while closed.
- Browser persistence, WebAssembly compatibility, file-size/memory limits, and supported TDLib methods must be tested.
- Never assume a browser database is automatically secure merely because it is local.

**Option B — Persistent backend TDLib worker**
- A long-running service handles Telegram clients and update processing.
- Better fit for ongoing sync while the user is offline.
- Increases security responsibility because the service manages users' Telegram sessions.
- Requires per-user isolation, encrypted persistent storage, strict service access, session revocation, operational monitoring, and a safe deployment environment.
- Do not assume a serverless Next.js function can safely host a long-lived TDLib session.

**Required decision process**
1. Build a minimal proof-of-concept to connect a test account, send a small file to the intended Telegram chat, download it, and observe deletion/update behavior.
2. Verify the official TDLib API, `tdweb` status/maintenance, supported browser/runtime, and Telegram terms as of implementation time.
3. Document limitations and threat model.
4. Choose the least risky option that meets the product requirements.
5. If continuous sync is not achievable safely in MVP, explicitly ship “Sync on open/reconnect” rather than pretending to have continuous sync.

### 4.3 Telegram API, MTProto, TDLib, and Bot API

- TDLib is a Telegram client library, not a storage provider and not the same as the Telegram Bot API.
- A bot cannot be assumed to access a user's personal Saved Messages or behave as that user's account.
- Do not build a bot-based workaround for user-account login.
- Obtain the app's own `api_id` and `api_hash` through Telegram's official developer flow.
- Follow current Telegram API terms, rate limits, authorization rules, and abuse protections.
- Do not bypass Telegram restrictions or automate behavior intended to evade limits.

### 4.4 File upload flow

1. User chooses a file in the UI.
2. Validate file name, size, extension, MIME type where available, and account/API limits. Never trust MIME/extension alone.
3. Create an upload task with a unique idempotency key.
4. Send the file through the chosen TDLib architecture to the configured Telegram destination.
5. Receive confirmed Telegram identifiers and available actual file size.
6. Write/commit the Firestore file metadata only after a confirmed successful upload. If partial states must be saved, use an explicit state machine (`queued`, `uploading`, `uploaded`, `failed`, `cancelled`, `needs_reconciliation`).
7. Update upload progress only from real progress callbacks/events where supported; otherwise show an honest indeterminate state.
8. On failure, retain enough safe task metadata to retry without creating unintended duplicate Telegram messages.
9. On success, refresh dashboard totals and Recent files.

### 4.5 Download flow

1. Verify the Firebase user and file ownership.
2. Verify the associated Telegram reference and authorization.
3. Download through the supported TDLib/client method.
4. Stream or save the file safely where supported; avoid loading large files fully into memory.
5. Sanitize the suggested download filename.
6. Return a clear error if the message/file is missing, the session has expired, or the file cannot be retrieved.
7. Do not create publicly accessible, long-lived download URLs unless a separate secure sharing feature is explicitly approved.

### 4.6 External deletion / sync flow

1. Receive a supported Telegram update or run a reconciliation check.
2. Map the Telegram chat/message reference to the correct user's metadata record.
3. Verify whether the message is permanently deleted versus unavailable due to cache/network/session conditions according to actual TDLib behavior.
4. Apply the update idempotently.
5. Recalculate or safely update storage summary.
6. Update `lastSyncedAt`, sync status, and a user-friendly notice if needed.
7. When verification is impossible, show `Sync needs attention` or `Last checked at …`, not a false deleted state.

---

## 5. Data Model — Cloud Firestore

Use a user-isolated structure. Suggested baseline (adjust after inspecting the existing repository and Firebase capabilities):

```text
users/{uid}
  displayName
  email
  createdAt
  updatedAt
  preferences:
    theme
    defaultView
    sortOrder
    uploadPreferences
  telegram:
    connectionStatus
    connectedAt
    lastSyncedAt
    syncStatus
    // No plaintext login code, password, session database, or API secret here.
  storageSummary:
    trackedFileCount
    folderCount
    trackedBytes
    lastCalculatedAt

users/{uid}/files/{fileId}
  name
  normalizedName
  mimeType
  extension
  fileSizeBytes
  parentFolderId  // null for root
  isStarred
  status          // active | trashed | missing_pending_verification | deleted
  telegramChatId
  telegramMessageId
  telegramFileId  // only if valid/useful for the selected TDLib API
  createdAt
  updatedAt
  uploadedAt
  lastOpenedAt
  trashedAt
  lastVerifiedAt
  syncStatus

users/{uid}/folders/{folderId}
  name
  normalizedName
  parentFolderId
  createdAt
  updatedAt
  isStarred
  status

users/{uid}/uploadTasks/{taskId}
  originalName
  fileSizeBytes
  status
  progressPercent   // only real progress; nullable when unknown
  errorCode         // safe, non-sensitive code
  createdAt
  updatedAt
  idempotencyKey

users/{uid}/activity/{activityId}
  type
  fileId
  createdAt
  // Minimal metadata only; no file contents or secrets.

users/{uid}/syncState/current
  status
  lastStartedAt
  lastCompletedAt
  lastErrorCode
  cursorOrCheckpoint // only if supported by the actual sync design
```

Notes:
- Do not store secrets in `users/{uid}` or any client-readable Firestore document.
- If backend TDLib is selected, store encrypted session material in a dedicated secret/session store with tightly restricted service identity access—not in ordinary user-readable Firestore. Choose the storage technology only after deployment requirements and key-management design are documented.
- `telegramChatId` and `telegramMessageId` are identifiers, not authorization. Every request must still enforce the authenticated user's ownership.
- Use Firestore `Timestamp` consistently. Define whether size uses bytes and only convert to MB/GB for UI display.
- Use stable IDs and unique idempotency keys for upload and deletion processing.
- Define retention rules for activity logs and deleted metadata.

### 5.1 Firestore security rules

Default-deny. Users must only read their own allowed metadata. The client must not be able to:
- Read another UID's records.
- Change `telegramChatId`/`telegramMessageId` to gain access to another user's file.
- Mark arbitrary files as uploaded or deleted to manipulate storage totals.
- Modify trusted storage summaries, session status, upload completion state, or security audit records if these are server-managed.
- Create arbitrary administrative roles or change ownership.
- Read backend-only session/secret records.

For sensitive operations, perform server-side validation with Firebase Admin SDK after verifying the ID token. Security Rules are not a substitute for backend authorization. Test rules with the Firebase Emulator Suite before deployment.

### 5.2 Indexes and queries

- Add only indexes required by actual queries.
- Plan queries for active files by `parentFolderId`, `normalizedName`, `uploadedAt`, `isStarred`, and status.
- Firestore is not a general full-text search engine. MVP search can search indexed file metadata and use client-side filtering for a small loaded folder; for larger collections, choose a proper indexed search design only if needed.
- Paginate file lists. Do not load every file into memory for large users.

---

## 6. Security and Privacy Requirements

### 6.1 Authentication and authorization

- Firebase Authentication for website identity.
- Verify Firebase ID tokens on every protected server request.
- Apply least privilege, per-user ownership checks, schema validation, and rate limiting.
- Do not trust `uid`, Telegram chat IDs, file IDs, or ownership supplied by the browser without server-side verification.
- Use secure, HttpOnly, SameSite cookies for server-managed website sessions if that pattern is chosen; otherwise use Firebase's supported client session approach correctly. Document the selected model.
- Protect sensitive actions such as disconnecting Telegram, permanently deleting files, exporting data, and deleting the website account with clear confirmation and recent re-authentication where appropriate.

### 6.2 Telegram session security

- Never store Telegram login codes, 2FA passwords, or session database files in plaintext.
- Never log or expose TDLib authorization state containing sensitive information.
- If a backend owns TDLib sessions, encrypt persistent session/database material at rest using a managed key system where practical, separate keys from data, restrict service access, and design revocation/deletion.
- If the browser owns the session, explain browser/device persistence and shared-device risks; provide a disconnect/clear-local-session flow. Do not claim browser storage is immune to malware or browser-profile access.
- Avoid transmitting Telegram session material through ordinary frontend API calls after setup unless the protocol absolutely requires it and the transfer is explicitly protected and reviewed.
- Disconnect should revoke or remove the session according to supported Telegram/TDLib behavior and delete local/server session material according to policy. Explain any limits.

### 6.3 Transport and stored data

- HTTPS/TLS in production.
- Firebase-managed encryption at rest is useful but does not equal E2EE.
- Keep secrets in server-side environment variables or a secret manager; never use `NEXT_PUBLIC_` for private secrets.
- Do not send file bytes or sensitive file metadata to analytics.
- Scrub Firebase tokens, Telegram codes, API hash, session data, file contents, and encryption keys from logs and crash reports.
- Set strict CORS and Content Security Policy where applicable.
- Apply secure response headers, input validation, safe filename handling, and safe content disposition for downloads.
- Do not render uploaded HTML/SVG or unknown file formats as trusted same-origin active content. Use safe preview mechanisms or force download.
- Never execute uploaded files. Do not automatically extract archives in MVP.
- Add dependency scanning and secret scanning to the repository/CI if supported.

### 6.4 E2EE decision

E2EE is **not a claim for MVP unless implemented as a real client-side encryption system**. A future E2EE design must include:
- Encryption before upload on the user's device.
- Strong, reviewed authenticated encryption and cryptographic library choices.
- Key derivation and secure key storage.
- Recovery and lost-key behavior.
- Key rotation and account/device migration considerations.
- Metadata leakage analysis.
- Preview/search limitations for encrypted content.
- Independent security review before marketing it as E2EE.

Do not invent custom cryptographic algorithms. Do not store the decryption key beside the encrypted file in the same easily accessible location.

### 6.5 Privacy and legal

- Publish an accurate Privacy Policy, Terms, and Acceptable Use Policy before public launch.
- Explain which file contents are stored in Telegram and which metadata is stored in Firebase.
- Explain whether the service can access Telegram sessions or file contents under the chosen architecture.
- Explain account deletion consequences, especially that deleting a website account may not delete Telegram messages unless a supported, confirmed deletion flow is implemented.
- Do not access or inspect users' personal Telegram messages beyond the minimum necessary to manage the configured storage chat.
- Follow Telegram API Terms, applicable laws, copyright rules, and abuse handling requirements.

---

## 7. UI/UX Specification

### 7.1 Product visual direction

- Premium, simple, calm, trustworthy SaaS.
- Fully English UI.
- Light theme as default; optional Dark and System modes in Settings.
- Neutral surfaces with a restrained teal/blue-green accent.
- Consistent spacing, readable typography, subtle borders, limited shadows, and small purposeful transitions.
- No excessive glassmorphism, flashy gradients, distracting animations, or fake AI-style visuals.
- Fully responsive at mobile, tablet, laptop, and wide desktop sizes.
- Accessible contrast, keyboard navigation, visible focus, semantic labels, and screen-reader-friendly status messages.

### 7.2 Routes and pages

**Public pages**
- `/` — Landing page
- `/how-it-works` — Product workflow and storage explanation
- `/security` — Honest security model and limitations
- `/help` — Help/FAQ
- `/privacy` — Privacy Policy
- `/terms` — Terms
- `/acceptable-use` — Acceptable Use Policy

**Authentication**
- `/login`
- `/signup`
- Add password reset/verification routes only if required by the selected Firebase Auth method.

**Private app**
- `/app` — Dashboard/Home
- `/app/drive` — My Drive
- `/app/drive/[folderId]` or an equivalent nested-folder route
- `/app/file/[fileId]` — File preview/details
- `/app/recent`
- `/app/starred`
- `/app/trash`
- `/app/search`
- `/app/connect-telegram`
- `/app/settings`

Routes can be adjusted to match the existing repository. Avoid duplicate routes that represent the same content.

### 7.3 Landing page sections

1. Navbar with brand, Features, How It Works, Security, Help, Sign In, and Get Started.
2. Hero with tagline “Your Files. Your Cloud. Your Control.”
3. Short, honest product explanation.
4. Product UI preview that is clearly illustrative until live data exists.
5. Feature grid: File & Folder Management, Upload Manager, Search, Preview, Recent & Starred, Trash & Restore.
6. Three-step How It Works.
7. Storage transparency: no unsupported total-quota or “unlimited forever” claim.
8. Security and privacy explanation.
9. FAQ.
10. Final CTA and footer with legal/help links.

### 7.4 Private app shell

- Collapsible desktop sidebar.
- Mobile navigation drawer.
- Top search bar.
- Account menu and settings shortcut.
- Global upload activity panel.
- Clear connection/sync indicator.
- Avoid a dense or crowded mobile layout.

Sidebar items:
- Home
- My Drive
- Recent
- Starred
- Trash
- Settings

Do not include Shared with me, Shared drives, Computers, or team features in MVP unless implemented and approved.

### 7.5 Dashboard/Home

Show:
- Welcome header and quick actions: Upload Files, New Folder.
- Storage Used in Your Drive.
- Tracked file count and folder count.
- Telegram connection/sync status.
- Recent files.
- Active upload activity and failed-upload recovery.
- Empty state for new users.
- No fake “remaining storage”, quota percentage, or arbitrary 15 GB quota.

### 7.6 My Drive

- Breadcrumb navigation.
- New Folder and Upload actions.
- Grid/List toggle.
- Sort by name, size, and date where data exists.
- Filter by type/date.
- File list columns: Name, Type, Size, Modified/Uploaded date, and More.
- Multi-select and bulk actions.
- Context menu for open/preview, download, rename, move, star, trash, and details.
- Confirmation dialog for permanent deletion.
- Keyboard navigation and visible focus.
- Pagination/virtualization for large folders.

### 7.7 Loading, empty, error, and sync states

Every data-driven page must handle:
- Initial skeleton loading.
- Empty folder / no search results.
- Uploading / queued / failed / cancelled.
- Telegram disconnected / reauthentication required.
- Network unavailable.
- Sync in progress / sync needs attention / last synced.
- Missing file pending verification.
- Unsupported preview or file too large to preview.
- Permission denied.
- Firebase/backend error.

Error messages must be understandable and actionable. Do not expose stack traces, internal identifiers, tokens, or raw server errors.

### 7.8 Accessibility and performance

- Use semantic HTML and proper labels.
- Ensure keyboard support for menus/dialogs and Escape behavior.
- Respect reduced-motion preferences.
- Use image/video/PDF preview lazily.
- Do not load all files at once.
- Use pagination or virtualization where needed.
- Avoid expensive client-wide state and unnecessary rerenders.
- Do not show a progress percentage unless actual progress is available.

---

## 8. Suggested Project Structure

Adapt this to the existing project rather than forcing a rewrite. For an App Router project:

```text
project-root/
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx
│   │   │   ├── how-it-works/page.tsx
│   │   │   ├── security/page.tsx
│   │   │   ├── help/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── terms/page.tsx
│   │   │   └── acceptable-use/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── drive/page.tsx
│   │   │   ├── drive/[folderId]/page.tsx
│   │   │   ├── file/[fileId]/page.tsx
│   │   │   ├── recent/page.tsx
│   │   │   ├── starred/page.tsx
│   │   │   ├── trash/page.tsx
│   │   │   ├── search/page.tsx
│   │   │   ├── connect-telegram/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── health/route.ts
│   │       └── ... protected routes only where justified
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── drive/
│   │   ├── upload/
│   │   ├── preview/
│   │   └── settings/
│   ├── features/
│   │   ├── auth/
│   │   ├── files/
│   │   ├── folders/
│   │   ├── uploads/
│   │   ├── telegram/
│   │   ├── search/
│   │   └── sync/
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts
│   │   │   ├── admin.ts
│   │   │   └── config.ts
│   │   ├── validation/
│   │   ├── security/
│   │   ├── format/
│   │   └── env.ts
│   ├── server/
│   │   ├── auth/
│   │   ├── files/
│   │   ├── uploads/
│   │   ├── telegram/
│   │   └── sync/
│   ├── types/
│   └── styles/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

If TDLib requires a persistent process or native dependencies not supported by the selected Next.js hosting runtime, put the Telegram connector in a separately deployable service/repository or clearly isolated package. Do not try to force it into an incompatible serverless runtime.

---

## 9. Packages and Technology Choices

**Do not install every item blindly.** Inspect the project and verify current versions, maintenance, licensing, and compatibility before selecting dependencies. Use one package manager consistently and commit the lockfile.

### 9.1 Core

- `next` — Next.js framework.
- `react`, `react-dom` — UI.
- `typescript` — type safety.
- `firebase` — Firebase client SDK.
- `firebase-admin` — server-only Firebase Admin operations, if server verification/admin operations are required.
- `zod` — runtime validation of request payloads and environment variables.
- `react-hook-form` — optional form handling if useful.
- `date-fns` — optional date formatting.
- `lucide-react` — consistent icons.

### 9.2 UI

Choose a consistent design system:
- Tailwind CSS if already used or appropriate.
- `shadcn/ui` components where appropriate; install the selected underlying packages, not a fictitious single runtime package.
- Radix UI primitives only when needed by the chosen shadcn/ui components.
- `sonner` or another single toast library, not multiple competing toast packages.
- `next-themes` only if it fits the selected theme implementation.

Use accessible dialogs, dropdowns, tooltips, menus, and command/search patterns. Do not add heavy animation libraries unless necessary; CSS transitions may be enough.

### 9.3 Telegram / TDLib

- Investigate official `tdweb` / WebAssembly-based TDLib for a browser-based proof-of-concept.
- If using a backend worker, investigate the official TDLib build/bindings that match the chosen runtime and operating system.
- Do not assume a package named `tdlib` works in every Next.js deployment. Verify installation, binary compatibility, native dependencies, maintenance, and supported methods.
- Do not substitute a random unofficial Telegram client package without reviewing its trustworthiness and security implications.
- Use the official Telegram API documentation and actual library types to confirm methods/events.

### 9.4 Search, file preview, and tests

- Prefer Firestore indexed metadata queries for MVP search.
- A PDF preview library such as `react-pdf` may be used after compatibility and bundle-size checks.
- Use native browser media playback only for safe, supported formats.
- `vitest` for unit tests if compatible with the repo.
- `@testing-library/react` and `@testing-library/user-event` for component tests.
- `@firebase/rules-unit-testing` and Firebase Emulator Suite for rules tests.
- `playwright` for end-to-end tests if appropriate.
- ESLint and the project's supported formatter/linter setup.
- Optional secret/dependency scanning in CI.

### 9.5 Security packages and controls

Packages do not automatically make an app secure. Use them only as part of a threat-model-driven design:
- `zod` for input validation.
- Firebase Admin SDK for server-side token verification and trusted writes.
- Firebase Security Rules and Emulator Suite for access-control testing.
- A maintained rate-limiting solution suitable for the chosen hosting environment.
- A reputable, maintained cryptographic library only if client-side file encryption is designed and reviewed.
- A server-side secret manager / KMS for backend-held session-encryption keys when appropriate.
- Secure headers/CSP configured in Next.js.
- Dependency and secret scanning where available.

Do not add a custom crypto implementation. Do not use `NEXT_PUBLIC_` for secrets. Do not assume CORS, obscured URLs, or hidden buttons are authorization.

---

## 10. Environment Configuration

Create `.env.example` with names only and safe placeholders. Never commit actual secrets.

Potential variables, depending on the selected implementation:

```bash
# Public Firebase web config may be exposed to the browser as intended by Firebase.
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server-only; never prefix these with NEXT_PUBLIC_
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Telegram application credentials — server-side if the chosen architecture allows it.
TELEGRAM_API_ID=
TELEGRAM_API_HASH=

# Only if a backend session encryption design is approved:
SESSION_ENCRYPTION_KEY_ID=
# Prefer a managed secret/KMS reference over a raw key in ordinary env files.
```

Notes:
- Firebase web configuration is not by itself an authorization secret; Security Rules and Auth configuration are essential.
- The Firebase Admin private key is highly sensitive and server-only.
- Avoid placing raw private keys in deployment logs. Use the hosting provider's secret manager and correct newline handling.
- For a browser-based TDLib build, assess that `api_id`/`api_hash` can be observable by users. Do not treat them as a replacement for authentication, rate limits, or Telegram compliance.
- Do not add environment variables until the selected architecture actually needs them.

---

## 11. Error Handling and State Machines

Use typed, stable error codes internally and friendly English messages in the UI.

Example upload states:
- `queued`
- `validating`
- `uploading`
- `uploaded`
- `failed_retryable`
- `failed_permanent`
- `cancelled`
- `needs_reconciliation`

Example Telegram connection states:
- `not_connected`
- `authorizing`
- `connected`
- `reauth_required`
- `disconnected`
- `error`

Example sync states:
- `idle`
- `syncing`
- `synced`
- `needs_attention`
- `offline`

Transitions must be validated. An upload cannot become `uploaded` until the Telegram upload is confirmed and the metadata record is committed. If Telegram succeeds but Firestore fails, preserve a recoverable state and reconcile it instead of blindly uploading a duplicate.

---

## 12. Testing and Acceptance Criteria

### 12.1 Authentication and ownership
- Anonymous users cannot open private pages or protected APIs.
- User A cannot read or mutate User B's files, folders, upload tasks, or connection status.
- Client-provided UID cannot override the verified token UID.
- Account deletion and disconnect require clear confirmation.

### 12.2 Telegram integration
- A test account can connect through the actual chosen TDLib flow.
- A small file is genuinely uploaded to the intended Telegram chat.
- A matching Firestore record is created only after confirmed upload.
- Download returns the actual file, not a placeholder.
- Missing/expired session produces a clear recovery path.
- Reconnect does not silently duplicate uploads.
- Telegram deletion/update behavior is verified against the actual supported API, including unavailable versus permanently deleted cases.
- If browser-based TDLib is used, external deletion is reconciled on next open/reconnect and the UI does not claim background sync while closed.

### 12.3 Storage accuracy
- Storage totals are derived from the documented set of records and byte sizes.
- Duplicate deletion events do not subtract a file twice.
- Trash behavior matches the published policy.
- A missing message is not counted as permanently deleted until sufficiently verified.
- Formatting of bytes/KB/MB/GB is consistent.
- Unknown total Telegram quota is never replaced with a made-up value.

### 12.4 File operations
- Folder nesting and breadcrumbs work.
- Rename/move behavior matches the metadata semantics.
- Starred, Recent, Trash, restore, permanent delete, bulk selection, and search work with actual data.
- Unsupported previews fail safely and offer download where possible.
- Unsafe file types are not executed or rendered as trusted active content.

### 12.5 UX and performance
- Mobile, tablet, and desktop layouts are tested.
- Loading, empty, error, offline, and sync states are present.
- No fake data in production.
- Large file lists use pagination/virtualization where appropriate.
- Keyboard navigation and focus behavior work.
- Upload progress is truthful.
- No sensitive information appears in logs.

### 12.6 Security
- Firestore Rules tests pass in Firebase Emulator Suite.
- Protected server endpoints verify ID tokens and ownership.
- Secret scanning finds no credentials in Git.
- Dependency audit is reviewed and critical issues resolved or documented.
- Session disconnect/revocation and data-deletion behavior are tested.
- Privacy/legal pages accurately describe actual behavior.

---

## 13. Recommended Implementation Milestones

### Milestone 0 — Repository audit and technical spike
- Inspect the existing repository and report its current architecture.
- Verify official TDLib/tdweb compatibility, methods, lifecycle, and deployment limits.
- Prove connect → upload → download → deletion/update detection with a test account.
- Decide browser TDLib vs persistent backend worker.
- Document the threat model, limitations, and chosen data flow.
- Do not build the full UI before this spike succeeds.

### Milestone 1 — Design system and public site
- Build the responsive English landing page and legal/help page shells.
- Establish typography, colors, spacing, buttons, dialogs, menus, toast, skeleton, and responsive navigation.
- Avoid fake product metrics.

### Milestone 2 — Firebase authentication and authorization
- Configure Firebase Auth.
- Implement protected routes and server token verification where applicable.
- Write and test Firestore Security Rules.
- Add user preferences and account settings.

### Milestone 3 — Telegram connection
- Implement actual TDLib authorization.
- Store session state according to the chosen architecture.
- Implement connect/disconnect/reconnect and clear error states.
- Security review before real users connect their main Telegram account.

### Milestone 4 — Core file operations
- Upload/download and metadata lifecycle.
- My Drive, nested folders, breadcrumbs, rename, move, star, bulk operations.
- Retry/recovery and idempotency.

### Milestone 5 — Dashboard and file experience
- Storage summary, Recent, Starred, Search, Trash.
- Preview and upload manager.
- Reconciliation and sync status.

### Milestone 6 — Hardening and release
- Test security rules, ownership isolation, session revocation, data deletion, upload recovery, and storage accounting.
- Test responsive UX and accessibility.
- Add monitoring with secret redaction.
- Finalize accurate Privacy Policy, Terms, Acceptable Use, Help, and deployment documentation.

---

## 14. Deployment Guidance

- Deploy the Next.js frontend on a supported hosting platform such as Vercel, after confirming compatibility with the actual code and runtime.
- Firebase Auth and Firestore must be configured for the production domain.
- If using a persistent TDLib worker, deploy it on infrastructure that supports the required persistent process, storage, and native dependencies. Do not assume the Next.js hosting platform's serverless functions can host it continuously.
- Configure environment variables and secrets in the deployment environment.
- Configure allowed domains, OAuth redirect URLs, HTTPS, security headers, and production Firestore rules.
- Set budgets/alerts and understand Firebase free-tier quotas and Telegram/API constraints. Never promise zero cost or unlimited operation.
- Provide a tested backup/export and account-deletion process for website metadata.
- Document recovery steps if the Telegram connector goes offline.

---

## 15. Required Deliverables from the Coding AI

Before implementation:
1. Repository audit.
2. Architecture diagram and explanation.
3. TDLib technical spike results and selected integration approach.
4. Firestore schema and Security Rules plan.
5. Threat model and list of secrets/data flows.
6. Route map and UI component plan.
7. Dependency list with justification.

During implementation:
1. Working code in small milestones.
2. Firestore rules and indexes.
3. `.env.example` without real credentials.
4. Unit/integration/E2E tests where appropriate.
5. README with local setup, Firebase setup, Telegram API setup, deployment, and troubleshooting.
6. Clear notes for features that are blocked or only partially supported.

Before declaring completion:
- Demonstrate actual Telegram connection and file upload/download.
- Demonstrate user isolation.
- Demonstrate storage calculation and deletion reconciliation.
- Confirm no fake data or false security/quota claims.
- List implemented features, known limitations, tests run, and remaining risks.

---

## 16. Final Product Principles

1. **Truthful UX:** show only data and capabilities the backend can verify.
2. **Privacy first:** collect and store the minimum necessary information.
3. **User isolation:** every file, folder, task, and session belongs to one verified user.
4. **Secure by design:** secrets never enter client-visible code or ordinary logs.
5. **Telegram-aware architecture:** Telegram is the file cloud; Firebase is the website identity and metadata system.
6. **No unsupported promises:** do not promise a total Telegram quota, unlimited storage, continuous sync, or E2EE without proof.
7. **Usability:** clear English, responsive layouts, fast navigation, meaningful empty/error states.
8. **Incremental development:** audit, prove the risky integration, implement, test, and then deploy.

**Definition of done:** The MVP is complete only when the actual Telegram integration works, metadata is consistent, user data is isolated, storage figures are honest, core file operations work, and the interface passes the agreed functional and security tests.
