import { z } from 'zod';

const bool = z
  .union([z.boolean(), z.string()])
  .default('false')
  .transform((v) => v === true || v === 'true');

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('HORIZON'),
  VITE_BASE_PATH: z.string().default('/'),
  VITE_ENABLE_PHOTOS: bool,
  VITE_ENABLE_PWA: bool,
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      VITE_APP_NAME: 'HORIZON',
      VITE_BASE_PATH: '/',
      VITE_ENABLE_PHOTOS: false,
      VITE_ENABLE_PWA: false,
    };
