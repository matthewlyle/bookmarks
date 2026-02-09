import { z } from "zod";

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
});

export const env = envSchema.parse(process.env);
