import MarkdownTextView from "@/components/MarkdownTextView/MarkdownTextView"

type IChatProps = {
    type: "text" | "choices",
    value: string | string[]
    choice_index?: number,
    name: string
}
const ChatUser = (detailContent: IChatProps) => {
    const { type, name, value } = detailContent
    return (
        <div className="flex items-start justify-end">
            <div className="flex items-end justify-end w-3/4">
                {type === "text" &&
                    <div className="flex items-end justify-end ">
                        <div className="bg-green-300 rounded-lg p-2">
                            {!Array.isArray(value) && <MarkdownTextView rawText={value}></MarkdownTextView>}
                            {/* <p className="text-black">{value}</p> */}
                        </div>
                    </div>
                }
            </div>
            <div className="box-border flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full mx-2 mt-0.5">
                <span className="text-l font-bold text-gray-600">{name.charAt(0)}</span>
            </div>
        </div>

    )
}

export default ChatUser;
