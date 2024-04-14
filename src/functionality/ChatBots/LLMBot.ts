import { LLM_SERVER } from "../Constants";
import { Message, CodeSnapshot, CodingExercise } from "../../Data Structures";
import { BaseBot } from "./BaseBot";
import { v4 } from 'uuid'

export default class LLMBot extends BaseBot {
    sessionName: string
    constructor(sessionName?: string) {
        super()

        this.sessionName = sessionName ?? v4()
        console.log("Starting new session with ID", this.sessionName)
        // Server side initialization
        // LLM_SERVER.post(`/create_collection`, {
        //     collection_name: this.sessionName
        // }).then(response => {
        //     console.log(response.data)
        // }).catch(err => {
        //     console.warn(err)
        // })
                
        LLM_SERVER.post("/create_chat", {
            system_prompt: "You are a senior engineer with 10+ years of coding experience. You are good at coming up with hints that guide students toward a correct implementation without spoiling the solution. You are teaching an introductory course on programming and now assisting two students on some coding problems."
        }).then(response => console.log(response.data))
    }

    async reply(chatHistory: Message[], codeTimeline: CodeSnapshot[], currentCode: CodeSnapshot, exerise: CodingExercise) {
        
        /* 
            TODO: the prompt must at least contain:
            - latest transcript of the students
            - Chat history
            - Coding problem description
            - Sample solution
            - Current code
        */
        let prompt = `...`

        
        let history = []
        chatHistory.forEach(msg => {
            history.push({
                role: msg.role,
                content: msg.role === "assistant" ? msg.content : `Candidate said \"${msg.content}\"`
            })
        })
        history.push({
            "role": "system",
            "content": prompt
        })
        history.push({
            role: "user",
            content: chatHistory[chatHistory.length - 1].content
        })
        console.log("prompt", prompt)
        const result = await LLM_SERVER.post("/send_chat_stateless", history)
        
        console.log("reply", result.data.response)
        return result.data.response
    }
}