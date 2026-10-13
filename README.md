# One Cloud ☁️ — Telegram-based Cloud Storage & Personal File Manager

[![One Cloud Banner](https://img.shields.io/badge/One%20Cloud-Open--Source%20Drive-0088cc?style=for-the-badge&logo=telegram&logoColor=white)](https://github.com/orgo-talukder/One-Cloud)
[![GitHub Stars](https://img.shields.io/github/stars/orgo-talukder/One-Cloud?style=for-the-badge&logo=github&color=ffd700)](https://github.com/orgo-talukder/One-Cloud/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-ffca28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Telegram MTProto](https://img.shields.io/badge/Telegram-MTProto%20GramJS-26a5e4?style=for-the-badge&logo=telegram)](https://core.telegram.org/mtproto)

> **One Cloud** is a next-generation, high-performance **Telegram-based cloud storage** and **Personal file manager**. Built as a modern **Open-source drive** and Google Drive alternative, it delivers blazing-fast **IDM-style parallel multi-chunk downloads**, real-time folder management, and seamless cross-device cloud synchronization using Telegram MTProto and Firebase Firestore.

---

## ⚡ Highlights & Key Keywords

- **Telegram-based cloud storage:** Store unlimited documents, 4K videos, audios, and archives securely inside your personal Telegram Saved Messages (`me`) without paying recurring cloud hosting fees.
- **Personal file manager:** Organize your digital workspace with nested directories, instant breadcrumbs, drag-and-drop uploading, auto-suggest search, and media lightboxes.
- **Open-source drive:** 100% self-hostable, private, transparent, and built with cutting-edge web technologies (Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS v4).
- **IDM Superfast Multi-Chunk Downloads:** Concurrent 8-chunk parallel downloader (`Blob` byte-assembly) and direct byte-streaming route supporting external download managers (IDM, aria2, curl, wget) with `Accept-Ranges: bytes`.
- **Cross-Device Persistent Sync:** Connect your Telegram account once via Google login or email; your Telegram session and folder hierarchy automatically sync across mobile, laptop, and desktop without reconnecting!

---

## 📑 Table of Contents

- [Why One Cloud?](#-why-one-cloud)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Features Checklist](#-features-checklist)
- [Speed & Download Engine (IDM-Grade Parallelism)](#-speed--download-engine-idm-grade-parallelism)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Step 1: Telegram API Credentials Setup](#-step-1-telegram-api-credentials-setup)
- [Step 2: Firebase Setup (Auth & Firestore)](#-step-2-firebase-setup-auth--firestore)
- [Step 3: Environment Configuration](#-step-3-environment-configuration)
- [Step 4: Local Installation & Development](#-step-4-local-installation--development)
- [Desktop App (Electron)](#-desktop-app-electron)
- [Production Deployment (VPS, Docker, Cloud Run, Vercel)](#-production-deployment)
- [Security & Privacy Architecture](#-security--privacy-architecture)
- [Telegram Limits & Guidelines](#-telegram-limits--guidelines)
- [Recommended GitHub Topics & SEO Tags](#-recommended-github-topics--seo-tags)
- [Contributing & License](#-contributing--license)

---

## 💡 Why One Cloud?

Standard cloud drives (Google Drive, Dropbox, iCloud) restrict users to 5 GB – 15 GB of free storage before charging steep monthly fees. Meanwhile, **Telegram** offers generous media hosting (up to **2 GB per file**, or **4 GB per file** for Telegram Premium accounts) completely free.

However, organizing, finding, and browsing files within standard Telegram chat timelines is difficult.

**One Cloud solves this problem:**
1. **Google Drive UI & UX:** Full-featured grid and list views, nested folder trees, search bar with live auto-suggest, trash bin with soft-delete and two-way permanent purge.
2. **Zero Middleman Storage:** Binary files stay stored directly on Telegram's global Data Centers. One Cloud servers never permanently store your private data.
3. **Decoupled Speed:** High-speed Cloud Firestore maintains file metadata, tags, and tree hierarchy, delivering millisecond directory navigation.

---

## 🏛 Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ONE CLOUD CLIENT APPS                           │
│        • Web Application (Next.js 15 / React 19 / Tailwind v4)         │
│        • Desktop App (Electron Multi-Platform Linux / macOS / Win)     │
│        • Mobile Progressive Web App (PWA with Service Worker)          │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
    1. Auth, Profile & Metadata               2. IDM-Style Concurrent Chunks
               │                                          │
               ▼                                          ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│     FIREBASE CLOUD SUITE     │          │   NEXT.JS STREAMING ENGINE   │
│  • Firebase Authentication   │          │   (Multi-threaded API Proxy) │
│    - Google 1-Click Sign-In  │          │  • AES-256-GCM Session Vault │
│    - Email / Password        │          │  • Byte Range Splitter       │
│  • Cloud Firestore           │          │  • GramJS MTProto Connector  │
│    `users/{uid}/files`       │          └──────────────┬───────────────┘
│    `users/{uid}/folders`     │                         │
│    `users/{uid}` (Sync State)│                         │ MTProto Direct TCP/WSS
└──────────────────────────────┘                         │ (Encrypted Byte Chunks)
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │     TELEGRAM MTProto CLOUD   │
                                          │      "Saved Messages" (me)   │
                                          │   (Files up to 2GB / 4GB)    │
                                          └──────────────────────────────┘
```

---

## 🚀 Features Checklist

### 📂 Personal File Manager
- **Hierarchical Folders:** Create infinite nested folders with responsive breadcrumbs.
- **Move & Organize:** Easy "Move to Folder" modal to reorganize your entire drive.
- **Sorting & Filtering:** Sort instantly by Name, Size, or Date Modified (Ascending/Descending).
- **Three-Dot Quick Menu:** Quick actions for Preview, Download, Star, Rename, Move, and Delete.
- **Search & Auto-Suggest:** Real-time YouTube-style search dropdown with instant file previews.

### ⚡ Download & Transfer Engine
- **IDM-Style Superfast Parallel Downloads:**
  - Files are split into concurrent chunks (1 MB – 4 MB per worker thread).
  - Multi-connection downloading utilizing maximum available network bandwidth.
  - Automatic fallback to high-speed single-stream chunking for restricted environments.
- **External Download Manager Friendly:** Direct stream endpoint with full `Accept-Ranges: bytes` support for Internet Download Manager (IDM), aria2, wget, and curl.
- **Transfer Drawer:** Bottom-right persistent drawer with real-time speed, byte counters, progress bars, and a clean dismiss (X) button with auto-dismiss on completion.

### 🔒 Security, Accounts & Sync
- **Google 1-Click Sign-In & Email Auth:** Safe, modern authentication powered by Firebase.
- **Cross-Device Telegram Session Sync:** Connect Telegram once; it automatically syncs with your Google / Email account. When logging in on mobile or another laptop, your Telegram drive is instantly ready without reconnecting.
- **Account & Profile Dashboard:** View connected Google avatar, email, provider badges, Telegram username, and cloud sync status under Settings (`/app/settings?tab=account`).
- **AES-256-GCM Encryption:** Session tokens are secured server-side using AES-256-GCM with dynamic 96-bit IVs and authentication tags.
- **Soft Delete & Permanent Purge:** Trashed files are deducted from active storage and can be restored or permanently revoked from Telegram servers (`deleteMessages('me', ..., { revoke: true })`).

---

## ⚡ Speed & Download Engine (IDM-Grade Parallelism)

One Cloud incorporates a modern chunk-based streaming architecture engineered to rival desktop download accelerators:

1. **Range-Based Fetching:** When downloading through the web client, the engine queries file metadata and dispatches concurrent chunk requests to `/api/telegram/download/[fileId]`.
2. **Byte Stitching in Memory:** Chunks are fetched via parallel `fetch()` streams and assembled into a consolidated in-memory `Blob` before prompting save, avoiding browser throttling.
3. **External IDM Acceleration:** For massive 1 GB+ videos or archives, users can click "Copy Direct Stream URL" and paste into **Internet Download Manager (IDM)**, unlocking up to 32 concurrent TCP connections directly against the stream.

---

## 🛠 Tech Stack

| Component | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) | `15.4` | App Router, Server Handlers, Turbopack |
| **UI Library** | [React](https://react.dev/) | `19.2` | Concurrent Mode & Modern Hooks |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.9` | Full type safety and strict schema validation |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `v4` | High-speed CSS engine with `@tailwindcss/postcss` |
| **Icons & Motion** | [Lucide](https://lucide.dev/) / [Motion](https://motion.dev/) | Latest | Google Drive-grade UI icons & fluid layout transitions |
| **Database & Auth** | [Firebase](https://firebase.google.com/) | `11.x` | Google Sign-in, Email Auth, Cloud Firestore |
| **Telegram Bridge** | [GramJS (`telegram`)](https://gram.js.org/) | `2.26+` | Pure JS MTProto client (runs in standard Node.js without native C++ TDLib) |
| **Desktop Runtime** | [Electron](https://www.electronjs.org/) | `44.x` | Linux AppImage, Debian package, Cross-platform desktop client |

---

## 📋 Prerequisites

1. **Node.js** version `20.x` or `22.x` LTS (`node -v`).
2. **npm** version `10+` (or `pnpm` / `yarn`).
3. An active **Telegram account** (with mobile phone).
4. A free **Google Firebase project** (for Authentication and Firestore).

---

## 🔑 Step 1: Telegram API Credentials Setup

One Cloud communicates with Telegram servers via MTProto using your personal `api_id` and `api_hash`:

1. Visit **[https://my.telegram.org](https://my.telegram.org)**.
2. Enter your phone number with international country code (e.g. `+1...` or `+880...`) and verify the code sent to your Telegram app.
3. Click on **API development tools**.
4. Fill in:
   - **App title:** `One Cloud Storage`
   - **Short name:** `onecloud`
   - **Platform:** `Web`
5. Click **Create application**.
6. Copy your **`api_id`** (numeric) and **`api_hash`** (32-character hex string).

---

## 🔥 Step 2: Firebase Setup (Auth & Firestore)

1. Open **[Firebase Console](https://console.firebase.google.com/)** and create a project.
2. In **Authentication > Sign-in method**, enable:
   - **Google** (Select support email)
   - **Email/Password**
   - **Anonymous** (for instant Guest testing)
3. In **Firestore Database**, create a database in **Production mode**.
4. In the **Rules** tab, deploy the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

5. Go to **Project Settings > General > Your apps**, register a Web App (`</>`), and copy your `firebaseConfig` keys.

---

## ⚙️ Step 3: Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

```env
# Telegram MTProto Credentials
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash

# AES-256 Session Secret (Minimum 32 random characters)
SESSION_SECRET=your_super_strong_random_32_char_secret_string

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Optional Canonical Website URL (for sitemap.xml)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 💻 Step 4: Local Installation & Development

```bash
# 1. Clone repository
git clone https://github.com/orgo-talukder/One-Cloud.git
cd One-Cloud

# 2. Install dependencies
npm install

# 3. Start local Next.js dev server
npm run dev
```

Navigate to `http://localhost:3000` in your web browser.
- Sign in with Google or Email.
- Click **Connect Telegram Account** (scan QR code with Telegram mobile app or log in with SMS code).
- Upload, organize, and download files with ultra-fast speed!

---

## 🖥 Desktop App (Electron)

One Cloud also bundles as a native desktop application:

```bash
# Run Electron in development mode
npm run electron:dev

# Build standalone Linux AppImage & Debian package
npm run build:linux
```

---

## 🚢 Production Deployment

### Option A: Linux VPS (DigitalOcean / Hetzner / AWS EC2)
Ideal for large file uploads up to Telegram's full 2 GB / 4 GB limits:
```bash
# Install Node.js 20 & PM2
sudo apt update && sudo apt install -y nodejs npm nginx
sudo npm install -g pm2

# Build & Run
npm install
npm run build
pm2 start npm --name "onecloud" -- start
```
Configure Nginx reverse proxy with `client_max_body_size 2048M;` and SSL with Certbot.

### Option B: Docker Container
```bash
docker build -t onecloud:latest .
docker run -d -p 3000:3000 --env-file .env.local --name onecloud onecloud:latest
```

---

## 🔒 Security & Privacy Architecture

- **Zero Third-Party Storage:** Binary files go directly from your client/server to Telegram's secure Data Centers. No AWS S3, Cloudflare R2, or third-party storage vendor sees your bytes.
- **AES-256-GCM Session Protection:** Your Telegram session token is encrypted before saving. Plaintext session strings are never stored.
- **Isolated User Firestore:** Firestore rules enforce that users can only read and write to their own documents (`/users/{uid}/*`).
- **Honest Data Model:** We clearly state that Telegram Saved Messages are encrypted in transit and at rest by Telegram MTProto, without misleading end-to-end encryption claims.

---

## ⚡ Telegram Limits & Guidelines

- **File Size Maximums:** 2,000 MB (2 GB) for standard accounts; 4,000 MB (4 GB) for Telegram Premium accounts.
- **Safety Flood Wait:** Consecutive rapid uploads are rate-limited by Telegram's safety engine. One Cloud automatically handles and informs users of any cooldown period.
- **Autonomous File Ownership:** If you delete a message inside the official Telegram mobile app, clicking "Sync" in One Cloud automatically updates your folder index.

---

## 🏷 Recommended GitHub Topics & SEO Tags

To ensure maximum visibility in GitHub Search and Google Indexing, add these topics in your GitHub repository's **About** settings:

`telegram-based-cloud-storage` · `personal-file-manager` · `open-source-drive` · `cloud-storage` · `google-drive-clone` · `nextjs` · `telegram-storage` · `idm-downloader` · `gramjs` · `unlimited-storage` · `firebase` · `file-manager` · `drive` · `pwa` · `electron`

---

## 📜 Contributing & License

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/orgo-talukder/One-Cloud/issues).

Distributed under the **MIT License**. See `LICENSE` for more information.

---

**One Cloud — Your Files. Your Cloud. Your Control.**  
Made with ❤️ by [Argo Talukder](https://github.com/orgo-talukder).
