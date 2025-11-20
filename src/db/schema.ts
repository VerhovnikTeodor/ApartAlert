import {
  pgTable,
  serial,
  text,
  varchar,
  pgEnum,
  timestamp,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const notificationFrequencyEnum = pgEnum("notification_frequency", [
  "immediate",
  "daily",
  "weekly",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("user"),
  notificationFrequency: notificationFrequencyEnum("notification_frequency")
    .notNull()
    .default("immediate"),
  lastDigestSent: timestamp("last_digest_sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apartments = pgTable("apartments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  area: integer("area").notNull(), // in square meters
  rating: integer("rating").notNull().default(3), // 1-5 stars
  imageUrl: text("image_url").notNull(),
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  apartmentId: integer("apartment_id")
    .notNull()
    .references(() => apartments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  startDate: varchar("start_date", { length: 50 }),
  endDate: varchar("end_date", { length: 50 }),
  radius: varchar("radius", { length: 50 }),
  numPeople: integer("num_people"),
  numStars: integer("num_stars"),
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
]);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  savedSearchId: integer("saved_search_id")
    .notNull()
    .references(() => savedSearches.id, { onDelete: "cascade" }),
  apartmentId: integer("apartment_id")
    .notNull()
    .references(() => apartments.id, { onDelete: "cascade" }),
  status: notificationStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  includedInDigest: boolean("included_in_digest").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  retryCount: integer("retry_count").notNull().default(0),
});
