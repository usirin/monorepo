import {pgTable, serial, text} from "drizzle-orm/pg-core";

export const themeSettings = pgTable("theme_settings", {
	id: serial("id").primaryKey(),
	userId: text("user_id").references(() => users.id),
	theme: text("theme").default("light"),
});
