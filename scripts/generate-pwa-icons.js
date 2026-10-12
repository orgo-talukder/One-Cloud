const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
const electronDir = path.join(__dirname, '..', 'electron');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generate() {
  const logoPath = path.join(publicDir, 'website_logo.png');

  // 1. PWA 512x512 with white background
  const inner512 = await sharp(logoPath)
    .resize(440, 440, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: inner512, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 2. PWA 192x192 with white background
  const inner192 = await sharp(logoPath)
    .resize(164, 164, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: inner192, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 3. Maskable 512x512 with safe-zone on solid white background
  const innerMaskable = await sharp(logoPath)
    .resize(380, 380, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: innerMaskable, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 4. Apple Touch Icon 180x180 with white background
  const innerApple = await sharp(logoPath)
    .resize(150, 150, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: innerApple, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 5. Desktop Electron App icon (electron/icon.png)
  if (fs.existsSync(electronDir)) {
    fs.copyFileSync(
      path.join(publicDir, 'pwa-512x512.png'),
      path.join(electronDir, 'icon.png')
    );
  }

  console.log('✅ PWA & Desktop icons successfully generated with clean white background (#FFFFFF)!');
}

generate().catch(console.error);
