import MarkdownTextView from '@/components/MarkdownTextView/MarkdownTextView';
import { FormControl, FormControlLabel, Radio, RadioGroup, RadioProps, styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
type IChatProps = {
    type: "text" | "choices" | "typing" | string,
    value: string | string[]
    choice_index?: number
}
type IChatAIProps = {
    messageId: number,
    content: IChatProps[]
    name: string,
    handleChooseAction: (actionInfo: string) => void
}



const ChatAI = (detailContent: IChatAIProps) => {
    const { messageId, content, name, handleChooseAction } = detailContent
    const [selectedValue, setSelectedValue] = useState('')
    // when a user choose one of the options
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const [i, j, k] = event.target.value.split(',')
        // i：message_id content_index：j
        const doActionInfo = { action: "make_choice", message_id: Number(i), content_index: Number(j), choice_index: Number(k) }
        handleChooseAction(JSON.stringify(doActionInfo))
        setSelectedValue(event.target.value);
    };
    return (
        <div className="flex items-start justify-start mt-1">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full mx-2 mt-1">
                <span className="text-l font-bold text-gray-600">{name.charAt(0)}</span>
            </div>
            <div className="flex items-start  w-2/3 max-w-2/3">
                <div className="flex-col">
                    <Typography variant="caption" display="block" className='text-gray-600 pl-1'>
                        {name}
                    </Typography>
                    <div className="bg-customBGColor02 rounded-lg p-2 text-black">
                        {content.map((item, i) => (
                            <div key={i}>
                                {item.type === 'text' && (
                                    !Array.isArray(item.value) && <MarkdownTextView rawText={item.value}></MarkdownTextView>
                                )}
                                {item.type === 'choices' && (
                                    <FormControl>
                                        <RadioGroup
                                            aria-labelledby="demo-customized-radios"
                                            name="customized-radios"
                                            onChange={handleChange}
                                        >

                                            {Array.isArray(item.value) && item.value.map((option, j) => (
                                                item.choice_index !== undefined ?
                                                    <FormControlLabel
                                                        key={j}
                                                        value={`${messageId},${i},${j}`}
                                                        control={<Radio />}
                                                        label={option}
                                                        checked={item.choice_index === j}
                                                        disabled={true}
                                                        className='text-black' />
                                                    :
                                                    <FormControlLabel
                                                        key={j}
                                                        value={`${messageId},${i},${j}`}
                                                        control={<Radio />}
                                                        label={option}
                                                        disabled={selectedValue !== '' && selectedValue !== `${messageId},${i},${j}`}
                                                        className='text-black'
                                                    />

                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ChatAI;
