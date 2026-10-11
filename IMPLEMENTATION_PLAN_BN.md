# One Cloud — সম্পূর্ণ কারিগরি বাস্তবায়ন পরিকল্পনা (Implementation Plan)

> **প্রজেক্টের নাম:** One Cloud  
> **উদ্দেশ্য:** টেলিগ্রামের Saved Messages-কে পার্সোনাল ক্লাউড স্টোরেজ হিসেবে ব্যবহার করে Google Drive-এর মতো আধুনিক, নিরাপদ এবং স্বচ্ছ ওয়েব ড্রাইভ অ্যাপ্লিকেশন তৈরি করা।  
> **নথি সংস্করণ:** 1.0.0 (Production Blueprint)  
> **মূল ভাষা:** বাংলা (কোড ও টেকনিক্যাল টার্মিনোলজি আন্তর্জাতিক মান অনুযায়ী ইংরেজিতে)  
> **স্ট্যাটাস:** আর্কিটেকচারাল প্ল্যানিং ও টেকনিক্যাল স্পেক (বাস্তবায়ন অনুমোদনের জন্য প্রস্তুত)

---

## ১. Project Overview (প্রজেক্টের পরিচিতি)

### ১.১ প্রজেক্ট কনসেপ্ট ও ভিশন
**One Cloud** হলো একটি পার্সোনাল ক্লাউড-ড্রাইভ ওয়েব অ্যাপ্লিকেশন, যা ব্যবহারকারীদের নিজস্ব টেলিগ্রাম অ্যাকাউন্টের **Saved Messages**-কে নির্ভরযোগ্য ফাইল স্টোরেজ হিসেবে সংযুক্ত করে। ব্যবহারকারী একটি পরিচিত Google Drive-এর মতো ড্যাশবোর্ডে ফাইল আপলোড, ফোল্ডার ভিত্তিক বিন্যাস, সার্চ, মাল্টিমিডিয়া প্রিভিউ, ডাউনলোড, স্টার, ট্র্যাশ এবং রিনেম করতে পারবেন।

- **ফাইল স্টোরেজ (Byte Storage):** ব্যবহারকারীর নিজস্ব টেলিগ্রাম অ্যাকাউন্ট (Saved Messages Chat)। কোনো ফাইল বাইট ওয়েবসাইটের ডাটাবেজে জমা হয় না।
- **ইউজার আইডেন্টিটি ও মেটাডাটা (Identity & Indexing):** Firebase Authentication এবং Cloud Firestore। ফোল্ডার স্ট্রাকচার, ফাইলের নাম, সাইজ, ট্যাগ ও অ্যাক্টিভিটি লগ এখানে সুরক্ষিত থাকবে।
- **ওয়েব প্ল্যাটফর্ম ও ব্র্রিজ (Frontend & Backend API):** Next.js 15 (App Router) + TypeScript + Tailwind CSS।
- **টেলিগ্রাম ইন্টারফেস:** MTProto / TDLib ক্লায়েন্ট প্রটোকল ব্যবহার করে ব্যবহারকারীর অ্যাকাউন্ট ইন্টারঅ্যাকশন।

### ১.২ মূল প্রতিজ্ঞা (Product Promise)
- **ট্যাগলাইন:** *Your Files. Your Cloud. Your Control.*
- **স্বচ্ছ স্টোরেজ নীতি (Truthful Storage):** কোনো মনগড়া "আনলিমিটেড স্টোরেজ" বা ভুয়া "15 GB কোটা বার" দেখানো হবে না। ড্যাশবোর্ডে প্রদর্শিত হবে **"Storage Used in Your Drive"**, যা ফায়ারস্টোরে ইনডেক্স করা ব্যবহারকারীর ফাইলগুলোর প্রকৃত বাইটের গাণিতিক যোগফল।
- **নিরাপত্তা ও প্রাইভেসি:** এন্ড-টু-এন্ড এনক্রিপশন (E2EE) দাবি করা হবে না যতক্ষণ না ক্লায়েন্ট-সাইডে সম্পূর্ণ ক্রিপ্টোগ্রাফিক পাইপলাইন কার্যকর হয়। সেশন সিক্রেটস কঠোরভাবে সার্ভার-সাইডে AES-256-GCM এনক্রিপশনে সুরক্ষিত থাকবে।

---

## ২. Repository Audit (বিদ্যমান রিপোজিটরি পরীক্ষা)

| বিষয় / ফাইল | বর্তমান অবস্থা | বিশদ পর্যবেক্ষণ |
| :--- | :--- | :--- |
| **Framework & Engine** | Next.js 15.4.9 (App Router) + React 19.2.1 | `package.json` এবং `next.config.ts` তৈরি আছে। আউটপুট মোড `standalone` কনফিগার করা। |
| **Styling & Icons** | Tailwind CSS v4 + PostCSS 8 + `lucide-react` | `@tailwindcss/postcss` 4.1.11 এবং `lucide-react` 0.553.0 ইনস্টল করা। |
| **Animations** | `motion` 12.23.24 | ফ্রেমওয়ার্কের মোশন লাইব্রেরি কনফিগার করা আছে। |
| **UI Routes & Pages** | অনুপস্থিত (`app/page.tsx` নেই) | শুধুমাত্র `app/layout.tsx` এবং `app/globals.css` আছে। কোনো পেজ, ড্রাইভ ইন্টারফেস বা কম্পোনেন্ট এখনও তৈরি করা হয়নি। |
| **Firebase Configuration** | আংশিক / স্ক্রিপ্ট টুলস মাত্র | `devDependencies`-এ `firebase-tools` 15.0.0 আছে, কিন্তু ক্লায়েন্ট SDK (`firebase`) বা `firebase-admin` এখনও ইনস্টল করা হয়নি। কোনো `firestore.rules` বা config ফাইল নেই। |
| **Telegram / TDLib Integration** | সম্পূর্ণ অনুপস্থিত | টেলিগ্রাম ক্লায়েন্ট, সেশন হ্যান্ডলার বা MTProto কানেক্টর কোড এখনও নেই। |
| **Environment Variables** | `.env.example` বেসিক | শুধুমাত্র `GEMINI_API_KEY` এবং `APP_URL` প্লেসহোল্ডার রয়েছে। ফায়ারবেস বা টেলিগ্রামের কোনো এনভায়রনমেন্ট ভেরিয়েবল নেই। |
| **ডকুমেন্টেশন** | `PRD.md` এবং `PRD_Telegram_Powered_Cloud_Drive_BN.md` | বিস্তারিত প্রোডাক্ট রিকোয়ারমেন্টস ডকুমেন্টস উপস্থিত। |

**সারসংক্ষেপ:** রিপোজিটরিটি একটি পরিষ্কার ও আধুনিক Next.js 15 বুনিয়াদে রয়েছে। কোনো পূর্ববর্তী কোড নষ্ট বা রিরাইট করার ঝুঁকি নেই; সবকিছু পরিকল্পিতভাবে গ্রাউন্ড আপ থেকে আর্কিটেকচার অনুযায়ী তৈরি করা সম্ভব।

---

## ৩. PRD Requirement Mapping (রিকোয়ারমেন্ট ম্যাপিং)

| PRD রিকোয়ারমেন্ট (Section) | টেকনিক্যাল সমাধান | বাস্তবায়ন স্ট্যাটাস |
| :--- | :--- | :--- |
| **Web Auth (2.1)** | Firebase Authentication (Google Sign-In ও Email Auth) | পরিকল্পিত (Milestone 2) |
| **Telegram Connection (2.1, 4.3)** | User API ID/Hash ইনপুট + স্যান্ডবক্স ডেমো মোড + সার্ভার-সাইড MTProto অথেনটিকেশন | পরিকল্পিত (Milestone 0, 3) |
| **Dashboard & Storage (3.1, 7.5)** | সত্যনিষ্ঠ "Storage Used in Your Drive" ক্যালকুলেশন; সক্রিয় ফাইলের সাইজের নির্ভুল হিসাব | পরিকল্পিত (Milestone 5) |
| **My Drive & Nested Folders (2.1, 7.6)** | ফায়ারস্টোর ভিত্তিক হায়ারার্কি (`parentFolderId`), ব্রেডক্রাম্বস, গ্রিড/লিস্ট ভিউ | পরিকল্পিত (Milestone 4) |
| **Upload Manager (4.4)** | চাঙ্কড আপলোড পাইপলাইন, আপলোড টাস্ক ট্র্যাকিং, রিট্রাই ও ক্যানসেল সাপোর্ট | পরিকল্পিত (Milestone 4) |
| **File Operations (2.1, 3.4)** | ডাউনলোড স্ট্রিমিং, মেটাডাটা রিনেম, ফোল্ডার মুভ, স্টার/আনস্টার | পরিকল্পিত (Milestone 4) |
| **Trash Semantics (3.3)** | ট্র্যাশে পাঠালে ফায়ারস্টোরে `status: 'trashed'`, টেলিগ্রাম বাইট অক্ষত রাখা; পার্মানেন্ট ডিলিটে টেলিগ্রাম থেকেও মোছা | পরিকল্পিত (Milestone 5) |
| **Previews (2.1)** | ইমেজ, অডিও, ভিডিও এবং পিডিএফ-এর নিরাপদ স্ট্রিমড প্রিভিউ | পরিকল্পিত (Milestone 5) |
| **User Isolation (4.1, 5.1)** | `users/{uid}` সাব-কালেকশন স্ট্রাকচার এবং কঠোর ফায়ারস্টোর রুলস | পরিকল্পিত (Milestone 2) |
| **Legal & Help (2.1, 7.2)** | How It Works, Security, Privacy, Terms, FAQ পেজসমূহ (সম্পূর্ণ ইংরেজি UI) | পরিকল্পিত (Milestone 1) |

---

## ৪. Architecture Decisions (কারিগরি সিদ্ধান্ত ও বিশ্লেষণ)

### ৪.১ টেলিগ্রাম ইন্টিগ্রেশন অ্যাপ্রোচ: TDLib vs Pure MTProto Client

টেলিগ্রাম ইউজার অ্যাকাউন্টের সঙ্গে কাজ করার দুটি প্রধান প্রযুক্তিগত উপায় রয়েছে:

| বৈশিষ্ট্য | অ্যাপ্রোচ ক: TDLib (Native C++ / WebAssembly) | অ্যাপ্রোচ খ: সার্ভার-সাইড পিওর MTProto (`telegram` / GramJS) |
| :--- | :--- | :--- |
| **আর্কিটেকচার** | C++ নেটিভ বাইনারি (`libtdjson.so`) অথবা ব্রাউজার Wasm (`tdweb`) | বিশুদ্ধ TypeScript/Node.js MTProto ক্লায়েন্ট লাইব্রেরি |
| **হোস্টিং বাস্তবতা** | Serverless / Cloud Run-এ 50MB+ নেটিভ বাইনারি চালানো জটিল, Wasm-এ ব্রাউজারে মেমোরি লিমিট ও মাল্টি-ট্যাব ক্র্যাশ ঝুঁকি থাকে। | যেকোনো Node.js রানটাইমে (Cloud Run, VPS, Docker, Next.js Server API) স্বাচ্ছন্দ্যে চলে। |
| **সেশন স্টোরেজ** | লোকাল ডিস্কে SQLite ফাইল প্রয়োজন (`td.binlog`), যা সার্ভারলেস বা এফিমোরাল কন্টেইনারে হারিয়ে যেতে পারে। | ক্রিপ্টোগ্রাফিক সেশন স্ট্রিং (`StringSession`) সমর্থন করে, যা AES-256 দিয়ে এনক্রিপ্ট করে সুরক্ষিত রাখা যায়। |
| **Saved Messages অপারেশন** | সম্পূর্ণ সমর্থিত | সম্পূর্ণ সমর্থিত (`InputPeerSelf`) |
| **রক্ষণাবেক্ষণ ঝুঁকি** | জটিল C++ বাইন্ডিং, OS নির্ভর কম্পাইলেশন ব্যর্থতার উচ্চ ঝুঁকি | স্ট্যান্ডার্ড npm প্যাকেজ, টাইপ-সেফ, সক্রিয়ভাবে রক্ষণাবেক্ষণকৃত |

> **গৃহীত সিদ্ধান্ত (Recommended Approach):**  
> সার্ভার-সাইডে পিওর MTProto আর্কিটেকচার (`telegram` / GramJS প্যাকেজ) নির্বাচন করা হয়েছে। এটি টেলিগ্রামের অফিশিয়াল ক্লায়েন্ট প্রটোকলের পূর্ণ বাস্তবায়ন যা নেটিভ C++ বাইনারির ঝামেলা ছাড়াই ব্যবহারকারীর নিজস্ব টেলিগ্রাম অ্যাকাউন্টে নিরাপদে লগইন, Saved Messages-এ ফাইল আপলোড, চাঙ্কড ডাউনলোড এবং ডিলিট নিশ্চিত করে। সাথে একটি **ইন্টারেক্টিভ স্যান্ডবক্স / ডেমো মোড** যুক্ত থাকবে যাতে কোনো থার্ড-পার্টি কী ছাড়াই সিস্টেমের সমস্ত কার্যকারিতা তাত্ক্ষণিকভাবে পরীক্ষা করা যায়।

### ৪.২ হোস্টিং ও সেশন পারসিস্টেন্স সিদ্ধান্ত
- **Next.js Full-Stack on Container / Cloud Run:** বর্তমান AI Studio ডেভেলপমেন্ট পরিবেশ একটি লিনাক্স ক্লাউড রান কন্টেইনারে চলে (Port 3000)। এখানে ফুল-স্ট্যাক Next.js API রুট ব্যবহার করে সরাসরি টেলিগ্রাম ক্লায়েন্ট ব্রিজ পরিচালনা করা সম্ভব।
- **সেশন সিকিউরিটি:** ব্যবহারকারীর অথেনটিকেশন সেশন কখনোই ব্রাউজারে বা প্লেইনটেক্সট ফায়ারস্টোরে থাকবে না। সার্ভার-সাইড এনভায়রনমেন্টে `SESSION_SECRET` দ্বারা AES-256-GCM এনক্রিপশন প্রয়োগ করা হবে।

---

## ৫. Architecture Diagram (সিস্টেম আর্কিটেকচার ডায়াগ্রাম)

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

### ডায়াগ্রাম কম্পোনেন্টসমূহের ভূমিকা:
1. **Frontend Workstation:** ব্যবহারকারী ফ্রেন্ডলি Google Drive স্টাইল ইন্টারফেস; ফাইল তালিকা, আপলোড প্রোগ্রেস ও মাল্টিমিডিয়া প্রিভিউ নিয়ন্ত্রণ করে।
2. **Firebase Auth:** ব্যবহারকারীর ওয়েবসাইট আইডেন্টিটি নিশ্চিত করে এবং প্রতিটি সার্ভার রিকোয়েস্টে `Bearer <idToken>` পাঠায়।
3. **Cloud Firestore:** শুধুমাত্র ফাইলের নাম, সাইজ, ফোল্ডার আইডি এবং টেলিগ্রামের মেসেজ রেফারেন্স সংরক্ষণ করে।
4. **Next.js Server API:** একটি নিরাপদ গেটওয়ে হিসেবে কাজ করে যা টেলিগ্রামের MTProto ক্লায়েন্টের সাথে যোগাযোগ করে এবং ব্রাউজারকে ফাইল স্ট্রিম পরিবেশন করে।
5. **Telegram Saved Messages:** প্রকৃত ফাইলের বাইটসমূহ ব্যবহারকারীর নিজস্ব অ্যাকাউন্টে সুরক্ষিতভাবে ধারণ করে।

---

## ৬. Technology Stack (প্রযুক্তি ও প্যাকেজ নির্বাচন)

| স্তর / ফিচার | নির্বাচিত প্যাকেজ / টুল | ভার্সন | নির্বাচনের যৌক্তিকতা |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 15.4.9 | আধুনিক পারফরম্যান্স, সার্ভার কম্পোনেন্টস ও সিকিউর API রুটস। |
| **Runtime / Lang** | Node.js + TypeScript | 5.9.3 | কম্পাইল-টাইম টাইপ সেফটি এবং ডাটা মডেল অখণ্ডতা। |
| **Styling** | Tailwind CSS v4 + Motion | 4.1.11 / 12.23 | ডোমেইন-নেটিভ SaaS ড্যাশবোর্ড ডিজাইন এবং স্মুথ মাইক্রো-ইন্টারঅ্যাকশন। |
| **Icons** | `lucide-react` | 0.553.0 | PRD এবং সিস্টেম স্পেক অনুযায়ী ড্রাইভ আইকন সেটের জন্য আদর্শ। |
| **Identity & DB** | `firebase` | ^11.x / 12.x | ক্লায়েন্ট-সাইড রিয়েলটাইম স্ন্যাপশট ও অথেনটিকেশন। |
| **Admin DB Auth** | `firebase-admin` | ^13.x | সার্ভার API-তে ক্রিপ্টোগ্রাফিক আইডি টোকেন ভ্যালিডেশন ও ওনারশিপ এনফোর্সমেন্ট। |
| **Telegram MTProto** | `telegram` (GramJS) | ^2.22.x | পিওর জাভাস্ক্রিপ্ট MTProto বাস্তবায়ন; নেটিভ C++ বাইনারির ঝামেলাহীন। |
| **Validation** | `zod` | ^3.24.x | এপিআই পেলোড এবং ফর্ম ইনপুট স্ট্রাকচার্ড ভ্যালিডেশন। |
| **Crypto Utility** | Node.js `crypto` (Built-in) | Core | AES-256-GCM অ্যালগরিদমে সেশন স্ট্রিং এনক্রিপশন ও ডিক্রিপশন। |

---

## ৭. Data Model (ফায়ারস্টোর ডাটা স্কিমা)

কঠোর ইউজার আইসোলেশন বজায় রাখতে সমস্ত ডাটা `users/{uid}` পাথে সাব-কালেকশন হিসেবে সংরক্ষিত হবে:

### ৭.১ `users/{uid}` (ব্যবহারকারীর প্রোফাইল ও সামারি)
```typescript
interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  telegram: {
    connectionStatus: 'not_connected' | 'authorizing' | 'connected' | 'reauth_required';
    connectedAt: Timestamp | null;
    lastSyncedAt: Timestamp | null;
    telegramUserId: string | null;
    telegramUsername: string | null;
    isSandbox: boolean;
  };
  storageSummary: {
    trackedBytes: number;        // শুধুমাত্র সক্রিয় ফাইলের মোট বাইট
    trackedFileCount: number;    // মোট সক্রিয় ফাইল সংখ্যা
    folderCount: number;         // মোট ফোল্ডার সংখ্যা
    lastCalculatedAt: Timestamp;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultView: 'grid' | 'list';
    sortOrder: 'name_asc' | 'date_desc' | 'size_desc';
  };
}
```

### ৭.২ `users/{uid}/folders/{folderId}` (ফোল্ডার মেটাডাটা)
```typescript
interface FolderDocument {
  id: string;
  name: string;
  normalizedName: string;
  parentFolderId: string | null; // null মানে রুট (My Drive)
  isStarred: boolean;
  status: 'active' | 'trashed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### ৭.৩ `users/{uid}/files/{fileId}` (ফাইল মেটাডাটা)
```typescript
interface FileDocument {
  id: string;
  name: string;
  normalizedName: string;
  mimeType: string;
  extension: string;
  fileSizeBytes: number;          // সঠিক পূর্ণসংখ্যা বাইট
  parentFolderId: string | null;
  isStarred: boolean;
  status: 'active' | 'trashed' | 'deleted';
  telegramChatId: string;        // "me" (Saved Messages)
  telegramMessageId: number;     // টেলিগ্রাম মেসেজ আইডি
  telegramFileId?: string;
  uploadedAt: Timestamp;
  updatedAt: Timestamp;
  trashedAt?: Timestamp | null;
}
```

### ৭.৪ `users/{uid}/uploadTasks/{taskId}` (আপলোড ট্র্যাকার)
```typescript
interface UploadTaskDocument {
  id: string;
  originalName: string;
  fileSizeBytes: number;
  status: 'queued' | 'uploading' | 'uploaded' | 'failed' | 'cancelled';
  progressPercent: number;        // 0 to 100
  errorCode?: string | null;
  idempotencyKey: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## ৮. Route, API ও Service Design

### ৮.১ পাবলিক ও অথ রুটসমূহ
- `/` — মার্কেটিং ল্যান্ডিং পেজ (Hero, Features, How It Works, Security, Transparent Storage FAQ, CTA)।
- `/how-it-works` — আর্কিটেকচারাল ব্যাখ্যা এবং টেলিগ্রামের ভূমিকা।
- `/security` — সৎ ও স্বচ্ছ সিকিউরিটি মডেল (কোনো ভুয়া E2EE দাবি নেই)।
- `/privacy` ও `/terms` ও `/acceptable-use` — নীতিমালা ও ব্যবহারকারী অধিকার।
- `/login` ও `/signup` — ফায়ারবেস অথেনটিকেশন ফর্ম।

### ৮.২ প্রাইভেট ড্রাইভ অ্যাপ্লিকেশন রুটসমূহ
- `/app` — ড্যাশবোর্ড ওভারভিউ (Storage Used, Recent Files, Quick Upload, Connection Status)।
- `/app/drive` — My Drive রুট ফোল্ডার (গ্রিড/লিস্ট, ব্রেডক্রাম্বস, ফোল্ডার ন্যাভিগেশন)।
- `/app/drive/[folderId]` — নেস্টেড ফোল্ডার ভিউ।
- `/app/recent` — সম্প্রতি আপলোড করা ফাইলের তালিকা।
- `/app/starred` — বুকমার্ক/স্টার করা ফাইল ও ফোল্ডার।
- `/app/trash` — ট্র্যাশ ভিউ (Restore এবং Permanent Delete অপশনসহ)।
- `/app/settings` — টেলিগ্রাম ডিসকানেক্ট, থিম প্রেফারেন্স এবং মেটাডাটা এক্সপোর্ট।

### ৮.৩ সার্ভার-সাইড সুরক্ষিত API এন্ডপয়েন্টসমূহ
| মেথড ও রুট | দায়িত্ব ও লজিক | সিকিউরিটি চেক |
| :--- | :--- | :--- |
| `POST /api/telegram/auth/send-code` | ফোন নম্বর গ্রহণ করে টেলিগ্রামে কোড পাঠায় অথবা স্যান্ডবক্স ইনিশিয়ালাইজ করে। | Firebase ID Token |
| `POST /api/telegram/auth/verify-code` | কোড ভ্যালিডেট করে সেশন তৈরি করে এবং AES-256 এনক্রিপ্ট করে সেভ করে। | Firebase ID Token |
| `POST /api/telegram/auth/disconnect` | টেলিগ্রাম সেশন রিভোক করে এবং সার্ভার মেমোরি থেকে মুছে ফেলে। | Firebase ID Token |
| `POST /api/telegram/upload` | মাল্টিপার্ট ফাইল স্ট্রিম করে টেলিগ্রাম Saved Messages-এ পাঠায় এবং মেসেজ আইডি রিটার্ন করে। | Firebase ID Token + সাইজ লিমিট ভ্যালিডেশন |
| `GET /api/telegram/download/[fileId]` | টেলিগ্রাম মেসেজ থেকে চাঙ্ক আকারে ফাইল স্ট্রিম করে রেসপন্সে পাঠায়। | Firebase ID Token + ওনারশিপ যাচাই |
| `POST /api/telegram/delete` | পার্মানেন্ট ডিলিটের ক্ষেত্রে টেলিগ্রামের `deleteMessages` কল করে এবং ফায়ারস্টোর মেটাডাটা মুছে দেয়। | Firebase ID Token + ওনারশিপ যাচাই |

---

## ৯. Security Architecture (নিরাপত্তা ও গোপনীয়তা)

1. **Zero-Trust Token Verification:** ক্লায়েন্ট প্রেরিত কোনো `uid`-কে বিশ্বাস করা হবে না। প্রতিটি প্রটেক্টেড API কলে Firebase Admin SDK দিয়ে `auth.verifyIdToken(token)` প্রয়োগ করা হবে।
2. **সেশন এনক্রিপশন (At-Rest Protection):**  
   টেলিগ্রাম ক্লায়েন্ট সেশন স্ট্রিং সার্ভারে স্টোর করার সময় `AES-256-GCM` এনক্রিপশন প্রয়োগ করা হবে।
   - এনক্রিপশন কি `SESSION_SECRET` এনভায়রনমেন্ট ভেরিয়েবলে থাকবে (সর্বনিম্ন 32 বাইট হেক্স)।
   - প্রতিটি এনক্রিপশনে র্যান্ডম Initial Vector (IV) এবং Auth Tag সংরক্ষণ করা হবে।
3. **কঠোর ফায়ারস্টোর সিকিউরিটি রুলস (ABAC):**
   - ইউজার শুধুমাত্র তার নিজস্ব `request.auth.uid == userId` পাথের ডকুমেন্টে অ্যাক্সেস পাবেন।
   - ফিল্ড-লেভেল ভ্যালিডেশন: ইনপুট সাইজ লিমিট, টাইপ চেক এবং স্টোরেজ সামারি ফিল্ডের সুরক্ষিত হ্যান্ডলিং।
4. **লগ ক্লিনিং ও নো-লিক পলিসি:**  
   কোনো লগ বা এরর রিপোর্টে টেলিগ্রাম অথ কোড, ২এফএ পাসওয়ার্ড, সেশন স্ট্রিং বা ফাইলের কনটেন্ট থাকবে না।

---

## ১০. UI/UX Implementation (ইউজার ইন্টারফেস ও ডিজাইন)

- **ডিজাইন সিস্টেম:** Tailwind CSS v4, ছিমছাম ও প্রফেশনাল SaaS ওয়ার্কস্টেশন লেআউট।
- **কালার স্কিম:**
  - 60% ক্যানভাস: ক্লিন নিউট্রাল ডার্ক/লাইট গ্রাউন্ড (`#FFFFFF` / `#0B0F17`)।
  - 30% স্ট্রাকচার: সাবলীল বর্ডার ও কার্ড ব্যাকগ্রাউন্ড (`1px border-slate-200 dark:border-slate-800`)।
  - 10% অ্যাকসেন্ট: বিশ্বস্ত আকাশী-নীল (`#0284C7` / `#0EA5E9`) ফোকাস ও সিলেকশনের জন্য।
- **Zero-Pill শৃঙ্খলা:** ফাইলের মেটাডাটা (সাইজ, তারিখ) কোনো কৃত্রিম রঙিন পিল বা ব্যাজে আবদ্ধ থাকবে না; পরিষ্কার টেক্সট এবং `·` সেপারেটর ব্যবহৃত হবে।
- **ট্যাবুলার নাম্বারস:** ফাইলের সাইজ ও টাইমস্ট্যাম্পে `tabular-nums font-mono` ব্যবহৃত হবে যাতে কলাম অ্যালাইনমেন্ট নিখুঁত থাকে।
- **ভাষার নিয়ম:** ব্যবহারকারীর দৃশ্যমান সমস্ত UI, বাটন, এরর স্টেট ও নোটিফিকেশন সম্পূর্ণ **English**-এ থাকবে।

---

## ১১. Phased Implementation Roadmap (বাস্তবায়ন রোডম্যাপ)

```
[Milestone 0: PoC & Core MTProto Bridge]
                     │
                     ▼
[Milestone 1: Public Marketing & Shell]
                     │
                     ▼
[Milestone 2: Firebase Auth & Security Rules]
                     │
                     ▼
[Milestone 3: Telegram Connection Flow]
                     │
                     ▼
[Milestone 4: Core Drive & File Upload/Download]
                     │
                     ▼
[Milestone 5: Dashboard, Search, Starred & Trash]
                     │
                     ▼
[Milestone 6: Verification, Testing & Hardening]
```

### Milestone 0: Core Architecture & Telegram PoC
- **উদ্দেশ্য:** টেলিগ্রামের Saved Messages-এ ফাইল আপলোড, ডাউনলোড ও ডিলিটের বাস্তব কার্যকারিতা প্রমাণ করা।
- **টাস্ক:** টেলিগ্রাম MTProto মডিউল এবং স্যান্ডবক্স প্রভাইডার তৈরি করা; টেস্ট আপলোড-ডাউনলোড যাচাই।
- **ফাইলসমূহ:** `lib/telegram/client.ts`, `lib/telegram/crypto.ts`, `app/api/telegram/test-poc/route.ts`।

### Milestone 1: Public Marketing & Layout Shell
- **উদ্দেশ্য:** আধুনিক ল্যান্ডিং পেজ এবং আইনি/সহায়তা পেজ তৈরি।
- **টাস্ক:** হিরো সেকশন, স্বচ্ছ স্টোরেজ ফিচার গ্রিড, নেভবার এবং ফুটার তৈরি।
- **ফাইলসমূহ:** `app/page.tsx`, `app/how-it-works/page.tsx`, `app/security/page.tsx`, `app/help/page.tsx`, `components/layout/Navbar.tsx`।

### Milestone 2: Firebase Auth & Security Rules
- **উদ্দেশ্য:** নির্ভরযোগ্য ইউজার আইডেন্টিটি এবং ফায়ারস্টোর স্কিমা স্থাপন।
- **টাস্ক:** ফায়ারবেস ক্লায়েন্ট ইনিশিয়ালাইজেশন, সাইন-ইন/সাইন-আপ পেজ এবং `firestore.rules` প্রয়োগ।
- **ফাইলসমূহ:** `lib/firebase/client.ts`, `lib/firebase/admin.ts`, `firestore.rules`, `app/login/page.tsx`, `app/signup/page.tsx`।

### Milestone 3: Telegram Account Connection
- **উদ্দেশ্য:** ব্যবহারকারীর নিজস্ব টেলিগ্রাম অ্যাকাউন্ট কানেক্ট ও সেশন সুরক্ষা।
- **টাস্ক:** ফোন নম্বর ইনপুট, কোড ভেরিফিকেশন, ২এফএ মোডাল এবং স্যান্ডবক্স টগল ইন্টিগ্রেশন।
- **ফাইলসমূহ:** `components/telegram/ConnectModal.tsx`, `app/api/telegram/auth/*`।

### Milestone 4: Core File Operations & My Drive
- **উদ্দেশ্য:** গুগল ড্রাইভের মতো ফাইল ও ফোল্ডার পরিচালনা।
- **টাস্ক:** ফোল্ডার ক্রিয়েশন, ব্রেডক্রাম্বস, আপলোড ম্যানেজার (প্রোগ্রেস বারসহ), রিনেম, মুভ, ডাউনলোড এবং স্টার।
- **ফাইলসমূহ:** `app/app/drive/page.tsx`, `components/drive/FileList.tsx`, `components/drive/UploadManager.tsx`, `app/api/telegram/upload/route.ts`।

### Milestone 5: Dashboard, Search, Recent, Starred & Trash
- **উদ্দেশ্য:** স্বচ্ছ স্টোরেজ ড্যাশবোর্ড, ইনস্ট্যান্ট মেটাডাটা সার্চ এবং ট্র্যাশ রিসাইকেল ব্যবস্থা।
- **টাস্ক:** "Storage Used in Your Drive" সামারি কার্ড, ফিল্টারড ভিউজ, ট্র্যাশ রিস্টোর এবং পার্মানেন্ট ডিলিট।
- **ফাইলসমূহ:** `app/app/page.tsx`, `app/app/trash/page.tsx`, `app/app/starred/page.tsx`, `components/drive/PreviewModal.tsx`।

### Milestone 6: Hardening, Verification & QA
- **উদ্দেশ্য:** কম্পাইলেশন চেক, এক্সেসিবিলিটি টেস্ট, রেসপন্সিভ ডিজাইন নিরীক্ষা এবং সিকিউরিটি অডিট।
- **টাস্ক:** `compile_applet` রান করা, সিকিউরিটি রুলস যাচাই এবং এরর রিকভারি নিশ্চিত করা।

---

## ১২. Mandatory Proof of Concept (টেলিগ্রাম পিওসি পরিকল্পনা)

পূর্ণাঙ্গ ইউআই তৈরির পূর্বে টেলিগ্রামের সাথে যোগাযোগের একটি নিয়ন্ত্রিত প্রুফ-অফ-কনসেপ্ট বাস্তবায়ন করা হবে:

1. **কানেক্টিভিটি টেস্ট:** সার্ভার থেকে টেলিগ্রামের ডেটা সেন্টারে পিং ও স্যান্ডবক্স ক্লায়েন্ট আরম্ভ।
2. **অথেনটিকেশন টেস্ট:** টেস্ট ফোন নম্বরে অথ কোড পাঠানো এবং ভেরিফিকেশন স্টেট ডিকোড করা।
3. **Saved Messages আপলোড:** একটি ডামি টেক্সট ফাইল (`test_poc.txt`) ব্যবহারকারীর Saved Messages (`chat_id: 'me'`) এ পাঠানো এবং `message_id` সংগ্রহ।
4. **ডাউনলোড ভ্যালিডেশন:** সংগৃহীত `message_id` থেকে ফাইল বাইট পুনরায় স্ট্রিম করে মূল ফাইলের সাথে হ্যাশ মেলানো।
5. **ডিলিট টেস্ট:** টেলিগ্রামের `deleteMessages` রিকোয়েস্ট পাঠিয়ে ফাইলটি মুছে ফেলা নিশ্চিত করা।

---

## ১৩. Testing ও Quality Assurance (টেস্টিং ও গুণগত মান)

- **ইউনিট টেস্ট:** সেশন এনক্রিপশন/ডিক্রিপশন এবং স্টোরেজ বাইট ফরম্যাটিং ফাংশন।
- **ইন্টিগ্রেশন টেস্ট:** ফায়ারবেস আইডি টোকেন যাচাই ও এপিআই রুট সুরক্ষা।
- **ফায়ারস্টোর সিকিউরিটি টেস্ট:** ইউজার এ যেন ইউজার বি-এর কোনো ফাইল বা ফোল্ডার অ্যাক্সেস করতে না পারে তার রুলস পরীক্ষা।
- **ফল্ট টলারেন্স:** আপলোড চলাকালীন নেটওয়ার্ক ড্রপ হলে রিট্রাই কিউ এবং স্পষ্ট এরর স্টেট প্রদর্শন।

---

## ১৪. Deployment ও Operations (ডিপ্লয়মেন্ট গাইডলাইন)

- **এনভায়রনমেন্ট ভেরিয়েবলস (`.env.example`):**
  ```env
  # Firebase Web Configuration
  NEXT_PUBLIC_FIREBASE_API_KEY=""
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
  NEXT_PUBLIC_FIREBASE_APP_ID=""

  # Server Session Encryption (Min 32 characters hex)
  SESSION_SECRET="e9b28f731a5c4d0e6f8a2b1c3d5e7f9a0b2c4d6e8f1a3c5e7b9d1f3a5c7e9b1d"
  ```
- **বিল্ড ও রান:** `npm run build` কমান্ডে কোনো টাইপস্ক্রিপ্ট বা লিন্ট ত্রুটি ছাড়া ক্লিন বিল্ড নিশ্চিত করা হবে।

---

## ১৫. Risks, Unknowns ও Decisions (ঝুঁকি ও সিদ্ধান্ত)

1. **টেলিগ্রাম রেট লিমিট ও ফ্লাড ওয়েট:**  
   *ঝুঁকি:* একসাথে প্রচুর ছোট ফাইল আপলোড করলে টেলিগ্রাম সাময়িক FloodWait দিতে পারে।  
   *সমাধান:* আপলোড ম্যানেজারে সিকোয়েন্সিয়াল কিউ এবং কনকারেন্সি লিমিট (সর্বোচ্চ ২-৩ টি প্যারালাল রিকোয়েস্ট) রাখা হবে।
2. **মোবাইল ও বড় ফাইল প্রিভিউ:**  
   *ঝুঁকি:* ১০০ মেগাবাইটের বেশি ভিডিও প্রিভিউ সরাসরি ব্রাউজার মেমোরিতে ক্র্যাশ করতে পারে।  
   *সমাধান:* বড় ফাইলের ক্ষেত্রে সরাসরি ডাউনলোড বাটন সাজেস্ট করা হবে এবং সেফ স্ট্রিমিং চাঙ্ক ব্যবহার করা হবে।

---

## ১৬. Final Acceptance Checklist (চূড়ান্ত গ্রহণযোগ্যতার মানদণ্ড)

- [ ] ওয়েবসাইট অ্যাকাউন্ট তৈরি এবং লগইন নির্বিঘ্নে কাজ করে।
- [ ] টেলিগ্রাম অ্যাকাউন্ট কানেক্ট/ডিসকানেক্ট করা যায় (স্যান্ডবক্স ও রিয়েল উভয় মোডে)।
- [ ] ফাইল আপলোড করলে টেলিগ্রামের Saved Messages-এ ফাইল যায় এবং ফায়ারস্টোরে রেকর্ড তৈরি হয়।
- [ ] ফোল্ডার নেস্টিং, ব্রেডক্রাম্বস এবং ফাইল মুভ সঠিকভাবে কাজ করে।
- [ ] ড্যাশবোর্ডের "Storage Used in Your Drive" হিসাব সম্পূর্ণ সত্যনিষ্ঠ ও নির্ভুল।
- [ ] ট্র্যাশ এবং পার্মানেন্ট ডিলিট পিআরডি-এর নীতি মেনে চলে।
- [ ] কোনো ব্যবহারকারী অন্য কারও ফাইল বা সেশন দেখতে বা স্পর্শ করতে পারে না।
- [ ] ইউজার-ফেসিং সমস্ত টেক্সট প্রাতিষ্ঠানিক ইংরেজিতে রয়েছে।

---

## ১৭. Sources & Official Documentation (তথ্যসূত্র)

1. **Telegram Core APIs & MTProto:** https://core.telegram.org/api
2. **Telegram TDLib Architecture:** https://core.telegram.org/tdlib
3. **Firebase Authentication Web:** https://firebase.google.com/docs/auth/web/start
4. **Cloud Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/get-started
5. **Next.js 15 App Router & API Route Handlers:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
