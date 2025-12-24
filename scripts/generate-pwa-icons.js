#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Generates all required icon sizes for PWA from source image
 */

const fs = require('fs');
const path = require('path');

// Using a pure JS image processor to avoid native dependencies
// We'll use the image in base64 and create copies
const sharp = require('sharp');

const sourceImage = path.join(__dirname, '../.local-docs/treasure-hunt-favicon.png');
const outputDir = path.join(__dirname, '../frontend/public/icons');

// Icon sizes required for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating PWA icons...');

  for (const size of iconSizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`✗ Failed to generate ${size}x${size} icon:`, error.message);
    }
  }

  // Also generate maskable icons (with padding for safe area)
  for (const size of [192, 512]) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}-maskable.png`);
    
    try {
      // Add 20% padding for safe area
      const paddingSize = Math.floor(size * 0.8);
      
      await sharp(sourceImage)
        .resize(paddingSize, paddingSize, {
          fit: 'contain',
          background: { r: 255, g: 193, b: 7, alpha: 1 } // Gold background
        })
        .extend({
          top: Math.floor((size - paddingSize) / 2),
          bottom: Math.ceil((size - paddingSize) / 2),
          left: Math.floor((size - paddingSize) / 2),
          right: Math.ceil((size - paddingSize) / 2),
          background: { r: 255, g: 193, b: 7, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${size}x${size} maskable icon`);
    } catch (error) {
      console.error(`✗ Failed to generate ${size}x${size} maskable icon:`, error.message);
    }
  }

  // Generate apple-touch-icon
  const appleTouchIconPath = path.join(outputDir, 'apple-touch-icon.png');
  try {
    await sharp(sourceImage)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(appleTouchIconPath);
    
    console.log('✓ Generated Apple Touch Icon');
  } catch (error) {
    console.error('✗ Failed to generate Apple Touch Icon:', error.message);
  }

  // Generate favicons
  const favicon32Path = path.join(outputDir, '../favicon-32x32.png');
  try {
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(favicon32Path);
    
    console.log('✓ Generated favicon-32x32.png');
  } catch (error) {
    console.error('✗ Failed to generate favicon-32x32.png:', error.message);
  }

  const favicon16Path = path.join(outputDir, '../favicon-16x16.png');
  try {
    await sharp(sourceImage)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(favicon16Path);
    
    console.log('✓ Generated favicon-16x16.png');
  } catch (error) {
    console.error('✗ Failed to generate favicon-16x16.png:', error.message);
  }

  console.log('\n✅ Icon generation complete!');
  console.log('\nGenerated files:');
  console.log('  - 8 standard icons (72x72 to 512x512)');
  console.log('  - 2 maskable icons (192x192, 512x512)');
  console.log('  - 1 Apple Touch Icon (180x180)');
  console.log('  - 2 favicons (16x16, 32x32)');
  console.log('\nTotal: 13 icon files');
}

// Run the script
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };

