// Generates the PWA raster icons from a simple on-brand die-face design.
// Self-contained: hand-rolls a minimal PNG encoder (no image deps needed).
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(outDir, { recursive: true });

const ACCENT = [0x2a, 0xa1, 0x98];
const INK = [0x00, 0x2b, 0x36];
const PAPER = [0xfd, 0xf6, 0xe3];

// --- tiny PNG encoder -------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
};
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- drawing ----------------------------------------------------------------
function draw(size) {
  const buf = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b], a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  };

  const radius = size * 0.2;
  const inCard = (x, y) => {
    // rounded square covering the whole icon (small margin)
    const m = size * 0.02;
    const lo = m;
    const hi = size - m;
    if (x < lo || y < lo || x > hi || y > hi) return false;
    const rx = Math.min(x - lo, hi - x);
    const ry = Math.min(y - lo, hi - y);
    if (rx >= radius || ry >= radius) return true;
    const dx = radius - rx;
    const dy = radius - ry;
    return dx * dx + dy * dy <= radius * radius;
  };
  const border = size * 0.05;

  const pipR = size * 0.075;
  const pips = [
    [0.3, 0.3],
    [0.7, 0.3],
    [0.5, 0.5],
    [0.3, 0.7],
    [0.7, 0.7],
  ].map(([px, py]) => [px * size, py * size]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inCard(x, y)) continue;
      // ink border ring
      const m = size * 0.02;
      const rx = Math.min(x - m, size - m - x);
      const ry = Math.min(y - m, size - m - y);
      const edge = Math.min(rx, ry);
      let color = edge < border ? INK : ACCENT;
      for (const [cx, cy] of pips) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= pipR) {
          color = PAPER;
          break;
        }
      }
      set(x, y, color);
    }
  }
  return encodePNG(size, size, buf);
}

const targets = [
  ['pwa-512x512.png', 512],
  ['pwa-192x192.png', 192],
  ['apple-touch-icon.png', 180],
];
for (const [name, size] of targets) {
  writeFileSync(join(outDir, name), draw(size));
  console.log('wrote', name);
}
