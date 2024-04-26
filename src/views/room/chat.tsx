"use client";

import { RoomInfo } from "@/Data Structures"
import { useEffect, useRef, useState } from "react";
import { useChatStore, useGlobalStore, useInputMessageStore } from './store/chatStore';
import { ChatAI, ChatUser, TextArea } from "./components/chat";
import { DraggablePanel } from '@lobehub/ui';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import { Flexbox } from 'react-layout-kit';
interface Props {
    roomInfo: RoomInfo
}

const email = localStorage.getItem('email')
// 使用 Promise 封装等待函数
function wait(timeout: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

/* Lobe Chat integration */
export default function Chat(props: Props) {
    const messages = useChatStore((state) => state.messages);
    const addMessage = useChatStore((state) => state.addMessage);
    const setMessage = useChatStore((state) => state.setMessage);
    const [inputNewMessage, clearNewMessage] = useInputMessageStore((state) => [state.inputNewMessage, state.clearNewMessage]);


    const chatWS = useRef<WebSocket | undefined>();
    const [expand, setExpand] = useState<boolean>(false);
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const updatePreference = useGlobalStore((state) => state.updatePreference);
    const preference = useGlobalStore((state) => state.preference);

    // send user questions
    const handleSendMessage = async () => {
        console.log('inputNewMessage-->', inputNewMessage)
        await wait(3000); // 等待 3 秒
        const newMessage = { action: "send_text", content: inputNewMessage }
        chatWS.current.send(JSON.stringify(newMessage))
        clearNewMessage()
        setButtonLoading(!buttonLoading)
        await wait(3000); // 等待 3 秒

        setButtonLoading(false)
        // addMessage(newMessage);
    };
    const handleSendOption = (optionInfo: string) => {
        console.log('我发送的消息--->', optionInfo)
        chatWS.current.send(optionInfo)
    }
    const connectSocketHandler = (e: Event) => {
        console.log('Connect Success-->', e)
    }
    const messageSocketHandler = (e: MessageEvent<any>) => {
        const responseData = JSON.parse(e.data)
        console.log('responseData--->', responseData)
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
            <div className="w-full bg-white-100 rounded-lg shadow-lg p-y-4 h-full flex justify-between flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">John Doe</h2>
                    <span className="text-sm text-gray-500">12:30 PM</span>
                </div>
                <div className="flex flex-col space-y-2 flex-grow overflow-y-auto scrollbar-thumb-red scrollbar-track-red bg-gray-100" ref={containerRef}>
                    {messages.map((item, i) => (
                        <div key={i}>
                            {item.sender.trim() !== email.trim() ?
                                <>
                                    {Array.isArray(item.content) && <ChatAI handleChooseAction={handleSendOption} content={item.content} name={item.name} />}
                                </>
                                :
                                <>
                                    {Array.isArray(item.content) && item.content.map((c, ci) => (<ChatUser name={item.name} key={ci} type={c.type} value={c.value} />))}
                                </>
                            }
                        </div>))}
                </div>
                <DraggablePanel
                    fullscreen={expand}
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

                    <div className="flex flex-col h-full justify-between">
                        <Flexbox
                            gap={8}
                            height={'100%'}
                            padding={'12px 0 16px'}
                            style={{ minHeight: 150, position: 'relative' }}
                        >
                            <TextArea sendMessage={handleSendMessage} />
                            <div className="flex justify-end items-end px-6">
                                <LoadingButton
                                    variant="contained"
                                    endIcon={<SendIcon />}
                                    loading={buttonLoading}
                                    loadingPosition="end"
                                    onClick={handleSendMessage}>
                                    Send
                                </LoadingButton>
                            </div>
                        </Flexbox>

                    </div>
                </DraggablePanel>
            </div>
        </div >
    </>
}