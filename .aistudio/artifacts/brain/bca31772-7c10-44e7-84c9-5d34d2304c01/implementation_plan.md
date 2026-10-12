# One Cloud — আল্ট্রা-ফাস্ট আপলোড ও ডাউনলোড অপ্টিমাইজেশন প্ল্যান (Singapore `sin1` + 8x Burst Upload + Parallel Chunked Download & Streaming)

এই ইমপ্লিমেন্টেশন প্ল্যানটির লক্ষ্য হলো আপনার **One Cloud** অ্যাপের **Upload এবং Download উভয় স্পিড সর্বোচ্চ পর্যায়ে (৩ থেকে ১০ গুণ দ্রুত)** নিয়ে যাওয়া, বড় ফাইল ডাউনলোডে মেমোরি বা টাইমআউট সমস্যা স্থায়ীভাবে দূর করা, এবং আপলোডের মতো ডাউনলোডেও **আসল রিয়েল-টাইম স্পিড (`MB/s`), ডাউনলোডেড সাইজ (`MB / MB`), এবং নির্ভুল বাকি সময় (`Real ETA`)** প্রদর্শন করা।

---

## ইউজার রিভিউ ও নিশ্চিতকৃত সিদ্ধান্তসমূহ (Confirmed Decisions)

> [!IMPORTANT]
> আপনার দেওয়া উত্তরগুলোর ওপর ভিত্তি করে নিচের ২টি প্রধান সিদ্ধান্ত চূড়ান্ত করা হয়েছে:

- **সিদ্ধান্ত ১ — IDM-স্টাইল প্যারালাল চাঙ্কড ডাউনলোড + রিয়েল-টাইম স্পিড/ETA + স্ট্রিমিং**:
  - ইউজার যখন কোনো ফাইলে **Download** ক্লিক করবেন, তখন ফাইলটি পুরোপুরি সার্ভারে বাফার হওয়ার জন্য অপেক্ষা না করে **৩–৪টি প্যারালাল চাঙ্ক ওয়ার্কারের (`4 MB` রেঞ্জ চাঙ্ক)** মাধ্যমে একসাথে নামানো হবে এবং নিচের Queue Drawer-এ **লাইভ ডাউনলোড স্পিড (`MB/s`), ডাউনলোড হওয়া সাইজ (`MB / MB`), ও আসল বাকি সময় (`Real ETA`)** দেখানো হবে।
  - পাশাপাশি সরাসরি ব্রাউজার প্রিভিউ বা স্ট্রিমিংয়ের জন্য **`ReadableStream` + `client.iterDownload` (Zero-Wait HTTP Streaming)** যুক্ত থাকবে।
- **সিদ্ধান্ত ২ — Vercel Singapore (`sin1`) Serverless Region**:
  - `vercel.json` ফাইলে ফাংশন রিজিয়ন **`sin1` (Singapore)** কনফিগার করা হবে, যাতে বাংলাদেশ/দক্ষিণ এশিয়া থেকে আমেরিকা (`iad1`) ঘুরে যাওয়ার বদলে সরাসরি সিঙ্গাপুরের মাধ্যমে টেলিগ্রাম ডেটাসেন্টারে (`DC5 Singapore`, মাত্র ২–৫ms দূরত্ব) ডেটা আদান-প্রদান হয়।

---

## ১. কেন এই ৩টি পরিবর্তনে স্পিড বহুগুণ বৃদ্ধি পাবে? (Architecture Overview)

### ক) পরিবর্তন ১ — Vercel `sin1` (Singapore) রিজিয়ন রাউটিং (`vercel.json`)
- **আগের সমস্যা**: আপনার আগের বিল্ড লগে দেখা গেছে Vercel আপনার সার্ভারলেস ফাংশনটি **আমেরিকার ওয়াশিংটনে (`iad1`)** রান করছিল। ফলে প্রতিটি রিকোয়েস্টকে `বাংলাদেশ ➔ আমেরিকা (১৪,০০০ কিমি) ➔ সিঙ্গাপুর টেলিগ্রাম সার্ভার (১৫,০০০ কিমি)` ভ্রমণ করতে হতো (প্রায় ৩০০–৪৫০ms ল্যাটেন্সি)।
- **নতুন সমাধান**: `vercel.json`-এ `"regions": ["sin1"]` যুক্ত করার ফলে আপনার এপিআই ফাংশনগুলো সরাসরি **সিঙ্গাপুরে** রান করবে। টেলিগ্রামের এশিয়া ডেটাসেন্টারও (`DC5`) সিঙ্গাপুরে অবস্থিত হওয়ায় Vercel থেকে Telegram-এর দূরত্ব হবে মাত্র **২ মিলিসেকেন্ড**!

### খ) পরিবর্তন ২ — আল্ট্রা-ফাস্ট আপলোড (`4 Parallel Workers` + `8x Sub-Part Burst`)
- **ব্রাউজার লেভেলে**: প্যারালাল ওয়ার্কার সংখ্যা **৪টি (`PARALLEL_WORKERS = 4`)** করা হবে, যাতে ব্রাউজার থেকে একসাথে সর্বোচ্চ **~১৬.৮ MB** ডেটা পাইপলাইনে (In-Flight) থাকে।
- **সার্ভার লেভেলে**: প্রতিটি ৪.২ MB (`8 × 512 KB`) চাঙ্কের ভেতরের ৮টি পার্ট আগে ৪টি + ৪টি করে ২ ধাপে যেত। এখন **`SUB_PART_CONCURRENCY = 8`** করে পুরো চাঙ্কের ৮টি `512 KB` পার্টই `Promise.all` দিয়ে **একই সাথে ১ বারে (Single Burst)** টেলিগ্রামে পাঠানো হবে।

### গ) পরিবর্তন ৩ — প্যারালাল চাঙ্কড ডাউনলোড ও Zero-Wait HTTP Streaming
- **আগের সমস্যা**: আগে ডাউনলোডে ক্লিক করলে `client.downloadMedia(message)` পুরো ফাইলটি (যেমন ২০ MB বা ২০০ MB) ১টি থ্রেডে সার্ভারের মেমোরিতে নামাত—যাতে অনেক সময় লাগত এবং ৪.৫ মেগাবাইটের বড় ফাইলে Vercel-এ এরর বা টাইমআউট হওয়ার ঝুঁকি ছিল।
- **নতুন সমাধান**:
  1. **Parallel Range/Chunk Download API (`offset` & `limit`)**: ডাউনলোড এপিআইতে GramJS-এর `client.iterDownload({ offset, limit, requestSize: 512 * 1024 })` ব্যবহার করে যেকোনো নির্দিষ্ট বাইট রেঞ্জ (যেমন `4 MB` চাঙ্ক) নামানোর সুবিধা যুক্ত করা হবে।
  2. **Browser 3x/4x Parallel Download Engine**: ব্রাউজার ফাইলটিকে `4 MB` চাঙ্কে ভাগ করে একসাথে **৩টি প্যারালাল ওয়ার্কার** দিয়ে ডাউনলোড করবে (ঠিক IDM-এর মতো), রিয়েল-টাইম স্পিড ও ETA দেখাবে, এবং সম্পন্ন হওয়ার সাথে সাথে ব্রাউজারে ফাইলটি সেভ (`BlobDownload`) করে দেবে।
  3. **Zero-Wait `ReadableStream` Streaming**: সরাসরি লিংক বা মিডিয়া প্রিভিউর ক্ষেত্রে প্রথম `512 KB` পাওয়ার সাথে সাথেই ওয়েব `ReadableStream` দিয়ে ব্রাউজারে স্ট্রিম করা হবে।

---

## ২. সিস্টেম ও ডেটা ফ্লো ডায়াগ্রাম (System & Data Flow Architecture)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     Browser Client (One Cloud Web App)                       │
│                                                                              │
│  [UPLOAD ENGINE]                         [DOWNLOAD ENGINE (IDM-Style)]       │
│  • 4 Parallel Workers (~4.2 MB each)     • 3 Parallel Workers (4 MB chunks)  │
│  • Live XHR upload.onprogress            • Live XHR onprogress byte tracker  │
│  • Real-Time Speed (MB/s) & ETA          • Real-Time Speed (MB/s) & ETA      │
└───────────────────┬──────────────────────────────────────┬───────────────────┘
                    │ Low-Latency Asia Route (~40ms)       │
                    ▼                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│              Vercel Serverless API — Singapore Region (`sin1`)               │
│                                                                              │
│  • Warm MTProto Connection Pool (0ms Reconnect Overhead)                     │
│  • Upload: 8x Sub-Part Burst (All 8 × 512KB parts sent in 1 Promise.all)     │
│  • Download Mode A: Byte-Range Chunk Fetch (`iterDownload` offset + limit)   │
│  • Download Mode B: Zero-Wait Web `ReadableStream` direct streaming          │
└─────────────────────────────────────────┬────────────────────────────────────┘
                                          │ Ultra-Fast Local Hop (~2ms)
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Telegram MTProto Data Center (Singapore)                  │
│                     • Saved Messages ('me') Cloud Storage                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## ৩. যে ফাইলগুলো তৈরি ও আপডেট করা হবে (Planned File Changes)

1. **`/vercel.json` (নতুন ফাইল)**:
   - Vercel Serverless Function-এর রিজিয়ন সিঙ্গাপুরে (`"regions": ["sin1"]`) সেট করা এবং আপলোড ও ডাউনলোড এপিআই রাউটের জন্য `maxDuration: 60` কনফিগার করা।
2. **`/lib/telegram/service.ts`**:
   - `uploadChunkToSavedMessages`-এ `SUB_PART_CONCURRENCY = 8` করা যাতে পুরো ৪.২ MB চাঙ্কের ৮টি `512 KB` পার্ট এক ঝটকায় টেলিগ্রামে আপলোড হয়।
   - নতুন `downloadChunkFromSavedMessages({ sessionToken, messageId, offset, limit })` মেথড যুক্ত করা, যা GramJS-এর `iterDownload` দিয়ে নির্দিষ্ট বাইট রেঞ্জ উচ্চগতিতে ডাউনলোড করবে।
   - নতুন `streamFromSavedMessages({ sessionToken, messageId })` মেথড যুক্ত করা, যা `ReadableStream` হিসেবে ফাইল স্ট্রিম করবে।
3. **`/app/api/telegram/download/[fileId]/route.ts`**:
   - প্যারালাল চাঙ্ক ডাউনলোডের জন্য `offset` ও `limit` কুয়েরি প্যারামিটার সাপোর্ট করা (যাতে প্রতিটি চাঙ্ক ৪ MB বা তার কম থাকে এবং কখনোই Vercel-এর ৪.৫ MB রেসপন্স লিমিটে আটকে না যায়)।
   - সাধারণ গెట్ রিকোয়েস্টের জন্য র‍্যামে পুরো ফাইল বাফার না করে সরাসরি `ReadableStream` স্ট্রিমিং রেসপন্স রিটার্ন করা।
4. **`/lib/drive/types.ts` এবং `/lib/drive/drive-context.tsx`**:
   - আপলোডে `PARALLEL_WORKERS = 4` করা।
   - নতুন `downloadFile(file: FileItem)` ফাংশন যুক্ত করা, যা ছোট ফাইল সরাসরি এবং বড় ফাইল **৩টি প্যারালাল ৪ MB ওয়ার্কারের** মাধ্যমে ডাউনলোড করবে ও রিয়েল-টাইম স্পিড (`MB/s`), ডাউনলোডেড সাইজ (`MB / MB`), ও `Real ETA` ট্র্যাক করবে।
5. **`/components/modals/UploadQueueDrawer.tsx` ও Drive পেজসমূহ**:
   - নিচের Queue Drawer-এ Upload এবং Download উভয় ধরনের টাস্কের রিয়েল-টাইম প্রগ্রেস, স্পিড (`MB/s`), সাইজ (`MB / MB`), আসল ETA, Cancel এবং Retry বাটন দেখানো।
   - সব পেজের (`My Drive`, `Folder View`, `Recent`, `Starred`, `FilePreviewModal`) Download বাটনগুলোকে নতুন হাই-স্পিড প্যারালাল ডাউনলোড ইঞ্জিনের সাথে যুক্ত করা।
