import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const TEAL = [0x07, 0x56, 0x6a];
const ORANGE = [0xf4, 0x77, 0x21];
const WHITE = [0xff, 0xff, 0xff];

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function writePng(file, size, pixelAt) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelAt(x / size, y / size);
      const o = row + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
}

function inRect(u, v, x0, y0, x1, y1) {
  return u >= x0 && u <= x1 && v >= y0 && v <= y1;
}

function roundedRect(u, v, x0, y0, x1, y1, r) {
  if (!inRect(u, v, x0, y0, x1, y1)) return false;
  const cx = Math.min(Math.max(u, x0 + r), x1 - r);
  const cy = Math.min(Math.max(v, y0 + r), y1 - r);
  return (u - cx) * (u - cx) + (v - cy) * (v - cy) <= r * r || (u >= x0 + r && u <= x1 - r) || (v >= y0 + r && v <= y1 - r);
}

function markPixel({ bg, mono }) {
  return (u, v) => {
    let px = [0, 0, 0, 0];
    const ink = mono ? WHITE : WHITE;
    if (inRect(u, v, 0.24, 0.28, 0.36, 0.76)) px = [...ink, 255];
    if (inRect(u, v, 0.64, 0.30, 0.76, 0.76)) px = [...ink, 255];
    const wx = 0.7, wy = 0.27, wr = 0.085;
    const dx = u - wx, dy = v - wy;
    const dist = Math.hypot(dx, dy);
    if (dist <= wr) {
      const ang = Math.atan2(dy, dx);
      const notch = ang < -Math.PI * 0.72 || ang > -Math.PI * 0.28;
      if (!notch) px = [...ink, 255];
    }
    const t = Math.min(1, Math.max(0, (u - 0.3) / 0.4));
    const vc = 0.3 + t * 0.44;
    if (u >= 0.3 && u <= 0.7 && Math.abs(v - vc) < 0.05) px = mono ? [...WHITE, 255] : [...ORANGE, 255];
    if (roundedRect(u, v, 0.16, 0.205, 0.44, 0.3, 0.03)) px = mono ? [...WHITE, 255] : [...ORANGE, 255];
    if (px[3] === 0 && bg) px = [...bg, 255];
    return px;
  };
}

const out = path.resolve(process.cwd(), 'assets');
fs.mkdirSync(out, { recursive: true });

writePng(path.join(out, 'icon.png'), 1024, markPixel({ bg: TEAL, mono: false }));
writePng(path.join(out, 'splash-icon.png'), 1024, markPixel({ bg: TEAL, mono: false }));
writePng(path.join(out, 'favicon.png'), 64, markPixel({ bg: TEAL, mono: false }));
writePng(path.join(out, 'android-icon-foreground.png'), 1024, markPixel({ bg: null, mono: false }));
writePng(path.join(out, 'android-icon-monochrome.png'), 1024, markPixel({ bg: null, mono: true }));
writePng(path.join(out, 'android-icon-background.png'), 1024, () => [...TEAL, 255]);

console.log('ícones NAPAUA BUILD gerados em', out);
