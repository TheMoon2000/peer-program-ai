"use client";

import { RoomInfo } from "@/Data Structures"
import { useEffect } from "react";
interface Props {
    roomInfo: RoomInfo
}

/* Lobe Chat integration */
export default function Chat(props: Props) {
    console.log()
    useEffect(() => {
        const email = localStorage.getItem('email')
        console.log('props.roomInfo.room.id--->',props.roomInfo.room.id)
        const socket = new WebSocket(`ws://172.174.247.133/chat/socket?room=${props.roomInfo.room.id}&email=${email}`);

        socket.onopen = () => {
            console.log('WebSocket 连接已建立');
            // 在连接建立后，可以发送和接收消息
            socket.send('Hello, WebSocket!');
        };

        socket.onmessage = (event) => {
            console.log('收到消息:', event.data);
            // 处理接收到的消息
        };

        socket.onclose = () => {
            console.log('WebSocket 连接已关闭');
            // 在连接关闭后执行清理操作
        };

        return () => {
            // 在组件卸载时关闭 WebSocket 连接
            socket.close();
        };
    }, []);
    return <>
        <div className="w-full h-full">
            <div className="w-full bg-white-100 rounded-lg shadow-lg p-4 h-full flex justify-between flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">John Doe</h2>
                    <span className="text-sm text-gray-500">12:30 PM</span>
                </div>
                <div className="flex flex-col space-y-2 flex-grow">
                    <div className="flex items-start">
                        <div className="bg-blue-500 rounded-lg p-2">
                            <p className="text-white">Hola, ¿cómo estás?</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-end">
                        <div className="bg-gray-300 rounded-lg p-2">
                            <p className="text-gray-800">¡Hola! Estoy bien, ¿y tú?</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="bg-blue-500 rounded-lg p-2">
                            <p className="text-white">Muy bien, gracias por preguntar.</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center mt-4">
                    <input type="text" className="flex-grow bg-gray-200 rounded-full px-4 py-2 text-gray-700 focus:outline-none" placeholder="Escribe un mensaje..." />
                    <button type="button" className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 focus:outline-none">Enviar</button>
                </div>
            </div>
        </div>
    </>
}