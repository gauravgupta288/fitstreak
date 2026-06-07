import sharp from 'sharp';
import { mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SOURCE = join(__dirname, 'public', 'logo.png');
const RES_DIR = join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Android mipmap icon sizes (standard launcher icon sizes)
const MIPMAP_SIZES = {
  'mipmap-mdpi':    { launcher: 48,  foreground: 108 },
  'mipmap-hdpi':    { launcher: 72,  foreground: 162 },
  'mipmap-xhdpi':   { launcher: 96,  foreground: 216 },
  'mipmap-xxhdpi':  { launcher: 144, foreground: 324 },
  'mipmap-xxxhdpi': { launcher: 192, foreground: 432 },
};

async function generateIcons() {
  console.log('🎨 Generating Android app icons from logo.png...\n');

  for (const [folder, sizes] of Object.entries(MIPMAP_SIZES)) {
    const outDir = join(RES_DIR, folder);
    mkdirSync(outDir, { recursive: true });

    // 1. Generate ic_launcher.png (square icon with slight rounding)
    const launcherPath = join(outDir, 'ic_launcher.png');
    await sharp(SOURCE)
      .resize(sizes.launcher, sizes.launcher, { fit: 'cover' })
      .png()
      .toFile(launcherPath);
    console.log(`  ✅ ${folder}/ic_launcher.png (${sizes.launcher}x${sizes.launcher})`);

    // 2. Generate ic_launcher_round.png (circular icon)
    const roundSize = sizes.launcher;
    const roundMask = Buffer.from(
      `<svg width="${roundSize}" height="${roundSize}">
        <circle cx="${roundSize / 2}" cy="${roundSize / 2}" r="${roundSize / 2}" fill="white"/>
      </svg>`
    );
    const roundPath = join(outDir, 'ic_launcher_round.png');
    await sharp(SOURCE)
      .resize(roundSize, roundSize, { fit: 'cover' })
      .composite([{ input: roundMask, blend: 'dest-in' }])
      .png()
      .toFile(roundPath);
    console.log(`  ✅ ${folder}/ic_launcher_round.png (${roundSize}x${roundSize} circular)`);

    // 3. Generate ic_launcher_foreground.png (adaptive icon foreground)
    // Foreground has 18dp padding on each side (for safe zone)
    // We place the logo in the center ~66% of the foreground canvas
    const fgSize = sizes.foreground;
    const logoSize = Math.round(fgSize * 0.66);
    const offset = Math.round((fgSize - logoSize) / 2);

    const resizedLogo = await sharp(SOURCE)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const fgPath = join(outDir, 'ic_launcher_foreground.png');
    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: resizedLogo, left: offset, top: offset }])
      .png()
      .toFile(fgPath);
    console.log(`  ✅ ${folder}/ic_launcher_foreground.png (${fgSize}x${fgSize} adaptive fg)`);
    console.log('');
  }

  console.log('🎉 All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
