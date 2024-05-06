"use client";

import { RoomInfo } from "@/Data Structures"
import { useEffect, useRef, useState } from "react";
import { useChatStore, useGlobalStore } from './store/chatStore';
import { ChatAI, ChatUser, TextArea, ChatAILoading } from "./components/chat";
import { DraggablePanel } from '@lobehub/ui';

import Loading from "../loading/loading";
import { HOST } from "@/Constants";

interface Props {
    roomInfo: RoomInfo
    revokeTerminal: (teminalId: string) => void
    onReceiveSystemEvent: (type: string, data: any) => void
}
const email = localStorage.getItem('email')
/* Lobe Chat integration */
export default function Chat(props: Props) {
    const { revokeTerminal } = props
    const [messages, addMessage, setMessage, makeChoice, typingState] = useChatStore((state) => [state.messages, state.addMessage, state.setMessage, state.makeChoice, state.typingState]);
    const chatWS = useRef<WebSocket | undefined>();
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const updatePreference = useGlobalStore((state) => state.updatePreference);
    const preference = useGlobalStore((state) => state.preference);
    const autoScrollToBottom = useRef(true)

    // restart—timer
    let timer = null
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
        if (chatWS.current && chatWS.current.readyState === WebSocket.OPEN) {
            chatWS.current.send(JSON.stringify(typingAction))
        }
    }
    const handleUserCancelTypingText = () => {
        const typingAction = { action: "stop_typing" }
        if (chatWS.current && chatWS.current.readyState === WebSocket.OPEN) {
            chatWS.current.send(JSON.stringify(typingAction))
        }
    }

    const connectSocketHandler = (e: Event) => {
        console.log('Connect Success-->', e)
    }

    const messageSocketHandler = async (e: MessageEvent<any>) => {
        const responseData = JSON.parse(e.data)
        // console.log('数据信息-->', responseData)
        if (Array.isArray(responseData)) {
            addMessage(responseData)
        } else {
            if (responseData.event === "make_choice") {
                makeChoice(responseData)
            } else if (responseData.sender === "system" && !responseData.event) {
                setMessage(responseData)
            } else if (responseData.event === "start_typing") {
                typingState(responseData)
            } else if (responseData.event === "stop_typing") {
                typingState(responseData)
            } else if (responseData.event === "terminal_started") {
                revokeTerminal(responseData.terminal_id)
            } else if (responseData.sender === "system" && responseData.event) {
                props.onReceiveSystemEvent(responseData.event, responseData)
            } else {
                setMessage(responseData)
            }
        }
    }
    const restartSocketHandler = () => {
        setIsConnected(false);
        timer = setInterval(() => {
            if (email) {
                chatWS.current = new WebSocket(`wss://${HOST}/chat/socket?room_id=${props.roomInfo.room.id}&email=${email}`)
            } else {
                chatWS.current = new WebSocket(`wss://${HOST}/chat/socket?room_id=${props.roomInfo.room.id}&email=`)
            }
            if (chatWS.current.readyState === 0) {
                clearInterval(timer);
                timer = null
                chatWS.current.addEventListener("open", connectSocketHandler)
                chatWS.current.addEventListener("message", messageSocketHandler)
                chatWS.current.addEventListener("error", errorSocketHandler)
                chatWS.current.addEventListener("close", closeSocketHandler)
                setIsConnected(true);
            }
        }, 5000)
    }
    const errorSocketHandler = (e: Event) => {
        console.log('Connect Error-->', e)
    }
    const closeSocketHandler = (e: Event) => {
        console.log('Connect Close-->', e)
        setIsConnected(false)
        chatWS.current = undefined
        chatWS.current?.close()
        restartSocketHandler()
    }
    const createWebsocket = () => {
        console.log('createWebSocket()')
        if (email) {
            chatWS.current = new WebSocket(`wss://${HOST}/chat/socket?room_id=${props.roomInfo.room.id}&email=${email}`)
            chatWS.current.addEventListener("open", connectSocketHandler)
            chatWS.current.addEventListener("message", messageSocketHandler)
            chatWS.current.addEventListener("error", errorSocketHandler)
            chatWS.current.addEventListener("close", closeSocketHandler)
        } else {
            chatWS.current = new WebSocket(`wss://${HOST}/chat/socket?room_id=${props.roomInfo.room.id}&email=`)
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

        containerRef.current.onscrollend = () => {
            // 如果用户目前（几乎）划到了屏幕最下方，则在增长内容时自动贴着底下。
            autoScrollToBottom.current = containerRef.current.scrollTop + 10 >= containerRef.current.scrollHeight
        }
    }, [])
    useEffect(() => {
        const scrollToBottom = () => {
            if (containerRef.current && autoScrollToBottom) {
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