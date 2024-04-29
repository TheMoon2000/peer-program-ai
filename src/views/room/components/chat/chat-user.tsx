import MarkdownTextView from "@/components/MarkdownTextView/MarkdownTextView"
import BubblesLoading from "@/components/chat/BubblesLoading"

type IChatProps = {
    type?: "text" | "choices" | "typing" | string,
    value?: string | string[]
    choice_index?: number,
    name?: string
}
const ChatUser = (detailContent: IChatProps) => {
    const { type, name, value, } = detailContent
    return (
        <div className="flex items-start justify-end mt-1">
            <div className="flex items-end justify-end w-2/3">
                {type === "text" &&
                    <div className="flex items-end justify-end ">
                        <div className="bg-white rounded-lg p-2 text-black ">
                            (!Array.isArray(value) && <MarkdownTextView rawText={value}></MarkdownTextView>)
                        </div>
                    </div>
                }
                {type === "typing" && <div className="flex items-end justify-end ">
                    <div className="bg-white rounded-lg p-2 text-black ">
                        <BubblesLoading />
                    </div>
                </div>}
            </div>
            <div className="box-border flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full mx-2 mt-0.5">
                <span className="text-l font-bold text-gray-600">{name.charAt(0)}</span>
            </div>
        </div>

    )
}

export default ChatUser;