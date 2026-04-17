import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src/wordpress/Kayak Tours');
const DIST_IMG_BASE = path.join(ROOT_DIR, 'dist/server/common/umiack-site-assets/img/tours');

const SIZES = [400, 800, 1200, 1600];

/**
 * Converts a string into a URL-safe slug.
 * - Lowercase
 * - Spaces/Underscores to Hyphens
 * - Remove non-alphanumeric characters (except hyphens)
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')     // Replace spaces and underscores with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars (keeps a-z, 0-9, _) -- wait, \w includes _
    .replace(/[^\w-]+/g, '')     // Let's be explicit:
    .replace(/[^a-z0-9-]/g, '')  // Keep only a-z, 0-9, and -
    .replace(/-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
}

async function optimizeImages() {
  console.log('🚀 Starting professional image optimization pipeline...');

  // Ensure dist base dir exists
  await fs.mkdir(DIST_IMG_BASE, { recursive: true });

  // Get all directories (tours) in SRC_DIR
  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true });
  const tours = entries.filter(e => e.isDirectory());

  for (const tour of tours) {
    const tourName = tour.name;
    const tourPath = path.join(SRC_DIR, tourName);
    const jsonPath = path.join(tourPath, 'images.json');
    const imgDir = path.join(tourPath, 'img');

    try {
      await fs.access(jsonPath);
    } catch {
      // console.log(`⏩ Skipping ${tourName}: No images.json found.`);
      continue;
    }

    const tourSlug = slugify(tourName) || tourName;
    console.log(`\n📦 Processing tour: ${tourName} (Slug: ${tourSlug})`);
    const imagesJson = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
    const manifest = [];

    // Sort by "order" field
    const sortedImages = imagesJson.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Create tour-specific dist dir
    const tourDistDir = path.join(DIST_IMG_BASE, tourSlug);
    await fs.mkdir(tourDistDir, { recursive: true });

    for (const imgSpec of sortedImages) {
      const fileName = imgSpec.file;
      const srcPath = path.join(imgDir, fileName);
      const baseName = path.parse(fileName).name;

      try {
        await fs.access(srcPath);
      } catch {
        console.error(`  ❌ Error: Source file not found: ${srcPath}`);
        continue;
      }

      console.log(`  🖼  Optimizing: ${fileName}`);
      const responsiveData = {
        original: fileName,
        alt: imgSpec.alt || '',
        variants: []
      };

      for (const size of SIZES) {
        // Generate WebP
        const webpName = `${baseName}-${size}w.webp`;
        const webpDistPath = path.join(tourDistDir, webpName);
        
        await sharp(srcPath)
          .rotate()
          .resize(size, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(webpDistPath);
        
        // Generate JPG
        const jpgName = `${baseName}-${size}w.jpg`;
        const jpgDistPath = path.join(tourDistDir, jpgName);
        
        await sharp(srcPath)
          .rotate()
          .resize(size, null, { withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(jpgDistPath);

        responsiveData.variants.push({
          width: size,
          webp: `/common/umiack-site-assets/img/tours/${tourSlug}/${webpName}`,
          jpg: `/common/umiack-site-assets/img/tours/${tourSlug}/${jpgName}`
        });
      }

      manifest.push(responsiveData);
    }

    // Write manifest for this tour
    const manifestPath = path.join(tourDistDir, 'images-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`  ✅ Generated manifest: ${manifestPath}`);
  }

  console.log('\n✨ Image optimization complete!');
}

optimizeImages().catch(err => {
  console.error('💥 Critical error during image optimization:', err);
  process.exit(1);
});
