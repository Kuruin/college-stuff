import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

// Users Table (Super Admin, Co-Admin, User)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Email
  password: text("password").notNull(), // Hashed
  role: text("role").notNull().default("user"), // 'super-admin' | 'co-admin' | 'user'
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events Table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Media Table
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  uploadedById: integer("uploaded_by_id").notNull(),
  url: text("url").notNull(), // Cloud storage URL
  type: text("type").notNull(), // 'image' | 'video'
  filename: text("filename").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reactions Table (Likes/Emoji)
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  mediaId: integer("media_id").notNull(),
  userId: integer("user_id").notNull(),
  reactionType: text("reaction_type").notNull(), // e.g., 'like', 'fire', 'heart'
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  media: many(media),
  reactions: many(reactions),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdById],
    references: [users.id],
  }),
  media: many(media),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  event: one(events, {
    fields: [media.eventId],
    references: [events.id],
  }),
  uploader: one(users, {
    fields: [media.uploadedById],
    references: [users.id],
  }),
  reactions: many(reactions),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  media: one(media, {
    fields: [reactions.mediaId],
    references: [media.id],
  }),
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdById: true, 
  createdAt: true 
});

export const insertMediaSchema = createInsertSchema(media).omit({ 
  id: true, 
  uploadedById: true, 
  createdAt: true 
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true
});

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
