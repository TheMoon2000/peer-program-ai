import MarkdownTextView from '@/components/MarkdownTextView/MarkdownTextView';
import { FormControl, FormControlLabel, Radio, RadioGroup, RadioProps, styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import BubblesLoading from "@/components/chat/BubblesLoading"
type IChatAIProps = {
    name: string,

}

const ChatAILoading = (detailContent: IChatAIProps) => {
    const { name } = detailContent
    return (
        <div className="flex items-start justify-start mt-1">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full mx-2 mt-1">
                <span className="text-l font-bold text-gray-600">{name.charAt(0)}</span>
            </div>
            <div className="flex flex-col items-start">
                <div className="max-w-12">
                    <Typography variant="caption" display="block" className='text-gray-600 pl-1'>
                        {name}
                    </Typography>
                    <div className="bg-customBGColor02 rounded-lg p-2 text-black">
                        <BubblesLoading />
                    </div>
                </div>
                <span className='text-xs text-zinc-400'>{name} is typing...</span>
            </div>

        </div>
    )
}

export default ChatAILoading;
