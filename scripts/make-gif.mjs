/**
 * Stitches demo-frames/f01-f08.png into .github/assets/demo.gif
 * Run: node scripts/make-gif.mjs
 */
import { createReadStream, createWriteStream, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import GIFEncoder from 'gif-encoder-2';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRAMES_DIR = join(__dirname, '../.github/assets/demo-frames');
const OUT_PATH   = join(__dirname, '../.github/assets/demo.gif');

// Delay per frame in ms — kept short so the demo flows without dead air
const DELAYS = {
  f01: 2000,  // Dashboard
  f02: 2000,  // Quest complete modal
  f03: 1500,  // Dashboard after reward
  f04: 2000,  // Focus Timer
  f05: 2000,  // Item Shop
  f06: 2000,  // Insights
  f07: 2000,  // Adventure Log
  f08: 3000,  // Ambient Mode — linger on the pet
};

function readPng(filePath) {
  return new Promise((resolve, reject) => {
    const png = new PNG();
    createReadStream(filePath)
      .pipe(png)
      .on('parsed', () => resolve(png))
      .on('error', reject);
  });
}

(async () => {
  const frameFiles = readdirSync(FRAMES_DIR)
    .filter(f => f.endsWith('.png'))
    .sort();

  if (!frameFiles.length) {
    console.error('No PNG frames found in', FRAMES_DIR);
    process.exit(1);
  }

  console.log(`Stitching ${frameFiles.length} frames → demo.gif`);

  // Read first frame to determine dimensions
  const first = await readPng(join(FRAMES_DIR, frameFiles[0]));
  const { width, height } = first;
  console.log(`  Canvas: ${width}×${height}`);

  const encoder = new GIFEncoder(width, height, 'neuquant', true);
  const output  = createWriteStream(OUT_PATH);
  encoder.createReadStream().pipe(output);

  encoder.start();
  encoder.setRepeat(0);   // loop forever
  encoder.setQuality(10); // 1=best, 20=worst

  const allFrames = [first, ...await Promise.all(
    frameFiles.slice(1).map(f => readPng(join(FRAMES_DIR, f)))
  )];

  for (let i = 0; i < frameFiles.length; i++) {
    const name  = frameFiles[i].replace('.png', '');
    const delay = DELAYS[name] ?? 2000;
    const png   = allFrames[i];

    encoder.setDelay(delay);
    encoder.addFrame(png.data);
    console.log(`  [${i + 1}/${frameFiles.length}] ${frameFiles[i]}  (${delay}ms)`);
  }

  encoder.finish();

  await new Promise((resolve, reject) => {
    output.on('finish', resolve);
    output.on('error', reject);
  });

  const bytes = (output.bytesWritten / 1024 / 1024).toFixed(1);
  console.log(`\ndemo.gif saved → ${OUT_PATH}  (${bytes} MB)`);
})();
