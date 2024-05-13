"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Split from "react-split";
import axios from "axios";
import { PyodideInterface, loadPyodide } from "pyodide";
import { IDisposable, Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useCallback, useEffect, useRef, useState } from "react";
import "@xterm/xterm/css/xterm.css";
import { useParams } from "next/navigation";
import { ursaTheme } from "@/functionality/Constants";
import Rustpad, { UserInfo } from "src/rustpad";
import Chat from "./chat";
import useStorage from "use-local-storage-state";
import debounce from "lodash.debounce";
// Required for rustpad to work
import init, { set_panic_hook } from "rustpad-wasm";
import ResetIcon from "@mui/icons-material/RefreshRounded";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import {
  DyteProvider,
  useDyteClient,
  useDyteMeeting,
  useDyteSelector,
} from "@dytesdk/react-web-core";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor";
import {
  language as pylanguage,
  conf as pyconf,
} from "monaco-editor/esm/vs/basic-languages/python/python.js";
import { TextField } from "@mui/material";
import { useBoolean } from "@/hooks/use-boolean";
import { showDialog } from "@jupyterlab/apputils";
import LoadingButton from "@mui/lab/LoadingButton";
import Grading from "../grading/grading";
import Navbar from "@/components/navbar/navbar";
import { HOST, axiosInstance, rustpadInstance } from "@/Constants";
import { Question, RoomInfo, TestResult } from "@/Data Structures";
import TestCases from "../grading/test-cases";
import Loading from "../loading/loading";
import {
  DyteAudioVisualizer,
  DyteChat,
  DyteGrid,
  DyteMeeting,
  DyteNameTag,
  DyteParticipantTile,
  DytePipToggle,
} from "@dytesdk/react-ui-kit";
import { ChatPlaceholder } from "./chat-placeholder";
import QuestionsDialog from "@/components/QuestionsDialog";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { DyteParticipant } from "@dytesdk/web-core";
import { replaceCanvasImport } from "@/utils/helper";

import * as unthrow from "@/graphics/unthrow";
import MarkdownTextView from "@/components/MarkdownTextView/MarkdownTextView";

interface Props {
  roomId: string;
}

function generateHue() {
  return Math.floor(Math.random() * 360);
}

export default function Room(props: Props) {
  const { room_id } = useParams();
  const roomInfo = useRef<RoomInfo | null | undefined>();
  const isPageLoaded = useBoolean(false);
  const [terminalInfo, setTerminalInfo] = useState<
    { token: string; id: string } | null | undefined
  >();
  const [testResults, setTestResults] = useState<
    TestResult[] | undefined | null
  >();
  const terminal = useRef<Terminal | undefined>();
  const terminalListenerStopper = useRef<IDisposable>();
  const fitAddOn = useRef<FitAddon>(new FitAddon());
  const pyodideRef = useRef<PyodideInterface | undefined>();
  const canvasRef = useRef(null);

  const ws = useRef<WebSocket | undefined>();
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | undefined>();
  const authorEditor = useRef<monaco.editor.ICodeEditor | undefined>();
  const rustpad = useRef<Rustpad>();
  const authorRustpad = useRef<Rustpad>();
  const rustpadFailed = useBoolean(false);
  const isResettingTerminal = useBoolean(false);
  const isRunningTests = useBoolean(false);
  const showResetTerminalDialog = useBoolean(false);
  const [questions, setQuestions] = useState<Question[]>();
  const snackbar = useSnackbar();
  const [participantLeftMessage, setParticipantLeftMessage] = useState<{ title: string, message: string }>(undefined)

  const [meeting, initMeeting] = useDyteClient();

  const [updateState, setUpdateState] = useState(0);
  // const awsTranscribe = useRef<AWSTranscribe>();

  // Insertion point color
  const [hue, setHue] = useStorage("hue", { defaultValue: generateHue });

  const initiateTerminalSession = useCallback(
    (
      terminalId: string,
      token: string,
      showWelcomeString = true,
      onOpen?: (ws: WebSocket) => void
    ) => {
      ws.current = new WebSocket(
        `wss://${HOST}/notebook/user/${room_id}/terminals/websocket/${terminalId}?token=${token}`
      );
      console.log("opened new terminal connection", ws.current);
      if (showWelcomeString) {
        ws.current.onopen = (e) => {
          terminal.current.writeln(
            "Welcome to Pear Program's collaborative terminal. Your code is located at main.py. Run `python main.py` to debug it."
          );
          if (ws.current.readyState === WebSocket.OPEN) {
            onOpen?.(ws.current);
          }
        };
      } else if (onOpen) {
        ws.current.onopen = () => {
          onOpen(ws.current);
        };
      }
      let oldWs = ws.current;
      ws.current.onclose = (e) => {
        if (ws.current === oldWs) {
          console.log("same ws session, closing old");
          setTerminalInfo(null);
        }
        stopper.dispose();
        terminal.current.blur();
        terminal.current.dispose();
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
      };

      const stopper = terminal.current.onData((arg1) => {
        if (ws.current.readyState === ws.current.CLOSED) {
          console.warn("socket closed");
          if (confirm("Terminal session closed. Reopen?")) {
            axiosInstance.post(`/rooms/${room_id}/restart-server`).then((r) => {
              stopper.dispose();

              setTerminalInfo({ id: r.data.terminal.name, token: token });
              initiateTerminalSession(r.data.terminal.name, token);
            });
          }
        } else {
          ws.current.send(JSON.stringify(["stdin", arg1]));
        }
      });
      terminalListenerStopper.current = stopper;
    },
    [terminalInfo]
  );

  // Intelligently save code to the server while balancing API call frequency and recency
  // When the user has made a change and
  const updateCode = useCallback(
    debounce(() => {
      const newCode = editor.current.getValue();
      axiosInstance
        .post(`/rooms/${room_id}/code`, {
          file: newCode,
          author_map: authorEditor.current.getValue(),
        })
        .catch((err) => {
          console.warn(err);
        });
    }, 1000),
    []
  );

  // Step 1: Load room info
  useEffect(() => {
    const userEmail = localStorage.getItem("email");

    loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
    }).then((p) => {
      pyodideRef.current = p;
    });

    Promise.all([
      axiosInstance.get(`/rooms/${room_id}?email=${userEmail}`),
      axiosInstance.get(`/questions`),
      fetch("/rustpad_wasm_bg.wasm").then(async (r) => {
        await init(r);
        set_panic_hook();
      }),
    ])
      .then(([response, questionsResponse]) => {
        roomInfo.current = response.data as RoomInfo;
        console.log(roomInfo.current);
        setTestResults(roomInfo.current.room.test_results);

        /* temporarily disabled to save api usage */
        if (roomInfo.current.meeting.user_token) {
          initMeeting({
            authToken: roomInfo.current.meeting.user_token,
            defaults: {
              audio: true,
              video: true,
            },
          }).then((m) => m?.joinRoom());
        }

        isPageLoaded.setValue(true);

        setQuestions(questionsResponse.data);
      })
      .catch((err) => {
        console.warn(err);
        roomInfo.current = null;
        isPageLoaded.setValue(true);
      });

    window.onresize = (ev: UIEvent) => {
      // Update editor layout
      editor.current?.layout();
      fitAddOn.current.fit();
    };

    // Required to maintain active session
    setInterval(() => {
      axiosInstance
        .post(`/rooms/${roomInfo.current.room.id}/heartbeat`)
        .catch((err) => {
          console.warn(err);
        });
    }, 20000);

    // return () => {
    //   rustpad.current?.dispose();
    //   rustpad.current = undefined;
    // };
  }, []);

  // Step 2: render page
  useEffect(() => {
    if (isPageLoaded.value && roomInfo.current) {
      const userEmail = localStorage.getItem("email");
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
          value: roomInfo.current.room.rustpad_code
            ? ""
            : roomInfo.current.room.code,
          minimap: {
            enabled: false, // This disables the minimap
          },
          readOnly: !userEmail,
          readOnlyMessage: { value: "Visitors cannot edit the code." },
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

      authorEditor.current = monaco.editor.create(
        document.querySelector("#author-editor")!,
        {
          value: roomInfo.current.room.rustpad_author_map
            ? ""
            : roomInfo.current.room.author_map,
          minimap: { enabled: false },
          language: "plaintext",
          automaticLayout: true,
        }
      );

      editor.current.onDidChangeModelContent((e) => {
        //@ts-ignore
        if (!e.changes[0].forceMoveMarkers) {
          authorEditor.current.getModel().pushEditOperations(
            editor.current.getSelections(),
            e.changes.map((c) => ({
              text: c.text.replace(
                /[^\n]/g,
                String.fromCharCode(48 + roomInfo.current.author_id || 63)
              ), // ASCII 63 = '?'
              range: c.range,
              //@ts-ignore
              rangeLength: c.rangeLength,
              rangeOffset: c.rangeOffset,
            })),
            () => null
          );
          updateCode();
        }
      });

      restartRustpad();

      terminal.current = new Terminal({ cursorBlink: true });
      terminal.current.loadAddon(fitAddOn.current);
      terminal.current.open(document.getElementById("terminal"));
      fitAddOn.current.fit();

      if (
        roomInfo.current.room.jupyter_server_token &&
        roomInfo.current.server.terminal_id
      ) {
        setTerminalInfo({
          id: roomInfo.current.server.terminal_id,
          token: roomInfo.current.room.jupyter_server_token,
        });
        initiateTerminalSession(
          roomInfo.current.server.terminal_id,
          roomInfo.current.room.jupyter_server_token
        );
      } else {
        setTerminalInfo(null);
      }
    }
  }, [isPageLoaded.value]);

  const restartRustpad = useCallback(() => {
    if (rustpad.current) {
      rustpad.current.dispose();
    }
    rustpad.current?.dispose()
    rustpad.current = new Rustpad({
      uri: `wss://rustpad.io/api/socket/${room_id}`,
      editor: editor.current,
      onConnected: () => {
        console.log("rustpad connected! hue:", {
          name: localStorage.getItem("name"),
          hue: hue,
        });
        rustpad.current?.setInfo({
          name: localStorage.getItem("name") ?? `Anonymous User`,
          hue: hue,
        });
        if (rustpadFailed.value) {
          rustpadFailed.setValue(false);
        }
      },
      onDisconnected: () => {
        console.warn("rustpad disconnected :("), rustpadFailed.setValue(true);
      },
      onDesynchronized() {
        rustpadFailed.setValue(true);
      },
    });
    authorRustpad.current?.dispose()
    authorRustpad.current = new Rustpad({
      uri: `wss://rustpad.io/api/socket/${room_id}-authors`,
      editor: authorEditor.current,
      onConnected: () => console.log("author rustpad connected!"),
      onDisconnected: () => console.warn("author rustpad disconnected"),
    });
  }, [editor.current, room_id]);

  // change question
  const handleQuestionChange = async (question: Question) => {
    const response = await axiosInstance
      .patch(`/rooms/${room_id}/`, {
        question_id: question.question_id,
        name: localStorage.getItem("name"),
      })
      .catch((err) => console.error(err));

    if (!!response && !!response.data) {
      roomInfo.current.room.question_id = response.data.question_id;
      roomInfo.current.room.test_cases = response.data.test_cases;
      editor.current.getModel().setValue(response.data.starter_code);
      authorEditor.current.setValue(
        response.data.starter_code.replace(/[^\n]/g, "?")
      );
      setTestResults(null);
    } else {
      snackbar.enqueueSnackbar({
        message:
          "Unable to switch question. Please check your internet connection.",
        variant: "warning",
      });
    }
    // TODO: What are these additional attributes for?
    // title
    // roomInfo.current.room.title = question.title;
    // description
    // roomInfo.current. = response.data.description;
  };

  const runCode = async () => {
    const currentCode = editor.current.getValue()

    // const currentCode = replaceCanvasImport(editor.current.getValue());
    const pyodide = pyodideRef.current;
    pyodide.registerJsModule("graphics", unthrow)
    
    if (!pyodide) {
      alert("Browser doesn't support python!");
      return;
    }

    pyodide.canvas.setCanvas2D(
      document.querySelector("#canvas") as HTMLCanvasElement
    );

    setTestResults(undefined);
    isRunningTests.setValue(true);

    let newTestResults: TestResult[] = [];
    for (const testCase of roomInfo.current.room.test_cases) {
      console.log(`Running test '${testCase.title}'...`);
      let userStdin: string[] = [];
      let userStdout: string[] = [];
      let currentOutput = "";
      let errMsg: string | undefined = undefined;
      pyodide.setStdout({
        // batched: (line: string) => {
        //   userStdout.push(line)
        //   userStdin.push("") // temporary
        //   console.log('output', line)
        // },
        raw: (ascii: number) => {
          const char = String.fromCharCode(ascii);
          if (char === "\n") {
            userStdout.push(currentOutput);
            userStdin.push("");
            currentOutput = "";
          } else {
            currentOutput += char;
          }
        },
      });

      let lineIndex = 0;
      pyodide.setStdin({
        stdin: () => {
          userStdout.push(currentOutput);
          currentOutput = "";
          const input = testCase.stdin[lineIndex++];
          if (input === undefined) {
            return "";
          } else {
            userStdin[lineIndex - 1] = input;
            return input;
          }
        },
        isatty: false,
      });
      // TODO: Add register JS Module here?

      await pyodide.runPythonAsync(currentCode).catch((err) => {
        errMsg = `${err}`;
      });

      if (currentOutput) {
        userStdout.push(currentOutput);
      }

      newTestResults.push({
        stdinObserved: userStdin,
        stdoutObserved: userStdout,
        error: errMsg,
        isCorrect:
          !errMsg && userStdout.length === testCase.stdout_expected.length &&
          userStdout.every(
            (v, i) => v.trim() === testCase.stdout_expected[i]?.trim()
          ),
      });
    }

    console.log("test results", newTestResults);

    await axiosInstance
      .post(`/rooms/${room_id}/test_results`, {
        test_results: newTestResults,
        email: localStorage.getItem("email"),
      })
      .catch((err) => {
        console.warn(err);
      });
    isRunningTests.setValue(false);
    setTestResults(newTestResults);
  };

  const runPythonRunCommand = useCallback(() => {
    axiosInstance
      .post(`/rooms/${room_id}/create-server`, {
        email: localStorage.getItem("email"),
      })
      .then(async (r) => {
        await axiosInstance
          .post(`/rooms/${room_id}/code`, {
            file: editor.current.getValue(),
            author_map: authorEditor.current.getValue(),
          })
          .catch((err) => {
            console.warn(err);
          });

        setTerminalInfo({
          id: r.data.terminal_id,
          token: roomInfo.current.room.jupyter_server_token,
        });
        terminalListenerStopper.current.dispose();
        initiateTerminalSession(
          r.data.terminal_id,
          roomInfo.current.room.jupyter_server_token,
          false,
          (ws) => {
            ws.send(JSON.stringify(["stdin", "python main.py\n"]));
            terminal.current.focus();
          }
        );
      });
  }, [roomInfo]);

  const refreshTerminalDisplay = useCallback(
    (terminalName: string, showWelcomeMessage: boolean) => {
      if (roomInfo.current) {
        setTerminalInfo({
          id: terminalName,
          token: roomInfo.current.room.jupyter_server_token,
        });
        terminalListenerStopper.current?.dispose();
        initiateTerminalSession(
          terminalName,
          roomInfo.current.room.jupyter_server_token,
          showWelcomeMessage,
          undefined
        );
      }
    },
    [setTerminalInfo, initiateTerminalSession]
  );

  if (!isPageLoaded.value) {
    return <Loading text={"Loading room..."} />;
  } else if (!roomInfo.current) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <h3>Room Not Found</h3>
      </div>
    );
  }

  return (
    <>
      <Stack className="full-screen">
        <Navbar
          onRun={runPythonRunCommand}
          meeting={meeting}
          roomInfo={roomInfo.current}
        ></Navbar>
        <Split
          className="main-split"
          direction="horizontal"
          sizes={[32, 68]}
          gutterSize={6}
          style={{ flexGrow: 1, maxHeight: "calc(100vh - 100px)" }}
        >
          <Chat
            roomInfo={roomInfo.current}
            onReceiveSystemEvent={(type, e) => {
              console.log("system message", e);
              if (type === "update_role") {
                const email = localStorage.getItem("email");
                if (email in e.roles) {
                  roomInfo.current.meeting.role = e.roles[email];
                  setUpdateState((updateState + 1) % 10000);
                  enqueueSnackbar({
                    message: `Your role has been updated to ${
                      ["Guest", "Driver", "Navigator"][e.roles[email]]
                    }`,
                    variant: "info",
                  });
                }
              } else if (type === "autograder_update") {
                setTestResults(e.results);
                enqueueSnackbar({
                  message: `Your partner has run the autograder.`,
                  variant: "info",
                });
              } else if (type === "terminal_started") {
                refreshTerminalDisplay(e.terminal_id, e.show_welcome_message);
              } else if (type === "question_update") {
                enqueueSnackbar({
                  message: `The coding problem is switched to "${e.question.title}".`,
                  variant: "info",
                });
                editor.current.getModel().setValue(e.question.starter_code);
                authorEditor.current.setValue(
                  e.question.starter_code.replace(/[^\n]/g, "?")
                );
              } else if (type === "leave_session") {
                setParticipantLeftMessage({ title: e.title, message: e.message })
              }
            }}
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
              <div>
                <Split
                  className="code-split"
                  style={{
                    flexShrink: 1,
                    alignItems: "stretch",
                    position: "relative",
                  }}
                  sizes={[55, 45]}
                  direction="horizontal"
                  gutterSize={6}
                  snapOffset={0}
                  onDrag={(e) => {
                    editor.current?.layout();
                  }}
                >
                  <div id="code-editor" className="relative">
                    {rustpadFailed.value && (
                      <div
                        className="absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center z-10"
                        style={{ backgroundColor: "#ffffffd0" }}
                      >
                        <div className="px-5">
                          Failed to connect. Please make sure you do not have
                          another tab open.
                        </div>
                        <Button onClick={restartRustpad}>Reconnect</Button>
                      </div>
                    )}
                  </div>
                  {/* <Grading editor={editor.current} /> */}
                  {/* <div id="author-editor" className="relative" /> */}
                  <Box sx={{ overflowY: "auto" }}>
                    <TestCases
                      useGraphics={roomInfo.current.room.use_graphics}
                      onRun={runCode}
                      cases={roomInfo.current?.room.test_cases}
                      results={testResults}
                      isWaiting={isRunningTests.value}
                    />
                    <QuestionsDialog
                      questions={questions}
                      handleQuestionChange={handleQuestionChange}
                    />
                    <canvas ref={canvasRef}></canvas>
                  </Box>
                </Split>
              </div>
              <Box position="relative">
                <div
                  className="full-screen bg-black p-1"
                  style={{ flexShrink: 0 }}
                >
                  {terminalInfo && (
                    <button
                      className="absolute right-2 bottom-2 z-10"
                      onClick={showResetTerminalDialog.onTrue}
                    >
                      <ResetIcon sx={{ color: "#f0f0f0f0" }} fontSize="small" />
                    </button>
                  )}
                  <div
                    id="terminal"
                    className="absolute left-1 right-1 top-1 bottom-0"
                  />
                </div>
                {terminalInfo === null && (
                  <div className="flex absolute w-full h-full justify-center items-center">
                    <LoadingButton
                      loading={isResettingTerminal.value}
                      sx={{ color: "#e0e0e0", borderColor: "#e0e0e050" }}
                      variant="outlined"
                      onClick={() => {
                        isResettingTerminal.setValue(true);
                        axiosInstance
                          .post(`/rooms/${room_id}/create-server`, {
                            email: localStorage.getItem("email"),
                            show_welcome_message: true,
                          })
                          .then((r) => {
                            setTerminalInfo({
                              id: r.data.terminal_id,
                              token: roomInfo.current.room.jupyter_server_token,
                            });
                            initiateTerminalSession(
                              r.data.terminal_id,
                              roomInfo.current.room.jupyter_server_token
                            );
                          })
                          .catch((err) => console.warn(err))
                          .finally(isResettingTerminal.onFalse);
                      }}
                    >
                      Start A Collaborative Terminal Session
                    </LoadingButton>
                  </div>
                )}
              </Box>
            </Split>
          </div>
        </Split>
      </Stack>

      <div
        id="author-editor"
        style={{ display: "none", overflow: "hidden", width: 0, height: 0 }}
      />

      <Dialog
        open={showResetTerminalDialog.value}
        fullWidth
        maxWidth="sm"
        onClose={showResetTerminalDialog.onFalse}
      >
        <DialogTitle>Restart the terminal?</DialogTitle>
        <DialogContent>The terminal history will be cleared.</DialogContent>
        <DialogActions>
          <Button onClick={showResetTerminalDialog.onFalse} variant="outlined">
            Cancel
          </Button>
          <LoadingButton
            disabled={isResettingTerminal.value}
            loading={isResettingTerminal.value}
            variant="soft"
            color="error"
            onClick={() => {
              isResettingTerminal.setValue(true);
              axiosInstance
                .post(`/rooms/${room_id}/restart-server`, {
                  email: localStorage.getItem("email"),
                })
                .then((r) => {
                  setTerminalInfo({
                    id: r.data.terminal.name,
                    token: terminalInfo.token,
                  });
                  terminalListenerStopper.current.dispose();
                  initiateTerminalSession(
                    r.data.terminal.name,
                    terminalInfo.token
                  );
                  showResetTerminalDialog.onFalse();
                  setTimeout(isResettingTerminal.onFalse, 500);
                })
                .catch(() => {
                  alert("Unable to connect to the server. Please try again.");
                  isResettingTerminal.onFalse();
                });
            }}
          >
            Restart Terminal
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={participantLeftMessage !== undefined} onClose={() => setParticipantLeftMessage(undefined)}>
        <DialogTitle>{participantLeftMessage?.title}</DialogTitle>
        <DialogContent>{participantLeftMessage?.message}</DialogContent>
        <DialogActions>
          <Button variant="soft" color="primary" onClick={() => setParticipantLeftMessage(undefined)}>Got it</Button>
        </DialogActions>
      </Dialog>
      {/* </DyteProvider> */}
    </>
  );
}
