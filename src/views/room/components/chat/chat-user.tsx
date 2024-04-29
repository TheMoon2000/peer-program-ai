import MarkdownTextView from "@/components/MarkdownTextView/MarkdownTextView"
import BubblesLoading from "@/components/chat/BubblesLoading"

type IChatProps = {
    type?: "text" | "choices",
    value?: string | string[]
    choice_index?: number,
    name?: string
    loading?: boolean
}
const ChatUser = (detailContent: IChatProps) => {
    const { type, name, value, loading } = detailContent
    return (
        <div className="flex items-start justify-end mt-1">
            <div className="flex items-end justify-end w-2/3">
                {type === "text" &&
                    <div className="flex items-end justify-end ">
                        <div className="bg-slate-500 text-gray-50 rounded-lg p-2 ">
                            {loading ? <BubblesLoading /> : (!Array.isArray(value) && <MarkdownTextView rawText={value}></MarkdownTextView>)}
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
