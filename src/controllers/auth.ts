import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { validator } from "hono/validator";

import { db } from "@/database/db";
import { insertUserSchema, users } from "@/database/schema";

import { JwtUtils } from "@/shared/jwt";
import { env, response } from "@/shared/utils";

export const authRouter = new Hono();

/**
 * Signs up the user.
 */
authRouter.post(
	"/sign-up",
	validator("json", (json, c) => {
		const parsed = insertUserSchema.safeParse(json);

		if (!parsed.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsed.data;
	}),
	async (c) => {
		const user = c.req.valid("json");

		// Wether the email is already taken by another user.
		const isEmailTaken = await db.query.users.findFirst({
			columns: {
				id: true,
			},
			where: (users, { eq }) => eq(users.email, user.email),
		});

		if (isEmailTaken) {
			return response(c, {
				status: 409,
				message: "Email is taken",
			});
		}

		const newPassword = await bcrypt.hash(user.password, 10);

		console.log(newPassword);

		// Insert the user.
		const [insertedUser] = await db
			.insert(users)
			.values({
				...user,
				password: newPassword,
			})
			.returning();

		if (!insertedUser) {
			return response(c, {
				status: 400,
				message: "User couldn't be created",
			});
		}

		// Create the token.
		const token = await JwtUtils.set(c, insertedUser.id);
		const { password, ...userWithoutPassword } = insertedUser;

		return response(c, {
			status: 200,
			data: {
				token,
				user: userWithoutPassword,
			},
		});
	},
);

/**
 * Login the user.
 */
authRouter.post(
	"/login",
	validator("json", (json, c) => {
		const parsed = insertUserSchema
			.pick({ email: true, password: true })
			.safeParse(json);

		if (!parsed.success) {
			return response(c, {
				status: 422,
				message: "The payload schema is invalid",
			});
		}

		return parsed.data;
	}),
	async (c) => {
		const credentials = c.req.valid("json");

		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, credentials.email),
		});

		// Wether the password is valid.
		const isCorrectPassword =
			user && (await bcrypt.compare(credentials.password, user.password));

		if (!isCorrectPassword) {
			return response(c, {
				status: 401,
				message: "The credentials are invalid",
			});
		}

		// Set the JWT.
		const token = await JwtUtils.set(c, user.id);
		const { password, ...userWithoutPassword } = user;

		return response(c, {
			status: 200,
			data: {
				user: userWithoutPassword,
				token,
			},
		});
	},
);

/**
 * Checks the user status.
 */
authRouter.get("/check-status", jwt({ secret: env.JWT_SECRET }), async (c) => {
	const payload = await JwtUtils.get(c);

	if (!payload) {
		return response(c, {
			status: 401,
			message: "User is not logged in",
		});
	}

	const isExpired = dayjs().unix() > payload.exp;

	if (isExpired) {
		return response(c, {
			status: 401,
			message: "Invalid token",
		});
	}

	return response(c, {
		status: 200,
		data: null,
	});
});
