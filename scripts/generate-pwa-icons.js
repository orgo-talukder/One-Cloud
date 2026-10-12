const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Beautiful One Cloud SVG icon
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141A24" />
      <stop offset="100%" stop-color="#0B0E13" />
    </linearGradient>
    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E0F2FE" />
    </linearGradient>
    <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#3B82F6" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Rounded App Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#293241" stroke-width="4" />

  <!-- Ambient Glow Behind Cloud -->
  <circle cx="256" cy="245" r="150" fill="url(#glowGrad)" />

  <!-- Cloud Shape -->
  <g filter="url(#dropGlow)">
    <path
      d="M372 320 H164 C124.2 320 92 287.8 92 248 C92 211.2 119.8 180.8 155.6 176.6 C169.6 138.8 206 112 248 112 C299.6 112 342.4 149.4 350.8 199.6 C382.4 204.6 408 231.8 408 266 C408 295.8 391.8 320 372 320 Z"
      fill="url(#cloudGrad)"
    />
  </g>

  <!-- Modern One Cloud Accent / Telegram Paper Plane Emblem -->
  <g transform="translate(186, 178) scale(0.58)">
    <path
      d="M246 16 L22 108 L114 148 L152 236 L180 178 L228 214 L246 16 Z"
      fill="url(#planeGrad)"
      opacity="0.95"
    />
    <path
      d="M114 148 L228 44 L152 178 L114 148 Z"
      fill="#CBD5E1"
      opacity="0.8"
    />
  </g>
</svg>
`;

// Maskable SVG with safe 15% inner padding
const svgMaskableContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141A24" />
      <stop offset="100%" stop-color="#0B0E13" />
    </linearGradient>
    <linearGradient id="cloudGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
    <linearGradient id="planeGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E0F2FE" />
    </linearGradient>
    <filter id="dropGlowM" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#3B82F6" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Full Bleed Background for Android Squircle/Circle Crop -->
  <rect width="512" height="512" fill="url(#bgGradM)" />

  <!-- Scaled down to 74% inside safe zone -->
  <g transform="translate(66.56, 66.56) scale(0.74)">
    <g filter="url(#dropGlowM)">
      <path
        d="M372 320 H164 C124.2 320 92 287.8 92 248 C92 211.2 119.8 180.8 155.6 176.6 C169.6 138.8 206 112 248 112 C299.6 112 342.4 149.4 350.8 199.6 C382.4 204.6 408 231.8 408 266 C408 295.8 391.8 320 372 320 Z"
        fill="url(#cloudGradM)"
      />
    </g>
    <g transform="translate(186, 178) scale(0.58)">
      <path
        d="M246 16 L22 108 L114 148 L152 236 L180 178 L228 214 L246 16 Z"
        fill="url(#planeGradM)"
        opacity="0.95"
      />
      <path
        d="M114 148 L228 44 L152 178 L114 148 Z"
        fill="#CBD5E1"
        opacity="0.8"
      />
    </g>
  </g>
</svg>
`;

async function generate() {
  const svgBuffer = Buffer.from(svgContent);
  const maskableSvgBuffer = Buffer.from(svgMaskableContent);

  // Write base SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

  // 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 Maskable PNG
  await sharp(maskableSvgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 180x180 Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 32x32 Favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✅ PWA icons successfully generated in /public directory!');
}

generate().catch(console.error);
