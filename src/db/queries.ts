import { cache } from "react";
import db from "./drizzle";
// import { rooms } from "./schema";
// import { rooms } from "./schema";
import { rooms } from "./schema";
import { v4 as uuidv4 } from "uuid";

export const getUsers = cache(async () => {
  const data = await db.query.users.findMany();

  return data;
});
export const getRooms = cache(async () => {
  const data = await db.query.rooms.findMany();

  return data;
});

// export const addRoom = async (codeState, question, terminalId) => {
//   try {
//     const newRoom = await db.insert(rooms).values({
//       // const newRoom = await rooms.insert({
//       id: uuidv4(),
//       codeState: codeState,
//       question: question,
//       terminalId: terminalId,
//     });
//     console.log("Room added successfully:", newRoom);
//     return newRoom; // Returns the newly added room object
//   } catch (error) {
//     console.error("Error adding room:", error);
//     throw error; // Rethrow or handle the error appropriately
//   }
// };
