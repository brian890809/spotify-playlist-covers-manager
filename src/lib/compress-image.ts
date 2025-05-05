import sharp from 'sharp';

export default async function compressImageBuffer(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1024, 1024, { fit: 'inside' })
    .jpeg({ 
      quality: 80,
      mozjpeg: true 
    })
    .toBuffer();
}