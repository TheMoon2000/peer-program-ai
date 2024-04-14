export interface CodingExercise {
    title: string
    description: string | null
    main_file_name: string
    starter_code: string
    solution: string
}

export interface Message {
    timestamp: Date;
    content: string;
    role: "user" | "assistant";
}
export interface CodeSnapshot {
    code: string
    timestamp: Date
}

export interface UserInfo {
    name: string
}
