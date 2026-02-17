import { users, events, media, reactions, type User, type InsertUser, type Event, type InsertEvent, type Media, type InsertMedia, type Reaction, type InsertReaction } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { role?: string, isApproved?: boolean }): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUserStatus(id: number, isApproved: boolean): Promise<User>;
  updateUserRole(id: number, role: string): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Event operations
  getEvents(): Promise<(Event & { creator: User })[]>;
  getEvent(id: number): Promise<(Event & { media: (Media & { reactions: Reaction[] })[] }) | undefined>;
  createEvent(event: InsertEvent & { createdById: number }): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Media operations
  addMedia(media: InsertMedia & { uploadedById: number }): Promise<Media>;
  deleteMedia(id: number): Promise<void>;
  
  // Reaction operations
  addReaction(reaction: InsertReaction): Promise<Reaction>;
  getReaction(mediaId: number, userId: number): Promise<Reaction | undefined>;
  deleteReaction(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser & { role?: string, isApproved?: boolean }): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserStatus(id: number, isApproved: boolean): Promise<User> {
    const [user] = await db.update(users).set({ isApproved }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getEvents(): Promise<(Event & { creator: User })[]> {
    const result = await db.query.events.findMany({
      with: { creator: true },
      orderBy: (events, { desc }) => [desc(events.date)]
    });
    return result as (Event & { creator: User })[];
  }

  async getEvent(id: number): Promise<(Event & { media: (Media & { reactions: Reaction[] })[] }) | undefined> {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: {
        media: {
          with: { reactions: true }
        }
      }
    });
    return event as (Event & { media: (Media & { reactions: Reaction[] })[] }) | undefined;
  }

  async createEvent(event: InsertEvent & { createdById: number }): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async addMedia(mediaData: InsertMedia & { uploadedById: number }): Promise<Media> {
    const [newMedia] = await db.insert(media).values(mediaData).returning();
    return newMedia;
  }

  async deleteMedia(id: number): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  async addReaction(reaction: InsertReaction): Promise<Reaction> {
    const [newReaction] = await db.insert(reactions).values(reaction).returning();
    return newReaction;
  }

  async getReaction(mediaId: number, userId: number): Promise<Reaction | undefined> {
    const [reaction] = await db.select().from(reactions).where(
      and(eq(reactions.mediaId, mediaId), eq(reactions.userId, userId))
    );
    return reaction;
  }

  async deleteReaction(id: number): Promise<void> {
    await db.delete(reactions).where(eq(reactions.id, id));
  }
}

export const storage = new DatabaseStorage();
