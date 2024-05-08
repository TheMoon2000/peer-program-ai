export interface CodingExercise {
  title: string;
  description: string | null;
  main_file_name: string;
  starter_code: string;
  solution: string;
}

export interface Message {
  timestamp: Date;
  content: string;
  role: "user" | "assistant";
}
export interface CodeSnapshot {
  code: string;
  timestamp: Date;
}

export interface UserInfo {
  name: string;
}

export interface TestCase {
  title: string;
  stdin: string[]; // The actual pieces of inputs
  stdin_expected: string[]; // Inputs spaced out
  stdout_expected: string[];
}

export interface TestResult {
  stdinObserved: string[];
  stdoutObserved: string[];
  error?: string;
  isCorrect: boolean;
}

export interface RoomInfo {
  room: {
    id: string;
    code: string;
    author_map: string; // maps who wrote what to characters
    rustpad_code?: string; // defined if retrieved from a rustpad
    rustpad_author_map?: string; // defined if retrieved from a rustpad
    is_full: boolean;
    question_id: string | null;
    test_cases: TestCase[] | null;
    use_graphics: boolean;
    test_results: TestResult[] | null;
    jupyter_server_token: string;
  };

  author_id: number | null;

  server: {
    terminal_id: string | null; // null means no terminal is running
  };

  meeting: {
    participant_id: string | null; // Null is the user isn't in the room
    meeting_id: string | null; // same as above
    user_token: string | null; // same as above
    all_participants: {
      participant_id: string;
      name: string;
    }[];
    role: 0 | 1 | 2;
  };
}

export interface Question {
  question_id: string;
  title: string;
}
