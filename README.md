# One Cloud ☁️

**Your Files. Your Cloud. Your Control.**

An open-source, Telegram-powered personal cloud drive engineered with a sleek **Google Drive-inspired web interface**. Store, organize, preview, download, and manage your documents and media with zero expensive storage subscriptions—powered by your personal **Telegram Saved Messages** for raw byte storage and **Firebase Cloud Firestore** for high-speed metadata indexing.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-ffca28?style=flat&logo=firebase)](https://firebase.google.com/)
[![Telegram MTProto](https://img.shields.io/badge/Telegram-MTProto%20GramJS-26a5e4?style=flat&logo=telegram)](https://core.telegram.org/mtproto)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 📑 Table of Contents

- [Why One Cloud?](#-why-one-cloud)
- [How It Works (System Architecture)](#-how-it-works-system-architecture)
- [Key Features](#-key-features)
- [Project Tech Stack](#-project-tech-stack)
- [Prerequisites](#-prerequisites)
- [Step 1: Telegram API Credentials Setup](#-step-1-telegram-api-credentials-setup)
- [Step 2: Firebase Setup (Auth & Firestore)](#-step-2-firebase-setup-auth--firestore)
- [Step 3: Environment Variables Configuration](#-step-3-environment-variables-configuration)
- [Step 4: Running Locally](#-step-4-running-locally)
- [Self-Hosting & Production Deployment](#-self-hosting--production-deployment)
  - [Deploying on Vercel](#deploying-on-vercel)
  - [Deploying with Docker](#deploying-with-docker)
  - [Deploying on a Linux VPS (Ubuntu / Debian + Nginx + PM2)](#deploying-on-a-linux-vps-ubuntu--debian--nginx--pm2)
  - [Deploying on Google Cloud Run or Render](#deploying-on-google-cloud-run-or-render)
- [Security & Cryptography Model](#-security--cryptography-model)
- [Telegram Limits & Technical Constraints](#-telegram-limits--technical-constraints)
- [API Route Reference](#-api-route-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [Disclaimer & Terms](#-disclaimer--terms)

---

## 💡 Why One Cloud?

Traditional cloud storage providers (Google Drive, Dropbox, OneDrive) charge recurring monthly fees once you exceed 5 GB to 15 GB of storage. Meanwhile, **Telegram Saved Messages** natively offers generous file hosting (up to **2 GB per file**, or **4 GB per file** for Telegram Premium accounts) with zero storage fees. 

However, searching and organizing files inside Telegram chat threads can quickly become chaotic. 

**One Cloud bridges this gap:**
1. **Familiar Experience:** You get a full Google Drive-style web interface with nested folders, drag-and-drop uploads, breadcrumbs, search, multi-format media previews, and trash recovery.
2. **Decoupled Architecture:** Heavy binary file bytes stay securely inside your personal Telegram account chat (`me`), while lightning-fast metadata (file names, sizes, mime types, folder parent IDs) is indexed in Cloud Firestore.
3. **Total Privacy & Custody:** You own the underlying Telegram account. If you ever stop using One Cloud, every file remains safely intact in your Telegram Saved Messages chat.

---

## 🏛 How It Works (System Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ONE CLOUD WEB CLIENT                            │
│           (Next.js 15 App Router / React 19 / Tailwind CSS v4)         │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
    1. Auth & Metadata Queries               2. Binary File Upload / Stream
               │                                          │
               ▼                                          ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│       FIREBASE CLOUD         │          │   ONE CLOUD NEXT.JS SERVER   │
│  • Firebase Authentication   │          │      (API Route Engine)      │
│    (Google / Email / Guest)  │          │  • AES-256-GCM Session Vault │
│  • Cloud Firestore           │          │  • GramJS MTProto Connector  │
│    `users/{uid}/files`       │          └──────────────┬───────────────┘
│    `users/{uid}/folders`     │                         │
└──────────────────────────────┘                         │ MTProto Over TCP/WSS
                                                         │ (Encrypted Auth Key)
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │     TELEGRAM MTProto CLOUD   │
                                          │      "Saved Messages" (me)   │
                                          │   (Files up to 2GB / 4GB)    │
                                          └──────────────────────────────┘
```

1. **Authentication:** The user logs in via Firebase Authentication (Google OAuth, Email/Password, or Anonymous Guest). All Firestore data is strictly scoped under `/users/{uid}/...` with default-deny security rules.
2. **Telegram Connection:** The user pairs their Telegram account via **QR Code Login** (scan with mobile app) or **Phone Number SMS/Code verification**. If Two-Step Verification (Cloud Password) is active, One Cloud computes the secure SRP check seamlessly.
3. **Encrypted Session Token:** The Telegram `StringSession` is encrypted server-side using **AES-256-GCM** with a dynamic 96-bit initialization vector (IV) and authentication tag. The server secret (`SESSION_SECRET`) ensures session keys cannot be forged or extracted.
4. **File Uploads:** When you upload a file, the server routes the byte stream to Telegram's MTProto servers using `sendFile('me', ...)`. Telegram stores the file and returns a document message ID. The file's metadata, size, MIME type, and Telegram message ID are recorded in your Firestore database.
5. **File Downloads & Streaming:** Downloading or previewing a file fetches the media stream directly from your Saved Messages chat using `downloadMedia(message)` and streams it back to your browser with appropriate `Content-Type` and `Content-Disposition` headers.
6. **Deletion:** Trashing a file marks it as `trashed` in Firestore (removing it from your storage calculation). Clicking "Delete Forever" sends an explicit `deleteMessages('me', [messageId], { revoke: true })` command to Telegram, purging the document from Telegram servers.

---

## 🚀 Key Features

- **Google Drive-Inspired Interface:**
  - Responsive **Grid View** and **List View** with sorting by name, size, and date.
  - Interactive **⋮ (Three-Dot)** menu for every file and folder (Preview, Download, Star, Rename, Move, Trashed).
  - Clean "+ New" action dropdown with New Folder, Upload File, and Upload Folder options.
- **Pure MTProto Telegram Integration:**
  - Built with GramJS (`telegram` npm package)—runs natively in Node.js without requiring external C++ TDLib shared libraries.
  - Real **QR Code Login** with dynamic polling and Telegram Data Center (DC) migration handling.
  - Real **Phone Number Login** with SMS / Telegram app code verification and 2FA Cloud Password support.
- **Rich In-Browser File Previews:**
  - Real image thumbnails and lightbox view (JPG, PNG, WebP, GIF, SVG).
  - Native HTML5 audio and video playback directly in the browser (MP4, WebM, MP3, WAV, OGG).
  - Embedded PDF document viewer.
  - Code and text preview with clean formatting.
- **Live Search & Auto-Suggest:**
  - YouTube-style real-time dropdown suggestion menu as you type.
  - Instant file preview trigger directly from search suggestions.
  - Keyboard navigation (Arrow keys + Enter).
- **Hierarchical Folder Structure:**
  - Unlimited nested subfolders with dynamic breadcrumb navigation.
  - "Move to Folder" modal to reorganize your drive structure effortlessly.
- **Upload Queue Manager:**
  - Persistent bottom-right drawer tracking multi-file upload tasks, real progress status, and retries.
- **Trash & Lifecycle Management:**
  - Soft-delete to Trash (deducted from active Drive storage).
  - One-click restore or permanent two-way deletion (Firestore + Telegram).
- **Truthful Storage Accounting:**
  - Clear **"Storage Used in Your Drive"** metric calculated directly from indexed active file sizes.
  - Detailed breakdown by categories: Images, Videos, Documents, Archives, Audio, and Others.
  - No deceptive "unlimited quota" claims or artificial 15 GB limits.
- **Appearance & Themes:**
  - Instant Light, Dark, and System Theme switching with zero screen flash.
  - Header quick-switcher and Settings page visual card selection.
- **Metadata Backup & Export:**
  - Export complete folder and file metadata snapshot as a `.json` backup file anytime.

---

## 🛠 Project Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Framework** | [Next.js 15.4](https://nextjs.org/) (App Router, Server Actions & Standalone Output) |
| **Runtime & Language** | [Node.js 20 LTS](https://nodejs.org/) / TypeScript 5.9 |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), `@tailwindcss/postcss`, `clsx`, `tailwind-merge` |
| **Icons & Animations** | [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) (`motion/react`) |
| **Database & Auth** | [Firebase 13](https://firebase.google.com/) (Firebase Auth + Cloud Firestore) |
| **Telegram Bridge** | [GramJS (`telegram`)](https://gram.js.org/) (Pure JavaScript MTProto client) |
| **QR Code Engine** | `qrcode` for Telegram mobile app pairing |
| **Cryptography** | Node.js `crypto` with **AES-256-GCM** (96-bit IV, 128-bit Auth Tag) |

---

## 📋 Prerequisites

Before installing One Cloud locally or self-hosting, ensure you have:
1. **Node.js** version `20.x` or `22.x` LTS installed (`node -v`).
2. **npm** version `10+` (or `pnpm` / `yarn`).
3. An active **Telegram account** (with your mobile phone).
4. A free **Google / Firebase account** (to set up Cloud Firestore & Auth).

---

## 🔑 Step 1: Telegram API Credentials Setup

One Cloud communicates with Telegram servers via MTProto using your personal `api_id` and `api_hash`. These credentials are free and provided directly by Telegram.

1. Open your web browser and navigate to **[https://my.telegram.org](https://my.telegram.org)**.
2. Enter your phone number (including international country code, e.g., `+1...` or `+880...`) and click **Next**.
3. Telegram will send a confirmation code to your Telegram app. Enter the code to log in.
4. Click on **API development tools**.
5. If you haven't created an app before, fill in the form:
   - **App title:** `One Cloud Drive` (or your preferred name)
   - **Short name:** `onecloud`
   - **Platform:** `Web`
   - **Description:** `Personal cloud drive storage client`
6. Click **Create application**.
7. You will now see your **`api_id`** (an integer, e.g. `12345678`) and **`api_hash`** (a 32-character hexadecimal string, e.g. `abcdef0123456789abcdef0123456789`).
8. Copy both values. You will paste them into your `.env.local` file.

> 💡 **Note:** If you run One Cloud as a multi-user application, users can also optionally supply their own `api_id` and `api_hash` directly in the connection modal, or rely on your server-level default.

---

## 🔥 Step 2: Firebase Setup (Auth & Firestore)

One Cloud uses Firebase to authenticate web users and store file/folder metadata.

### 1. Create a Firebase Project
1. Go to the **[Firebase Console](https://console.firebase.google.com/)**.
2. Click **Add project**, name it (e.g. `my-onecloud-drive`), and click Continue. (Google Analytics can be disabled).

### 2. Enable Authentication Providers
1. In the left navigation menu, click **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable the following providers:
   - **Email/Password:** Enable "Email/Password" (disable Email link / passwordless).
   - **Google:** Enable Google Sign-In and choose your support email.
   - **Anonymous:** Enable Anonymous authentication (used for instant Guest mode).
4. Under the **Settings** tab > **Authorized domains**, ensure `localhost` is listed. If deploying to Vercel or a custom domain, add your domain (e.g., `your-app.vercel.app`).

### 3. Enable Cloud Firestore
1. In the left menu, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a region near your location (e.g., `nam5` for North America, `asia-southeast1` for Asia, `eur3` for Europe).
4. Select **Start in production mode** and click Create.

### 4. Deploy Firestore Security Rules
1. In the Firestore Database page, click the **Rules** tab.
2. Paste the following security rules (also provided in the repository's `firestore.rules` file):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Isolated user-space rule: Each authenticated user can only access their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```
3. Click **Publish**.

### 5. Obtain Firebase Web Configuration
1. In the Firebase Console, click the **Gear icon (Project Settings)**.
2. Scroll down to the **Your apps** card and click the **Web icon (`</>`)**.
3. Enter an app nickname (e.g. `One Cloud Web`) and click **Register app**.
4. You will see a `firebaseConfig` object with:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
5. Keep these values handy for the next step.

---

## ⚙️ Step 3: Environment Variables Configuration

In the root directory of the project, create a `.env.local` file by copying the provided `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your configuration details:

```env
# ==============================================================================
# Telegram MTProto API Credentials (from https://my.telegram.org)
# ==============================================================================
TELEGRAM_API_ID=your_telegram_api_id_here
TELEGRAM_API_HASH=your_telegram_api_hash_here

# ==============================================================================
# Server-side AES-256 Session Secret (Minimum 32 random characters)
# Generate via: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# ==============================================================================
SESSION_SECRET=a_super_strong_random_32_character_secret_string_here

# ==============================================================================
# Firebase Web Client Configuration (from Firebase Console > Project Settings)
# ==============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Optional: Set only if you created a non-(default) Firestore database instance
# NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID=(default)
```

> 🔒 **Security Notice:** Never commit `.env.local` to public version control. It is already included in `.gitignore`.

---

## 💻 Step 4: Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-username/onecloud.git
cd onecloud
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Open in your browser
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- Sign up with email or click **Continue with Google** / **Continue as Anonymous Guest**.
- Once in the Drive dashboard, click **Connect Telegram Account** in the top header or banner.
- Scan the QR code using your Telegram mobile app (**Telegram Settings > Devices > Link Desktop Device**) or log in with your phone number.
- You are ready to upload, organize, search, and preview files!

---

## 🚢 Self-Hosting & Production Deployment

One Cloud is designed to be easily self-hosted across multiple cloud providers and containerized environments.

### Deploying on Vercel

1. Push your repository to GitHub or GitLab.
2. Sign in to **[Vercel](https://vercel.com/)** and click **Add New > Project**.
3. Import your One Cloud repository.
4. In the **Environment Variables** section, add all variables from your `.env.local`:
   - `TELEGRAM_API_ID`
   - `TELEGRAM_API_HASH`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Click **Deploy**.
6. After deployment completes, copy your Vercel URL (e.g., `onecloud.vercel.app`) and add it to **Firebase Console > Authentication > Settings > Authorized domains**.

> ⚠️ **Vercel Serverless Body Limit Notice:** Vercel Serverless Functions enforce a 4.5 MB request body limit for standard serverless functions on the Hobby tier. For large files (> 4.5 MB), we recommend hosting on a **VPS**, **Docker**, **Render**, or **Google Cloud Run** using Next.js standalone mode as described below.

---

### Deploying with Docker

One Cloud includes Next.js standalone output configuration (`output: 'standalone'` in `next.config.ts`), making container images exceptionally lightweight (~120 MB).

Create a `Dockerfile` in the root directory (if not already present):

```dockerfile
# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 2. Dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 4. Production Runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

**Build and Run the Docker Container:**

```bash
# Build Docker image
docker build -t onecloud:latest .

# Run container with environment file
docker run -d \
  --name onecloud \
  -p 3000:3000 \
  --env-file .env.local \
  --restart unless-stopped \
  onecloud:latest
```

---

### Deploying on a Linux VPS (Ubuntu / Debian + Nginx + PM2)

A VPS (DigitalOcean, Hetzner, Linode, AWS EC2, or Oracle Cloud) allows you to upload large files (up to Telegram's full 2 GB / 4 GB limit) without third-party serverless payload restrictions.

#### 1. Server Prerequisites
```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Install PM2 globally
sudo npm install -g pm2
```

#### 2. Clone and Build One Cloud
```bash
cd /var/www
sudo git clone https://github.com/your-username/onecloud.git
cd onecloud
sudo chown -R $USER:$USER /var/www/onecloud

# Install and build
npm install
cp .env.example .env.local
nano .env.local # Fill in your production environment variables
npm run build
```

#### 3. Start with PM2 Process Manager
```bash
pm2 start npm --name "onecloud" -- start
pm2 save
pm2 startup
```

#### 4. Configure Nginx Reverse Proxy & Large File Uploads
Edit `/etc/nginx/sites-available/onecloud`:

```nginx
server {
    server_name yourdrive.yourdomain.com;

    # Allow large file uploads to stream to Telegram
    client_max_body_size 2048M;
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and configure SSL:
```bash
sudo ln -s /etc/nginx/sites-available/onecloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install free SSL certificate via Certbot
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdrive.yourdomain.com
```

---

### Deploying on Google Cloud Run or Render

Because Next.js compiles into a self-contained standalone server, you can deploy One Cloud as a containerized web service:
- **Google Cloud Run:** Fully managed, scales to zero when idle, supports HTTP/2 and websockets. Set Container Port to `3000`, increase Request Timeout to 300s, and inject your `.env.local` variables via Google Cloud Secret Manager.
- **Render:** Choose **Web Service**, select Docker environment, add environment variables, and configure health check to `/`.

---

## 🔒 Security & Cryptography Model

One Cloud adheres to strict privacy and data isolation standards:

```
┌────────────────────────────────────────────────────────┐
│                   SECURITY POSTURE                     │
├────────────────────────────────────────────────────────┤
│ 1. AES-256-GCM Session Protection                     │
│    • 96-bit Random IV per session token                │
│    • 128-bit Authentication Tag                        │
│    • Key derived from server `SESSION_SECRET` via SHA-256│
│                                                        │
│ 2. Strict User Isolation in Cloud Firestore            │
│    • Scoped exclusively under `/users/{uid}/...`       │
│    • Deny-by-default Firestore Security Rules         │
│                                                        │
│ 3. Zero Raw Byte Retention                             │
│    • No binary files are stored on One Cloud servers   │
│    • Direct stream bridge between browser and Telegram│
│                                                        │
│ 4. Honest Encryption Notice                            │
│    • Transparently disclaims false E2EE marketing      │
│    • Uses Telegram's official MTProto cloud encryption │
└────────────────────────────────────────────────────────┘
```

1. **AES-256-GCM Session Vault:** When a user authorizes their Telegram account, the session string is encrypted using AES-256-GCM before being stored or referenced. Plaintext session tokens are never logged or exposed.
2. **Strict Firestore Multi-Tenant Isolation:** Database security rules restrict each user's read/write permissions to their unique Firebase UID (`request.auth.uid == userId`). No user can inspect or alter another user's folder hierarchy or file metadata.
3. **Zero Binary Retention:** One Cloud servers act strictly as a transport bridge. Once chunks are dispatched to Telegram, no copies are retained on the web server disk.
4. **Honest Security Statement:** One Cloud **does not falsely claim End-to-End Encryption (E2EE)**. Telegram Saved Messages are cloud chats encrypted in transit and at rest by Telegram's MTProto servers, not peer-to-peer Secret Chats. We do not make misleading marketing claims.

---

## ⚡ Telegram Limits & Technical Constraints

When using Telegram as the storage backend, the following official Telegram platform parameters apply:

- **File Size Ceiling:**
  - Standard Telegram accounts: Maximum **2,000 MB (2.0 GB)** per individual file.
  - Telegram Premium accounts: Maximum **4,000 MB (4.0 GB)** per individual file.
- **Flood Wait Protection:**
  - Rapidly uploading dozens of files simultaneously in seconds may trigger Telegram's `FLOOD_WAIT_X` safety rate limit. One Cloud catches these events gracefully and communicates the exact cooldown duration.
- **Account Independence:**
  - One Cloud sends files to your own personal chat (`me` / Saved Messages). If you manually delete a file message inside the native Telegram mobile app, clicking **Sync with Telegram** in One Cloud will detect the missing message and update your drive index.

---

## 📡 API Route Reference

One Cloud provides server-side Next.js route handlers under `/api/telegram/*`:

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/telegram/auth` | `POST` | Handles Telegram auth lifecycle: `sendCode`, `verifyCode`, `initQr`, and `checkQr` (with DC migration & 2FA support). |
| `/api/telegram/upload` | `POST` | Accepts multi-part form data containing the file buffer and uploads it directly to Saved Messages (`me`). |
| `/api/telegram/download/[fileId]` | `GET` | Fetches the binary document message from Telegram Saved Messages and streams it back to the client. |
| `/api/telegram/delete` | `POST` | Revokes and permanently deletes the specified file message ID from Telegram Saved Messages (`me`). |

---

## 📁 Project Directory Structure

```
├── app/
│   ├── api/
│   │   └── telegram/
│   │       ├── auth/route.ts          # QR & Phone authentication handler
│   │       ├── upload/route.ts        # MTProto Saved Messages upload bridge
│   │       ├── download/[fileId]/     # File streaming & download route
│   │       └── delete/route.ts        # Two-way permanent deletion handler
│   ├── app/                           # Authenticated Drive Application
│   │   ├── drive/                     # Root Drive view
│   │   │   └── [folderId]/page.tsx    # Nested folder hierarchy view
│   │   ├── recent/page.tsx            # Chronological recent uploads
│   │   ├── starred/page.tsx           # Starred items filter
│   │   ├── trash/page.tsx             # Trashed files & recovery view
│   │   ├── settings/page.tsx          # Account, Telegram, Themes & Backup
│   │   ├── layout.tsx                 # Protected app layout with Sidebar & Header
│   │   └── page.tsx                   # Dashboard overview & storage analytics
│   ├── login/page.tsx                 # Sign-in page (Google / Email / Guest)
│   ├── signup/page.tsx                # Registration page
│   ├── how-it-works/page.tsx          # Architecture overview page
│   ├── security/page.tsx              # Security & privacy disclosures
│   ├── privacy/page.tsx               # Privacy policy
│   ├── terms/page.tsx                 # Terms of service
│   ├── acceptable-use/page.tsx        # Acceptable use policy
│   ├── layout.tsx                     # Root Next.js layout & Providers
│   └── page.tsx                       # Public landing page
├── components/
│   ├── drive/
│   │   ├── FileList.tsx               # Grid & List view, 3-dot dropdowns
│   │   └── Toolbar.tsx                # View switcher, sorting, type filter
│   ├── layout/
│   │   ├── AppHeader.tsx              # Search bar with auto-suggest & theme toggle
│   │   ├── AppSidebar.tsx             # Google Drive "+ New" button & navigation
│   │   ├── Navbar.tsx                 # Public header
│   │   └── Footer.tsx                 # Public footer
│   └── modals/
│       ├── ConnectTelegramModal.tsx   # QR code & Phone pairing dialog
│       ├── FilePreviewModal.tsx       # Media, video, PDF & code lightbox
│       ├── MoveFileModal.tsx          # Move to folder modal
│       ├── NewFolderModal.tsx         # Create subfolder modal
│       ├── RenameModal.tsx            # Metadata rename dialog
│       └── UploadQueueDrawer.tsx      # Multi-task upload queue drawer
├── lib/
│   ├── drive/
│   │   ├── drive-context.tsx          # Drive state management & Firestore syncing
│   │   ├── storage-calc.ts            # Accurate storage metrics & byte formatting
│   │   └── types.ts                   # Core Drive file and folder data types
│   ├── firebase/
│   │   ├── auth-context.tsx           # Firebase user authentication context
│   │   └── client.ts                  # Firebase app, auth & Firestore initialization
│   ├── telegram/
│   │   ├── crypto.ts                  # AES-256-GCM session token encryption
│   │   ├── service.ts                 # GramJS MTProto service bridge
│   │   └── types.ts                   # Telegram auth & upload response types
│   └── theme-context.tsx              # Light / Dark / System theme provider
├── firestore.rules                    # Production Firestore security rules
├── firebase-blueprint.json            # Firestore schema definition
├── next.config.ts                     # Standalone build & image optimization config
└── package.json                       # Dependencies & build scripts
```

---

## ❓ Troubleshooting & FAQ

### 1. `FLOOD_WAIT_X` Error during Login or Upload
**Cause:** Telegram's security system limits rapid authentication attempts or excessive consecutive uploads.  
**Solution:** Wait the number of seconds specified in the error message (e.g., `FLOOD_WAIT_60` means wait 60 seconds). For production deployments, avoid requesting SMS codes repeatedly within short intervals.

### 2. "This domain is not authorized in Firebase"
**Cause:** You deployed the app to a custom domain or Vercel URL that is not listed in your Firebase project's allowed origins.  
**Solution:** Open the **Firebase Console > Authentication > Settings > Authorized domains** and add your deployment domain (e.g. `your-app.vercel.app` or `drive.yourdomain.com`).

### 3. QR Code scan says "Two-Step Verification Required"
**Cause:** Your Telegram account has a 2-Step Verification Cloud Password enabled.  
**Solution:** Enter your Telegram Cloud Password when prompted. One Cloud will automatically compute the cryptographic SRP challenge and finalize your login session.

### 4. Upload fails on large files when hosted on Vercel
**Cause:** Vercel serverless functions have a maximum payload size limit of 4.5 MB.  
**Solution:** Self-host One Cloud on a **Linux VPS** with Nginx (`client_max_body_size 2048M;`) or deploy using **Docker** on Render / Google Cloud Run.

### 5. Are my files accessible if One Cloud is offline?
**Yes.** All uploaded files reside directly in your personal Telegram **Saved Messages** (`me`) chat. You can access, view, or download them at any time directly through the official Telegram desktop or mobile apps.

---

## 📜 Disclaimer & Terms

- **Independent Project:** One Cloud is an independent, open-source project and is **not affiliated with, sponsored by, or endorsed by Telegram FZ-LLC or Google LLC**.
- **Compliance:** Users are responsible for adhering to [Telegram's Terms of Service](https://telegram.org/tos) and applicable local regulations. One Cloud must not be used to distribute malicious software or copyright-infringing material.

---

**One Cloud — Your Files. Your Cloud. Your Control.**  
Crafted with ❤️ for freedom, privacy, and seamless personal cloud storage.
