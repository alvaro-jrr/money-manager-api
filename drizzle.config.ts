import type { Config } from "drizzle-kit";

import { env } from "@/shared/utils";

export default {
	schema: "./src/database/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		host: env.DB_HOST,
		database: env.DB_DATABASE,
		password: env.DB_PASSWORD,
		user: env.DB_USERNAME,
	},
} satisfies Config;
