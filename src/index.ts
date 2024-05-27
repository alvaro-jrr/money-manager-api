import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";

import { authRouter } from "./controllers/auth";
import { response } from "./shared/utils";

const app = new Hono({ strict: false });

// Middlewares.
app.use(logger());
app.use("*", cors());

// Routes.
app.get("/", (c) => c.text("Welcome"));

app.route("/auth", authRouter);

app.onError((err, c) => {
	return response(c, {
		status: err instanceof HTTPException ? err.status : 400,
		message: err.message,
	});
});

// Serve.
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`Server is running on port ${port}`);
showRoutes(app);

serve({
	fetch: app.fetch,
	port,
	hostname: "RENDER" in process.env ? "0.0.0.0" : "localhost",
});
