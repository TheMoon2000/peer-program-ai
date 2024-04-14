import { CodeSnapshot, CodingExercise, Message } from "../Data Structures"

/** Superclass of all chatbots. */
export class BaseBot {
    
    /** Function 1: able to generate hint when user clicks “Get hint”. */
    async getHint(chatHistory: Message[], codeTimeline: CodeSnapshot[]) {
        const hint = "I'm sorry, I cannot give you a hint."
        return hint
    }

    /** Function 2: able to converse with the user about their code. */
    async reply(chatHistory: Message[], codeTimeline: CodeSnapshot[], currentCode: CodeSnapshot, exercise: CodingExercise) {
        const reply = "Hello, I am a base bot."
        return reply
    }

    /**
     * Function 3: triggered periodically to decide if user should be actively intervened and given more instructions on how to proceed with the question.
     * */
    async shouldIntervene(chatHistory: Message[], codeTimeline: CodeSnapshot[]) {
        return false
    }
}