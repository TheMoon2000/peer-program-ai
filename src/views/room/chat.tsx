"use client";

import { RoomInfo } from "@/Data Structures"
import { useEffect, useRef, useState } from "react";
import { useChatStore, useGlobalStore, useInputMessageStore } from './store/chatStore';
import { ChatAI, ChatUser, SystemMessage, TextArea } from "./components/chat";
import { DraggablePanel } from '@lobehub/ui';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import { notification, Space } from 'antd';
import { Flexbox } from 'react-layout-kit';
import { Backdrop, Button, CircularProgress } from "@mui/material";
import Loading from "../loading/loading";
interface Props {
    roomInfo: RoomInfo
}
type NotificationType = 'success' | 'info' | 'warning' | 'error';
const email = localStorage.getItem('email')

/* Lobe Chat integration */
export default function Chat(props: Props) {
    const [messages, addMessage, setMessage, makeChoice] = useChatStore((state) => [state.messages, state.addMessage, state.setMessage, state.makeChoice]);
    const [inputNewMessage, clearNewMessage] = useInputMessageStore((state) => [state.inputNewMessage, state.clearNewMessage]);
    const chatWS = useRef<WebSocket | undefined>();
    let timer = null
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>();
    const [api, contextHolder] = notification.useNotification({ maxCount: 3, });
    const containerRef = useRef<HTMLDivElement>(null);
    const updatePreference = useGlobalStore((state) => state.updatePreference);
    const preference = useGlobalStore((state) => state.preference);
    // system notification
    const openNotificationWithIcon = (type: NotificationType, system_message: string) => {
        api[type]({
            message: system_message,
            placement: 'topLeft',
        });
    };
    const handleSystemMessage = (systemMessageList) => {
        for (let index = 0; index < systemMessageList.length; index++) {
            const element = systemMessageList[index];
            openNotificationWithIcon('info', element.system_message)
        }
    }
    // send user questions
    const handleSendMessage = async () => {
        console.log('inputNewMessage-->', inputNewMessage)
        setButtonLoading(true)
        const newMessage = { action: "send_text", content: inputNewMessage }
        chatWS.current.send(JSON.stringify(newMessage))
        clearNewMessage()
        setButtonLoading(false)
    };
    const handleSendOption = (optionInfo: string) => {
        console.log('我发送的消息--->', optionInfo)
        chatWS.current.send(optionInfo)
    }
    const handleUserTypingText = () => {
        const typyingAction = { action: "start_typing" }
        console.log('开始打字-->', typyingAction)
        chatWS.current.send(JSON.stringify(typyingAction))
    }
    const connectSocketHandler = (e: Event) => {
        console.log('Connect Success-->', e)
    }

    const messageSocketHandler = async (e: MessageEvent<any>) => {
        const responseData = JSON.parse(e.data)
        console.log('数据信息-->', responseData)
        if (Array.isArray(responseData)) {
            addMessage(responseData.filter((item,) => (item.sender !== 'system')))
            const systemMessage = responseData.filter((item) => (item.sender === 'system'))
            handleSystemMessage(systemMessage)
        } else {
            setMessage(responseData)
            if (responseData.event === "make_choice") {
                makeChoice(responseData)
            } else if (responseData.sender === "system") {
                openNotificationWithIcon('info', responseData.system_message)
            }
        }
    }
    const restartSocketHandler = () => {
        timer = setInterval(() => {
            chatWS.current = new WebSocket(`ws://172.174.247.133/chat/socket?room_id=${props.roomInfo.room.id}&email=${email}`)
            if (chatWS.current.readyState === 0) {
                clearInterval(timer)
                timer = null
                chatWS.current.addEventListener("open", connectSocketHandler)
                chatWS.current.addEventListener("message", messageSocketHandler)
                chatWS.current.addEventListener("error", errorSocketHandler)
                chatWS.current.addEventListener("close", closeSocketHandler)
            }
        }, 5000)
    }
    const errorSocketHandler = (e: Event) => {
        console.log('Connect Error-->', e)
    }
    const closeSocketHandler = (e: Event) => {
        console.log('Connect Close-->', e)
        restartSocketHandler()
    }
    // init chat websocket
    useEffect(() => {
        chatWS.current = new WebSocket(`ws://172.174.247.133/chat/socket?room_id=${props.roomInfo.room.id}&email=${email}`)
        chatWS.current.addEventListener("open", connectSocketHandler)
        chatWS.current.addEventListener("message", messageSocketHandler)
        chatWS.current.addEventListener("error", errorSocketHandler)
        chatWS.current.addEventListener("close", closeSocketHandler)
    }, [])
    return <>
        <div className="min-w-80 w-full h-full  scrollbar-thums sb-red scrollbar-track-red">
            {timer === null ? <div className="w-full rounded-lg shadow-lg p-y-4 h-full flex justify-between flex-col">
                {/* <SystemMessage messages={systemMessageList}></SystemMessage> */}
                <div className="scrollbar flex flex-col space-y-2 flex-grow overflow-y-auto scrollbar-thumb-red scrollbar-track-red bg-customBGColor01" ref={containerRef}>
                    {contextHolder}
                    {messages.map((item, i) => (
                        <div key={i}>
                            {item.sender.trim() !== email.trim() ?
                                <>
                                    {Array.isArray(item.content) && <ChatAI messageId={i} handleChooseAction={handleSendOption} content={item.content} name={item.name} />}
                                </>
                                :
                                <>
                                    {Array.isArray(item.content) && item.content.map((c, ci) => (<ChatUser name={item.name} key={ci} type={c.type} value={c.value} />))}
                                </>
                            }
                        </div>))}
                    {isTyping && <ChatUser name="T" loading={true} type="text" />}
                </div>
                {email && <DraggablePanel
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
                            <TextArea sendMessage={handleSendMessage} handleUserTyping={handleUserTypingText} />
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
                </DraggablePanel>}
            </div>
                :
                <Loading text="Reconnecting..." />}

        </div >
    </>
}