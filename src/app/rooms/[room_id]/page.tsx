import Room from "@/views/room/room";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Room",
};

interface Params {
  room_id: string
}

export default function LoginPage(props: Params) {
  return <Room roomId={props.room_id} />;
}
