import { TextArea } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { ChangeEvent, memo, useEffect, useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { isCommandPressed } from '@/utils/keyboard';
import LoadingButton from '@mui/lab/LoadingButton';
import { Flexbox } from 'react-layout-kit';
import { useBoolean } from '@/hooks/use-boolean';
const useStyles = createStyles(({ css }) => {
    return {
        textarea: css`
      resize: none !important;
      height: 100% !important;
      padding: 0 24px;
      line-height: 1.5;
      box-shadow: none !important;
    `,
        textareaContainer: css`
      position: relative;
      flex: 1;
      overflow-y: auto;
    `,
    };
});

interface InputAreaProps {
    sendMessage: (value: string) => void,
    sendTypingAction: () => void
    sendCancelTypingAction: () => void
}
const email = localStorage.getItem('email')
const InputArea = memo<InputAreaProps>(({ sendMessage, sendTypingAction, sendCancelTypingAction }) => {
    const { styles } = useStyles();
    const textareaRef = useRef<TextAreaRef>(null);
    const [message, setMessage] = useState("")
    const isTyping = useBoolean(false)

    useEffect(() => {
        if (isTyping.value) {
            sendTypingAction()
        } else {
            sendCancelTypingAction()
        }
    }, [isTyping.value])

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value)
        isTyping.setValue(event.target.value.length > 0)
    };

    // 聚焦而且至少打了一个字符，才算在打字
    const onInputFocused = () => {
        isTyping.setValue(message.length > 0)
    }

    // 取消聚焦的话，必然会停止打字状态
    const onInputUnfocused = () => {
        isTyping.setValue(false)
    }
    return (
        <div className='flex flex-col justify-between h-full '>
            <Flexbox
                gap={8}
                height={'100%'}
                padding={'12px 0 16px'}
                style={{ minHeight: 150, position: 'relative' }}
            >
                <div className={styles.textareaContainer}>
                    <TextArea
                        className={`${styles.textarea} scrollbar`}
                        onBlur={onInputUnfocused}
                        onFocus={onInputFocused}
                        onChange={handleInputChange}
                        onPressEnter={(e) => {
                            if (e.shiftKey) return;
                            e.preventDefault();
                            sendCancelTypingAction();
                            sendMessage(message);
                            setMessage("")
                        }}
                        placeholder='Please input chat content ...'
                        ref={textareaRef}
                        type={'pure'}
                        value={message}
                    />
                </div>
                <div className="flex justify-end items-end px-6">
                    <LoadingButton
                        variant="contained"
                        endIcon={<SendIcon />}
                        loadingPosition="end"
                        onClick={() => {
                            sendMessage(textareaRef.current.resizableTextArea.textArea.value)
                            textareaRef.current.resizableTextArea.textArea.value = ""
                            textareaRef.current.blur()
                        }}>
                        Send
                    </LoadingButton>
                </div>
            </Flexbox >

        </div >
    );
});

InputArea.displayName = 'InputArea';

export default InputArea;
