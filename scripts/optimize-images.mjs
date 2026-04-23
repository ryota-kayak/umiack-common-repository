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
    .replace(/[^a-z0-9-]/g, '')  // Keep only a-z, 0-9, and -
    .replace(/-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
}

/**
 * Process a set of images defined by an images.json and source directory.
 * Outputs optimized images and a manifest to the specified dist directory.
 * 
 * @param {string} jsonPath - Path to the images.json file
 * @param {string} imgDir - Path to the directory containing source images
 * @param {string} distDir - Path to the output directory for optimized images
 * @param {string} serverBasePath - Server-relative base path for manifest URLs
 */
async function processImageSet(jsonPath, imgDir, distDir, serverBasePath) {
  const imagesJson = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
  const manifest = [];

  // Sort by "order" field
  const sortedImages = imagesJson.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Create dist dir
  await fs.mkdir(distDir, { recursive: true });

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
      const webpDistPath = path.join(distDir, webpName);
      
      await sharp(srcPath)
        .rotate()
        .resize(size, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpDistPath);
      
      // Generate JPG
      const jpgName = `${baseName}-${size}w.jpg`;
      const jpgDistPath = path.join(distDir, jpgName);
      
      await sharp(srcPath)
        .rotate()
        .resize(size, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(jpgDistPath);

      responsiveData.variants.push({
        width: size,
        webp: `${serverBasePath}/${webpName}`,
        jpg: `${serverBasePath}/${jpgName}`
      });
    }

    manifest.push(responsiveData);
  }

  // Write manifest
  const manifestPath = path.join(distDir, 'images-manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  ✅ Generated manifest: ${manifestPath}`);
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
    const imgDir = path.join(tourPath, 'img');
    const tourSlug = slugify(tourName) || tourName;

    // Check if img/ directory exists
    try {
      await fs.access(imgDir);
    } catch {
      continue; // No img directory, skip
    }

    console.log(`\n📦 Processing tour: ${tourName} (Slug: ${tourSlug})`);

    // --- Strategy: Check for subfolders inside img/ ---
    const imgEntries = await fs.readdir(imgDir, { withFileTypes: true });
    const subfolders = imgEntries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

    // Check which subfolders have their own images.json
    const validSubfolders = [];
    for (const sub of subfolders) {
      const subJsonPath = path.join(imgDir, sub.name, 'images.json');
      try {
        await fs.access(subJsonPath);
        validSubfolders.push(sub.name);
      } catch {
        // Subfolder without images.json - skip
      }
    }

    if (validSubfolders.length > 0) {
      // --- NEW FORMAT: Subfolders with their own images.json ---
      for (const subName of validSubfolders) {
        const subImgDir = path.join(imgDir, subName);
        const subJsonPath = path.join(subImgDir, 'images.json');
        const subDistDir = path.join(DIST_IMG_BASE, tourSlug, subName);
        const serverBasePath = `/common/umiack-site-assets/img/tours/${tourSlug}/${subName}`;

        console.log(`  📂 Subfolder: ${subName}`);
        await processImageSet(subJsonPath, subImgDir, subDistDir, serverBasePath);
      }
    } else {
      // --- LEGACY FORMAT: images.json at tour root, images in img/ directly ---
      const legacyJsonPath = path.join(tourPath, 'images.json');
      try {
        await fs.access(legacyJsonPath);
      } catch {
        console.log(`  ⏩ Skipping ${tourName}: No images.json found (neither subfolder nor legacy).`);
        continue;
      }

      const tourDistDir = path.join(DIST_IMG_BASE, tourSlug);
      const serverBasePath = `/common/umiack-site-assets/img/tours/${tourSlug}`;

      console.log(`  📂 Legacy format (img/ root)`);
      await processImageSet(legacyJsonPath, imgDir, tourDistDir, serverBasePath);
    }
  }

  console.log('\n✨ Image optimization complete!');
}

optimizeImages().catch(err => {
  console.error('💥 Critical error during image optimization:', err);
  process.exit(1);
});
