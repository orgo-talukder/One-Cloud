# গুগল ড্রাইভ-স্টাইল শেয়ার লিংক, রোল ও সিকিউরিটি আর্কিটেকচার — পূর্ণাঙ্গ ও বিস্তারিত বাস্তবায়ন পরিকল্পনা

এই পরিকল্পনাটি আপনার ক্লাউড প্ল্যাটফর্মে গুগল ড্রাইভের সমমানের এবং আধুনিক ক্লাউড সিকিউরিটি স্ট্যান্ডার্ড অনুযায়ী **Share Link**, **Role-Based Access Control (RBAC)**, **Password Shield**, **Expiration Management**, এবং **Zero-Credential-Leak Guest Portal** বাস্তবায়নের পুঙ্খানুপুঙ্খ ইঞ্জিনিয়ারিং ব্লুপ্রিন্ট।

---

## ১. প্রকল্পের উদ্দেশ্য ও সারসংক্ষেপ (Executive Summary)

বর্তমানে আপনার অ্যাপে ফাইলগুলো ব্যক্তিগত টেলিগ্রাম স্টোরেজ এবং ফায়ারস্টোরে সংরক্ষিত থাকে। ব্যবহারকারীরা যাতে গুগল ড্রাইভের মতো যেকোনো নির্দিষ্ট ফাইল বা ফোল্ডারের জন্য একটি প্রফেশনাল, সুন্দর ও অত্যন্ত সুরক্ষিত পাবলিক শেয়ার লিংক তৈরি করতে পারেন—এই পরিকল্পনার উদ্দেশ্য তা নিখুঁতভাবে অর্জন করা।

### প্রধান লক্ষ্যসমূহ:
1. **Google Drive-Style Share Modal:** ফাইল কার্ডের ৩-ডট মেনু, কনটেক্সট মেনু বা প্রিভিউ থেকে "Share" চাপলে গুগল ড্রাইভের অনুরূপ উইন্ডো চালু হবে।
2. **ডুয়েল অ্যাক্সেস স্কোপ (General Access):**
   - **Restricted:** শুধুমাত্র অনুমোদিত নির্দিষ্ট ব্যক্তি অ্যাক্সেস করতে পারবে।
   - **Anyone with the link:** লিংক থাকা যেকোনো ব্যক্তি (লগইন করা বা অতিথি) ফাইলটি দেখতে পাবে।
3. **মাল্টি-টায়ার পারমিশন রোলস (Granular Permission Roles):**
   - **Viewer (দর্শক):** ফাইলটি ব্রাউজারে প্রিভিউ করতে পারবে এবং অনুমোদিত হলে ডাউনলোড করতে পারবে।
   - **Editor (সম্পাদক):** ফোল্ডার শেয়ারের ক্ষেত্রে নতুন ফাইল আপলোড, সাব-ফোল্ডার তৈরি ও অর্গানাইজ করতে পারবে।
4. **এন্টারপ্রাইজ-গ্রেড সিকিউরিটি শিল্ড (Security Shield):**
   - **পাসওয়ার্ড সুরক্ষা (Password-Protected):** লিংক খোলার আগে পাসওয়ার্ড চ্যালেঞ্জ।
   - **মেয়াদ নির্ধারণ (Self-Expiring TTL):** ১ দিন, ৭ দিন, ৩০ দিন বা নির্দিষ্ট তারিখ পর লিংক নিষ্ক্রিয়।
   - **ডাউনলোড ব্লক (View-Only / Block Downloads):** ইউজার ফাইল স্ক্রিনে শুধু দেখতে পারবে, কম্পিউটারে সেভ করতে পারবে না।
   - **তাত্ক্ষণিক রিভোক (Instant Killswitch):** মালিক যেকোনো সময় এক ক্লিকে লিংক বাতিল করতে পারবেন।
5. **জিরো-লিক ক্রিপ্টোগ্রাফিক প্রক্সি (Zero Credential Leakage):**
   - শেয়ার গ্রহীতা কখনোই মালিকের টেলিগ্রাম সেশন টোকেন, বট ক্রেডেনশিয়াল বা আসল ইন্টারনাল মেসেজ আইডি দেখতে পারবে না। সবকিছু সার্ভার প্রক্সির মাধ্যমে নিরাপদ টোকেনে ডেলিভারি হবে।

---

## ২. গুগল ড্রাইভ বনাম আমাদের আর্কিটেকচারের তুলনামূলক ম্যাট্রিক্স

| ফিচার | গুগল ড্রাইভ | আমাদের ক্লাউড আর্কিটেকচার | বাস্তবায়ন পদ্ধতি |
| :--- | :--- | :--- | :--- |
| **Share Link Generation** | এক ক্লিকে ইউনিক ইউআরএল তৈরি | ক্রিপ্টোগ্রাফিক র্যান্ডম টোকেন (`/share/sh_...`) | Web Crypto API (Secure Random 128-bit) |
| **General Access** | Restricted / Anyone with link | Restricted / Anyone with link | Firestore ACL + Role Checking |
| **Permission Roles** | Viewer, Commenter, Editor | Viewer (Read), Editor (Upload/Manage) | Granular Role Enforcement |
| **Password Protection** | গুগল ড্রাইভ সাধারণে নেই (Dropbox/Enterprise-এ আছে) | **সম্পূর্ণ যুক্ত থাকবে** | SHA-256 Hashed Password Validation |
| **Link Expiration** | শুধুমাত্র Google Workspace পেইড প্ল্যানে আছে | **১০০% ফ্রি ও বিল্ট-ইন থাকবে** | ISO Timestamp Comparison (`expiresAt`) |
| **Download Prevention** | "Disable options to download, print, copy" | **সম্পূর্ণ যুক্ত থাকবে** | Context Menu Blocking & Blob Proxy Guard |
| **Instant Revocation** | এক ক্লিকে "Remove link" | **এক ক্লিকে "Revoke Share"** | Status update to `revoked` in Firestore |
| **Guest UI / Experience** | পরিচ্ছন্ন ড্রাইভ প্রিভিউ পেজ | **ডার্ক/লাইট মোডযুক্ত আধুনিক প্রিভিউ পেজ** | Next.js Dynamic Route (`/share/[token]`) |

---

## ৩. রোল ও পারমিশন ম্যাট্রিক্স (Role & Permission Matrix)

| কার্যক্রম (Action) | Viewer (Allow Download) | Viewer (Block Download) | Editor (Folder) | Owner (মালিক) |
| :--- | :---: | :---: | :---: | :---: |
| ব্রাউজারে ফাইল প্রিভিউ দেখা | ✅ | ✅ | ✅ | ✅ |
| ফাইল ডিভাইসে ডাউনলোড করা | ✅ | ❌ | ✅ | ✅ |
| রাইট-ক্লিক ও "Save As" করা | ✅ | ❌ (ব্লক থাকবে) | ✅ | ✅ |
| ফাইলের নাম পরিবর্তন (Rename) | ❌ | ❌ | ✅ | ✅ |
| ফোল্ডারে নতুন ফাইল আপলোড | ❌ | ❌ | ✅ | ✅ |
| ফাইল পার্মানেন্ট ডিলিট করা | ❌ | ❌ | ❌ | ✅ |
| শেয়ারিং সেটিংস পরিবর্তন/বাতিল | ❌ | ❌ | ❌ | ✅ |

---

## ৪. ফায়ারস্টোর ডেটাবেজ ও স্কিমা আর্কিটেকচার (Firestore Schema)

শেয়ারিং তথ্যের জন্য ফায়ারস্টোরে একটি নতুন শীর্ষ-স্তরের কালেকশন থাকবে: `shares`

### ৪.১. `shares/{shareToken}` ডকুমেন্ট স্কিমা
```typescript
export interface ShareLinkDocument {
  shareToken: string;            // ইউনিক টোকেন, যেমন: "sh_7c8d9e2a1b4f"
  fileId: string;                // ড্রাইভ ফাইলের আইডি
  folderId?: string | null;      // ফোল্ডার শেয়ারিং হলে ফোল্ডার আইডি
  ownerUid: string;              // শেয়ারকারীর Firebase UID
  ownerEmail: string;            // শেয়ারকারীর ইমেইল বা ডিসপ্লে নেম
  
  // ফাইলের মেটাডেটা ক্যাশ (যাতে দ্রুত প্রিভিউ লোড হয়)
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  extension: string;
  thumbnailUrl?: string;
  
  // পারমিশন ও এক্সেস
  accessLevel: 'viewer' | 'editor';
  isPublic: boolean;             // true = anyone with link
  
  // সিকিউরিটি গার্ডস
  hasPassword: boolean;          // পাসওয়ার্ড দেওয়া আছে কি না
  passwordHash?: string | null;  // SHA-256 সল্টেড হ্যাশ (কখনোই প্লেইনটেক্সট নয়)
  expiresAt?: string | null;     // ISO ডেট স্ট্রিং (যেমন: "2026-11-01T00:00:00.000Z")
  allowDownload: boolean;        // true = ডাউনলোড ওপেন, false = নো-ডাউনলোড
  
  // স্ট্যাটাস ও ট্র্যাকিং মেট্রিকস
  status: 'active' | 'revoked' | 'expired';
  viewCount: number;             // মোট ভিউ সংখ্যা
  downloadCount: number;         // মোট ডাউনলোড সংখ্যা
  lastViewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### ৪.২. ফাইল ডকুমেন্টে শেয়ার রেফারেন্স (`users/{uid}/files/{fileId}`)
ফাইলের মূল ডকুমেন্টে শেয়ার স্ট্যাটাস ট্র্যাক করার জন্য দুটি ফিল্ড সংরক্ষিত হবে:
```typescript
{
  isShared: boolean;             // ফাইলটি বর্তমানে শেয়ার করা কি না
  activeShareToken?: string | null; // বর্তমান সক্রিয় শেয়ার টোকেন
  shareAccessLevel?: 'viewer' | 'editor';
}
```

---

## ৫. ব্যাকএন্ড এপিআই স্পেসিফিকেশন (API Architecture)

সকল শেয়ারিং অপারেশন Next.js App Router API রুটের মাধ্যমে পরিচালিত হবে, যা মালিকের ক্রেডেনশিয়ালকে বহিরাগতদের থেকে সম্পূর্ণ গোপন রাখবে:

### ৫.১. `POST /api/drive/share/create`
- **উদ্দেশ্য:** নতুন শেয়ার লিংক তৈরি বা বিদ্যমান শেয়ার সেটিংস আপডেট করা।
- **অথরাইজেশন:** ফাইল মালিকের সেশন প্রয়োজন।
- **ইনপুট পে-লোড:**
  ```json
  {
    "fileId": "file_12345",
    "accessLevel": "viewer",
    "password": "optionalPassword123",
    "expiresInDays": 7,
    "allowDownload": true
  }
  ```
- **রেসপন্স:**
  ```json
  {
    "success": true,
    "shareToken": "sh_9a8f7c6e1d",
    "shareUrl": "https://your-domain.com/share/sh_9a8f7c6e1d"
  }
  ```

### ৫.২. `GET /api/drive/share/verify?token=sh_...`
- **উদ্দেশ্য:** গেস্ট পেজ খোলার সময় টোকেনের বৈধতা ও সিকিউরিটি স্ট্যাটাস চেক করা।
- **যাচাইয়ের ধাপসমূহ:**
  1. টোকেন কি `shares` কালেকশনে বিদ্যমান?
  2. `status === 'active'` কি না?
  3. `expiresAt` পার হয়ে গেছে কি না?
  4. পাসওয়ার্ড প্রয়োজন কি না (`hasPassword === true`)?
- **রেসপন্স (পাসওয়ার্ড ছাড়া বা পাসওয়ার্ড ভেরিফাইড হলে):**
  ```json
  {
    "valid": true,
    "requiresPassword": false,
    "file": {
      "name": "Project_Design.pdf",
      "size": 2450000,
      "mimeType": "application/pdf",
      "extension": "pdf",
      "allowDownload": true,
      "accessLevel": "viewer",
      "ownerName": "Argo"
    }
  }
  ```

### ৫.৩. `POST /api/drive/share/verify-password`
- **উদ্দেশ্য:** পাসওয়ার্ড প্রটেক্টেড লিংকের জন্য গেস্টের দেওয়া পাসওয়ার্ড মিলিয়ে দেখা।
- **লজিক:** গেস্টের পাঠানো পাসওয়ার্ডের SHA-256 হ্যাশ তৈরি করে ডাটাবেজের `passwordHash`-এর সাথে তুলনা করা। সঠিক হলে একটি শর্ট-লিভড অ্যাক্সেস টোকেন বা সেশন সেট করা।

### ৫.৪. `GET /api/drive/share/stream/[shareToken]`
- **উদ্দেশ্য:** গেস্ট ব্যবহারকারীকে সরাসরি ফাইলটি স্ট্রিম বা ডাউনলোড করিয়ে দেওয়া।
- **আর্কিটেকচার সুবিধা:** গেস্টের কাছে টেলিগ্রাম সেশন পাঠানো হয় না। সার্ভার স্বয়ংক্রিয়ভাবে টেলিগ্রাম থেকে চাঙ্ক রিড করে ব্রাউজারে স্ট্রিমিং রেসপন্স হিসেবে পাঠায়।
- **হেডার হ্যান্ডলিং:**
  - `allowDownload === false` হলে `Content-Disposition: inline` বাধ্য করা হবে।
  - `allowDownload === true` হলে সরাসরি ডাউনলোড ফ্রেন্ডলি হেডার দেওয়া হবে।

### ৫.৫. `POST /api/drive/share/revoke`
- **উদ্দেশ্য:** ফাইল মালিকের নির্দেশে এক ক্লিকে শেয়ার লিংক বাতিল করা।
- **লজিক:** `shares/{shareToken}` ডকুমেন্টের স্ট্যাটাস `'revoked'` করা এবং ফাইলের `isShared: false` করা।

---

## ৬. ইউজার ইন্টারফেস ও কম্পোনেন্ট ওয়্যারফ্রেম (UI/UX Design)

### ৬.১. গুগল ড্রাইভ-স্টাইল Share Modal (`components/modals/ShareModal.tsx`)
মডালটি ওপেন হলে ব্যবহারকারী দেখতে পাবেন:

```
┌────────────────────────────────────────────────────────┐
│  Share "Project_Presentation_2026.pdf"           [ X ] │
├────────────────────────────────────────────────────────┤
│  General access                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🌐 Anyone with the link                       ▼ │  │
│  │    Anyone on the internet with the link can view │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Role: [ Viewer ▼ ]                                    │
│                                                        │
│  ▼ Security & Link Settings (Advanced)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [x] Protect with Password: [ Enter password... ] │  │
│  │ [x] Expiration Date:       [ 7 Days           ▼ ]│  │
│  │ [x] Allow viewers to download                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Link: https://your-domain.com/share/sh_9a8f7c6e...    │
├────────────────────────────────────────────────────────┤
│  [ 🗑️ Revoke Share ]       [ Cancel ]  [ 🔗 Copy Link ]│
└────────────────────────────────────────────────────────┘
```

### ৬.২. গেস্ট প্রিভিউ পোর্টাল (`app/share/[shareToken]/page.tsx`)
বাইরের কোনো ব্যবহারকারী যখন লিংকে প্রবেশ করবেন, তখন গুগল ড্রাইভের সমমানের প্রিভিউ ইন্টারফেস প্রদর্শিত হবে:

1. **টপবার:**
   - অ্যাপ লোগো (OneCloud)।
   - ফাইলের নাম, সাইজ এবং এক্সটেনশন ব্যাজ।
   - ডানপাশে "Download" বাটন (যদি ডাউনলোডের অনুমতি থাকে)।
2. **সেন্টার প্রিভিউ জোন (Media Viewer):**
   - **ছবি:** ফুলস্ক্রিন ক্রিস্টাল-ক্লিয়ার ভিউ।
   - **ভিডিও:** কাস্টম ভিডিও প্লেয়ার (Play/Pause, Seekbar, Volume, Fullscreen)।
   - **অডিও:** ওয়েভফর্ম/প্লেয়ার সহ সাউন্ড বার।
   - **পিডিএফ:** ফুলস্ক্রিন ডকুমেন্ট রিডার।
   - **অন্যান্য ফাইল (Zip, Code, Executable):** ফাইল আইকন এবং স্পষ্ট বিবরণ।
3. **পাসওয়ার্ড গেটওয়ে স্ক্রিন (Password Screen):**
   - যদি ফাইলে পাসওয়ার্ড দেওয়া থাকে, ফাইল কন্টেন্ট লোড হওয়ার আগে একটি সিকিউর কার্ড আসবে:
   - *"This file is password protected. Enter the password to view and download."*
   - সঠিক পাসওয়ার্ড দিলে তৎক্ষণাৎ কন্টেন্ট আনলক হবে।
4. **অকার্যকর/এক্সপায়ার্ড স্ক্রিন (Expired Screen):**
   - লিংকটির মেয়াদ শেষ হলে বা মালিক বাতিল করলে স্পষ্ট মেসেজ আসবে:
   - *"Link Expired or Revoked. Contact the file owner to request access."*

---

## ৭. সম্পূর্ণ ডেটাফ্লো ডায়াগ্রাম (System Dataflow)

```
[ফাইল মালিক]                                  [বহিরাগত ক্লায়েন্ট / গেস্ট]
     │                                                     │
     │ 1. Share Modal ওপেন করে সেটিংস নির্ধারণ           │
     ▼                                                     │
[POST /api/drive/share/create]                             │
     │                                                     │
     ├─► ফায়ারস্টোর `shares` টেবিলে টোকেন তৈরি              │
     ▼                                                     │
[কপি করা লিংক পাঠান] ─────────────────────────────────────►│
                                                           │ 2. লিংকে প্রবেশ (/share/sh_...)
                                                           ▼
                                            [GET /api/drive/share/verify]
                                                           │
                                            ┌──────────────┴──────────────┐
                                     (পাসওয়ার্ড প্রযোজ্য)          (সরাসরি উন্মুক্ত)
                                            │                             │
                                            ▼                             ▼
                                   [পাসওয়ার্ড ইনপুট ফর্ম]           [প্রিভিউ পেজ রেন্ডার]
                                            │                             │
                                     (সঠিক পাসওয়ার্ড)                     │
                                            └──────────────┬──────────────┘
                                                           ▼
                                            [প্রিভিউ ও ডাউনলোড উপভোগ]
                                            [GET /api/drive/share/stream]
```

---

## ৮. ধাপে ধাপে বাস্তবায়ন রোডম্যাপ (Implementation Phases)

### ফেজ ১: ডেটা স্ট্রাকচার ও এপিআই ইঞ্জিন (Backend Foundation)
- [ ] `lib/drive/share-types.ts` তৈরি (শেয়ার মডেল, ইন্টারফেস এবং রোল টাইপস)।
- [ ] ক্রিপ্টোগ্রাফিক সিকিউর টোকেন জেনারেটর এবং হ্যাশিং ইউটিলিটি ফাংশন তৈরি।
- [ ] ফায়ারস্টোর `shares` কালেকশন ইন্টিগ্রেশন।
- [ ] Next.js এপিআই রুটস ইমপ্লিমেন্টেশন:
  - `/api/drive/share/create`
  - `/api/drive/share/verify`
  - `/api/drive/share/verify-password`
  - `/api/drive/share/stream/[shareToken]`
  - `/api/drive/share/revoke`

### ফেজ ২: গুগল ড্রাইভ-স্টাইল Share Modal (`ShareModal.tsx`)
- [ ] `components/modals/ShareModal.tsx` ডিজাইন ও কোডিং (গুগল ড্রাইভ থিম)।
- [ ] রোল সিলেকশন ড্রপডাউন (Viewer / Editor)।
- [ ] পাসওয়ার্ড প্রোটেকশন চেকবক্স ও পাসওয়ার্ড ইনপুট ফিল্ড।
- [ ] এক্সপায়ারি ডেট ড্রপডাউন (1 Day, 7 Days, 30 Days, Custom)।
- [ ] "Allow Viewers to Download" টগল সুইচ।
- [ ] এক ক্লিকে "Copy Link" কপি ও টোস্ট নোটিফিকেশন।
- [ ] পূর্বে শেয়ার করা ফাইল হলে "Revoke Share" এক-ক্লিক বাটন।

### ফেজ ৩: ড্রাইভ পেজ ও প্রিভিউ মডালে ইন্টিগ্রেশন
- [ ] `app/app/drive/page.tsx`-এর ৩-ডট মেনুতে **"Share"** অ্যাকশন বোতাম যুক্ত করা।
- [ ] `components/drive/FileList.tsx`-এর মেনুগুলোতে **"Share"** বোতাম যুক্ত করা।
- [ ] `components/modals/FilePreviewModal.tsx`-এর হেডারে **"Share"** বোতাম যুক্ত করা।
- [ ] যেসব ফাইল বর্তমানে শেয়ার করা আছে, সেগুলোর পাশে ছোট একটি সুন্দর শেয়ার্ড আইকন (🔗) দেখানো।

### ফেজ ৪: প্রিমিয়াম গেস্ট পোর্টাল (`app/share/[shareToken]/page.tsx`)
- [ ] সম্পূর্ণ আধুনিক ও রেসপনসিভ গেস্ট পেজ ডিজাইন।
- [ ] পাসওয়ার্ড প্রটেকশন গেটওয়ে কম্পোনেন্ট (পিন/পাসওয়ার্ড ফর্ম)।
- [ ] এক্সপায়ার্ড এবং রিভোকড লিংকের জন্য কাস্টম স্টেট পেজ।
- [ ] ইমেজ, ভিডিও, অডিও ও পিডিএফ প্রিভিউয়ার রেন্ডারিং।
- [ ] পারমিশন অনুযায়ী ডাউনলোড বাটন এনাবল/ডিজেবল এবং ডিএলপি প্রটেকশন (রাইট ক্লিক ব্লক)।

### ফেজ ৫: অ্যানালিটিক্স, টেস্টিং ও ভেরিফিকেশন
- [ ] ভিউ কাউন্টার ও ডাউনলোড কাউন্টার ট্র্যাকিং পরীক্ষা।
- [ ] পাসওয়ার্ড যাচাইয়ের ব্রুট-ফোর্স রোধ পরীক্ষা।
- [ ] মোবাইল, ট্যাবলেট এবং ডেস্কটপ স্ক্রিনে রেসপন্সিভনেস নিশ্চিত করা।

---

## ৯. বাস্তবায়ন সফলভাবে সম্পন্ন (Implementation Complete)

গুগল ড্রাইভের সমমানের শেয়ার লিংক, অ্যাক্সেস কন্ট্রোল (Viewer/Editor), পাসওয়ার্ড শিল্ড, সেলফ-এক্সপায়ারিং টাইম-টু-লাইভ (TTL), ডিএলপি ডাউনলোড প্রটেকশন, কিউআর কোড জেনারেশন এবং গেস্ট প্রিভিউ পোর্টাল সফলভাবে তৈরি ও একীভূত করা হয়েছে।
