# One Cloud — Folder/File 3-Dot Menu, Delete Confirmation Popup ও Chunked Upload ফিক্স প্ল্যান

এই ইমপ্লিমেন্টেশন প্ল্যানটির লক্ষ্য হলো আপনার রিপোর্ট করা দুটি প্রধান সমস্যা—**(১) Vercel-এ বড় ফাইল (যেমন `13.9 MB` ভিডিও) আপলোডে `Error` আসা** এবং **(২) ফোল্ডার ও ফাইলের 3-Dot (`⋮`) মেনুতে ক্লিক করলে শুধু Rename আসা এবং Delete অপশন ও Confirmation Popup না আসা**—সম্পূর্ণভাবে সমাধান করা।

---

## ইউজার রিভিউ ও নিশ্চিতকৃত সিদ্ধান্তসমূহ (Confirmed Decisions)

> [!IMPORTANT]
> আপনার দেওয়া উত্তরগুলোর ওপর ভিত্তি করে নিচের ৩টি প্রধান সিদ্ধান্ত চূড়ান্ত করা হয়েছে:

- **সিদ্ধান্ত ১ — 3-Dot (`⋮`) মেনুর অপশনসমূহ**: ফোল্ডার ও ফাইলের ৩-ডট বাটনে ক্লিক করলে সরাসরি Rename পপআপ না খুলে একটি পূর্ণাঙ্গ **Context Dropdown Menu** খুলবে, যেখানে **Open folder / Preview, Rename, Star / Unstar, Move to Trash, এবং Delete** অপশন থাকবে।
- **সিদ্ধান্ত ২ — Delete Confirmation Popup-এর আচরণ**: ইউজার যখন কোনো ফোল্ডার বা ফাইলে Delete / Move to Trash-এ ক্লিক করবেন, তখন একটি প্রফেশনাল **Delete Confirmation Modal** পপআপ আসবে, যেখান থেকে ইউজার **Move to Trash (ট্র্যাশে পাঠান)** অথবা **Delete Forever (স্থায়ীভাবে মুছে ফেলুন)**—যেকোনো একটি বেছে নিতে পারবেন।
- **সিদ্ধান্ত ৩ — 13.9 MB+ ফাইল আপলোড এরর সমাধান (Chunked Upload + Retry)**: Vercel-এর 4.5 MB সার্ভারলেস পেলোড সীমা অতিক্রম করার জন্য বড় ফাইলগুলোকে **2 MB চাঙ্কে (Chunked MTProto Upload)** ভাগ করে টেলিগ্রামে আপলোড করা হবে এবং Upload Drawer-এ আসল এরর মেসেজ ও **Retry** বাটন যুক্ত করা হবে।

---

## ১. সমস্যাগুলোর মূল কারণ ও সমাধানের সারসংক্ষেপ (Root Cause & Overview)

### ক) কেন `IDM_Life_Time_Free.mp4 (13.9 MB)` আপলোডে `Error` এসেছিল?
1. **Vercel 4.5 MB Serverless Limit**: ব্রাউজার থেকে পুরো 13.9 MB ফাইলটি একসাথে `/api/telegram/upload` রাউটে পাঠানো হচ্ছিল। কিন্তু Vercel Serverless Function ৪.৫ মেগাবাইটের বড় রিকোয়েস্ট বডি ব্লক করে (`413 FUNCTION_PAYLOAD_TOO_LARGE`)।
2. **সমাধান**: ব্রাউজার ফাইলটিকে **2 MB (4 × 512 KB MTProto parts)** আকারের ছোট ছোট চাঙ্কে ভাগ করে পাঠাবে। প্রতিটি চাঙ্ক ৪.৫ মেগাবাইটের অনেক নিচে থাকায় Vercel কখনোই ব্লক করবে না এবং টেলিগ্রামের MTProto `SaveFilePart` / `SaveBigFilePart` প্রোটোকলের মাধ্যমে সম্পূর্ণ ফাইলটি আপনার Telegram Saved Messages-এ সেভ হবে।

### খ) কেন ফোল্ডারের 3-Dot (`⋮`) বাটনে ক্লিক করলে শুধু Rename আসছিল এবং Delete বা Confirmation Popup আসেনি?
1. **মেনুর বদলে সরাসরি Rename স্টেট কল**: `My Drive` পেজে ফোল্ডার ও ফাইলের ৩-ডট বাটনের `onClick`-এ কোনো ড্রপডাউন মেনু না রেখে সরাসরি `setRenameTarget(...)` বসানো ছিল।
2. **Folder Rename বাগ**: `RenameModal` কম্পোনেন্টে ফোল্ডার রিনেম করার সময় ভুলবশত `renameFolder`-এর বদলে `renameFile` কল হচ্ছিল, যার ফলে Firestore-এ ফোল্ডারের নাম আপডেট হতে সমস্যা হতো।
3. **Delete Confirmation Modal অনুপস্থিত**: `My Drive`, `Recent`, ও `Starred` পেজে আইটেম ডিলিট করার আগে কনফার্মেশন পপআপ দেখানোর কোড যুক্ত করা ছিল না।

---

## ২. ইউজার এক্সপেরিয়েন্স ও ভিজ্যুয়াল ডিজাইন (User Experience & Visual Design)

### ইউজার ফ্লো (Step-by-Step Interactive Flow)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ১. Folder / File 3-Dot (⋮) বাটনে ক্লিক                                       │
│    └── একটি প্রিমিয়াম ডার্ক Dropdown Menu ওপেন হবে:                          │
│        • Folder-এর জন্য: Open folder, Rename, Star/Unstar,                   │
│          Move to Trash, Delete Forever                                       │
│        • File-এর জন্য (Grid ও List উভয় ভিউতে): Preview, Download,            │
│          Rename, Move to Folder, Star/Unstar, Move to Trash, Delete Forever  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ২. "Move to Trash" বা "Delete" অপশনে ক্লিক                                   │
│    └── Delete Confirmation Popup Modal ওপেন হবে:                             │
│        • আইটেমের নাম ও ধরন (Folder হলে ভেতরে কয়টি ফাইল আছে তা দেখাবে)       │
│        • অপশন ১: "Move to Trash" (সফট ডিলিট — পরে রিস্টোর করা যাবে)          │
│        • অপশন ২: "Delete Forever" (লাল Destructive বাটন — স্থায়ী ডিলিট)       │
│        • অপশন ৩: "Cancel" (পপআপ বন্ধ করবে)                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ ৩. বড় ফাইল আপলোড (যেমন 13.9 MB বা তার বেশি)                                  │
│    └── ব্রাউজার স্বয়ংক্রিয়ভাবে ২ MB চাঙ্কে ভাগ করে আপলোড করবে:                │
│        • Upload Queue Drawer-এ রিয়েল-টাইম প্রগ্রেস (১৫% → ৪৫% → ৮০% → ১০০%)  │
│        • কোনো কারণে নেটওয়ার্ক বিচ্ছিন্ন হলে স্পষ্ট কারণ এবং "Retry" বাটন     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### ভিজ্যুয়াল আইডেন্টিটি ও থিম
- **3-Dot Dropdown Menu**: `surface-raised` (`#191F2B`) ব্যাকগ্রাউন্ড, `border-strong` (`#3A4658`) ১ পিক্সেল বর্ডার, আইকনসহ পরিষ্কার এক-লাইনের অপশন এবং নিচে ডিভাইডারের পর লাল রঙে (`danger` `#F16B7A`) `Delete` অপশন। বাইরে ক্লিক করলে বা `Escape` চাপলে মেনু স্বয়ংক্রিয়ভাবে বন্ধ হবে।
- **Delete Confirmation Modal**: `RenameModal`-এর মতোই ডার্ক ব্যাকড্রপ ব্লা-সহ সেন্টারড মডাল কার্ড, যেখানে ইউজার স্পষ্টভাবে বুঝতে পারবেন ফাইল/ফোল্ডারটি ট্র্যাশে যাবে নাকি স্থায়ীভাবে মুছে যাবে।

---

## ৩. মূল টেকনিক্যাল সিদ্ধান্ত ও ট্রেড-অফ (Key Product Decisions & Trade-Offs)

- **সিদ্ধান্ত ১ — MTProto 512 KB Part-Aligned Chunked Upload**:
  - *পদ্ধতি*: টেলিগ্রামের MTProto প্রোটোকলে প্রতিটি ফাইল পার্টের সর্বোচ্চ সাইজ হলো `512 KB (524,288 bytes)`। তাই ক্লায়েন্ট থেকে প্রতিটি রিকোয়েস্টে `2 MB` (`4 × 512 KB`) করে ডেটা পাঠানো হবে। সার্ভার সেই ২ মেগাবাইটকে ৫১২ কিলোবাইটের ৪টি পার্টে ভাগ করে ইউজারের টেলিগ্রাম সেশনে `Api.upload.SaveFilePart` বা `Api.upload.SaveBigFilePart` দিয়ে পাঠাবে এবং শেষ ধাপে `SendMedia` দিয়ে মেসেজ সম্পন্ন করবে।
  - *কেন*: এতে কোনো সার্ভারলেস মেমোরি বা ডিস্ক লিমিট ক্র্যাশ করবে না এবং Vercel-এর 4.5 MB রিকোয়েস্ট সীমার মধ্যে থেকেই বড় ভিডিও বা আর্কাইভ ফাইল নির্বিঘ্নে আপলোড হবে।
- **সিদ্ধান্ত ২ — `RenameModal`-এ Folder Rename বাগ ফিক্স**:
  - *পদ্ধতি*: `RenameModal`-এ `item.isFolder` চেক করে ফোল্ডারের জন্য `renameFolder(item.id, cleanName)` এবং ফাইলের জন্য `renameFile(item.id, cleanName)` কল করা হবে।

---

## ৪. টেকনিক্যাল আর্কিটেকচার ও স্টেট ফ্লো (Technical Architecture & Data Strategy)

### সিস্টেম ও কম্পোনেন্ট ডায়াগ্রাম

```
┌────────────────────────────────────────────────────────────────────────────┐
│                     My Drive / Workspace Views (Grid & List)               │
│  ┌───────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │ Folder Card & File Row 3-Dot Menu │  │ DeleteConfirmationModal        │ │
│  │ • activeMenuId: string | null     │  │ • Target: File or Folder       │ │
│  │ • Open / Preview                  │  │ • Action 1: trashFile/Folder() │ │
│  │ • Rename (Fixes renameFolder)     │  │ • Action 2: permanentlyDelete  │ │
│  │ • Star / Unstar                   │  │ • Shows nested file count      │ │
│  │ • Move (for files)                │  └────────────────────────────────┘ │
│  │ • Delete / Move to Trash          │                                     │
│  └─────────────────┬─────────────────┘                                     │
└────────────────────┼───────────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                DriveContext & Chunked Upload Pipeline                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ uploadFiles(files) / retryUpload(taskId):                            │  │
│  │ • If file <= 3 MB: Single-request fast upload                        │  │
│  │ • If file > 3 MB: Slicing into 2 MB (2,097,152 bytes) chunks         │  │
│  │   ├── Step 1..N: Send chunk + fileId + partOffset + totalParts       │  │
│  │   └── Final Step: Commit InputFile / InputFileBig to Saved Messages  │  │
│  └──────────────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│              Serverless Telegram Upload Bridge & UploadQueueDrawer         │
│  • Saves 512 KB MTProto parts directly via SaveFilePart / SaveBigFilePart  │
│  • Displays live progress %, human-readable error message, & Retry button  │
└────────────────────────────────────────────────────────────────────────────┘
```

### ইন্টারেক্টিভ কম্পোনেন্ট ও স্টেট ম্যাপিং
1. **3-Dot Dropdown State (`activeMenuId`)**:
   - যেকোনো ফোল্ডার বা ফাইলের ৩-ডট বাটনে ক্লিক করলে শুধু সেই আইটেমের ড্রপডাউন মেনু খুলবে (Grid এবং List—উভয় ভিউতেই)।
   - ফোল্ডারে স্টার করা থাকলে ফোল্ডার কার্ডে স্টার ব্যাজও দেখাবে।
2. **Delete Confirmation Modal State (`deleteTarget`)**:
   - `{ id: string, name: string, isFolder: boolean, defaultMode?: 'trash' | 'permanent' }` স্টেট ধরে কনফার্মেশন পপআপ খুলবে।
   - ফোল্ডার ডিলিট করার সময় যদি ভেতরে ফাইল থাকে, তবে পপআপে সতর্কবার্তা দেখাবে এবং ফোল্ডার ট্র্যাশ বা পার্মানেন্ট ডিলিট করলে ভেতরের ফাইলগুলোও সঠিকভাবে হ্যান্ডেল করবে।
3. **Chunked Upload & Retry Handler (`retryUpload`)**:
   - `DriveContext`-এ `retryUpload(taskId: string)` ফাংশন যুক্ত করা হবে এবং `UploadQueueDrawer`-এ ফেইল হওয়া ফাইলের পাশে **Retry** বাটন ও এরর টেক্সট দেখানো হবে।
