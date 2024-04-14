import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roomUsers = pgTable("room_users", {
  roomId: uuid("room_id")
    .references(() => rooms.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.userId, { onDelete: "cascade" })
    .notNull(),
});

// Define the Rooms table with additional details
export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey(),
  codeState: text("code_state").notNull(),
  question: text("question").notNull(),
  token: text("token").notNull(),
  meetingId: text("meeting_id"),
  terminalId: integer("terminal_id").notNull(), // Unique terminal ID for each room
  full: boolean("full").notNull().default(false), // Indicates if the room is full
  created: timestamp("created").notNull(), // created time for the room
  // roomId: uuid("room_id")
  //   .notNull()
  //   .references(() => rooms.id), // Foreign key linking to Rooms
});

export const chat = pgTable("chat", {
  messageId: uuid("message_id").primaryKey(), // Unique identifier for each message
  roomId: uuid("room_id")
    .references(() => rooms.id, { onDelete: "cascade" })
    .notNull(), // Foreign key linking to Rooms table
  userId: uuid("user_id")
    .references(() => users.userId, { onDelete: "cascade" })
    .notNull(), // Foreign key linking to Users table
  messageContent: text("message_content").notNull(), // The content of the message
  timeCreated: timestamp("time_created").notNull(), // Timestamp of when the message was created
});

// Define the Users table
export const users = pgTable("users", {
  userId: uuid("user_id").primaryKey(),
  // userId: text("user_id").primaryKey(),
  userEmail: text("user_email").notNull().unique(),
  userName: text("user_name").notNull().default("User"),
  // roomId: uuid("room_id")
  //   .notNull()
  //   .references(() => rooms.id), // Foreign key linking to Rooms
});
