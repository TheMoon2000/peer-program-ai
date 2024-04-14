"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Split from "react-split";
import axios from "axios"
import { Terminal as JTerminal } from "@jupyterlab/terminal";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useCallback, useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import MarkdownTextView from "@/components/MarkdownTextView/MarkdownTextView";
import { useParams } from "next/navigation";
import { ursaTheme } from "@/functionality/Constants";
import Rustpad, { UserInfo } from "src/rustpad";
import Chat from "@/components/chat/chat";
// Required for rustpad to work
import init, { set_panic_hook } from "rustpad-wasm";


import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { CompletionItemKind, CompletionItem as VCompletionItem, Diagnostic as VDiagnostic, WorkspaceFolder } from "vscode-languageclient"
import { MonacoLanguageClient } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction, MessageTransports, integer } from 'vscode-languageclient';
import "monaco-editor"
import { language as pylanguage, conf as pyconf } from 'monaco-editor/esm/vs/basic-languages/python/python.js'


interface Props {
  roomId: string;
}

const axiosInstance = axios.create({ baseURL: "https://ursacoding.com/notebook/user/jerry", headers: { "Authorization": "token 55eff85b5bff46d98ecff36ee69d62fe" } })

export default function Room(props: Props) {
  const { room_id } = useParams()
  const terminalInfo = useRef<{ token: string, id: number } | undefined>()
  const terminal = useRef<Terminal | undefined>(new Terminal({ cursorBlink: true }));
  const fitAddOn = useRef<FitAddon>(new FitAddon())
  const ws = useRef<WebSocket | undefined>();
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | undefined>()
  const rustpad = useRef<Rustpad>()

  const initiateTerminalSession = useCallback(() => {
    if (!terminalInfo.current) { console.warn("Cannot initiate terminal session because info is not provided") }
    const { token, id: terminalId } = terminalInfo.current
    ws.current = new WebSocket(`wss://ursacoding.com/notebook/user/${(room_id as string).replace("-", "")}/terminals/websocket/${terminalId}?token=${token}`)
    ws.current.onopen = e => console.log("socket opened", e);
    ws.current.onclose = e => console.warn('socket closed', e);
    ws.current.addEventListener("message", e => {
      const [type, content] = JSON.parse(e.data);
      if (type === "stdout") {
        terminal.current.write(content);
        terminal.current.refresh(0, terminal.current.rows)
      }
    })
  }, [terminalInfo.current])

  // Setup monaco editor
  useEffect(() => {
    init().then(() => set_panic_hook())
    monaco.languages.register({
      id: 'json',
      extensions: ['.json', '.jsonc'],
      aliases: ['JSON', 'json'],
      mimetypes: ['application/json']
    });
    monaco.languages.register({
        id: 'python',
        extensions: ['.py', '.python'],
        aliases: ['Python', 'python']
    });

    monaco.languages.setMonarchTokensProvider('python', pylanguage);
    monaco.languages.setLanguageConfiguration('python', pyconf);

    monaco.editor.getModels().forEach(m => m.dispose())
    monaco.editor.defineTheme("ursa", ursaTheme)

    editor.current = monaco.editor.create(document.querySelector("#code-editor")!, {
      lightbulb: {
        enabled: monaco.editor.ShowLightbulbIconMode.On
      },

      minimap: {
          enabled: false // This disables the minimap
      },

      language: "python",
      lineHeight: 21,
      renderLineHighlight: "all",
      fontSize: 15,
      suggestFontSize: 14,
      suggestLineHeight: 25,
      lineNumbersMinChars: 4,
      padding: { top: 5 },
      theme: "ursa",
      fontFamily: "Menlo, Consolas, monospace"
    })

    window.onresize = (ev: UIEvent) => {
      // Update editor layout
      editor.current?.layout()
      fitAddOn.current.fit()
    }

    rustpad.current = new Rustpad({
      uri: `wss://ursacoding.com/rustpad/api/socket/${room_id}`,
      editor: editor.current,
      onConnected: () => console.log("rustpad connected!"),
      onDisconnected: () => console.warn("rustpad disconnected :("),
      onChangeUsers: (users) => console.warn("users changed", users)
    })

    // TODO: fetch the terminal info from backend
    terminalInfo.current = { token: "55eff85b5bff46d98ecff36ee69d62fe", id: 1 }
    initiateTerminalSession()
    terminal.current.loadAddon(fitAddOn.current);
    terminal.current.open(document.getElementById("terminal"));
    fitAddOn.current.fit();
    
    terminal.current.onData((arg1) => {
      if (ws.current.readyState === ws.current.CLOSED) {
        console.warn("socket closed")
        if (confirm("Terminal session closed. Reopen?")) {
          initiateTerminalSession()
        }
      } else {
        ws.current.send(JSON.stringify(["stdin", arg1]));
      }
    });

    return () => {
      rustpad.current?.dispose();
      rustpad.current = undefined;
    };
    // editor.current.onDidChangeModelContent(e => {

    // })
    // editor.current.onDidChangeModelContent(e => {
    //   const code = this.editorRef!.getModel()!.getValue()
    //   console.log(code)

    // })

  })

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
        <Chat editor={editor.current} usersOnline={[{ name: "Jerry" }, { name: "Chinat" }]} />

        <div>
          <Split
            className="right-split"
            direction="vertical"
            gutterSize={6}
            sizes={[75, 25]}
            snapOffset={0}
            onDrag={sizes => {
              fitAddOn.current.fit()
              editor.current?.layout()
            }}
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
                onDrag={e => {
                  editor.current?.layout()
                }}
              >
                <div id="code-editor">

                </div>
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
