import { Button } from "@/components/ui/button";
import {
  Dialog,
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

// Props type definition
interface QuestionsDialogProps {
  questions: Question[]; // Using the Questions type defined earlier
  handleQuestionChange: (question: Question) => Promise<void>; // Function type added
}

const QuestionsDialog: React.FC<QuestionsDialogProps> = ({
  questions,
  handleQuestionChange,
}) => {
  // Need to handle when the question is clicked
  // Should perform patch?

  // Get the list of questions
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Questions</Button>
      </DialogTrigger>
      <DialogContent className="">
        {/* <DialogContent className="sm:max-w-[425px]"> */}
        <DialogHeader>
          <DialogTitle>Questions</DialogTitle>
          <DialogDescription>
            Change the question that you would like to do.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            {questions.length > 0 ? (
              questions.map((question) => (
                <Button
                  key={question.question_id}
                  variant="outline"
                  onClick={() => handleQuestionChange(question)}
                >
                  {question.title}
                </Button>
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
