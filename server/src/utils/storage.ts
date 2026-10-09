import fs from 'fs';
import path from 'path';
import type { Request } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import AppError from './appError';

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

/**
 * Persists a processed avatar image and returns its public URL.
 *
 * - Uploads to Cloudinary when `CLOUDINARY_*` env vars are set (works in any
 *   stateless/serverless environment).
 * - Otherwise writes to local disk under `public/img/users` (served by
 *   `express.static('public')`), which is fine for local development.
 */
export const saveAvatar = async (
  buffer: Buffer,
  filename: string,
  req: Request,
): Promise<string> => {
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
