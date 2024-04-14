import axios from "axios";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export const LLM_SERVER = axios.create({ baseURL: "https://what-will-the-url-be?" })
export const ursaTheme: monaco.editor.IStandaloneThemeData = {
    base: "vs",
    inherit: true,
    rules: [
         {
            "foreground":"#4089E0",
            "fontStyle": "bold",
            "token":"keyword.python"
         },
         {
            "foreground": "#808080",
            "token": "bracket.python"
         },
         {
            "foreground": "#9CDCFE",
            "token": "variable"
         }
    ],
    
    colors: {
        "editor.lineHighlightBackground": "#f3f3f3",
        "editorSuggestWidget.selectedBackground": "#62b0ff",
        "editorHoverWidget.background": "#ffffff",
        "editorHoverWidget.border": "#ffffff00"
    }
}