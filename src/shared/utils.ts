import "dotenv/config";
import { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";

import { envSchema } from "./schema";

/**
 * The `.env` variables.
 */
export const env = envSchema.parse(process.env);

/**
 * Returns a response in the desired format.
 */
export function response(
	context: Context,
	{
		status,
		message,
		data,
	}: {
		status: StatusCode;
		message?: string;
		data?: unknown;
	},
) {
	return context.json(
		{
			status,
			message,
			data,
		},
		status,
	);
}
