import Link from "next/link";
import {
  DyteGrid,
  DyteMeeting,
  DyteParticipantTile,
  DytePipToggle,
} from "@dytesdk/react-ui-kit";
import { useCallback, useEffect, useState, useRef } from "react"; // mark modified

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useBoolean } from "@/hooks/use-boolean";
import DyteClient from "@dytesdk/web-core";
import { DyteProvider } from "@dytesdk/react-web-core";
import { RoomInfo } from "@/Data Structures";
import { DialogContent, DialogTitle } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { axiosInstance } from "@/Constants";
import { useSnackbar } from "notistack";

// mark - start
function Popup({
  isVisible,
  onClose,
  title,
  message,
  buttonText,
}: {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message?: string; // Make the message optional
  buttonText: string;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
        {message && <p className="text-sm mb-8">{message}</p>}
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-md bg-zinc-50 px-5 py-3 text-lg font-semibold text-gray-700 shadow-sm hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-300"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
// mark - end

interface Props {
  onRun: () => void;
  roomInfo: RoomInfo;
}

export default function Navbar(props: Props) {
  const showVideo = useBoolean(false);
  const showUserRoleDialog = useBoolean(false);
  const showSwitchRoleDialog = useBoolean(false);
  const isSwitchingRole = useBoolean(false);
  const snackbar = useSnackbar();

  const [isPopupVisible, setPopupVisible] = useState(false); // mark
  const originalButtonRef = useRef<HTMLButtonElement | null>(null); // mark

  const roleName =
    typeof props.roomInfo.meeting.role === "number"
      ? ["Unassigned", "Driver", "Navigator"][props.roomInfo.meeting.role]
      : "Guest";
  const otherRoleName = ["Guest", "Driver", "Navigator"][
    (3 - props.roomInfo.meeting.role ?? 0) % 3
  ];

  const switchRole = useCallback(() => {
    isSwitchingRole.setValue(true);
    axiosInstance
      .post(`/rooms/${props.roomInfo.room.id}/switch-roles`, {
        email: localStorage.getItem("email"),
        role: props.roomInfo.meeting.role,
      })
      .then((response) => {
        showSwitchRoleDialog.setValue(false);
        snackbar.enqueueSnackbar({
          message: `You switched your role to ${otherRoleName}.`,
          variant: "success",
        });
        props.roomInfo.meeting.role = response.data.role;
        setTimeout(() => isSwitchingRole.setValue(false), 500);
      })
      .catch((err) => {
        console.warn(err);
        isSwitchingRole.setValue(false);
        alert("Failed to switch!");
      });
  }, [props.roomInfo]);

  // mark - start
  useEffect(() => {
    const popupSeen = localStorage.getItem("popupSeen");
    if (!popupSeen) {
      setPopupVisible(true); // Show popup if not previously dismissed
    }
  }, []);

  const handleOriginalButtonClick = () => {
    if (props.roomInfo.meeting.zoom_url) {
      window.open(props.roomInfo.meeting.zoom_url, "_blank");
      console.log("Original Join Video Call button clicked!");
    } else {
      console.log("Zoom URL is not available.");
    }
  };

  const handlePopupButtonClick = () => {
    setPopupVisible(false);
    localStorage.setItem("popupSeen", "true");
    if (originalButtonRef.current) {
      console.log("Triggering click on the original Join Video Call button.");
      originalButtonRef.current.click();
    } else {
      console.error("Original button reference is null.");
    }
  };
  // mark - end

  return (
    <div
      style={{ height: "100px" }}
      className="bg-gray-800 px-8 md:flex md:items-center md:justify-between"
    >
      <div className="min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Pear Program
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
              key={p.zoom_registrant_id}
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
          ref={originalButtonRef} // mark
          type="button"
          className="ml-3 inline-flex items-center rounded-md bg-zinc-50 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-50 disabled:cursor-not-allowed"
          disabled={!props.roomInfo.meeting.zoom_url}
          onClick={() => {
            window.open(props.roomInfo.meeting.zoom_url, "_blank");
          }}
        >
          Join Video Call
        </button>
      </div>
      <Popup
        isVisible={isPopupVisible}
        onClose={handlePopupButtonClick}
        title="Please click the button below to join the video call."
        buttonText="Join Video Call"
      />
      <div
        style={{
          flexGrow: 1,
          flexShrink: 1,
          height: "100px",
          position: "relative",
        }}
      ></div>
      {(props.roomInfo.meeting.role === 1 ||
        props.roomInfo.meeting.role === 2) && (
        <div className="text-white flex flex-row justify-center items-center gap-x-2">
          <span>
            Your Role:{" "}
            <b
              className="text-sky-100 hover:underline cursor-pointer"
              onClick={showUserRoleDialog.onTrue}
            >
              {roleName}
            </b>
          </span>
          {!!props.roomInfo.meeting.role && (
            <button
              className={`text-white text-opacity-90 bg-slate-600 border-none rounded-md hover:bg-slate-500 duration-200 px-2 py-1 ${
                props.roomInfo.meeting.role ? "cursor-pointer" : ""
              }`}
              style={{ fontSize: 13 }}
              onClick={showSwitchRoleDialog.onTrue}
            >
              Switch
            </button>
          )}
        </div>
      )}
      <a
        className="ml-3 inline-flex items-center rounded-md bg-[#1f2937] border border-white px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#374151] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#1f2937]"
        href="https://forms.gle/s6uH68oB3C85q9yb7"
        target="_blank"
        rel="noopener noreferrer"
      >
        Report Issue
      </a>
      <button
        type="button"
        className="ml-3 inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        onClick={props.onRun}
      >
        Run Code
      </button>
      {!!props.roomInfo.meeting.role && (
        <Dialog
          open={showUserRoleDialog.value}
          onClose={showUserRoleDialog.onFalse}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{`The ${
            ["", "Driver", "Navigator"][props.roomInfo.meeting.role]
          }`}</DialogTitle>
          <DialogContent>
            {props.roomInfo.meeting.role === 1
              ? "As the driver, your responsibility involves writing the code. You should think out loud and help the navigator understand the code."
              : "As the navigator, your responsibility involves reviewing each line of code as it is typed by the Driver, considering the big picture, and providing directions and suggestions."}
          </DialogContent>
          <DialogActions>
            <Button
              variant="soft"
              color="primary"
              onClick={showUserRoleDialog.onFalse}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {!!props.roomInfo.meeting.role && (
        <Dialog
          open={showSwitchRoleDialog.value}
          onClose={showSwitchRoleDialog.onFalse}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{"Switch role with your coding partner?"}</DialogTitle>
          <DialogContent>{`You are currently the ${roleName}. After switching, you will become the ${otherRoleName} and your partner will become the ${roleName}.`}</DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={showSwitchRoleDialog.onFalse}>
              Cancel
            </Button>
            <LoadingButton
              variant="soft"
              color="primary"
              loading={isSwitchingRole.value}
              onClick={switchRole}
            >
              Switch
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
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
