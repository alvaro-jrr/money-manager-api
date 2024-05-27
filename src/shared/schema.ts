import { z } from "zod";

/**
 * The schema of the `.env` variables.
 */
export const envSchema = z.object({
	DB_HOST: z.union([z.literal("localhost"), z.string()]),
	DB_DATABASE: z.string().min(1),
	DB_USERNAME: z.string().min(1),
	DB_PASSWORD: z.string().default(""),
	JWT_SECRET: z.string().min(5),
});

/**
 * The schema of the JWT payload.
 */
export const jwtPayloadSchema = z.object({
	iat: z.number(),
	nbf: z.number(),
	exp: z.number(),
	userId: z.number(),
});
