import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env before reading process.env. Importing this module first (see
// server.ts) guarantees the rest of the app sees a validated config.
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),

  DATABASE: z.string().min(1, 'DATABASE connection string is required'),
  ACCESS_TOKEN_SECRET: z.string().min(1, 'ACCESS_TOKEN_SECRET is required'),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET is required'),

  // Optional integrations — features degrade gracefully when unset.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USERNAME: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Treat an empty value (as in .env.example) the same as unset.
  CLIENT_URL: z.preprocess(
    v => (v === '' ? undefined : v),
    z.string().url().optional(),
  ),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    '❌ Invalid or missing environment variables:\n' +
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  // Tests provide configuration at runtime, so don't hard-exit there.
  if (process.env.NODE_ENV !== 'test') process.exit(1);
}

export const env = (parsed.success ? parsed.data : process.env) as z.infer<
  typeof envSchema
>;
