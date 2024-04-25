type IChatProps = {
    type: "text" | "choices",
    value: string | string[]
    choice_index?: number
}
const ChatAI = (detailContent: IChatProps) => {
    return (
        <div className="flex items-start w-2/3 max-w-2/3">
            {detailContent.type === "text" &&
                <div className="bg-blue-500 rounded-lg p-2">
                    <p className="text-white">{detailContent.value}</p>
                </div>
            }
            {detailContent.type === "choices" &&
                (<div>
                    {Array.isArray(detailContent.value) && detailContent.value.map((item, index) => (
                        <div key={index} className="flex flex-col space-y-4 my-1">
                            <label htmlFor="option-a" className="cursor-pointer flex items-center">
                                <input type="radio" id="option-a" name="options" className="hidden" value="a" />
                                <span className="px-2 py-1 text-lg font-medium text-gray-800 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">{item.slice(-1)}</span>
                                <span className="text-base ml-2 text-gray-500 dark:text-gray-400">{item}</span>
                            </label>
                        </div>
                    ))}
                </div>)

            }
        </div>
    )
}

export default ChatAI;
