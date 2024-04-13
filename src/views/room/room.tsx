"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Split from "react-split";
import axios from "axios"
import { Terminal as JTerminal } from "@jupyterlab/terminal";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import MarkdownTextView from "@/components/MarkdownTextView/MarkdownTextView";

interface Props {
  roomId: string;
}

const axiosInstance = axios.create({ baseURL: "https://ursacoding.com/notebook/user/jerry", headers: { "Authorization": "token 55eff85b5bff46d98ecff36ee69d62fe" } })

export default function Room(props: Props) {
  const terminal = useRef<Terminal | undefined>(new Terminal({ cursorBlink: true }));
  const fitAddOn = useRef<FitAddon>(new FitAddon())
  const ws = useRef<WebSocket | undefined>();

  useEffect(() => {
    const terminalId = 1 // TODO: load actual terminal session ID      
    ws.current = new WebSocket(
      `wss://ursacoding.com/notebook/user/jerry/terminals/websocket/${terminalId}?token=55eff85b5bff46d98ecff36ee69d62fe`
    )

    terminal.current.loadAddon(fitAddOn.current);
    terminal.current.open(document.getElementById("terminal"));
    fitAddOn.current.fit();
    
    ws.current.onopen = (e: Event) => console.log("socket opened", e);
    ws.current.onclose = e => console.warn('socket closed', e);

    ws.current.addEventListener("message", e => {
      const [type, content] = JSON.parse(e.data);
      if (type === "stdout") {
        terminal.current.write(content);
        terminal.current.refresh(0, terminal.current.rows)
      }
    })

    terminal.current.onData((arg1) => {
      if (ws.current.readyState === ws.current.CLOSED) {
        console.warn("socket closed")
      } else {
        ws.current.send(JSON.stringify(["stdin", arg1]));
      }
    });

    window.addEventListener("unload", () => {
      ws.current.close()
    })
  });

  return (
    <Stack className="full-screen">
      {/* Navigation bar */}
      <Stack
        height={60}
        sx={{ backgroundColor: "#dbe0f5" }}
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        Navigation bar
      </Stack>
      <Split className="main-split" direction="horizontal" sizes={[32, 68]} gutterSize={6} style={{flexGrow: 1}}>
        <div>
          <MarkdownTextView rawText={"Instructions come here.\n```python\ndef hello():\n    print('hello')\n```"} />
        </div>

        <div>
          <Split
            className="right-split"
            direction="vertical"
            gutterSize={6}
            sizes={[75, 25]}
            snapOffset={0}
            onDrag={sizes => fitAddOn.current.fit()}
          >
            {/* <Split className="split" direction="horizontal" sizes={[50, 50]}>
                      
                  </Split> */}
            <div>
              <Split
                className="code-split"
                sizes={[50, 50]}
                direction="horizontal"
                gutterSize={6}
                snapOffset={0}
              >
                <div>left</div>
                <div>right</div>
              </Split>
            </div>
            <Box position="relative">
              <div id="terminal" className="full-screen" style={{overflowY: "auto"}} />
            </Box>
          </Split>
        </div>
      </Split>
    </Stack>
  );
}
