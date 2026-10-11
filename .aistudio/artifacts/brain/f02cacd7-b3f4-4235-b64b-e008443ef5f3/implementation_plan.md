# Firebase Google Auth (auth/unauthorized-domain) ফিক্স ও ডায়নামিক এনভায়রনমেন্ট ভ্যারিয়েবল সাপোর্ট প্ল্যান

Google Authentication ব্যবহারের সময় `Error (auth/unauthorized-domain)` ত্রুটি নিরসন এবং Vercel বা অন্য কোনো কাস্টম হোস্টিংয়ে ব্যবহারকারীর নিজস্ব Firebase প্রজেক্ট (`one-cloud-6df65`) নির্বিঘ্নে ব্যবহারের জন্য ক্লায়েন্ট কনফিগারেশনকে গতিশীল (dynamic environment variables-driven) করার বাস্তবায়ন পরিকল্পনা।

> [!IMPORTANT] ব্যবহারকারীর রিভিউ ও নিশ্চিতকৃত সিদ্ধান্ত (Confirmed Decision):
> - **পদ্ধতি নির্বাচন:** কোডবেস সরাসরি হার্ডকোডেড না করে ডায়নামিক এনভায়রনমেন্ট ভ্যারিয়েবল (`process.env.NEXT_PUBLIC_FIREBASE_*`) সাপোর্ট যুক্ত করা হবে, যাতে Vercel-এ সেট করা ব্যবহারকারীর নিজস্ব Firebase প্রজেক্ট (`one-cloud-6df65`) অগ্রাধিকার পায় এবং লোকাল/AI Studio পরিবেশে ডিফল্ট ফাইলে নিরাপদ ফলব্যাক থাকে।
> - **অনুমোদন ব্যতিরেকে কোডিং না করার নিয়ম:** ব্যবহারকারী এই পরিকল্পনাটি দেখে 'Proceed' বাটনে ক্লিক করে অনুমোদন (Approved) দিলেই কেবল কোডিং শুরু করা হবে।

---

## ১. সমস্যার উৎস ও কারণ বিশ্লেষণ (Root Cause Analysis)

1. **প্রজেক্টের অমিল (Project Mismatch):**
   - Vercel-এ চলমান অ্যাপ্লিকেশনটি (`one-cloud-zeta.vercel.app`) কোডের ভেতরে হার্ডকোডেড থাকা AI Studio প্রজেক্টের সাথে যুক্ত ছিল (`enhanced-chassis-wsmzh`)।
   - কিন্তু ব্যবহারকারী Firebase Console-এ `one-cloud-zeta.vercel.app` ডোমেনটি Authorized Domains-এ যুক্ত করেছিলেন তার সম্পূর্ণ আলাদা নিজস্ব প্রজেক্ট **`one-cloud-6df65`**-এ।
   - ফলে রিকোয়েস্ট যাচ্ছিল `enhanced-chassis-wsmzh`-এর কাছে, যেখানে Vercel ডোমেনটি অনুমোদিত ছিল না। তাই Firebase `auth/unauthorized-domain` এরর প্রদর্শন করছিল।

2. **এনভায়রনমেন্ট ভ্যারিয়েবল অবহেলা (Environment Variables Ignored):**
   - `/lib/firebase/client.ts` ফাইলে কোনো `process.env.NEXT_PUBLIC_FIREBASE_*` চেক ছিল না; এটি কেবল সরাসরি `firebase-applet-config.json` ইমপোর্ট করছিল। ফলে Vercel ড্যাশবোর্ডে ভ্যারিয়েবল যুক্ত করা হলেও কোড তা রিড করছিল না।

3. **ইউজার ফ্রেন্ডলি এরর বার্তার অভাব:**
   - ব্রাউজারে র কোড `Error (auth/unauthorized-domain)` সরাসরি প্রদর্শন করছিল, যা সাধারণ ব্যবহারকারীর কাছে বোধগম্য নয়।

---

## ২. আর্কিটেকচার ও কনফিগারেশন ফ্লো (Configuration Flow Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FIREBASE CLIENT INITIALIZATION                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Check process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID                           │
│                                                                             │
│ ├── [YES: Vercel / Custom Env Set] ───────────────────────────────────────┐ │
│ │   Use process.env.NEXT_PUBLIC_FIREBASE_* (Your 'one-cloud-6df65' Project)│ │
│ │   • apiKey: NEXT_PUBLIC_FIREBASE_API_KEY                                 │ │
│ │   • authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN                         │ │
│ │   • projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID                           │ │
│ │   • storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET                   │ │
│ │   • messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID          │ │
│ │   • appId: NEXT_PUBLIC_FIREBASE_APP_ID                                   │ │
│ │                                                                          │ │
│ └── [NO: Local Dev / AI Studio Default] ──────────────────────────────────┐│ │
│     Fallback to firebase-applet-config.json                                ││ │
│     (Safe fallback ensures app never crashes without env vars)             ││ │
└───────────────────────────────────────────────────────────────────────────┴─┴─┘
                                      │
                                      ▼
                        Initialize Firebase App & Auth
                                      │
                                      ▼
      Google Sign-In Popup matches Authorized Domain on active project!
```

---

## ৩. প্রধান পরিবর্তনসমূহ (Key Changes to Implement)

### ১. `/lib/firebase/client.ts` পুনঃলিখন:
- কনফিগারেশন অবজেক্টটিকে ডায়নামিক করা:
  ```ts
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultFileConfig.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultFileConfig.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultFileConfig.projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultFileConfig.storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultFileConfig.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultFileConfig.appId,
  };
  ```
- Firestore ডাটাবেস ইনিশিয়ালাইজেশনকে সুরক্ষিত রাখা (যদি কাস্টম ডাটাবেস আইডি ভ্যারিয়েবল দেওয়া থাকে তা গ্রহণ করবে, নতুবা ডিফল্ট ডাটাবেস ব্যবহার করবে)।

### ২. `/app/login/page.tsx` ও `/app/signup/page.tsx`-এ স্পষ্ট এরর হ্যান্ডলিং:
- যদি Firebase থেকে `auth/unauthorized-domain` এরর আসে, তখন ইউজারকে স্পষ্ট নির্দেশনামূলক বার্তা দেখানো:
  - *"This domain is not authorized for Google Sign-In in Firebase. Please add this domain to Authorized Domains in your Firebase Console under Authentication > Settings > Authorized domains."*
- যাতে ডেভেলপার বা ব্যবহারকারী সাথে সাথে বুঝতে পারেন কোনো ডোমেন মিসিং আছে কিনা।

### ৩. `.env.example` আপডেট:
- Vercel-এ সেট করার জন্য সমস্ত প্রয়োজনীয় ভ্যারিয়েবলের স্পষ্ট ফরম্যাট ও গাইড যুক্ত করা।

---

## ৪. ব্যবহারকারীর জন্য Vercel সেটআপ নির্দেশিকা (Action for You on Vercel)

কোড পরিবর্তনের পর আপনার Vercel ড্যাশবোর্ডে নিচের ভ্যারিয়েবলগুলো যোগ করে রিডিপ্লয় (Redeploy) করতে হবে:
1. `NEXT_PUBLIC_FIREBASE_API_KEY` = আপনার `one-cloud-6df65` প্রজেক্টের Web API Key
2. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `one-cloud-6df65.firebaseapp.com`
3. `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `one-cloud-6df65`
4. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `one-cloud-6df65.firebasestorage.app`
5. `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = আপনার প্রজেক্টের Sender ID
6. `NEXT_PUBLIC_FIREBASE_APP_ID` = আপনার Web App ID

---

## ৫. ধাপভিত্তিক বাস্তবায়ন রোডম্যাপ (Implementation Roadmap)

1. **ক্লায়েন্ট কনফিগারেশন আপডেট:** `/lib/firebase/client.ts` আপডেট করে ডায়নামিক এনভায়রনমেন্ট ভ্যারিয়েবল সাপোর্ট দেওয়া।
2. **লগইন ও সাইনআপ পেজের এরর হ্যান্ডলার আপডেট:** `auth/unauthorized-domain` এর জন্য পরিষ্কার বার্তা প্রদান।
3. **কম্পাইলেশন ও বিল্ড ভেরিফিকেশন:** `compile_applet` ও `lint_applet` চালিয়ে বিল্ড সফল নিশ্চিত করা।
