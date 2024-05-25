import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { env } from "@/shared/utils";

import * as schema from "./schema";

export const client = new pg.Client({
	host: env.DB_HOST,
	port: 5432,
	user: env.DB_USERNAME,
	password: env.DB_PASSWORD,
	database: env.DB_DATABASE,
});

await client.connect();

export const db = drizzle(client, { schema });
