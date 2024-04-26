import Link from "next/link";
import { DyteMeeting, DytePipToggle } from "@dytesdk/react-ui-kit";
import { useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useBoolean } from "@/hooks/use-boolean";
import DyteClient from "@dytesdk/web-core";
import { DyteProvider } from "@dytesdk/react-web-core";
import { RoomInfo } from "@/Data Structures";

interface Props {
  meeting?: DyteClient;
  onRun: () => void;
  roomInfo: RoomInfo;
}

export default function Navbar(props: Props) {
  const showVideo = useBoolean(false);

  return (
    <div
      style={{ height: "100px" }}
      className="bg-gray-800 p-8 md:flex md:items-center md:justify-between"
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Peer Program
        </h2>
      </div>
      <div className="mt-4 flex md:ml-4 md:mt-0">
        {/* <Link
            href={"/"}
            //   type="button"
            className="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          >
            Leave
          </Link> */}
        <div className="flex -space-x-2 mx-3">
          {/* <div className="flex -space-x-2 overflow-hidden"> */}

          {props.roomInfo.meeting.all_participants.map((p) => (
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 ring-2 ring-white"
              key={p.participant_id}
            >
              <span className="text-sm font-medium leading-none text-white">
                {/* {m.role === "user" ? name.slice(0, 2).toUpperCase() : "AI"} */}
                {p.name.slice(0, 2).toUpperCase()}
              </span>
            </span>
          ))}

          {/* <img
            className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
            alt=""
          />
          <img
            className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
          /> */}
        </div>

        <button
          type="button"
          className="ml-3 inline-flex items-center rounded-md bg-zinc-50 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
          onClick={() => props.meeting.participants.pip.enable()}
          // onClick={showVideo.onTrue}
        >
          Show Video
          {/* <DytePipToggle
            meeting={props.meeting}
            className="ml-3 inline-flex items-center rounded-md bg-zinc-50 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
          /> */}
        </button>
        {/* <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            onClick={props.onRun}
          >
            Run
          </button> */}
      </div>
    </div>
  );
}

// {/* <Dialog open={showVideo.value} fullScreen>
//   {props.meeting ? (
//     // <DyteProvider value={props.meeting}>
//     <>
//       {/* <DyteMeeting
//         mode="fill"
//         meeting={props.meeting}
//         style={{ height: "100%" }}
//         className="absolute w-0 h-0 overflow-hidden -z-10"
//       />
//       <DytePipToggle meeting={props.meeting} /> */}
//     </>
//   ) : (
//     // </DyteProvider>
//     <div className="flex-grow flex justify-center items-center">
//       Visitors cannot join video call.
//     </div>
//   )}
//   <DialogActions sx={{ justifyContent: "center" }}>
//     <Button variant="outlined" onClick={showVideo.onFalse}>
//       Hide
//     </Button>
//   </DialogActions>
// </Dialog> */}
