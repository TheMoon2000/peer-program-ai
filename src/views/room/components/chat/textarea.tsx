import { TextArea } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { memo, useRef } from 'react';

import { isCommandPressed } from '@/utils/keyboard';
import { useInputMessageStore } from '../../store/chatStore';

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
    handleUserTyping: () => void
}

const InputArea = memo<InputAreaProps>(({ sendMessage, handleUserTyping }) => {
    const { styles } = useStyles();
    const ref = useRef<TextAreaRef>(null);
    const isChineseInput = useRef(false);
    const [inputNewMessage, updateNewMessage] = useInputMessageStore((state) => [state.inputNewMessage, state.updateNewMessage]);
    const handleChangeInputContent = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        updateNewMessage(event.target.value);
        handleUserTyping()
    };
    return (
        <div className='flex flex-col justify-between h-full '>
            <div className={styles.textareaContainer}>
                <TextArea
                    className={`${styles.textarea} scrollbar`}
                    onBlur={(event) => updateNewMessage(event.target.value)}
                    onChange={(event) => handleChangeInputContent(event)}
                    onCompositionEnd={() => { isChineseInput.current = false; }}
                    onCompositionStart={() => { isChineseInput.current = true; }}
                    onPressEnter={(e) => {
                        if (e.shiftKey || isChineseInput.current) return;
                        const send = () => {
                            e.preventDefault();
                            sendMessage(inputNewMessage);
                        };
                        const commandKey = isCommandPressed(e);
                        if (commandKey) {
                            // wrap
                            updateNewMessage((e.target as any).value + '\n');
                            return;
                        } else {
                            // send
                            console.log('no command', inputNewMessage)
                            send()
                        }
                    }}
                    placeholder='Please input chat content ...'
                    ref={ref}
                    type={'pure'}
                    value={inputNewMessage}
                />
            </div>
        </div>
    );
});

InputArea.displayName = 'InputArea';

export default InputArea;