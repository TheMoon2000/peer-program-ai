"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Split from "react-split";
import axios from "axios";
import { Terminal as JTerminal } from "@jupyterlab/terminal";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useCallback, useEffect, useRef, useState } from "react";
import "@xterm/xterm/css/xterm.css";
import { useParams } from "next/navigation";
import { ursaTheme } from "@/functionality/Constants";
import Rustpad, { UserInfo } from "src/rustpad";
import Chat from "@/components/chat/chat";
import useStorage from "use-local-storage-state";
// Required for rustpad to work
import init, { set_panic_hook } from "rustpad-wasm";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  CompletionItemKind,
  CompletionItem as VCompletionItem,
  Diagnostic as VDiagnostic,
  WorkspaceFolder,
} from "vscode-languageclient";
import { MonacoLanguageClient } from "monaco-languageclient";
import {
  toSocket,
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from "vscode-ws-jsonrpc";
import {
  CloseAction,
  ErrorAction,
  MessageTransports,
  integer,
} from "vscode-languageclient";
import "monaco-editor";
import {
  language as pylanguage,
  conf as pyconf,
} from "monaco-editor/esm/vs/basic-languages/python/python.js";
import { getRooms } from "@/db/queries";
import { getRoomById, getUserIdsFromRoomId } from "@/actions/roomActions";
import { TextField } from "@mui/material";
import { useBoolean } from "@/hooks/use-boolean";
import { getSelf, updateName, updateUser } from "@/actions/userActions";
import { showDialog } from "@jupyterlab/apputils";
import LoadingButton from "@mui/lab/LoadingButton";

interface Props {
  roomId: string;
}

const axiosInstance = axios.create({
  baseURL: "https://ursacoding.com/notebook/user/jerry",
  headers: { Authorization: "token 55eff85b5bff46d98ecff36ee69d62fe" },
});

function generateHue() {
  return Math.floor(Math.random() * 360);
}

export default function Room(props: Props) {
  const { room_id } = useParams();
  const terminalInfo = useRef<{ token: string; id: number } | undefined>();
  const terminal = useRef<Terminal | undefined>();
  const fitAddOn = useRef<FitAddon>(new FitAddon());
  const ws = useRef<WebSocket | undefined>();
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | undefined>();
  const rustpad = useRef<Rustpad>();
  const showNameDialog = useBoolean(false); // TODO
  const [username, setUsername] = useState("");
  const isUsernameLoading = useBoolean(false);

  // Insertion point color
  const [hue, setHue] = useStorage("hue", { defaultValue: generateHue });

  const initiateTerminalSession = useCallback(() => {
    if (!terminalInfo.current) {
      console.warn(
        "Cannot initiate terminal session because info is not provided"
      );
    }
    const { token, id: terminalId } = terminalInfo.current;

    ws.current = new WebSocket(
      `wss://ursacoding.com/notebook/user/${(room_id as string).replace(
        /-/g,
        ""
      )}/terminals/websocket/${terminalId}?token=${token}`
    );
    ws.current.onopen = (e) => console.log("socket opened", e);
    ws.current.onclose = (e) => console.warn("socket closed", e);
    ws.current.addEventListener("message", (e) => {
      const [type, content] = JSON.parse(e.data);
      if (type === "stdout") {
        terminal.current.write(content);
        terminal.current.refresh(0, terminal.current.rows);
      }
    });
  }, [terminalInfo.current]);

  // Setup monaco editor
  useEffect(() => {
    init().then(() => set_panic_hook());
    monaco.languages.register({
      id: "json",
      extensions: [".json", ".jsonc"],
      aliases: ["JSON", "json"],
      mimetypes: ["application/json"],
    });
    monaco.languages.register({
      id: "python",
      extensions: [".py", ".python"],
      aliases: ["Python", "python"],
    });

    monaco.languages.setMonarchTokensProvider("python", pylanguage);
    monaco.languages.setLanguageConfiguration("python", pyconf);

    monaco.editor.getModels().forEach((m) => m.dispose());
    monaco.editor.defineTheme("ursa", ursaTheme);

    editor.current = monaco.editor.create(
      document.querySelector("#code-editor")!,
      {
        minimap: {
          enabled: false, // This disables the minimap
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
        fontFamily: "Menlo, Consolas, monospace",
        automaticLayout: true,
      }
    );

    window.onresize = (ev: UIEvent) => {
      // Update editor layout
      editor.current?.layout();
      fitAddOn.current.fit();
    };

    // TODO: fetch the terminal info from backend
    const userId = localStorage.getItem("userId");
    Promise.all([
      getRoomById(room_id as string),
      getUserIdsFromRoomId(room_id as string),
      getSelf(userId),
      init(),
    ]).then(([room, users, currentUser]) => {
      console.log({ token: room[0].token, id: room[0].terminalId });
      console.log("current users", users);
      if (!currentUser?.userName) {
        showNameDialog.setValue(true);
      } else {
        setUsername(currentUser.userName);
      }
      terminal.current = new Terminal({ cursorBlink: true });
      terminalInfo.current = { token: room[0].token, id: room[0].terminalId };
      initiateTerminalSession();
      terminal.current.loadAddon(fitAddOn.current);
      terminal.current.open(document.getElementById("terminal"));
      fitAddOn.current.fit();

      terminal.current.onData((arg1) => {
        if (ws.current.readyState === ws.current.CLOSED) {
          console.warn("socket closed");
          if (confirm("Terminal session closed. Reopen?")) {
            initiateTerminalSession();
          }
        } else {
          ws.current.send(JSON.stringify(["stdin", arg1]));
        }
      });

      // Rustpad init
      set_panic_hook();
      rustpad.current = new Rustpad({
        uri: `wss://ursacoding.com/rustpad/api/socket/${room_id}`,
        editor: editor.current,
        onConnected: () => {
          console.log("rustpad connected!", username, hue);
          rustpad.current?.setInfo({ name: username, hue: hue });
        },
        onDisconnected: () => console.warn("rustpad disconnected :("),
        onChangeUsers: (users) => console.warn("users changed", users),
      });
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
  }, []);

  return (
    <>
      <Stack className="full-screen">
        {/* Navigation bar */}
        <Stack
          height="4rem"
          sx={{ backgroundColor: "#dbe0f5" }}
          direction="row"
          justifyContent="center"
          alignItems="center"
          flexShrink={0}
        >
          Peer Program
        </Stack>
        <Split
          className="main-split"
          direction="horizontal"
          sizes={[32, 68]}
          gutterSize={6}
          style={{ flexGrow: 1 }}
        >
          <Chat
            editor={editor.current}
            usersOnline={[{ name: "Jerry" }, { name: "Chinat" }]}
            userName={username}
          />

          <div>
            <Split
              className="right-split"
              direction="vertical"
              gutterSize={6}
              sizes={[75, 25]}
              snapOffset={0}
              onDrag={(sizes) => {
                fitAddOn.current.fit();
                editor.current?.layout();
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
                  onDrag={(e) => {
                    editor.current?.layout();
                  }}
                >
                  <div id="code-editor"></div>
                  <div>right</div>
                </Split>
              </div>
              <Box position="relative">
                <div
                  id="terminal"
                  className="full-screen"
                  style={{ overflowY: "auto" }}
                />
              </Box>
            </Split>
          </div>
        </Split>
      </Stack>

      <Dialog open={showNameDialog.value} fullWidth maxWidth="sm">
        <DialogTitle>Looks like it is your first time here</DialogTitle>
        <DialogContent>
          <Box mb={2} mt={-0.25}>
            What is your name?
          </Box>
          <TextField
            placeholder="Name"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton
            disabled={!username}
            loading={isUsernameLoading.value}
            variant="contained"
            color="primary"
            onClick={async () => {
              isUsernameLoading.setValue(true);
              const userId = localStorage.getItem("userId");
              if (!userId) {
                window.location.assign("/");
              }
              const response = await updateName(userId, username);
              if (response === undefined) {
                window.location.assign("/");
              } else {
                showNameDialog.setValue(false);
                isUsernameLoading.setValue(false);
              }
            }}
          >
            Join Room
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
