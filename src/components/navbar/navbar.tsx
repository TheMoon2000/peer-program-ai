import Link from "next/link";
import { DyteProvider, useDyteClient, useDyteMeeting } from '@dytesdk/react-web-core';
import { DyteMeeting } from '@dytesdk/react-ui-kit';
import { useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useBoolean } from "@/hooks/use-boolean";

interface Props {
  authToken?: string
  onRun: () => void
}

export default function Navbar(props: Props) {
  // const [meeting, initMeeting] = useDyteClient()
  const showVideo = useBoolean(false)

    useEffect(() => {
        // initMeeting({
        //     authToken: props.authToken ?? "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdJZCI6ImI1Y2Q5MjY2LWRkZWQtNDI4OC05ZDE5LTE3MWRkNzg0YmIxOCIsIm1lZXRpbmdJZCI6ImJiYjBkNTBiLWVlOWQtNGI4MC1iZTUyLTQwZWZhNWM4YjAyZSIsInBhcnRpY2lwYW50SWQiOiJhYWE4MGUwNy0xYjliLTQ0ZWMtYTliZi1iN2QxNTE0NzUzNzciLCJwcmVzZXRJZCI6IjQwMDg3YzIzLWJjYTAtNGIxYS1iYzc2LWNmODY1MzAwY2YxMyIsImlhdCI6MTcxMzEzNzg3MywiZXhwIjoxNzIxNzc3ODczfQ.q8Nxsgzp9NgdkhyLOJbOQEO0mL05492sCjXRISselKGF-NmF6XaoHf6BvvkgXfTMJR33pgALpCkBJVcSIeFO78DwyTQ-rJd-edvaZHpUp-vg14OJiIE1iX8FzdpEd6E5HEoJC-V9KILKa4EqHWkqTVtec_XyfiSDB2NnjltoyhIE_h1tDqsneWqzy-EqHjbml7OPFUPQ5lBriqHsQhv6U-kba-cIirQdkjNpNe7gct_EBq556FoeSmLfeqx6gx67QVkExm6xOUBvdKFQmWDeAR9rcz-qsJMxc8hZBxoQrN3OMBNFS7-08LOsOH8DS3Df9SRmpVaODEMD5-CRTZJQ2Q",
        //     defaults: {
        //         audio: false,
        //         video: true
        //     }
        // })//.then((m) => m?.joinRoom())
    }, [])


  return (
      <div style={{height: "100px"}} className="bg-gray-800 p-8 md:flex md:items-center md:justify-between">
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
            {/* <img
              className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
              src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
            <img
              className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
              src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            /> */}
            <img
              className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
              alt=""
            />
            <img
              className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
          </div>
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-zinc-50 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300"
            onClick={showVideo.onTrue}
          >
            Toggle Video
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            onClick={props.onRun}
          >
            Run
          </button>
        </div>
      <Dialog open={showVideo.value} fullScreen>
        {/* <DyteProvider value={meeting}>
          <DyteMeeting mode="fill" meeting={meeting} style={{height: "100%"}} />
        </DyteProvider>
        <DialogActions sx={{justifyContent: "center"}}>
          <Button onClick={showVideo.onFalse}>Hide</Button>
        </DialogActions> */}
      </Dialog>
    </div>
  );
}

function VideoView() {
  const { meeting } = useDyteMeeting();
  return <div style={{height: "100vh", width: "100vw"}}>
      <DyteMeeting mode="fill" meeting={meeting} style={{height: "100%"}} />
  </div>
}