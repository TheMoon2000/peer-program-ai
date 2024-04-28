import MarkdownTextView from '@/components/MarkdownTextView/MarkdownTextView';
import { action } from '@/theme/palette';
import { FormControl, FormControlLabel, Radio, RadioGroup, RadioProps, styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

type IChatProps = {
    type: "text" | "choices",
    value: string | string[]
    choice_index?: number,
}
type IChatAIProps = {
    content: IChatProps[]
    name: string,
    handleChooseAction: (actionInfo: string) => void
}

const BpIcon = styled('span')(({ theme }) => ({
    borderRadius: '50%',
    width: 16,
    height: 16,
    boxShadow:
        theme.palette.mode === 'dark'
            ? '0 0 0 1px rgb(16 22 26 / 40%)'
            : 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: theme.palette.mode === 'dark' ? '#394b59' : '#f5f8fa',
    backgroundImage:
        theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))'
            : 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
    '.Mui-focusVisible &': {
        outline: '2px auto rgba(19,124,189,.6)',
        outlineOffset: 2,
    },
    'input:hover ~ &': {
        backgroundColor: theme.palette.mode === 'dark' ? '#30404d' : '#ebf1f5',
    },
    'input:disabled ~ &': {
        boxShadow: 'none',
        background:
            theme.palette.mode === 'dark' ? 'rgba(57,75,89,.5)' : 'rgba(206,217,224,.5)',
    },
}));

const BpCheckedIcon = styled(BpIcon)({
    backgroundColor: '#137cbd',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&::before': {
        display: 'block',
        width: 16,
        height: 16,
        backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
        content: '""',
    },
    'input:hover ~ &': {
        backgroundColor: '#106ba3',
    },
});

// Inspired by blueprintjs
function BpRadio(props: RadioProps) {
    return (
        <Radio
            disableRipple
            color="default"
            checkedIcon={<BpCheckedIcon />}
            icon={<BpIcon />}
            {...props}
        />
    );
}
const ChatAI = (detailContent: IChatAIProps) => {
    const { content, name, handleChooseAction } = detailContent
    const [selectedValue, setSelectedValue] = useState('')
    // when a user choose one of the options
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const [i, j, k] = event.target.value.split(',')
        const doActionInfo = { sender: localStorage.getItem('email').trim(), event: "make_choice", action: "make_choice", message_id: Number(i), content_index: Number(j), choice_index: Number(k) }
        handleChooseAction(JSON.stringify(doActionInfo))
        setSelectedValue(event.target.value);
    };
    return (
        <div className="flex items-start justify-start mt-1">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full mx-2 mt-1">
                <span className="text-l font-bold text-gray-600">{name.charAt(0)}</span>
            </div>
            <div className="flex items-start  w-3/4 max-w-3/4">
                <div className="flex-col">
                    <Typography variant="caption" display="block" className='text-black-500'>
                        {name}
                    </Typography>
                    <div className="bg-white rounded-lg p-2">
                        {content.map((item, i) => (
                            <div key={i}>
                                {item.type === 'text' && (
                                    !Array.isArray(item.value) && <MarkdownTextView rawText={item.value} inline />
                                    // <p className="text-black">{item.value}</p>
                                )}
                                {item.type === 'choices' && (
                                    <FormControl>
                                        <RadioGroup
                                            aria-labelledby="demo-customized-radios"
                                            name="customized-radios"
                                            onChange={handleChange}
                                        >
                                            {Array.isArray(item.value) && item.value.map((option, j) => (
                                                <FormControlLabel key={j} value={`${i},${j},${item.choice_index}`} control={<BpRadio />} label={option}
                                                    disabled={selectedValue !== '' && selectedValue !== `${i},${j},${item.choice_index}`} />
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
