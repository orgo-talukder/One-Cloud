# Implementation Plan: Auth Auto-Redirect, 7 Protected System Folders & Custom File/Folder Icons

One Cloud প্ল্যাটফর্মে অথেনটিকেটেড ইউজারদের সরাসরি ড্রাইভ ড্যাশবোর্ডে অটোমেটিক রিডাইরেক্ট, ৭টি অপরিবর্তনীয় (Protected) ডিফল্ট সিস্টেম ফোল্ডার তৈরি এবং ইউজারদের প্রদানকৃত PNG আইকন সেট অনুযায়ী স্বয়ংক্রিয় ফাইল এক্সটেনশন ও ফোল্ডার আইকন ম্যাপিং বাস্তবায়ন।

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **ব্যবহারকারীর নিশ্চিতকৃত সিদ্ধান্তসমূহ:**
> 1. **হোমপেজ অটো-রিডাইরেক্ট:** কোনো অথেনটিকেটেড (লগইন করা) ইউজার যদি `one-cloud-zeta.vercel.app` বা রুট (`/`) ইউআরএলে প্রবেশ করেন, তবে ল্যান্ডিং পেজে আটকে না রেখে সরাসরি `/app` (ড্রাইভ ড্যাশবোর্ড)-এ ইনস্ট্যান্ট রিডাইরেক্ট করা হবে। আন-অথেনটিকেটেড ব্যবহারকারীরা পূর্বের মতোই ল্যান্ডিং পেজ দেখতে পাবেন।
> 2. **৭টি ডিফল্ট সিস্টেম ফোল্ডার:** প্রতিটি ইউজারের ড্রাইভে ডিফল্টভাবে ৭টি ফোল্ডার থাকবে:
>    - `Documents` ➔ `documents_folder_icon.png`
>    - `Photos` ➔ `photo_folder_icon.png`
>    - `Videos` ➔ `video_folder_icon.png`
>    - `Music` ➔ `music_folder_icon.png`
>    - `Downloads` ➔ `download_folder_icon.png`
>    - `Archives` ➔ `archive_folder_icon.png`
>    - `Other Files` ➔ `files_folder_icon.png`
>    *এই ৭টি ফোল্ডার কোনো ইউজার ডিলিট (Trash), রিনেম (Rename) বা রিমুভ করতে পারবেন না।*
> 3. **ইউজারদের কাস্টম তৈরি ফোল্ডার:** ইউজার যখন নিজে নতুন ফোল্ডার তৈরি করবেন, তখন এক্সক্লুসিভভাবে `normal_folder_icon2.png` আইকনটি ব্যবহৃত হবে। `normal_folder_icon.png` ফাইলটি প্রজেক্ট থেকে মুছে ফেলা হবে।
> 4. **স্বয়ংক্রিয় ফাইল আইকন ম্যাপিং:** `files_icon/` ফোল্ডারের PNG ফাইলগুলোর মাধ্যমে ফাইল ফরম্যাট অনুযায়ী স্বয়ংক্রিয়ভাবে সঠিক আইকন রেন্ডার হবে (যেমন: APK, PDF, Video, Audio, ZIP, RAR, 7z, DOCX, Code Files ইত্যাদি)।

---

## 1. Overview & Core Concept

### What It Does
- **Seamless Auth Transition:** ইউজার একবার লগইন করলে প্রতিবার ল্যান্ডিং পেজ দেখে "Go to Drive" বাটনে ম্যানুয়াল ক্লিক করার ঝামেলা দূর হবে। অ্যাপ স্বয়ংক্রিয়ভাবে ইউজারের অথেনটিকেশন স্টেট ডিটেক্ট করে তাৎক্ষণিক ড্রাইভ ড্যাশবোর্ডে নিয়ে যাবে।
- **Structured Cloud Organization (7 Protected Folders):** গুগল ড্রাইভ ও ওয়ানড্রাইভের মতো প্রতিটি ইউজারের একাউন্টে ৭টি প্রধান ক্যাটাগরির ফোল্ডার স্বয়ংক্রিয়ভাবে ইনিশিয়ালাইজ থাকবে। এই ফোল্ডারগুলো সুরক্ষিত থাকবে যাতে ইউজার ভুলে ডিলিট বা রিনেম করতে না পারেন।
- **High-Fidelity Visual Experience:** জেনেরিক ভেক্টর আইকনের বদলে দৃষ্টিনন্দন ও প্রিমিয়াম থ্রিডি/মডার্ন PNG আইকন দিয়ে গ্রিড ও লিস্ট ভিউতে ফাইল ও ফোল্ডার প্রদর্শিত হবে।

### Target Audience & Persona
- টেলিগ্রাম ক্লাউড স্টোরেজ ব্যবহারকারী, যারা গুগল ড্রাইভের মতো গোছানো ফোল্ডার স্ট্রাকচার এবং দ্রুতগতির ড্যাশবোর্ড এক্সেস চান।

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Visits Root (/) URL                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                 Is Firebase User Authenticated?
                ┌────────────────┴────────────────┐
               Yes                               No
                │                                 │
        [Show Instant Minimal]            [Render Landing Page]
        [Loading / Redirect  ]            [With Sign-in & Hero]
                │
     Redirect to /app (Drive)
                │
   Check 7 System Folders in User Root
   (Documents, Photos, Videos, etc.)
                │
   Display Beautiful PNG Icons
   - Folders: Category-specific PNGs
   - Custom Folders: normal_folder_icon2.png
   - Files: Extension-matched PNGs
```

### Visual Identity & Icon Placement
- **পাবলিক অ্যাসেট স্ট্রাকচার:** সকল PNG আইকনকে Next.js-এর অপটিমাইজড পাথ `/public/icons/folders/` এবং `/public/icons/files/`-এ স্থানান্তর করা হবে।
- **প্রোটেক্টেড ফোল্ডার ব্যাজ/লক ভিউজুয়াল:** ডিফল্ট ৭টি ফোল্ডারের কনটেক্সট মেনু বা অ্যাকশন মেনুতে "Rename", "Move", এবং "Delete/Trash" অপশন নিষ্ক্রিয় বা লুকানো থাকবে। প্রয়োজনে ফোল্ডারের নামের পাশে একটি সূক্ষ্ম সিস্টেম ব্যাজ বা লক আইকন নির্দেশ করবে যে এটি সিস্টেম ফোল্ডার।
- **ফাইল ফরম্যাট ডিটেকশন গ্রিড:**
  - এক্সটেনশন `.pdf` ➔ `pdf_icon.png`
  - এক্সটেনশন `.jpg, .png, .webp, .svg` ➔ `image_icon.png`
  - এক্সটেনশন `.mp4, .mkv, .webm, .avi, .mov` ➔ `video_icon.png`
  - এক্সটেনশন `.mp3, .wav, .flac, .aac, .ogg` ➔ `music_icon.png`
  - এক্সটেনশন `.zip` ➔ `zip_icon.png`
  - এক্সটেনশন `.rar` ➔ `rar_icon.png`
  - এক্সটেনশন `.7z` ➔ `7-zip_icon.png`
  - এক্সটেনশন `.tar, .gz, .bz2, .xz` ➔ `archive_icon.png`
  - এক্সটেনশন `.apk` ➔ `apk_icon.png`
  - এক্সটেনশন `.doc` ➔ `doc_icon.png`
  - এক্সটেনশন `.docx` ➔ `docx_icon.png`
  - এক্সটেনশন `.ppt, .pptx` ➔ `pptx_icon.png`
  - এক্সটেনশন `.txt, .log` ➔ `txt_icon.png`
  - এক্সটেনশন `.csv` ➔ `csv_icon.png`
  - এক্সটেনশন `.json` ➔ `json_icon.png`
  - এক্সটেনশন `.xml` ➔ `xml_icon.png`
  - এক্সটেনশন `.html, .htm` ➔ `html_icon.png`
  - এক্সটেনশন `.css` ➔ `css_icon.png`
  - এক্সটেনশন `.js, .jsx, .ts, .tsx, .mjs` ➔ `js_icon.png`
  - এক্সটেনশন `.py` ➔ `python_icon.png`
  - এক্সটেনশন `.java` ➔ `java_icon.png`
  - এক্সটেনশন `.jar` ➔ `jar_icon.png`
  - এক্সটেনশন `.md, .markdown` ➔ `markdown_icon.png`
  - অন্যান্য / অজানা ফাইল ➔ `file_00000000a62881f4aff7a0925e6b7cd1.png`

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Authentication Auto-Redirect Architecture
- **Chosen Approach:** `app/page.tsx`-এ `useAuth` হুক ব্যবহার করে `user` অবজেক্ট পাওয়ার সাথে সাথে `router.replace('/app')` কল করা। প্রাথমিক `loading` অবস্থায় একটি স্লিক, মিনিমাল লোডিং স্পিনার বা ব্যাকগ্রাউন্ড স্কেলিটন দেখানো।
- **Why:** কোনো ফ্লিকার বা দীর্ঘ সময় ল্যান্ডিং পেজ না দেখিয়ে তাৎক্ষণিক ড্যাশবোর্ডে পাঠায়।
- **Alternatives Considered:** Next.js Edge Middleware — কিন্তু ক্লায়েন্ট-সাইড Firebase Auth স্টেট কুকির বদলে IndexedDB/LocalStorage-এ থাকার কারণে ক্লায়েন্ট-সাইড রিয়্যাক্ট লাইফসাইকেলে স্টেট চেক করে রিডাইরেক্ট করাই নির্ভরযোগ্য ও ত্রুটিমুক্ত।

### Decision 2: 7 System Protected Folders Storage & Persistence
- **Chosen Approach:** `drive-context.tsx`-এ ইউজার লগইন হওয়ার পর তার ড্রাইভে যদি ৭টি সিস্টেম ফোল্ডার না থাকে, তবে স্বয়ংক্রিয়ভাবে `isSystem: true` এবং নির্দিষ্ট `systemType` দিয়ে তৈরি হবে।
- **Safety Enforcement:**
  - `trashFolder`, `renameFolder`, `deleteFolder` ফাংশনগুলোতে `if (folder.isSystem) return;` গার্ড যুক্ত হবে।
  - ইউআই ড্রপডাউন মেনু (`FileList.tsx`) থেকে রিনেম এবং ডিলিট অপশন হাইড করা থাকবে।

### Decision 3: Asset Handling & Optimization
- **Chosen Approach:** ইউজারদের প্রদানকৃত কাঁচা ফোল্ডার `files & folder icon` থেকে ছবিগুলো `/public/icons/` ডিরেক্টরিতে সুসংগঠিতভাবে সাজানো হবে এবং Next.js `<Image>` বা হাই-স্পিড `<img>` ট্যাগ দিয়ে প্রপার ক্যাশিং ও শার্প রেন্ডারিং নিশ্চিত করা হবে। `normal_folder_icon.png` ডিলিট করা হবে।

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js Frontend                              │
├────────────────────────────────┬───────────────────────────────────────┤
│         Landing Page           │            Drive Dashboard            │
│         (app/page.tsx)         │              (app/app/*)              │
│                                │                                       │
│   useAuth() => user exists?    │  Folder Rendering    File Rendering   │
│      ├── Yes ➔ router.replace  │  ├── isSystem?       ├── Match ext    │
│      └── No  ➔ Show Hero Page  │  │   ➔ System PNG    │   ➔ Format PNG │
│                                │  └── Custom?         └── Fallback PNG │
│                                │      ➔ custom2.png                    │
└────────────────────────────────┴───────────────────┬───────────────────┘
                                                     │
                                 ┌───────────────────┴───────────────────┐
                                 │        lib/drive/drive-context        │
                                 │  - ensureDefaultSystemFolders()       │
                                 │  - isSystem Guard on Trash/Rename     │
                                 │  - Icon Resolver Helper               │
                                 └───────────────────────────────────────┘
```

### Folder Data Model Enhancement
```ts
export interface FolderItem {
  id: string;
  name: string;
  parentFolderId: string | null;
  isStarred: boolean;
  status: 'active' | 'trashed';
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
  isSystem?: boolean; // নতুন: ট্র্যাশ/রিনেম ব্লক করতে
  systemType?: 'documents' | 'photos' | 'videos' | 'music' | 'downloads' | 'archives' | 'files' | null;
}
```

### Icon Resolution Helper (`lib/drive/icon-resolver.ts`)
একটি ডেডিকেটেড লাইব্রেরি ফাংশন তৈরি করা হবে:
- `getFolderIconPath(folder: FolderItem): string`
  - যদি `folder.isSystem` হয়, তবে তার `systemType` বা নাম অনুযায়ী সংশ্লিষ্ট ফোল্ডার আইকন পাথ রিটার্ন করবে (যেমন: `/icons/folders/documents_folder_icon.png`)।
  - যদি ইউজার-তৈরি কাস্টম ফোল্ডার হয়, তবে `/icons/folders/normal_folder_icon2.png` রিটার্ন করবে।
- `getFileIconPath(fileName: string, mimeType?: string): string`
  - ফাইলের নাম থেকে এক্সটেনশন আলাদা করে ম্যাপিং টেবিল চেক করবে এবং সঠিক PNG পাথ রিটার্ন করবে।

---

## 5. Execution Steps Summary
1. **Asset Management:**
   - `/public/icons/folders/` এবং `/public/icons/files/` ডিরেক্টরি তৈরি করে ফাইলগুলো কপি করা।
   - ব্যবহারকারীর নির্দেশ অনুযায়ী অপ্রয়োজনীয় `normal_folder_icon.png` মুছে ফেলা।
2. **Icon Resolver Utility:**
   - `lib/drive/icon-resolver.ts` তৈরি করা যা নিখুঁতভাবে সব ফরম্যাট ও ফোল্ডার টাইপের জন্য সঠিক আইকন পাথ প্রদান করবে।
3. **Landing Page Redirection:**
   - `app/page.tsx`-এ অথেনটিকেটেড ইউজার সনাক্ত করে সাথে সাথে `/app`-এ রিডাইরেক্ট যুক্ত করা।
4. **Protected Folders Logic:**
   - `lib/drive/types.ts` এবং `lib/drive/drive-context.tsx`-এ ৭টি সিস্টেম ফোল্ডারের অটো-ইনিশিয়ালাইজেশন এবং ডিলিট/রিনেম প্রটেকশন কোড যুক্ত করা।
5. **UI Integration:**
   - `components/drive/FileList.tsx`, `components/drive/FileCard.tsx`, ব্রেডক্রাম্ব ও মডালে Lucide আইকনের পরিবর্তে নতুন PNG আইকন রেন্ডারিং কার্যকর করা।
   - সিস্টেম ফোল্ডারগুলোর জন্য রিনেম এবং ডিলিট বোতাম নিষ্ক্রিয় করা।
6. **Verification & Build:**
   - `lint_applet` এবং `compile_applet` চালিয়ে বিল্ড সফল হওয়া নিশ্চিত করা।
