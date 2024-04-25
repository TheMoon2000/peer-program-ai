"use client";

import { RoomInfo } from "@/Data Structures"
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useChatStore } from './store/chatStore';
import { ChatAI, ChatUser } from "./components/chat";
interface Props {
    roomInfo: RoomInfo
}

const email = localStorage.getItem('email')

/* Lobe Chat integration */
export default function Chat(props: Props) {
    const messages = useChatStore((state) => state.messages);
    const addMessage = useChatStore((state) => state.addMessage);
    const setMessage = useChatStore((state) => state.setMessage);
    const chatWS = useRef<WebSocket | undefined>();
    const containerRef = useRef<HTMLDivElement>(null);


    const [inputQuestionValue, setInputQuestionValue] = useState('');

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputQuestionValue(event.target.value);
    };
    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            handleSendMessage();
        }
    };
    // send user questions
    const handleSendMessage = () => {
        const newMessage = { action: "send_text", content: inputQuestionValue }
        chatWS.current.send(JSON.stringify(newMessage))
        setInputQuestionValue('')
        // addMessage(newMessage);
    };
    const connectSocketHandler = (e: Event) => {
        console.log('Connect Success-->', e)
    }
    const messageSocketHandler = (e: MessageEvent<any>) => {
        const responseData = JSON.parse(e.data)
        if (Array.isArray(responseData)) {
            addMessage(responseData)
        } else {
            console.log('responseData', responseData)
            setMessage(responseData)
        }
    }
    const errorSocketHandler = (e: Event) => {
        console.log('Connect Error-->', e)
    }
    const closeSocketHandler = (e: Event) => {
        console.log('Connect Close-->', e)
    }
    // init chat websocket
    useEffect(() => {
        chatWS.current = new WebSocket(`ws://172.174.247.133/chat/socket?room_id=${props.roomInfo.room.id}&email=${email}`)
        chatWS.current.addEventListener("open", connectSocketHandler)
        chatWS.current.addEventListener("message", messageSocketHandler)
        chatWS.current.addEventListener("error", errorSocketHandler)
        chatWS.current.addEventListener("close", closeSocketHandler)
    }, [])

    useEffect(() => {
        // 滚动到底部
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);
    return <>
        <div className="w-full h-full  scrollbar-thumb-red scrollbar-track-red">
            <div className="w-full bg-white-100 rounded-lg shadow-lg p-4 h-full flex justify-between flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">John Doe</h2>
                    <span className="text-sm text-gray-500">12:30 PM</span>
                </div>
                <div className="flex flex-col space-y-2 flex-grow overflow-y-auto scrollbar-thumb-red scrollbar-track-red" ref={containerRef}>
                    {messages.map((item, i) => (
                        <div key={i}>
                            {item.sender === 'AI' ?
                                <>
                                    {item.content.map((c, ci) => (<ChatAI key={ci} type={c.type} value={c.value} />))}
                                </>
                                :
                                <>
                                    {item.content.map((c, ci) => (<ChatUser key={ci} type={c.type} value={c.value} />))}
                                </>
                            }
                        </div>))}
                </div>
                <div className="flex items-center mt-4">
                    <input
                        type="text"
                        className="flex-grow bg-gray-200 rounded-full px-4 py-2 text-gray-700 focus:outline-none"
                        placeholder="Please input what you wanna ask"
                        value={inputQuestionValue}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown} />
                    <button type="button" className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 focus:outline-none" onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div >
    </>
}