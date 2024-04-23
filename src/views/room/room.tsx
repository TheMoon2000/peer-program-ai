"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Split from "react-split";
import axios from "axios";
import { PyodideInterface, loadPyodide } from "pyodide";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useCallback, useEffect, useRef, useState } from "react";
import "@xterm/xterm/css/xterm.css";
import { useParams } from "next/navigation";
import { ursaTheme } from "@/functionality/Constants";
import Rustpad, { UserInfo } from "src/rustpad";
import Chat from "@/components/chat/chat";
import useStorage from "use-local-storage-state";
import debounce from "lodash.debounce"
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
import Grading from "../grading/grading";
import Navbar from "@/components/navbar/navbar";
import { HOST, axiosInstance, rustpadInstance } from "@/Constants";
import { RoomInfo, TestResult } from "@/Data Structures";
import TestCases from "../grading/test-cases";

interface Props {
  roomId: string;
}


function generateHue() {
  return Math.floor(Math.random() * 360);
}



export default function Room(props: Props) {
  const { room_id } = useParams();
  const roomInfo = useRef<RoomInfo | undefined>()
  const [terminalInfo, setTerminalInfo] = useState<{ token: string; id: string } | null | undefined>();
  const [testResults, setTestResults] = useState<TestResult[] | undefined | null>()
  const terminal = useRef<Terminal | undefined>();
  const fitAddOn = useRef<FitAddon>(new FitAddon());
  const pyodideRef = useRef<PyodideInterface | undefined>()
  const ws = useRef<WebSocket | undefined>();
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | undefined>();
  const rustpad = useRef<Rustpad>();
  const rustpadFailed = useBoolean(false);
  const authorshipRustpad = useRef<Rustpad>();
  const showNameDialog = useBoolean(false); // TODO
  const isTerminalLoading = useBoolean(false);
  const isRunningTests = useBoolean(false);

  // Insertion point color
  const [hue, setHue] = useStorage("hue", { defaultValue: generateHue });

  const initiateTerminalSession = useCallback((terminalId: string, token: string) => {
    ws.current = new WebSocket(
      `ws://${HOST}/notebook/user/${room_id}/terminals/websocket/${terminalId}?token=${token}`
    );
    ws.current.onopen = (e) => {
      terminal.current.writeln("Welcome to Pear Program's collaborative terminal. Your code is located at main.py. Run `python main.py` to debug it.")
    };
    ws.current.onclose = (e) => {
      setTerminalInfo(null)
      stopper.dispose()
      terminal.current.blur()
      terminal.current.dispose()
      terminal.current = new Terminal({ cursorBlink: true });
      terminal.current.loadAddon(fitAddOn.current);
      terminal.current.open(document.getElementById("terminal"));
      fitAddOn.current.fit();
    };

    ws.current.onmessage = (e: MessageEvent<any>) => {
      const [type, content] = JSON.parse(e.data);
      if (type === "stdout") {
        terminal.current.write(content);
        terminal.current.refresh(0, terminal.current.rows);
      }
    }

    const stopper = terminal.current.onData((arg1) => {
      if (ws.current.readyState === ws.current.CLOSED) {
        console.warn("socket closed");
        if (confirm("Terminal session closed. Reopen?")) {
          axiosInstance.post(`/rooms/${room_id}/restart-server`).then((r) => {
            stopper.dispose()
            
            setTerminalInfo({ id: r.data.terminal.name, token: token })
            initiateTerminalSession(r.data.terminal.name, token);
          });
        }
      } else {
        ws.current.send(JSON.stringify(["stdin", arg1]));
      }
    });
  }, [terminalInfo]);

  // Intelligently save code to the server while balancing API call frequency and recency
  // When the user has made a change and 
  const updateCode = useCallback(debounce(() => {
    const newCode = editor.current.getValue()
    axiosInstance.post(`/rooms/${room_id}/code`, {
      file: newCode
    }).catch(err => {
      console.warn(err)
    })
  }, 1000), [])

  // Setup monaco editor
  useEffect(() => {
    terminal.current = new Terminal({ cursorBlink: true });
    terminal.current.loadAddon(fitAddOn.current);
    terminal.current.open(document.getElementById("terminal"));
    fitAddOn.current.fit();

    loadPyodide({indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"}).then(p => pyodideRef.current = p)

    Promise.all([
      axiosInstance.get(`/rooms/${room_id}?email=${localStorage.getItem("email")}`),
      fetch("/rustpad_wasm_bg.wasm").then(async r => {
        await init(r)
        set_panic_hook()
      })
    ]).then(([response]) => {
      roomInfo.current = response.data as RoomInfo
      console.log(roomInfo.current)
      setTestResults(roomInfo.current.room.test_results)
      if (roomInfo.current.room.jupyter_server_token && roomInfo.current.server.terminal_id) {
        setTerminalInfo({ id: roomInfo.current.server.terminal_id, token: roomInfo.current.room.jupyter_server_token })
        initiateTerminalSession(roomInfo.current.server.terminal_id, roomInfo.current.room.jupyter_server_token)
      } else {
        setTerminalInfo(null)
      }
      
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
  
      monaco.editor.defineTheme("ursa", ursaTheme);
      editor.current = monaco.editor.create(
        document.querySelector("#code-editor")!,
        {
          value: roomInfo.current.room.code,
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
      editor.current.onDidChangeModelContent(updateCode)

      restartRustpad()
    })

    
    window.onresize = (ev: UIEvent) => {
      // Update editor layout
      editor.current?.layout();
      fitAddOn.current.fit();
    };

    // TODO: fetch the terminal info from backend
    const userId = localStorage.getItem("userId");
    /*
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
    });
    */

    // Rustpad init
    // init().then(() => {
    //   set_panic_hook();
    
      // authorshipRustpad.current = new Rustpad({
      //   uri: `ws://${HOST}/rustpad/api/socket/${room_id}-authors`,
        
      // })
    // })

    // return () => {
    //   rustpad.current?.dispose();
    //   rustpad.current = undefined;
    // };
  }, []);

  const restartRustpad = useCallback(() => {
    if (rustpad.current) {
      rustpad.current.dispose()
    }
    if (localStorage.getItem("email")) {
      rustpad.current = new Rustpad({
        uri: `ws://${HOST}/rustpad/api/socket/${room_id}`,
        authorId: localStorage.getItem("email"),
        editor: editor.current,
        onConnected: () => {
          console.log("rustpad connected! hue:", hue);
          rustpad.current?.setInfo({ name: localStorage.getItem("name"), hue: hue });
          if (rustpadFailed.value) { rustpadFailed.setValue(false) }
        },
        onDisconnected: () => {
          console.warn("rustpad disconnected :("),
          rustpadFailed.setValue(true)
        },
        onDesynchronized() {
            rustpadFailed.setValue(true)
        },
        onChangeUsers: (users) => console.warn("users changed", users),
      });
    }
  }, [editor.current, room_id])

  const runCode = async () => {
    const currentCode = editor.current.getValue()
    const pyodide = pyodideRef.current
    if (!pyodide) {
      alert("Browser doesn't support python!")
      return
    }
  
    setTestResults(undefined)
    isRunningTests.setValue(true)

    let newTestResults: TestResult[] = []
    for (const testCase of roomInfo.current.room.test_cases) {
      console.log(`Running test '${testCase.title}'...`)
      let userStdin: string[] = []
      let userStdout: string[] = []
      let currentOutput = ""
      let errMsg: string | undefined = undefined
      pyodide.setStdout({
        // batched: (line: string) => {
        //   userStdout.push(line)
        //   userStdin.push("") // temporary
        //   console.log('output', line)
        // },
        raw: (ascii: number) => {
          const char = String.fromCharCode(ascii)
          if (char === "\n") {
            userStdout.push(currentOutput)
            userStdin.push("")
            currentOutput = ""
          } else {
            currentOutput += char
          }
        }
      })

      let lineIndex = 0
      pyodide.setStdin({ stdin: () => {
        userStdout.push(currentOutput)
        currentOutput = ""
        const input = testCase.stdin[lineIndex++]
        if (input === undefined) {
          return ""
        } else {
          userStdin[lineIndex - 1] = input
          return input
        }
      }, isatty: false })

      await pyodide.runPythonAsync(currentCode).catch(err => {
        errMsg = `${err}`
      })

      if (currentOutput) {
        userStdout.push(currentOutput)
      }

      newTestResults.push({
        stdinObserved: userStdin,
        stdoutObserved: userStdout,
        error: errMsg,
        isCorrect: !errMsg && userStdout.every((v, i) => v.trim() === testCase.stdout_expected[i]?.trim())
      })
    }

    console.log('test results', newTestResults)
    
    await axiosInstance.post(`/rooms/${room_id}/test_results`, {
      test_results: newTestResults
    })
    isRunningTests.setValue(false)
    setTestResults(newTestResults)
    
  }

  return (
    <>
      <Stack className="full-screen">
        {/* Navigation bar */}
        <Navbar onRun={runCode}></Navbar>
        {/* <Stack
          height="4rem"
          sx={{ backgroundColor: "#dbe0f5" }}
          direction="row"
          justifyContent="center"
          alignItems="center"
          flexShrink={0}
        >
          Peer Program
        </Stack> */}
        <Split
          className="main-split"
          direction="horizontal"
          sizes={[32, 68]}
          gutterSize={6}
          style={{ flexGrow: 1, maxHeight: "calc(100vh - 100px)" }}
        >
          {/* <Chat
            roomId={room_id as string}
            userId={localStorage.getItem("userId")!}
            editor={editor.current}
            usersOnline={[{ name: "Jerry" }, { name: "Chinat" }]}
            userName={username}
          /> */}
          <div />

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
                  style={{flexShrink: 1, alignItems: "stretch", position: "relative"}}
                  sizes={[55, 45]}
                  direction="horizontal"
                  gutterSize={6}
                  snapOffset={0}
                  onDrag={(e) => {
                    editor.current?.layout();
                  }}
                >
                  <div id="code-editor" className="relative">
                    {rustpadFailed.value && <div className="absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center z-10" style={{backgroundColor: "#ffffffd0"}}>
                      <div className="p-2">Failed to connect. Please make sure you don't have another tab open.</div>
                      <Button onClick={restartRustpad}>Reconnect</Button>
                    </div>}
                  </div>
                  {/* <Grading editor={editor.current} /> */}
                  <TestCases onRun={runCode} cases={roomInfo.current?.room.test_cases} results={testResults} isWaiting={isRunningTests.value} />
                </Split>
              </div>
              <Box position="relative">
                <div
                  id="terminal"
                  className="full-screen"
                  style={{ overflowY: "auto", flexShrink: 0 }}
                />
                {terminalInfo === null && <div className="flex absolute w-full h-full justify-center items-center">
                   <LoadingButton loading={isTerminalLoading.value} sx={{color: "#e0e0e0", borderColor: "#e0e0e050"}} variant="outlined" onClick={() => {
                    isTerminalLoading.setValue(true)
                    axiosInstance.post(`/rooms/${room_id}/create-server`).then(r => {
                      setTerminalInfo({ id: r.data.terminal_id, token: roomInfo.current.room.jupyter_server_token })
                      initiateTerminalSession(r.data.terminal_id, roomInfo.current.room.jupyter_server_token)
                    }).catch(err => console.warn(err))
                    .finally(isTerminalLoading.onFalse)
                  }}>Start A Collaborative Terminal Session</LoadingButton>
                </div>}
              </Box>
            </Split>
          </div>
        </Split>
      </Stack>

      {/* <Dialog open={showNameDialog.value} fullWidth maxWidth="sm">
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
      </Dialog> */}
    </>
  );
}
