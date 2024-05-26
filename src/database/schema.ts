import { relations } from "drizzle-orm";
import {
	serial,
	pgTable,
	varchar,
	pgEnum,
	integer,
	timestamp,
	date,
	numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * The users of the application.
 */
export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	email: varchar("email", { length: 50 }).notNull().unique(),
	password: varchar("password", { length: 70 }).notNull(),
	fullName: varchar("full_name", { length: 50 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	transactions: many(transactions),
}));

export const insertUserSchema = createInsertSchema(users, {
	email: (schema) => schema.email.email().min(1).max(50),
	fullName: (schema) => schema.fullName.min(1).max(50),
	password: (schema) => schema.password.min(5).max(70),
});

/**
 * The types of transactions.
 */
export const transactionTypeEnum = pgEnum("transaction_type", [
	"income",
	"expense",
]);

/**
 * The categories a transaction can be.
 */
export const categories = pgTable("categories", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 50 }).notNull(),
	transactionType: transactionTypeEnum("transaction_type").notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
	transactions: many(transactions),
}));

export const insertCategorySchema = createInsertSchema(categories, {
	title: (schema) => schema.title.min(1).max(50),
});

/**
 * The transactions an user has made.
 */
export const transactions = pgTable("transactions", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, {
			onDelete: "cascade",
		})
		.notNull(),
	categoryId: integer("category_id").references(() => categories.id, {
		onDelete: "set null",
	}),
	description: varchar("description", { length: 50 }).notNull(),
	type: transactionTypeEnum("type").notNull(),
	date: date("date").notNull(),
	amount: numeric("amount", {
		precision: 10,
		scale: 3,
	}).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
	user: one(users, {
		fields: [transactions.userId],
		references: [users.id],
	}),
	category: one(categories, {
		fields: [transactions.categoryId],
		references: [categories.id],
	}),
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
	amount: (schema) =>
		z.preprocess((input) => {
			const processed = schema.amount
				.regex(/^\d+$/)
				.transform(Number)
				.safeParse(input);

			return processed.success ? processed.data : input;
		}, z.number().gt(0)),
	description: (schema) => schema.description.min(1).max(50),
});
