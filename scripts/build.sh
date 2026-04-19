#!/bin/bash
set -e

# PATH setup to use local node/npm and local binaries
ROOT_DIR="$(pwd)"
export PATH="$ROOT_DIR/.node_bin/node-v20.12.2-darwin-x64/bin:$ROOT_DIR/node_modules/.bin:$PATH"

echo "🧹 Cleaning dist..."
rm -rf dist
mkdir -p dist

echo "🖼  Optimizing images..."
node ./scripts/optimize-images.mjs

echo "📂 Copying src to dist..."
# Use cp -R and then clean up metadata files
cp -R src/* dist/
find dist -name ".DS_Store" -depth -exec rm {} \;
find dist -name ".gitignore" -depth -exec rm {} \;

echo "🏷  Injecting build version (Cache Busting)..."
TIMESTAMP=$(date +%Y%m%d%H%M)
TARGET_FILE="dist/wordpress/Kayak Tours/kayak-tours-loader.js"
if [ -f "$TARGET_FILE" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/BUILD_VERSION/$TIMESTAMP/g" "$TARGET_FILE"
  else
    sed -i "s/BUILD_VERSION/$TIMESTAMP/g" "$TARGET_FILE"
  fi
  echo "  Version set to: $TIMESTAMP"
fi

echo "🎨 Optimizing CSS with Lightning CSS..."
find dist -name "*.css" -type f | while IFS= read -r file; do
  echo "  Minifying: $file"
  # Lightning CSS minifies in-place if output is same as input
  lightningcss --minify "$file" -o "$file"
done

echo "⚡ Optimizing JavaScript with esbuild..."
find dist -name "*.js" -type f | while IFS= read -r file; do
  echo "  Minifying: $file"
  esbuild "$file" --minify --allow-overwrite --outfile="$file"
done

echo "📄 Optimizing HTML with html-minifier-terser..."
find dist -name "*.html" -type f | while IFS= read -r file; do
  echo "  Minifying: $file"
  # Note: --minify-js and --minify-css are disabled because complex inline scripts (like WebGL) can cause parse errors.
  if ! html-minifier-terser --collapse-whitespace --remove-comments "$file" -o "$file"; then
    echo "  ⚠️ Warning: Failed to minify $file, keeping original."
  fi
done

echo "✅ Build complete! 'dist' folder is now ready for production."
