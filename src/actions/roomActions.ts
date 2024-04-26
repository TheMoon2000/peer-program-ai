"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { roomUsers, rooms } from "@/db/schema";
import { v4 as uuid } from "uuid";
import axios from "axios";

export const getData = async () => {
  const data = await db.select().from(rooms);
  return data;
};
export const getRoomById = async (id: string, email: string) => {
  const response = await axios.get(
    `http://172.174.247.133/api/rooms/${id}?email=${email}`
  );
  // const data = await db.select().from(rooms).where(eq(rooms.id, id));
  return response.data;
};

export const getUserIdsFromRoomId = async (id: string) => {
  const data = await db
    .select()
    .from(roomUsers)
    .where(eq(roomUsers.roomId, id));
  return data;
};

export const addRoom = async (
  codeState: string,
  question: string
  // token: string,
  // terminalId: number,
  // full?: boolean
) => {
  const newRoomId = uuid();

  // Get terminal + response
  const formattedServerId = newRoomId.replace(/-/g, "");

  const response = await axios.post(
    "https://ursacoding.com/peer/create-server",
    {
      session_id: formattedServerId,
    }
  );

  // Assuming the response is successful and contains data
  console.log("Server created successfully:", response.data);
  await db.insert(rooms).values({
    id: newRoomId,
    codeState: codeState,
    question: question,
    token: response.data.token,
    terminalId: response.data["terminal_id"],
    full: false,
    created: new Date(),
    //TODO: need to get the meeting id as well?
  });
  return newRoomId;
};

export const deleteRoom = async (id: string) => {
  await db.delete(rooms).where(eq(rooms.id, id));

  revalidatePath("/");
};

// export const toggleusers = async (id: number, done: boolean) => {
//   await db
//     .update(users)
//     .set({
//       done: done,
//     })
//     .where(eq(users.id, id));

//   revalidatePath("/");
// };

// export const editusers = async (id: number, text: string) => {
//   await db
//     .update(users)
//     .set({
//       text: text,
//     })
//     .where(eq(users.id, id));

//   revalidatePath("/");
// };
