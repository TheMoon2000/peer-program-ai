type IChatProps = {
    type: "text" | "choices",
    value: string | string[]
    choice_index?: number
}
const ChatUser = (detailContent: IChatProps) => {
    return (
        <div className="flex items-end justify-end ">
            {detailContent.type === "text" &&
                <div className="flex items-end justify-end w-2/3">
                    <div className="bg-gray-300 rounded-lg p-2">
                        <p className="text-gray-800">{detailContent.value}</p>
                    </div>
                </div>
            }
        </div>
    )
}

export default ChatUser;
