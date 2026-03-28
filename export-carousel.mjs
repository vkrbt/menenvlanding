#!/usr/bin/env node
/**
 * export-carousel.mjs
 * Exports all 9 Instagram carousel slides from instagram-carousel.html
 * as 1080×1080 PNG files into ./carousel/
 *
 * Usage:
 *   node export-carousel.mjs
 *
 * Requirements:
 *   npm install puppeteer
 */

import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const HTML_FILE = resolve(__dirname, 'instagram-carousel.html');
const OUT_DIR   = resolve(__dirname, 'carousel');
const SLIDES    = 9;
const SIZE      = 1080;

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Viewport at 2x device pixel ratio → renders at 2160×2160, saved as 2160×2160 PNG
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 2 });

  // Load the file
  await page.goto(`file://${HTML_FILE}`, { waitUntil: 'networkidle0' });

  // Wait for fonts
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 800));

  for (let i = 1; i <= SLIDES; i++) {
    const outFile = resolve(OUT_DIR, `slide-${String(i).padStart(2, '0')}.png`);

    // Detach the slide-outer from its wrapper and render it full-size at the
    // top of the document so it fills the 1080×1080 viewport exactly.
    await page.evaluate((idx, size) => {
      const outer = document.getElementById('outer-' + idx);

      // Save original styles so we can restore later
      outer._savedStyle = outer.getAttribute('style') || '';
      outer._savedParent = outer.parentNode;
      outer._savedNextSibling = outer.nextSibling;

      // Move to body, reset all positioning/transform
      document.body.appendChild(outer);
      outer.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'width:' + size + 'px',
        'height:' + size + 'px',
        'transform:none',
        'z-index:99999',
      ].join(';');
    }, i, SIZE);

    // Screenshot the full viewport (which is now exactly the slide)
    await page.screenshot({ path: outFile, type: 'png' });

    // Restore the element to its original place
    await page.evaluate((idx) => {
      const outer = document.getElementById('outer-' + idx);
      outer.style.cssText = outer._savedStyle;
      outer._savedParent.insertBefore(outer, outer._savedNextSibling);
      delete outer._savedStyle;
      delete outer._savedParent;
      delete outer._savedNextSibling;
    }, i);

    console.log(`✅  Slide ${i}/${SLIDES} → ${outFile}`);
  }

  await browser.close();
  console.log(`\n🎉  Done! ${SLIDES} slides saved to ${OUT_DIR}`);
}

main().catch(err => {
  console.error('❌  Export failed:', err);
  process.exit(1);
});
