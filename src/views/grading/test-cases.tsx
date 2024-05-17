import { TestCase, TestResult } from "@/Data Structures";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import LoadingButton from "@mui/lab/LoadingButton";
import "./test-cases.css";
import { useEffect } from "react";

interface Props {
  useGraphics?: boolean
  cases?: TestCase[] | null;
  results?: TestResult[] | null;
  isWaiting: boolean;
  onRun: () => void;
}

export default function TestCases(props: Props) {
  return (
    <div className="px-4 relative test-case-container overflow-y-visible bg-white box-border">
      <canvas id="canvas" width="390px" height="260px" style={{backgroundColor: "white", border: "1px solid gray", width: "calc(100% - 1rem)", display: props.useGraphics ? "block" : "none"}} />
      {props.cases && (
        <div className="py-2">
          <LoadingButton
            loading={props.isWaiting}
            variant="outlined"
            onClick={props.onRun}
          >
            Check Correct
          </LoadingButton>
        </div>
      )}
      <div className="flex-col gap-1 items-stretch">
        {props.results === undefined && (
          <div className="text-center py-4 gray">Loading...</div>
        )}
        {props.results &&
          props.cases?.map((testCase, caseIndex) => {
            const testResult = props.results[caseIndex];
            if (!testResult) { return <></>}
            return (
              <Accordion key={caseIndex} sx={{ my: 1 }} defaultExpanded>
                <AccordionSummary
                  expandIcon={
                    <ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />
                  }
                >
                  <code style={{ fontWeight: 600, fontSize: 14 }}>
                    {testCase.title}
                  </code>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    fontFamily: "SFMono-Regular, Menlo, monospace",
                    fontSize: 13,
                    p: 1,
                  }}
                >
                  <div className="p-2">
                    <div className="py-1">
                      <code style={{ fontWeight: 700 }}>Expected Output</code>
                    </div>
                    <div>
                      {testCase.stdout_expected.map((line, i) => (
                        <p className="overflow-auto mb-0" key={i}>
                          {line.trim() ===
                          testResult.stdoutObserved[i]?.trim() ? (
                            line
                          ) : (
                            <mark
                              style={{ backgroundColor: "rgb(255, 194, 153)" }}
                            >
                              {line}
                            </mark>
                          )}
                          {testCase.stdin_expected && (
                            <strong style={{ color: "blue" }}>
                              {" "}
                              {testCase.stdin_expected[i]}
                            </strong>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="py-1">
                      <code style={{ fontWeight: 700 }}>Observed Output</code>
                    </div>
                    <div>
                      {testResult.stdoutObserved.map((line, i) => (
                        <p className="overflow-auto mb-0" key={i}>
                          {line.trim() ===
                          testCase.stdout_expected[i]?.trim() ? (
                            line
                          ) : (
                            <mark
                              style={{ backgroundColor: "rgb(255, 194, 153)" }}
                            >
                              {line}
                            </mark>
                          )}
                          {
                            <strong style={{ color: "blue" }}>
                              {" "}
                              {testResult.stdinObserved[i]}
                            </strong>
                          }
                        </p>
                      ))}
                    </div>
                    {testResult.error && (
                      <div
                        className="rounded border mt-2"
                        style={{ backgroundColor: "rgba(255, 0, 0, 0.2)" }}
                      >
                        <p
                          className="mb-0 p-1 text-nowrap overflow-scroll"
                          style={{ backgroundColor: "#f3f3f3" }}
                        >
                          <strong>Errors:</strong>
                        </p>
                        <div className="p-1">
                          <code className="mb-0" style={{ fontSize: 12.5 }}>
                            {testResult.error}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionDetails>
              </Accordion>
            );
          })}
      </div>
    </div>
  );
}
