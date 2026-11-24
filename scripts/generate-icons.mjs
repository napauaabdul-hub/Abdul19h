import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const GREEN = [0x43, 0xa0, 0x47];
const ORANGE = [0xf4, 0x77, 0x21];
const WHITE = [0xff, 0xff, 0xff];
const TEAL = [0x07, 0x56, 0x6a];

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

function housePixel({ bg, roof, body, door }) {
  return (u, v) => {
    const roofTop = 0.18, roofBase = 0.48, apexU = 0.5, halfBase = 0.36;
    if (v >= roofTop && v <= roofBase) {
      const half = halfBase * (v - roofTop) / (roofBase - roofTop);
      if (Math.abs(u - apexU) <= half) return [...roof, 255];
    }
    if (u >= 0.26 && u <= 0.74 && v >= 0.48 && v <= 0.82) {
      if (u >= 0.44 && u <= 0.56 && v >= 0.62 && v <= 0.82) return [...door, 255];
      if (u >= 0.31 && u <= 0.41 && v >= 0.55 && v <= 0.65) return [220, 240, 230, 255];
      if (u >= 0.59 && u <= 0.69 && v >= 0.55 && v <= 0.65) return [220, 240, 230, 255];
      return [...body, 255];
    }
    if (bg) return [...bg, 255];
    return [0, 0, 0, 0];
  };
}

const out = path.resolve(process.cwd(), 'assets');
fs.mkdirSync(out, { recursive: true });

writePng(path.join(out, 'icon.png'), 1024, housePixel({ bg: GREEN, roof: ORANGE, body: WHITE, door: GREEN }));
writePng(path.join(out, 'splash-icon.png'), 1024, housePixel({ bg: GREEN, roof: ORANGE, body: WHITE, door: GREEN }));
writePng(path.join(out, 'favicon.png'), 64, housePixel({ bg: GREEN, roof: ORANGE, body: WHITE, door: GREEN }));
writePng(path.join(out, 'android-icon-foreground.png'), 1024, housePixel({ bg: null, roof: ORANGE, body: WHITE, door: TEAL }));
writePng(path.join(out, 'android-icon-monochrome.png'), 1024, housePixel({ bg: null, roof: WHITE, body: WHITE, door: [0, 0, 0] }));
writePng(path.join(out, 'android-icon-background.png'), 1024, (u, v) => [...GREEN, 255]);

console.log('icons gerados em', out);
