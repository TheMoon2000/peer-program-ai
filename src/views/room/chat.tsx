"use client";

import { RoomInfo } from "@/Data Structures"
import { useEffect, useRef, useState } from "react";
import { useChatStore, useGlobalStore } from './store/chatStore';
import { ChatAI, ChatUser, TextArea, ChatAILoading } from "./components/chat";
import { DraggablePanel } from '@lobehub/ui';
import Socket from "@/utils/socket";

import Loading from "../loading/loading";
import { HOST } from "@/Constants";

interface Props {
    roomInfo: RoomInfo
    revokeTerminal: (teminalId: string) => void
}
const email = localStorage.getItem('email')
/* Lobe Chat integration */
export default function Chat(props: Props) {
    const { revokeTerminal } = props
    const [messages, addMessage, setMessage, makeChoice, typingState] = useChatStore((state) => [state.messages, state.addMessage, state.setMessage, state.makeChoice, state.typingState]);
    const chatWS = useRef<WebSocket | undefined>();
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const updatePreference = useGlobalStore((state) => state.updatePreference);
    const preference = useGlobalStore((state) => state.preference);
    // send user questions
    const handleSendMessage = async (message) => {
        const newMessage = { action: "send_text", content: message }
        chatWS.current.send(JSON.stringify(newMessage))
    };
    const handleSendOption = (optionInfo: string) => {
        chatWS.current.send(optionInfo)
    }
    const handleUserTypingText = () => {
        const typingAction = { action: "start_typing" }
        chatWS.current.send(JSON.stringify(typingAction))
        // const typingMessage = {
        //     sender: email,
        //     event: 'typing',
        //     name: 'Hello',
        //     content: [{ type: "typing", value: '', }]
        // }
        // setMessage(typingMessage)
    }
    const handleUserCancelTypingText = () => {
        const typingAction = { action: "stop_typing" }
        chatWS.current.send(JSON.stringify(typingAction))
    }

    const connectSocketHandler = (e: Event) => {
        console.log('Connect Success-->', e)
    }

    const messageSocketHandler = async (e: MessageEvent<any>) => {
        const responseData = JSON.parse(e.data)
        console.log('数据信息-->', responseData)
        if (Array.isArray(responseData)) {
            addMessage(responseData)
        } else {
            if (responseData.event === "make_choice") {
                makeChoice(responseData)
            } else if (responseData.sender === "system") {
                setMessage(responseData)
            } else if (responseData.event === "start_typing") {
                typingState(responseData)
            } else if (responseData.event === "stop_typing") {
                typingState(responseData)
            } else if (responseData.event === "terminal_started") {
                revokeTerminal(responseData.terminal_id)
            } else {
                setMessage(responseData)
            }
        }
    }
    const restartSocketHandler = () => {
        console.log('Reconnecting....')
        setIsConnected(false);
        setTimer(setInterval(() => {
            if (email) {
                chatWS.current = new WebSocket(`wss://${HOST}/chat/socket?room_id=${props.roomInfo.room.id}&email=${email}`)
            } else {
                chatWS.current = new WebSocket(`wss://${HOST}/chat/socket?room_id=${props.roomInfo.room.id}&email=`)
            }
            if (chatWS.current.readyState === 0) {
                clearInterval(timer)
                setTimer(timer)
                setIsConnected(true);
                chatWS.current.addEventListener("open", connectSocketHandler)
                chatWS.current.addEventListener("message", messageSocketHandler)
                chatWS.current.addEventListener("error", errorSocketHandler)
                chatWS.current.addEventListener("close", closeSocketHandler)
            }
        }, 5000))
    }
    const errorSocketHandler = (e: Event) => {
        console.log('Connect Error-->', e)
    }
    const closeSocketHandler = (e: Event) => {
        restartSocketHandler()
    }
    const createWebsocket = () => {
        if (email) {
            chatWS.current = new WebSocket(`ws://172.174.247.133/chat/socket?room_id=${props.roomInfo.room.id}&email=${email}`)
            chatWS.current.addEventListener("open", connectSocketHandler)
            chatWS.current.addEventListener("message", messageSocketHandler)
            chatWS.current.addEventListener("error", errorSocketHandler)
            chatWS.current.addEventListener("close", closeSocketHandler)
        } else {
            chatWS.current = new WebSocket(`ws://172.174.247.133/chat/socket?room_id=${props.roomInfo.room.id}&email=`)
            chatWS.current.addEventListener("open", connectSocketHandler)
            chatWS.current.addEventListener("message", messageSocketHandler)
            chatWS.current.addEventListener("error", errorSocketHandler)
            chatWS.current.addEventListener("close", closeSocketHandler)
        }
    }
    // init chat websocket
    useEffect(() => {
        // 执行重新连接逻辑
        if (!chatWS.current) {
            createWebsocket()
        }
        const handleOnline = () => {
            setIsConnected(true);
            if (!chatWS.current) {
                createWebsocket()
            } else {
                chatWS.current.addEventListener("open", connectSocketHandler)
                chatWS.current.addEventListener("message", messageSocketHandler)
                chatWS.current.addEventListener("error", errorSocketHandler)
                chatWS.current.addEventListener("close", closeSocketHandler)
            }
        };
        const handleOffline = () => {
            setIsConnected(false);
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [])
    useEffect(() => {
        const scrollToBottom = () => {
            if (containerRef.current) {
                const scrollContainer = containerRef.current;
                // 平滑滚动到底部
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: 'smooth',
                });
            }
        };
        // 在组件加载后滚动到底部
        scrollToBottom();
    }, [messages]); // 在依赖数组中添加 messages

    return <>
        <div className="min-w-80 h-full  scrollbar-thums sb-red scrollbar-track-red">
            {isConnected ? <div className="w-full rounded-lg shadow-lg p-y-4 h-full flex justify-between flex-col">
                <div className="scrollbar flex flex-col space-y-2 flex-grow overflow-x-hidden overflow-y-auto scrollbar-thumb-red scrollbar-track-red bg-customBGColor01 py-2" ref={containerRef}>
                    {/* Non-anonymous users */}
                    {email !== null && messages.map((item, i) => (
                        <div key={i} className="border-box">
                            {item.sender.trim() !== email.trim() ?
                                <>
                                    {/* {(item.event && item.event.trim() == 'start_typing') && <ChatAILoading name={item.name} />} */}
                                    {(item.sender !== 'system' && item.event == 'start_typing') && <ChatAILoading name={item.name} />}
                                    {Array.isArray(item.content) && <ChatAI messageId={i} handleChooseAction={handleSendOption} content={item.content} name={item.name} />}
                                </>
                                :
                                <>
                                    {Array.isArray(item.content) && item.content.map((c, ci) => (<ChatUser name={item.name} key={ci} type={c.type} value={c.value} />))}
                                </>
                            }
                            {item.sender === 'system' && (
                                <p className="flex justify-center items-center my-1">
                                    <span className="text-neutral-500 text-xs">{item.system_message}</span>
                                </p>
                            )}
                        </div>))}
                    {/*  */}
                    {/* Anonymous User */}
                    {email === null && messages.map((item, i) => (
                        <div key={i}>
                            {Array.isArray(item.content) && <ChatAI messageId={i} handleChooseAction={handleSendOption} content={item.content} name={item.name} />}
                            {item.sender === 'system' && (
                                <p className="flex justify-center items-center my-1">
                                    <span className="text-neutral-500 text-xs">{item.system_message}</span>
                                </p>
                            )}
                        </div>))}
                </div>
                {email !== null && <DraggablePanel
                    headerHeight={64}
                    maxHeight={400}
                    minHeight={150}
                    onSizeChange={(_, size) => {
                        if (!size) return;
                        updatePreference({
                            inputHeight: typeof size.height === 'string' ? Number.parseInt(size.height) : size.height,
                        });
                    }}
                    placement="bottom"
                    size={{ height: preference.inputHeight, width: '100%' }}
                    style={{ zIndex: 10 }}
                >

                    <div className="flex flex-col h-full justify-between bg-white">
                        <TextArea sendMessage={handleSendMessage} sendTypingAction={handleUserTypingText} sendCancelTypingAction={handleUserCancelTypingText} />
                    </div>
                </DraggablePanel>}
            </div>
                :
                <Loading text="Reconnecting..." />}

        </div >
    </>
}