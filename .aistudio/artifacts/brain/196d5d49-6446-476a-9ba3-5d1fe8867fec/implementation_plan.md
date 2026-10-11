# One Cloud — সম্পূর্ণ কারিগরি বাস্তবায়ন পরিকল্পনা (Implementation Plan)

One Cloud হলো একটি আধুনিক পার্সোনাল ক্লাউড ড্রাইভ ওয়েব অ্যাপ্লিকেশন, যা ব্যবহারকারীদের নিজস্ব টেলিগ্রাম অ্যাকাউন্টের **Saved Messages**-কে নির্ভরযোগ্য ফাইল স্টোরেজ হিসেবে ব্যবহার করে Google Drive-এর মতো ফাইল ম্যানেজমেন্টের সুবিধা প্রদান করে।

---

## User Review & Critical Decisions

> [!IMPORTANT]
> ব্যবহারকারীর সাথে আলোচনা এবং কারিগরি গবেষণার ভিত্তিতে নিম্নোক্ত মূল সিদ্ধান্তগুলো চূড়ান্ত করা হয়েছে:

- **টেলিগ্রাম ক্লায়েন্ট আর্কিটেকচার (Confirmed)**: নেটিভ C++ TDLib বাইনারির জটিলতা এড়িয়ে স্থিতিশীল **সার্ভার-সাইড পিওর MTProto ব্রিজ (`telegram` / GramJS)** এবং সাথে ফুল ফিচার্ড **স্যান্ডবক্স ডেমো মোড**।
- **স্টোরেজ গন্তব্য (Confirmed)**: প্রতিটি ব্যবহারকারীর নিজস্ব টেলিগ্রাম অ্যাকাউন্টের **Saved Messages** চ্যাট (`chat_id = "me"`), যাতে ফাইল সম্পূর্ণ নিজস্ব নিয়ন্ত্রণে থাকে।
- **সেশন সিকিউরিটি (Confirmed)**: টেলিগ্রাম অথেনটিকেশন সেশন কখনোই ব্রাউজার বা প্লেইনটেক্সটে থাকবে না; সার্ভার-সাইডে AES-256-GCM এনক্রিপশনের মাধ্যমে সুরক্ষিত থাকবে।
- **সৎ স্টোরেজ অ্যাকাউন্টিং (Enforced by PRD)**: কোনো মনগড়া কোটা বা ভুয়া আনলিমিটেড দাবি নয়; ড্যাশবোর্ডে থাকবে **"Storage Used in Your Drive"**, যা ফায়ারস্টোরে ইনডেক্স করা ব্যবহারকারীর সক্রিয় ফাইলগুলোর প্রকৃত বাইটের যোগফল।

---

## ১. Overview & Core Concept

- **মূল বৈশিষ্ট্য**: ফোল্ডার হায়ারার্কি, নেস্টেড ব্রেডক্রাম্বস, ড্র্যাগ-অ্যান্ড-ড্রপ আপলোড ম্যানেজার (প্রোগ্রেস বারসহ), ইমেজ/ভিডিও/অডিও/পিডিএফ মিডিয়া প্রিভিউ, মেটাডাটা সার্চ, স্টার এবং নিরাপদ ট্র্যাশ ও পার্মানেন্ট ডিলিট।
- **প্রযুক্তিগত বিভাজন**: 
  - **বাইট স্টোরেজ:** টেলিগ্রাম ক্লাউড (Saved Messages)।
  - **মেটাডাটা ও ইউজার আইসোলেশন:** Cloud Firestore (`users/{uid}` সাব-কালেকশন)।
  - **ওয়েবসাইট আইডেন্টিটি:** Firebase Authentication।

---

## ২. User Experience & Visual Design

- **ডিজাইন ফিলোসফি**: ডোমেইন-নেটিভ SaaS ড্যাশবোর্ড ও ক্লাউড ওয়ার্কস্টেশন লেআউট।
- **কালার প্যালেট (60-30-10 নীতি)**:
  - ক্যানভাস (60%): পরিষ্কার সাদা (`#FFFFFF`) লাইট মোডে এবং গভীর স্লেট ডার্ক মোড (`#0B0F17`)।
  - স্ট্রাকচারাল সারফেস (30%): সাবলীল বর্ডার (`1px border-slate-200 dark:border-slate-800`) ও হালকা কার্ড ব্যাকগ্রাউন্ড।
  - অ্যাকসেন্ট (10%): বিশ্বস্ত আকাশী-নীল (`#0284C7` / `#0EA5E9`) ফোকাস ও অ্যাক্টিভ বাটনগুলোর জন্য।
- **Zero-Pill ও টাইপোগ্রাফি শৃঙ্খলা**: ফাইলের সাইজ, তারিখ এবং এক্সটেনশন কোনো রঙিন ক্যাপসুল ব্যাজে আটকানো থাকবে না; পরিষ্কার টেক্সট এবং `·` সেপারেটর দিয়ে বিন্যস্ত হবে। সাইজ ও ডেটায় `font-mono tabular-nums` নিশ্চিত করা হবে।
- **ভাষার নীতি**: ইউজার-ফেসিং সমস্ত পেজ, বাটন, নোটিফিকেশন ও এরর মেসেজ সম্পূর্ণ প্রাতিষ্ঠানিক **English**-এ থাকবে।

---

## ৩. Technical Architecture & System Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Frontend (Next.js 15 + React 19)                         │
│                                                                                        │
│   ┌──────────────────────────┐  ┌──────────────────────────┐  ┌─────────────────────┐  │
│   │   Marketing & Policy     │  │     Drive Workstation    │  │   File Operations   │  │
│   │   - Landing Page (/)     │  │     - /app/drive (Tree)  │  │   - Upload Manager  │  │
│   │   - /how-it-works        │  │     - /app/recent        │  │   - Stream Preview  │  │
│   │   - /security & /help    │  │     - /app/starred       │  │   - Download Action │  │
│   │   - /privacy & /terms    │  │     - /app/trash         │  │   - Search Dialog   │  │
│   └─────────────┬────────────┘  └─────────────┬────────────┘  └──────────┬──────────┘  │
└─────────────────┼─────────────────────────────┼──────────────────────────┼─────────────┘
                  │                             │                          │
       (Firebase Auth State)          (Metadata Queries)        (File Payload / Stream)
                  │                             │                          │
                  ▼                             ▼                          ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────────────────────┐
│     Firebase Authentication     │   │         Next.js Server API Layer (/api/*)        │
│                                 │   │                                                  │
│  • Google Popup Sign-In         │   │  • /api/telegram/connect (Auth & 2FA Flow)       │
│  • Email/Password Auth          │   │  • /api/telegram/upload (Chunked MTProto Upload) │
│  • Verified User ID Tokens      │   │  • /api/telegram/download (Stream Bridge)        │
│                                 │   │  • /api/telegram/delete (Saved Messages Purge)   │
│                                 │   │  • /api/telegram/sync (External Reconciliation)  │
│                                 │   │  • AES-256-GCM Session Encryptor                 │
└────────────────┬────────────────┘   └────────────────────────┬─────────────────────────┘
                 │                                             │
                 │ (Scoped Rules Check)                        │ (MTProto Protocol)
                 ▼                                             ▼
┌─────────────────────────────────┐           ┌──────────────────────────────────────────┐
│     Cloud Firestore Database    │           │          Telegram Cloud Servers          │
│                                 │           │                                          │
│  • users/{uid} (Profile & Sync) │           │  • User's Personal "Saved Messages" Chat │
│  • users/{uid}/folders (Tree)   │           │  • Encrypted MTProto Transport Layer     │
│  • users/{uid}/files (Metadata) │           │  • Raw Byte Storage for Uploaded Media   │
│  • users/{uid}/uploadTasks      │           │                                          │
└─────────────────────────────────┘           └──────────────────────────────────────────┘
```

---

## ৪. Firestore Data Model & Schema

- **`users/{uid}`**: ইউজার প্রোফাইল, টেলিগ্রাম কানেকশন স্ট্যাটাস (`connected`, `disconnected`, `authorizing`), এবং গাণিতিক সামারি (`trackedBytes`, `trackedFileCount`, `folderCount`)।
- **`users/{uid}/folders/{folderId}`**: `name`, `parentFolderId` (রুট হলে null), `isStarred`, `status` (`active` | `trashed`), টাইমস্ট্যাম্পস।
- **`users/{uid}/files/{fileId}`**: `name`, `mimeType`, `extension`, `fileSizeBytes`, `parentFolderId`, `isStarred`, `status` (`active` | `trashed` | `deleted`), `telegramMessageId`, `telegramChatId`, `uploadedAt`, `updatedAt`।
- **`users/{uid}/uploadTasks/{taskId}`**: আপলোড কিউ, প্রোগ্রেস পার্সেন্ট (0-100), রিট্রাই স্টেট।

---

## ৫. Phased Implementation Roadmap

- **Milestone 0: Core Architecture & Telegram PoC**  
  টেলিগ্রাম MTProto মডিউল, স্যান্ডবক্স প্রভাইডার, এবং টেস্ট আপলোড-ডাউনলোড-ডিলিট ভ্যালিডেশন।
- **Milestone 1: Public Marketing & Shell**  
  ল্যান্ডিং পেজ (`/`), How It Works, Security, Help & FAQ, Terms, Privacy Policy (ইংরেজি UI)।
- **Milestone 2: Firebase Auth & Security Rules**  
  ফায়ারবেস ক্লায়েন্ট ও অ্যাডমিন SDK ইনিশিয়ালাইজেশন, অথ পেজ, এবং কঠোর ABAC ফায়ারস্টোর সিকিউরিটি রুলস।
- **Milestone 3: Telegram Connection Flow**  
  টেলিগ্রাম কানেক্ট মোডাল, ফোন কোড ভেরিফিকেশন, ২এফএ হ্যান্ডলিং, স্যান্ডবক্স টগল এবং সেশন এনক্রিপশন।
- **Milestone 4: Core File Operations & My Drive**  
  ফোল্ডার হায়ারার্কি, ব্রেডক্রাম্বস, আপলোড ম্যানেজার (প্রোগ্রেস ট্র্যাকারসহ), রিনেম, মুভ, ডাউনলোড এবং স্টার।
- **Milestone 5: Dashboard, Search, Recent, Starred & Trash**  
  স্টোরেজ সামারি কার্ড, ইনস্ট্যান্ট মেটাডাটা সার্চ, মিডিয়া প্রিভিউ মোডাল, ট্র্যাশ রিস্টোর এবং পার্মানেন্ট ডিলিট।
- **Milestone 6: Verification, Testing & Hardening**  
  `compile_applet` বিল্ড ভেরিফিকেশন, এক্সেসিবিলিটি, এরর রিকভারি এবং রেসপন্সিভ টেস্ট।
