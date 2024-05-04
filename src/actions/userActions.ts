"use server";

import { axiosInstance } from "@/Constants";

export const addUserToRoom = async (email: string, name: string) => {
  const response = await axiosInstance.post("/rooms", {
    email: email,
    name: name,
  });

  console.log(response);
  // // TODO: Get a room, find an empty room, or create a new room?
  // // Look for a room that is not full
  // const emptyRoom = await db.select().from(rooms).where(eq(rooms.full, false));

  // let roomId;
  // // If there is an empty room
  // if (emptyRoom.length > 0) {
  //   // add user to Room
  //   await db.insert(roomUsers).values({
  //     userId: userId,
  //     roomId: emptyRoom[0].id,
  //   });

  //   // update room to be full
  //   await db
  //     .update(rooms)
  //     .set({
  //       full: true,
  //     })
  //     .where(eq(rooms.id, emptyRoom[0].id));

  //   roomId = emptyRoom[0].id;
  // } else {
  //   // else create a new room for the user
  //   // TODO: NEED TO FIGURE OUT THE OTHER PARTS SOON!

  //   const newRoomId = await addRoom(
  //     "codeState",
  //     "question"
  //     // "token",
  //     // Math.floor(Math.random() * 100),
  //     // false
  //   );

  //   // add user to Room
  //   await db.insert(roomUsers).values({
  //     userId: userId,
  //     roomId: newRoomId,
  //   });

  //   roomId = newRoomId;
  // }

  // return room id
  return response.data.room_id;
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
