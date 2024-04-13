"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Split from "react-split";
import { Terminal as JTerminal } from "@jupyterlab/terminal";
import { Terminal } from "@xterm/xterm"
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";

interface Props {
  roomId: string;
}

export default function Room(props: Props) {
    const terminal = useRef<Terminal | undefined>()
    const ws = useRef<WebSocket>(new WebSocket("wss://ursacoding.com/notebook/user/jerry/terminals/websocket/1?token=55eff85b5bff46d98ecff36ee69d62fe"))

    useEffect(() => {
        terminal.current = new Terminal()
        terminal.current.open(document.getElementById("terminal"))
        
        ws.current.onopen = (e: Event) => console.log('socket opened', e)
        ws.current.onmessage = (msgEvent) => {
            const data = JSON.parse(msgEvent.data)
            if (data[0] === "stdout") {
                console.log(data[1])
                terminal.current.write(data[1])
            }
        }

        terminal.current.onData((arg1) => {
            console.log('received', arg1)
            ws.current.send(arg1)
        })
    })

    return <Stack className="full-screen">
        {/* Navigation bar */}
        <Stack height={60} sx={{backgroundColor: "#dbe0f5"}} direction="row" justifyContent="center" alignItems="center">
            Navigation bar
        </Stack>
        <Split className="main-split" style={{flexGrow: 1}} direction="vertical" gutterSize={6} sizes={[75, 25]} snapOffset={0}>
            {/* <Split className="split" direction="horizontal" sizes={[50, 50]}>
                
            </Split> */}
            <div>
                <Split className="code-split" sizes={[50,50]} direction="horizontal" gutterSize={6} snapOffset={0}>
                    <div>left</div>
                    <div>right</div>
                </Split>
            </div>
            <Box position="relative">
                <div id="terminal" className="full-screen" />
            </Box>
        </Split>
    </Stack>
}
