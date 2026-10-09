import fs from 'fs';
import path from 'path';
import type { Request } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import AppError from './appError';
import logger from './logger';

const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

type ImgbbResponse = {
  data?: { display_url?: string };
  error?: { message?: string; code?: number };
} | null;

const IMGBB_ATTEMPTS = 6;

const uploadToImgbb = async (
  buffer: Buffer,
  filename: string,
): Promise<string> => {
  const image = buffer.toString('base64');
  const name = filename.replace(/\.jpeg$/, '');

  // ImgBB intermittently answers "Internal upload error" (400, code 111) or
  // 5xx for valid images, so retry a few times before giving up.
  // Stay well inside the serverless function's time limit.
  const deadline = Date.now() + 20000;
  for (let attempt = 1; attempt <= IMGBB_ATTEMPTS; attempt++) {
    const timeLeft = deadline - Date.now();
    if (timeLeft < 1000) break;
    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: new URLSearchParams({ key: env.IMGBB_API_KEY!, image, name }),
      signal: AbortSignal.timeout(Math.min(8000, timeLeft)),
    }).catch(() => null);
    const json = res
      ? ((await res.json().catch(() => null)) as ImgbbResponse)
      : null;
    if (res?.ok && json?.data?.display_url) return json.data.display_url;

    logger.warn(
      { attempt, status: res?.status, imgbbError: json?.error },
      'ImgBB upload failed',
    );
    const retryable = !res || res.status >= 500 || json?.error?.code === 111;
    if (!retryable) break;
    if (attempt < IMGBB_ATTEMPTS)
      await new Promise(resolve => setTimeout(resolve, 250 * attempt));
  }

  throw new AppError('Image upload failed. Please try again later.', 502);
};

/**
 * Persists a processed avatar image and returns its public URL.
 *
 * - Uploads to ImgBB when `IMGBB_API_KEY` is set.
 * - Otherwise uploads to Cloudinary when `CLOUDINARY_*` env vars are set (works in any
 *   stateless/serverless environment).
 * - Otherwise writes to local disk under `public/img/users` (served by
 *   `express.static('public')`), which is fine for local development.
 */
export const saveAvatar = async (
  buffer: Buffer,
  filename: string,
  req: Request,
): Promise<string> => {
  if (env.IMGBB_API_KEY) return uploadToImgbb(buffer, filename);

  if (cloudinaryConfigured) {
    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'easy-quick-form/avatars',
            public_id: filename.replace(/\.jpeg$/, ''),
            resource_type: 'image',
            overwrite: true,
          },
          (error, result) => {
            if (error || !result)
              return reject(error ?? new Error('Cloudinary upload failed'));
            resolve(result.secure_url);
          },
        )
        .end(buffer);
    });
  }

  // Serverless filesystems are read-only/ephemeral: without Cloudinary there
  // is nowhere durable to store the file, so reject the upload cleanly.
  if (process.env.VERCEL)
    throw new AppError(
      'Avatar uploads are not configured on this server yet.',
      503,
    );

  const uploadDir = path.join(__dirname, '..', '..', 'public', 'img', 'users');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, filename), buffer);
  return `${req.protocol}://${req.get('host')}/img/users/${filename}`;
};
