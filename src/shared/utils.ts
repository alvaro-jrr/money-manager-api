import "dotenv/config";

import { envSchema } from "./schema";

/**
 * The `.env` variables.
 */
export const env = envSchema.parse(process.env);
