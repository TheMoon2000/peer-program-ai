"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { chat, roomUsers, rooms } from "@/db/schema";
import { v4 as uuid } from "uuid";
import axios from "axios";

// Chat message operations
// Add a new message
export const addMessage = async (
  roomId: string,
  userId: string,
  userInput: string,
  assistantResponse: string,
  assistantName: string
) => {
  const messageId = uuid();
  await db.insert(chat).values({
    messageId: messageId,
    roomId: roomId,
    userId: userId,
    userInput: userInput,
    assistantResponse: assistantResponse,
    assistantName: assistantName,
    timeCreated: new Date(),
  });
  // Need to revalidate the specific room? -- make sure that the messages work for everyone?
  revalidatePath(`/rooms/${roomId}`);

  return messageId;
};

// Fetch all messages in a room
export const getMessagesInRoom = async (roomId: string) => {
  return await db.select().from(chat).where(eq(chat.roomId, roomId));
};

// Update a message
export const updateMessage = async (
  messageId: string,
  newUserInput: string,
  newAssistantResponse: string
) => {
  await db
    .update(chat)
    .set({
      userInput: newUserInput,
      assistantResponse: newAssistantResponse,
    })
    .where(eq(chat.messageId, messageId));
};

// Delete a message
export const deleteMessage = async (messageId: string) => {
  await db.delete(chat).where(eq(chat.messageId, messageId));
};
