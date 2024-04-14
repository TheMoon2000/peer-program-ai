import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useState } from "react";

interface Props {
  editor?: monaco.editor.IStandaloneCodeEditor; // undefined means loading
}

const textareaStyle: React.CSSProperties = {
  resize: "none",
  borderRadius: 3,
  padding: 5,
  backgroundColor: "#f0f0f0",
  width: "100%",
};

const testCases = [
  {
    title: "Test with positive integers",
    input: "add_numbers(10, 5)",
    expected_output: "15",
    description: "Basic addition of two positive numbers.",
    passed: true,
  },
  {
    title: "Test with zero",
    input: "add_numbers(0, 5)",
    expected_output: "5",
    description: "Adding zero should return the other number.",
    passed: true,
  },
  {
    title: "Test with negative numbers",
    input: "add_numbers(-10, -5)",
    expected_output: "-15",
    description: "Summing two negative numbers.",
    passed: false,
  },
  {
    title: "Test with a positive and a negative number",
    input: "add_numbers(-10, 20)",
    expected_output: "10",
    description: "Adding a negative number to a positive number.",
    passed: false,
  },
  {
    title: "Test with floating-point numbers",
    input: "add_numbers(10.5, 4.5)",
    expected_output: "15.0",
    description: "Handling of float addition.",
    passed: false,
  },
  {
    title: "Test with large numbers",
    input: "add_numbers(1000000, 2000000)",
    expected_output: "3000000",
    description: "Correct handling of very large integers.",
    passed: false,
  },
  {
    title: "Test with both numbers as zero",
    input: "add_numbers(0, 0)",
    expected_output: "0",
    description: "The sum of zero with zero is zero.",
    passed: false,
  },
];

export default function Grading(props: Props) {
  const [inputValue, setInputValue] = useState("1,2,3");
  const [outputValue, setOutputValue] = useState("6");
  return (
    <div className="m-2 w-full">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Test Cases
        </h3>
      </div>
      <Accordion type="single" collapsible>
        {testCases.map((test, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>
              <div className="flex justify-between w-full">
                <div>{test.title}</div>
                {test.passed ? (
                  <span className="no-underline inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">
                    Passed
                  </span>
                ) : (
                  <span className="no-underline inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    Failed
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>
                <strong>Input:</strong> {test.input}
              </p>
              <p>
                <strong>Expected Output:</strong> {test.expected_output}
              </p>
              <p>{test.description}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  // return <div style={{padding: "1rem", minWidth: "200px" }}>
  //   <table style={{ width: "100%" }}>
  //     <tbody>
  //       <tr>
  //         <td>Input:</td>
  //         <td>
  //           <textarea readOnly style={textareaStyle} value={inputValue} />
  //         </td>
  //       </tr>
  //       <tr>
  //         <td>Output:</td>
  //         <td>
  //           <textarea readOnly style={textareaStyle} value={outputValue} />
  //         </td>
  //       </tr>
  //     </tbody>
  //   </table>
  // </div>
}
