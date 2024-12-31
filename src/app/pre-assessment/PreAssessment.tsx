"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as monaco from "monaco-editor"; // uses window
import { ursaTheme } from "@/functionality/Constants";
import { Terminal } from "xterm"; // uses window
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import Pre from "@lobehub/ui/es/mdx/Pre";
import { loadPyodide } from "pyodide"; // uses window
import emailjs from "emailjs-com";

const PreAssessmentContext = createContext<any>(null);
export const usePreAssessment = () => useContext(PreAssessmentContext);

// Provider to manage the shared editor and terminal instances
const PreAssessmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const terminalInstance = useRef<Terminal | null>(null);

  return (
    <PreAssessmentContext.Provider value={{ editorRef, terminalInstance }}>
      {children}
    </PreAssessmentContext.Provider>
  );
};

// NavBar for displaying the title and action buttons
const NavBar = () => {
  const { editorRef, terminalInstance } = usePreAssessment();
  const pyodideRef = useRef<any>(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false); // new
  const dropdownRef = useRef<HTMLDivElement | null>(null); // new

  const handleRunCode = async () => {
    if (editorRef.current && terminalInstance.current) {
      const code = editorRef.current.getValue()?.trim();

      terminalInstance.current.clear();
      terminalInstance.current.writeln("$ python main.py");

      if (!code) {
        terminalInstance.current.writeln("Error: No code provided.");
        return;
      }

      try {
        if (!pyodideRef.current) {
          pyodideRef.current = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
          });
        }

        const pyodide = pyodideRef.current;

        pyodide.runPython(`
          import sys
          from io import StringIO

          sys.stdout = output = StringIO()
        `);

        pyodide.runPython(code);

        const output = pyodide.runPython("output.getvalue()");

        if (output) {
          terminalInstance.current.writeln(output);
        } else {
          terminalInstance.current.writeln(
            "Execution finished with no output."
          );
        }
      } catch (error) {
        terminalInstance.current.writeln(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gray-800 px-8 md:flex md:items-center md:justify-between h-24 shadow-md relative">
      <div className="min-w-0 flex items-center">
        <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Pear Program
        </h2>
        <div className="relative ml-3">
          <button
            className="text-white hover:bg-[#374151] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#1f2937] ml-2 text-3xl font-bold p-3 h-12 w-12 flex items-center justify-center rounded-full bg-[#1f2937]"
            onClick={() => setDropdownVisible((prev) => !prev)}
          >
            ⓘ
          </button>

          {isDropdownVisible && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 mt-2 w-80 bg-white shadow-lg rounded-md p-6 z-50"
            >
              <h3 className="text-lg font-bold mb-2">Instructions</h3>
              <ul className="list-disc list-inside text-lg text-gray-600">
                <li>Press Run Code button to check your program</li>
                <li>Do what you can in 15 minutes</li>
                <li>There's no "check correct" button, just do your best</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex md:ml-4 md:mt-0">
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
          onClick={handleRunCode}
        >
          Run Code
        </button>
      </div>
    </div>
  );
};

// Timer component to track and display remaining time
const Timer = ({
  selectedQuestion,
  onTimeUp,
  stopTimer,
}: {
  selectedQuestion: number | null;
  onTimeUp: () => void;
  stopTimer: boolean;
}) => {
  const totalTime = 15 * 60;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (selectedQuestion !== null && timeLeft === null) {
      const savedStartTime = localStorage.getItem("timerStartTime");
      if (savedStartTime) {
        const elapsed = Math.floor(
          (Date.now() - parseInt(savedStartTime)) / 1000
        );
        setTimeLeft(Math.max(totalTime - elapsed, 0));
      } else {
        localStorage.setItem("timerStartTime", Date.now().toString());
        setTimeLeft(totalTime);
      }
    }
  }, [selectedQuestion]);

  useEffect(() => {
    if (stopTimer) {
      localStorage.removeItem("timerStartTime");
      return;
    }

    if (timeLeft === 0) {
      onTimeUp();
      localStorage.removeItem("timerStartTime");
      return;
    }

    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft, onTimeUp, stopTimer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return timeLeft !== null ? (
    <div className="mt-6 text-center">
      <div className="inline-flex items-center bg-gray-200 px-4 py-2 rounded-full shadow-md">
        <h3 className="text-sm font-semibold text-gray-700 mr-2">
          Time Remaining:
        </h3>
        <p
          className={`text-lg font-bold ${
            timeLeft <= 60 ? "text-red-500" : "text-green-600"
          }`}
        >
          {formatTime(timeLeft)}
        </p>
      </div>
    </div>
  ) : null;
};

// Email sending component for sending email upon successful submission
const SendEmail = async (
  email: string,
  savedCode: Record<string, string>
): Promise<void> => {
  const question1Code = savedCode["1"] || "No answer provided for Question 1";
  const question2Code = savedCode["2"] || "No answer provided for Question 2";
  const question3Code = savedCode["3"] || "No answer provided for Question 3";

  try {
    await emailjs.send(
      "service_bduhyu9", // EmailJS service ID
      "template_kbpvxv5", // EmailJS template ID
      {
        question_1: question1Code,
        question_2: question2Code,
        question_3: question3Code,
        user_email: email,
      },
      "owvTgwLmhQ_GADi-i" // EmailJS public key
    );
  } catch (error) {
    throw new Error("Failed to send email: " + error.message);
  }
};

// SubmitPopup component to display window to get user email and confirm submission
const SubmitPopup = ({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const savedCode = JSON.parse(localStorage.getItem("savedCode") || "{}");
      await SendEmail(email, savedCode); // Call the utility function
      setIsSubmitted(true);
    } catch (error) {
      console.error(error.message);
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-md text-center w-11/12 max-w-sm">
        {isSubmitted ? (
          <div>
            <h2 className="text-lg font-bold mb-4">Submission Successful!</h2>
            <p className="text-sm text-gray-600 mb-4">
              Thank you for your time. Your submission has been recorded.
            </p>
            <button
              className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold mb-4">Submission Confirmation</h2>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your email to confirm your submission.
            </p>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white text-sm font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 ${
                  isSubmitting
                    ? "bg-gray-400"
                    : "bg-green-500 hover:bg-green-600"
                } text-white text-sm font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm Submission"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// StaticMessages component to display welcome and additional messages in the chat section
const StaticMessages = ({
  isWelcomeMessage,
}: {
  isWelcomeMessage: boolean | null;
}) => {
  return isWelcomeMessage ? (
    <div className="flex items-start">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
        <span className="text-gray font-bold">B</span>
      </div>
      <div className="ml-3">
        <p className="text-sm text-gray-700">Bruno</p>
        <div className="bg-gray-200 p-3 rounded-lg shadow">
          <p className="text-xl font-bold text-gray-700 mb-4">
            Welcome to Pear Program!
          </p>
          <p className="text-lg text-gray-700 mb-4">
            We're excited to have you here. Let's start with a quick warm-up to
            refresh your programming skills.
          </p>
          <p className="text-lg font-bold text-gray-700 mb-4">
            What to Expect:
          </p>
          <p className="text-lg text-gray-700 mb-4">
            You'll have 15 minutes to solve three coding problems.
          </p>
          <p className="text-lg font-bold text-gray-700 mb-4">No Pressure:</p>
          <p className="text-lg text-gray-700 mb-4">
            Just try your best- it's okay if you don't know something. This is
            meant to see what you remember!
          </p>
          <p className="text-lg font-bold text-gray-700 mb-4">Get Started:</p>
          <p className="text-lg text-gray-700 mb-4">
            Click Question 1 on the right to view the first coding problem.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-start mt-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
        <span className="text-gray font-bold">B</span>
      </div>
      <div className="ml-3">
        <p className="text-sm text-gray-700">Bruno</p>
        <div className="bg-gray-200 p-3 rounded-lg shadow">
          <p className="text-lg text-gray-700">
            You can run your code, but you won't be able to check if your code
            is correct.
            <br /> <br />
            Press the Run Code button in the top right corner to execute your
            program. The output will appear in the terminal window at the
            bottom.{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

// ChatSection to display the selected question and its details
const ChatSection = ({
  selectedQuestion,
}: {
  selectedQuestion: number | null;
}) => {
  const questions = [
    {
      id: 1,
      number: "Question 1:",
      title: "Conditionals and Comparisons",
      text: "Write a program that takes an input number and prints whether it is positive, negative, or zero.",
      example: 'Example Input: 5\nExample Output: "Positive"',
    },
    {
      id: 2,
      number: "Question 2:",
      title: "Loops",
      text: "Write a program that prints all numbers from 1 to 10, inclusive.",
      example: "Example Output:\n1\n2\n3\n...\n10",
    },
    {
      id: 3,
      number: "Question 3:",
      title: "Basic Input and Output",
      text: "Write a program that asks for a user’s name and prints a personalized greeting.",
      example: 'Example Input: "Alice"\nExample Output: "Hello, Alice!"',
    },
  ];

  const question = questions.find((q) => q.id === selectedQuestion);

  return (
    <div className="w-1/3 bg-[#f8f8f8] border-r border-gray-300 flex flex-col min-w-[400px]">
      <h2 className="text-lg font-bold p-4 border-b">Chat</h2>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {question ? (
          <>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-gray font-bold">B</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">Bruno</p>
                <div className="bg-gray-200 p-3 rounded-lg shadow">
                  <p className="text-lg font-bold text-gray-700">
                    {question.number}
                  </p>
                  <p className="text-lg font-bold text-gray-700 mb-4">
                    {question.title}
                  </p>
                  <p className="text-lg text-gray-700" mb-4>
                    {question.text}
                  </p>
                  <pre className="bg-gray-100 p-2 rounded text-lg text-gray-800 mt-2">
                    {question.example}
                  </pre>
                </div>
              </div>
            </div>
            <StaticMessages isWelcomeMessage={false} />
          </>
        ) : (
          <StaticMessages isWelcomeMessage={true} />
        )}
      </div>
    </div>
  );
};

// CodeSection for displaying the Monaco editor and handling code changes
const CodeSection = ({
  selectedQuestion,
  savedCode,
  onCodeChange,
}: {
  selectedQuestion: number | null;
  savedCode: string;
  onCodeChange: (code: string) => void;
}) => {
  const { editorRef } = usePreAssessment();
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorContainerRef.current && !editorRef.current) {
      monaco.editor.defineTheme("ursa", ursaTheme);
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        value: savedCode,
        language: "python",
        theme: "vs-light",
        minimap: { enabled: false },
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
      });
    }

    return () => {
      editorRef.current?.dispose();
    };
  }, [editorContainerRef]);

  useEffect(() => {
    if (editorRef.current) {
      const currentCode = editorRef.current.getValue();
      if (currentCode !== savedCode) {
        editorRef.current.setValue(savedCode);
      }

      const onChange = () => {
        const currentCode = editorRef.current?.getValue() || "";
        onCodeChange(currentCode);
      };

      const disposable = editorRef.current.onDidChangeModelContent(onChange);

      return () => disposable.dispose();
    }
  }, [selectedQuestion, savedCode]);

  return (
    <div className="flex-1 bg-white border-r border-gray-300 flex flex-col">
      <h2 className="text-lg font-bold p-4 border-b">Code Editor</h2>
      <div
        ref={editorContainerRef}
        className="flex-grow"
        id="code-editor"
      ></div>
    </div>
  );
};

// QuestionSection to display available questions, handle selection and submission
const QuestionSection = ({
  onQuestionClick,
  selectedQuestion,
}: {
  onQuestionClick: (id: number) => void;
  selectedQuestion: number | null;
}) => {
  const questions = [
    { id: 1, text: "Question 1" },
    { id: 2, text: "Question 2" },
    { id: 3, text: "Question 3" },
  ];

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleSubmit = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="w-1/3 bg-gray-100 flex flex-col min-w-[400px] max-w-[33.33%] z-10">
      <h2 className="text-lg font-bold p-4 border-b">Select Coding Question</h2>
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {questions.map((question) => (
          <button
            key={question.id}
            className={`w-full text-left p-2 border border-gray-300 rounded-md
                ${
                  selectedQuestion === question.id
                    ? "bg-gray-400 text-white"
                    : "bg-gray-100 hover:bg-gray-300"
                }`}
            onClick={() => onQuestionClick(question.id)}
          >
            {question.text}
          </button>
        ))}

        <button
          type="button"
          className="mt-4 w-full px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      <SubmitPopup isVisible={isPopupVisible} onClose={handleClosePopup} />
    </div>
  );
};

// TerminalSection for rendering and managing the terminal interface
const TerminalSection = () => {
  const { terminalInstance } = usePreAssessment();
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const fitAddon = useRef(new FitAddon());

  useEffect(() => {
    if (terminalRef.current) {
      const terminal = new Terminal({
        cursorBlink: true,
        theme: {
          background: "#000000",
          foreground: "#ffffff",
        },
      });

      terminal.loadAddon(fitAddon.current);
      terminal.open(terminalRef.current);
      fitAddon.current.fit();

      terminalInstance.current = terminal;

      const handleResize = () => fitAddon.current.fit();

      return () => {
        terminalInstance.current = null;
        terminal.dispose();
      };
    }
  }, []);

  return (
    <div
      className="bg-black text-white p-4 flex flex-col"
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "25vh",
        zIndex: 20,
      }}
    >
      <h2 className="text-lg font-bold mb-2">Terminal</h2>
      <div ref={terminalRef} className="flex-grow overflow-hidden"></div>
    </div>
  );
};

// PreAssessment component to manage the overall page structure and logic
const PreAssessment: React.FC = () => {
  const [savedCode, setSavedCode] = useState<{ [key: number]: string }>(() => {
    const storedCode = localStorage.getItem("savedCode");
    const defaultCode =
      'def main(): \n \t""" \n \tYou should write your code here. Make sure to delete \n \tthe \'pass\' line before starting to write your own code.  \n \t""" \n \tpass \n \nif __name__ == \'__main__\': \n \tmain()';

    return storedCode
      ? JSON.parse(storedCode)
      : {
          1: "# question 1 \n" + defaultCode,
          2: "# question 2 \n" + defaultCode,
          3: "# question 3 \n" + defaultCode,
        };
  });

  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(
    () => {
      const storedQuestion = localStorage.getItem("selectedQuestion");
      return storedQuestion ? parseInt(storedQuestion, 10) : null;
    }
  );

  useEffect(() => {
    if (selectedQuestion !== null) {
      localStorage.setItem("selectedQuestion", selectedQuestion.toString());
    }
  }, [selectedQuestion]);

  useEffect(() => {
    localStorage.setItem("savedCode", JSON.stringify(savedCode));
  }, [savedCode]);

  const handleCodeChange = (code: string) => {
    if (selectedQuestion !== null) {
      setSavedCode((prev) => ({
        ...prev,
        [selectedQuestion]: code,
      }));
    }
  };

  return (
    <PreAssessmentProvider>
      <div className="h-screen flex flex-col">
        <NavBar />

        <div className="flex flex-grow overflow-hidden">
          <ChatSection selectedQuestion={selectedQuestion} />

          <div className="flex flex-col flex-grow">
            <div className="flex flex-grow">
              <CodeSection
                selectedQuestion={selectedQuestion}
                savedCode={savedCode[selectedQuestion || 0] || ""}
                onCodeChange={handleCodeChange}
              />

              <QuestionSection
                onQuestionClick={setSelectedQuestion}
                selectedQuestion={selectedQuestion}
              />
            </div>
            <TerminalSection />
          </div>
        </div>
      </div>
    </PreAssessmentProvider>
  );
};

export default PreAssessment;
