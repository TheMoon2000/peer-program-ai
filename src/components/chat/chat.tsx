import { UserInfo } from '@/Data Structures'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

interface Props {
    editor?: monaco.editor.IStandaloneCodeEditor // first load is empty
    usersOnline: UserInfo[]
}

export default function Chat(props: Props) {
    if (!props.editor) {
        return <div /> // loading screen
    }
    return <div>

    </div>
}