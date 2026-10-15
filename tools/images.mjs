#!/usr/bin/env node
// Pre-generates raster images that are committed to the repository, so the build never
// re-encodes images and stays byte-for-byte reproducible (DESIGN-SPEC §6.4).
// Usage: npm run images
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg');

const png = async (size) => sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).withMetadata({}).toBuffer();

writeFileSync('public/apple-touch-icon.png', await png(180));

// favicon.ico with a single embedded 48×48 PNG (ICO allows PNG payloads).
const p48 = await png(48);
const header = Buffer.alloc(6 + 16);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(48, 6); header.writeUInt8(48, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(p48.length, 14); header.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([header, p48]));

// Avatar variants (avatar-192/384.avif|webp|jpg + avatar.jpg) from owner-approved 2026 studio portrait (decision D2).
const avatarSrc = readFileSync('src/assets/avatar-2026.png');
for (const size of [192, 384]) {
  const base = () => sharp(avatarSrc).resize(size, size, { fit: 'cover', position: 'centre' });
  writeFileSync(`public/avatar-${size}.jpg`, await base().jpeg({ quality: 88, mozjpeg: true }).toBuffer());
  writeFileSync(`public/avatar-${size}.webp`, await base().webp({ quality: 86, effort: 6 }).toBuffer());
  writeFileSync(`public/avatar-${size}.avif`, await base().avif({ quality: 72, effort: 6 }).toBuffer());
}
writeFileSync('public/avatar.jpg', readFileSync('public/avatar-384.jpg'));
console.log('wrote public/apple-touch-icon.png, public/favicon.ico, public/avatar-{192,384}.{jpg,webp,avif}, public/avatar.jpg');
