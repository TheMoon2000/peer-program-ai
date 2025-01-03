import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QuestionsList from "./QuestionsList";
import { Question } from "@/Data Structures";
import { axiosInstance } from "@/Constants";

import { useState, useEffect } from "react"; // mark

// Props type definition
interface QuestionsDialogProps {
  questions: Question[]; // Using the Questions type defined earlier
  handleQuestionChange: (question: Question) => Promise<void>; // Function type added
}

const QuestionsDialog: React.FC<QuestionsDialogProps> = ({
  questions,
  handleQuestionChange,
}) => {
  // mark - start
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    const storedState = localStorage.getItem("buttonClicked");
    if (storedState === "true") {
      setClicked(true);
    } else {
      // Start a timer for 2 minutes
      const timer = setTimeout(() => {
        if (!clicked && questions.length > 0) {
          const randomIndex = Math.floor(Math.random() * questions.length); // Random problem
          handleQuestionChange(questions[randomIndex]); // Automatically select problem
          setClicked(true);
          localStorage.setItem("buttonClicked", "true"); // Persist state
        }
      }, 120000); // 2 minutes in milliseconds
      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [clicked, questions, handleQuestionChange]);

  const handleClick = () => {
    setClicked(true);
    localStorage.setItem("buttonClicked", "true");
  };
  // mark - end

  // Need to handle when the question is clicked
  // Should perform patch?

  // Get the list of questions
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="p-4">
          <Button
            variant="default"
            onClick={handleClick} // mark
            className={`${!clicked ? "animate-pulse" : ""}`} // mark
          >
            Select Coding Problem
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="">
        {/* <DialogContent className="sm:max-w-[425px]"> */}
        <DialogHeader>
          <DialogTitle>Problems</DialogTitle>
          <DialogDescription>
            Change the problem that you would like to do. Scroll down to see all
            of the problems.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="max-h-96 overflow-y-auto grid grid-cols-1 items-center gap-4">
            {questions.length > 0 ? (
              questions.map((question) => (
                <DialogClose asChild key={question.question_id}>
                  <Button
                    variant="outline"
                    onClick={() => handleQuestionChange(question)}
                  >
                    <div className="flex-1 text-sm text-center py-2">
                      {question.title}
                    </div>
                  </Button>
                </DialogClose>
              ))
            ) : (
              <p>No questions available</p>
            )}

            {/* <QuestionsList></QuestionsList> */}
          </div>
        </div>
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

export default QuestionsDialog;
