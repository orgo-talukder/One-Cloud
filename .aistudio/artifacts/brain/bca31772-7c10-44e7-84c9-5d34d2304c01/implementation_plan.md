# One Cloud — High-Speed Parallel MTProto Upload (আর্কিটেকচার ১) ও রিয়েল-টাইম ETA ইমপ্লিমেন্টেশন প্ল্যান

এই ইমপ্লিমেন্টেশন প্ল্যানটির লক্ষ্য হলো **Vercel-এ রেখেই এবং ১০০% সিকিউরিটি (`AES-256-GCM` সেশন এনক্রিপশন ও গোপন `API_HASH`) অক্ষুণ্ণ রেখেই** ফাইল আপলোডের গতি **৫ থেকে ৮ গুণ বৃদ্ধি করা** এবং প্রতিটি ফাইলের আপলোডে **আসল রিয়েল-টাইম ট্রান্সফার স্পিড (`MB/s` / `KB/s`), আপলোডেড বাইটস (`8.0 MB / 13.9 MB`), এবং নির্ভুল বাকি সময় (`Real ETA`)** প্রদর্শন করা।

---

## ইউজার রিভিউ ও নিশ্চিতকৃত সিদ্ধান্তসমূহ (Confirmed Decisions)

> [!IMPORTANT]
> আপনার দেওয়া উত্তরগুলোর ওপর ভিত্তি করে নিচের ২টি প্রধান সিদ্ধান্ত চূড়ান্ত করা হয়েছে:

- **সিদ্ধান্ত ১ — রিয়েল-টাইম আপলোড মেট্রিক্স ও আসল ETA প্রদর্শন**: Upload Queue Drawer-এ কোনো অনুমানভিত্তিক বা ফেইক টাইমার ব্যবহার করা হবে না। ব্রাউজার থেকে প্রকৃতপক্ষে কত বাইট ডেটা কত মিলিসেকেন্ডে (`performance.now()`) আপলোড সম্পন্ন হয়েছে তার ওপর ভিত্তি করে **Live Speed (`MB/s` বা `KB/s`), Uploaded Size (`X MB / Total MB`), এবং Real Remaining Time (`ETA`, যেমন `~14s left` বা `~2m 10s left`)** দেখানো হবে।
- **সিদ্ধান্ত ২ — 3x Parallel 2MB Workers + 4x Sub-Part Concurrency + Connection Pool**:
  1. **ব্রাউজার লেভেলে**: বড় ফাইলের জন্য একসাথে **৩টি প্যারালাল ২ মেগাবাইট ওয়ার্কার (3 Concurrent 2MB Workers = 6 MB In-Flight)** কাজ করবে।
  2. **সার্ভার লেভেলে**: প্রতিটি ২ মেগাবাইট চাঙ্কের ভেতরের ৪টি `512 KB` MTProto পার্ট `Promise.all` দিয়ে **একই সাথে (4x Sub-Part Concurrency)** টেলিগ্রামে পাঠানো হবে।
  3. **কানেকশন লেভেলে**: প্রতিটি চাঙ্কে বারবার `client.connect()` ও `client.disconnect()` না করে **MTProto Connection Pool (Keep-Alive Client Cache)** ব্যবহার করা হবে, যাতে কানেকশন ওভারহেড শূন্যে নেমে আসে।

---

## ১. কেন এই আর্কিটেকচারটি ৫–৮ গুণ দ্রুত এবং ১০০% সিকিউর? (Architecture Overview)

### ক) স্পিড বৃদ্ধির ৩টি স্তর (3-Layer Acceleration)
1. **স্তর ১ — MTProto Keep-Alive Connection Pool (0ms Handshake)**:
   - আগে প্রতিটি ২ MB চাঙ্কের জন্য নতুন করে টেলিগ্রাম সার্ভারে TCP + MTProto হ্যান্ডশেক (`client.connect()`) হতো, যাতে প্রতি চাঙ্কে ১.৫–৩ সেকেন্ড নষ্ট হতো।
   - এখন সার্ভার মেমোরিতে ইউজারের কানেক্টেড `TelegramClient` পুল (`globalThis.tgClientPool`) হিসেবে **Keep-Alive** থাকবে (৯০ সেকেন্ড আইডল TTL সহ)। ফলে প্রথম চাঙ্কের পর বাকি সব চাঙ্কে কানেকশন হতে **০ মিলিসেকেন্ড** সময় লাগবে।
2. **স্তর ২ — 4x Intra-Chunk Parallelism (`Promise.all`)**:
   - প্রতিটি ২ মেগাবাইট চাঙ্কের ভেতরে ৪টি `512 KB` পার্ট থাকে। আগে এগুলো `for` লুপে একটার পর একটা যেত। এখন ৪টি পার্টই `Promise.all` দিয়ে **একসাথে (Simultaneously)** টেলিগ্রামের `SaveBigFilePart`-এ পাঠানো হবে।
3. **স্তর ৩ — 3x Browser Parallel Workers + Two-Phase Commit**:
   - ব্রাউজার ফাইলটিকে ২ মেগাবাইট চাঙ্কে ভাগ করে একটি ওয়ার্কার পুলের মাধ্যমে **একসাথে ৩টি চাঙ্ক (`mode: 'chunk'`)** পাঠাবে।
   - যেহেতু প্যারালাল আপলোডে চাঙ্ক ১, ২, ৩ যেকোনো ক্রমে শেষ হতে পারে, তাই সবগুলো চাঙ্ক ১০০% আপলোড হওয়ার পর ব্রাউজার চূড়ান্ত ধাপে একটি হালকা **`mode: 'commit'`** রিকোয়েস্ট পাঠাবে, যা টেলিগ্রামের Saved Messages-এ ফাইলটি সংরক্ষণ করবে।

### খ) কীভাবে ১০০% রিয়েল-টাইম (নন-ফেইক) ETA ও স্পিড গণনা করা হবে?
- কোনো কৃত্রিম কাউন্টডাউন বা `setInterval` ফেইক টাইমার ব্যবহার করা হবে না।
- প্রতিটি ফাইল আপলোড শুরু হওয়ার মুহূর্তে `startTime = performance.now()` এবং একটি **Sliding Window Byte Tracker** (সর্বশেষ সম্পন্ন হওয়া চাঙ্কগুলোর প্রকৃত বাইট ও প্রকৃত অতিবাহিত সময় `elapsedSeconds`) রেকর্ড করা হবে:
  - **প্রকৃত আপলোডেড বাইটস (`uploadedBytes`)**: প্রতিটি চাঙ্ক বা ছোট ফাইলের রিকোয়েস্ট সম্পন্ন হওয়ার সাথে সাথে প্রকৃত পাঠানো বাইট যোগ হবে (এবং `XMLHttpRequest upload.onprogress` ব্যবহার করে ইন-ফ্লাইট প্রতিটি বাইটের লাইভ ট্র্যাকিং হবে!)।
  - **প্রকৃত নেটওয়ার্ক স্পিড (`speedBytesPerSec`)**:
    $$\text{Speed (Bytes/sec)} = \frac{\text{Actual Bytes Transferred}}{\text{Actual Elapsed Seconds}}$$
  - **প্রকৃত বাকি সময় (`etaSeconds`)**:
    $$\text{Remaining Bytes} = \text{Total File Size} - \text{Actual Uploaded Bytes}$$
    $$\text{ETA (Seconds)} = \left\lceil \frac{\text{Remaining Bytes}}{\text{Measured Speed (Bytes/sec)}} \right\rceil$$
- যদি নেটওয়ার্ক স্পিড কমে যায়, তবে সাথে সাথে রিয়েল-টাইমে ETA বাড়বে; আর নেটওয়ার্ক স্পিড বাড়লে সাথে সাথে ETA কমে আসবে।

---

## ২. সিস্টেম ও ডেটা ফ্লো ডায়াগ্রাম (System & Data Flow Architecture)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     Browser Client (DriveContext & XHR Pool)                 │
│                                                                              │
│  File (e.g. 13.9 MB or 2 GB)                                                 │
│   ├── Sliced into 2 MB (4 × 512 KB) MTProto-aligned chunks                   │
│   ├── 3 Parallel Workers (Worker 1, Worker 2, Worker 3)                      │
│   │    ├── Real-time XHR upload.onprogress tracks exact bytes sent           │
│   │    ├── Live Speed = actualUploadedBytes / elapsedSeconds                 │
│   │    └── Live ETA   = (totalBytes - actualUploadedBytes) / liveSpeed       │
│   └── Phase 2: When all chunks finish -> Sends `mode: 'commit'`              │
└───────────────────┬──────────────────────┬──────────────────────┬────────────┘
                    │ Worker 1 (2 MB)      │ Worker 2 (2 MB)      │ Worker 3 (2 MB)
                    ▼                      ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                  Vercel Serverless API (/api/telegram/upload)                │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Warm MTProto Connection Pool (Keep-Alive TelegramClient per Session)   │  │
│  │ • Reuses active encrypted MTProto DC connection (0ms reconnect delay)  │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────▼────────────────────────────────────┐  │
│  │ 4x Parallel Sub-Part Sender (Promise.all)                              │  │
│  │ • PartOffset + 0 (512 KB) ──┐                                          │  │
│  │ • PartOffset + 1 (512 KB) ──┼──► Concurrent Api.upload.SaveBigFilePart │  │
│  │ • PartOffset + 2 (512 KB) ──┤                                          │  │
│  │ • PartOffset + 3 (512 KB) ──┘                                          │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────▼────────────────────────────────────┐  │
│  │ Final Commit (`mode: 'commit'`)                                        │  │
│  │ • Invokes client.sendFile('me', InputFileBig / InputFile)              │  │
│  │ • Returns Telegram messageId & file metadata to save in Firestore      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## ৩. ইউজার ইন্টারফেস ও অভিজ্ঞতা (Upload Queue Drawer UI)

### Upload Queue Drawer-এ রিয়েল-টাইম তথ্য প্রদর্শন
প্রতিটি আপলোড হতে থাকা ফাইলের রো-তে নিচের তথ্যগুলো লাইভ আপডেট হবে:
1. **ফাইলের নাম ও স্ট্যাটাস ব্যাজ**: যেমন `IDM_Life_Time_Free.mp4` এবং ডানপাশে প্রকৃত শতাংশ (`64%`)।
2. **লাইভ ট্রান্সফার মেট্রিক্স লাইন (Monospace Tabular Numbers)**:
   - **Uploaded / Total Size**: `8.9 MB / 13.9 MB`
   - **Real-Time Speed**: `2.4 MB/s` (অথবা ধীর নেটওয়ার্কে `480 KB/s`)
   - **Real-Time Remaining Time (ETA)**: `~2s left` / `~1m 15s left` / `Finalizing in Telegram...` (যখন শেষ ধাপে মেসেজ কমিট হচ্ছে)।
3. **Header Summary**: একাধিক ফাইল আপলোড হলে হেডারে মোট কয়টি ফাইল আপলোড হচ্ছে এবং সামগ্রিক স্পিড ও অগ্রগতি দেখাবে।
