"use server";

import { axiosInstance } from "@/Constants";

export const getRoomById = async (id: string, email: string) => {
  const response = await axiosInstance.get(`/api/rooms/${id}?email=${email}`)
  // const data = await db.select().from(rooms).where(eq(rooms.id, id));
  return response.data;
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
