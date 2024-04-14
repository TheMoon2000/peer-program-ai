"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { roomUsers, rooms, users } from "@/db/schema";
// import { uuid } from "drizzle-orm/pg-core";
import { v4 as uuid } from "uuid";
import { addRoom } from "./roomActions";

export const getData = async () => {
  const data = await db.select().from(users);
  return data;
};

export const addUser = async (email: string) => {
  // TODO: Get a room, find an empty room, or create a new room?
  // Look for a room that is not full

  // If there is a full room

  // add user to Room

  // else create a new room for the user

  // return room id

  const userId = uuid();
  await db.insert(users).values({
    userId: userId,
    userEmail: email,
    // roomId: "14d3a085-26d0-4bb6-bf9f-e5a90a2d77c4",
  });
  // revalidatePath("/");
  return userId;
};

export const addUserToRoom = async (userId: string) => {
  // TODO: Get a room, find an empty room, or create a new room?
  // Look for a room that is not full
  const emptyRoom = await db.select().from(rooms).where(eq(rooms.full, false));

  let roomId;
  // If there is an empty room
  if (emptyRoom.length > 0) {
    // add user to Room
    await db.insert(roomUsers).values({
      userId: userId,
      roomId: emptyRoom[0].id,
    });

    // update room to be full
    await db
      .update(rooms)
      .set({
        full: true,
      })
      .where(eq(rooms.id, emptyRoom[0].id));

    roomId = emptyRoom[0].id;
  } else {
    // else create a new room for the user
    // TODO: NEED TO FIGURE OUT THE OTHER PARTS SOON!

    const newRoomId = await addRoom(
      "codeState",
      "question"
      // "token",
      // Math.floor(Math.random() * 100),
      // false
    );

    // add user to Room
    await db.insert(roomUsers).values({
      userId: userId,
      roomId: newRoomId,
    });

    roomId = newRoomId;
  }

  // return room id
  return roomId;
};

export const deleteUsers = async (id: string) => {
  await db.delete(users).where(eq(users.userId, id));

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
