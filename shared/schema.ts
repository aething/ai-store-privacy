import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  name: text("name"),
  phone: text("phone"),
  country: text("country"),
  street: text("street"),
  house: text("house"),
  apartment: text("apartment"),
  language: text("language").default("ru"),
  verificationToken: text("verification_token"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in USD cents
  priceEUR: integer("price_eur").notNull(), // in EUR cents
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  features: text("features").array(),
  specifications: text("specifications").array(),
  stripeProductId: text("stripe_product_id"),
  currency: text("currency").notNull().default("usd"), // 'usd' or 'eur'
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  status: text("status").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"), // 'usd' or 'eur'
  stripePaymentId: text("stripe_payment_id"),
  trackingNumber: text("tracking_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    isVerified: true,
    verificationToken: true,
    stripeCustomerId: true,
    stripeSubscriptionId: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
  });

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  password: true,
  email: true,
  isVerified: true,
  verificationToken: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
