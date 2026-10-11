# One Cloud ☁️

**Your Files. Your Cloud. Your Control.**

One Cloud is a Telegram-powered personal cloud drive designed to make file storage and management simple, accessible, and convenient. It aims to provide a familiar, Google Drive-inspired web interface where users can upload, organize, search, preview, download, and manage their files using their own Telegram account as the underlying file storage.

Instead of building an entirely separate file-storage infrastructure, One Cloud is designed to use Telegram for storing file content, Firebase Authentication for website user accounts, and Cloud Firestore for file metadata and organizational information.

## ✨ What Is One Cloud?

One Cloud brings the convenience of a traditional cloud drive to your Telegram account. Its goal is to transform file management into a more organized experience through a modern web interface, so users do not have to rely exclusively on Telegram's chat interface to find and manage their stored files.

The project focuses on personal file management rather than team collaboration or shared business workspaces.

## 🚀 Planned Features

- **Telegram-Powered Storage:** Use your own Telegram account as the underlying file storage through a supported Telegram client integration.
- **File Management:** Upload, download, rename, organize, move, star, and manage files.
- **Folder Organization:** Create nested folders and navigate your files using a familiar folder-based structure.
- **Smart File Search:** Find files using available metadata, including filename, file type, folder, and upload or modification date.
- **File Previews:** Preview supported images, PDFs, audio, and video files where technically possible.
- **Recent & Starred:** Quickly access recently uploaded files and your favorite items.
- **Trash & Restore:** Move items to Trash, restore them, and manage permanent deletion with clear confirmations.
- **Upload Manager:** Track upload tasks, monitor real progress where supported, retry failures, and view upload status.
- **Personal Dashboard:** View tracked files, folders, recent activity, upload status, and an informative storage summary.
- **Secure User Accounts:** Sign up, sign in, manage your account, and keep your website data isolated from other users.
- **Responsive Interface:** Access the drive through a modern interface designed for desktop, tablet, and mobile devices.
- **Personalization:** Configure appearance, file sorting, default views, and other supported preferences.

## ⚙️ How It Is Designed to Work

**1. Create an account**

Users create an account on One Cloud using Firebase Authentication.

**2. Connect Telegram**

Users connect their own Telegram account through a supported Telegram client integration. TDLib is the preferred option, subject to technical verification and compatibility with the intended deployment.

**3. Upload and organize files**

Files are intended to be uploaded to a configured Telegram destination. One Cloud stores the associated file metadata and folder organization in Cloud Firestore.

**4. Access files through the web interface**

Users can browse their folders, search available file metadata, preview supported files, download items, and manage their Drive through the One Cloud interface.

## 🛠️ Technology Stack

- **Next.js** — Web application framework
- **TypeScript** — Type-safe application development
- **Firebase Authentication** — Website authentication and account management
- **Cloud Firestore** — File metadata, folder structures, preferences, and related application data
- **Telegram API / TDLib** — Telegram account integration and file operations, subject to implementation and API compatibility

## 🔐 Security & Privacy

One Cloud is designed with user isolation, secure authentication, and responsible session management in mind.

The intended architecture separates website authentication from Telegram account authorization. User-specific metadata is stored in Firestore, while Telegram session material must be handled using an appropriately secured storage and session-management design.

The application must enforce ownership checks and must never expose private session credentials, authentication codes, passwords, or server secrets.

Security and encryption claims depend on the actual implementation. One Cloud does not automatically provide end-to-end encryption simply because it uses Telegram or Firebase.

## 📦 Storage Transparency

One Cloud distinguishes between the files tracked by the application and the total storage usage of a Telegram account.

Its storage summary is intended to calculate usage from the file records tracked in the user's Drive. It does not imply that One Cloud provides a separate storage quota or guarantees unlimited storage.

## 🎯 Project Goal

The goal of One Cloud is to make Telegram-based file storage feel more like a dedicated cloud drive: organized, searchable, accessible, and easier to manage through a purpose-built web application.

The project is being developed around a practical MVP, with an emphasis on usability, reliability, privacy, and transparent handling of files and account sessions.

---

**One Cloud — Your Files. Your Cloud. Your Control.**
