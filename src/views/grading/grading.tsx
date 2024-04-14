import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useState } from "react";

interface Props {
  editor?: monaco.editor.IStandaloneCodeEditor // undefined means loading
}

const textareaStyle: React.CSSProperties = {
  resize: "none",
  borderRadius: 3,
  padding: 5,
  backgroundColor: "#f0f0f0",
  width: "100%"
}

export default function Grading(props: Props) {
  const [inputValue, setInputValue] = useState("1,2,3")
  const [outputValue, setOutputValue] = useState("6")
  return <div style={{padding: "1rem", minWidth: "200px" }}>
    <table style={{ width: "100%" }}>
      <tbody>
        <tr>
          <td>Input:</td>
          <td>
            <textarea readOnly style={textareaStyle} value={inputValue} />
          </td>
        </tr>
        <tr>
          <td>Output:</td>
          <td>
            <textarea readOnly style={textareaStyle} value={outputValue} />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
}