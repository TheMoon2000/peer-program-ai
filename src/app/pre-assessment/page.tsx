import dynamic from "next/dynamic";

const PreAssessment = dynamic(() => import("../assessment"), {
  ssr: false,
});

const questions = [
  {
    id: 1,
    number: "Question 1:",
    title: "Basic Input and Output",
    text:
      "Write a program that takes a number as input and outputs the " +
      "number squared.\n\n" +
      "NOTE: The formatting of the output may look strange. Do not " +
      "worry about formatting as long as the program successfully " +
      "squares the input.",
    example:
      "# Prompt the user to enter a number\n" +
      "# User enters 5\n" +
      "Squared number: 25",
  },
  {
    id: 2,
    number: "Question 2:",
    title: "Conditionals and Comparisons",
    text:
      "Write a program that randomly generates a number from 1 to " +
      "100 and classify if that person can vote in the US. A person " +
      "can vote in the US if they are 18 or older.",
    example:
      "Randomly generated age is 92.\n" +
      "This person can vote.\n \n" +
      "Randomly generated age is 15.\n" +
      "This person cannot vote.",
  },
  {
    id: 3,
    number: "Question 3:",
    title: "Loops",
    text:
      "Write a program that uses a loop to print all of the multiples " +
      "of 7 from 1 to a randomly generated number between 50 and 500.",
    example: "Random Limit: 424 \n 7 \n 14 \n 21 \n 28 \n ...",
  },
];

const googleFormLink =
  "https://docs.google.com/forms/d/e/1FAIpQLSd-LaPEU3OVdM2Glkn89uW2pQ3VBCT8B9209fwy0g82ejvEbQ/viewform?usp=sharing";

const Page = () => {
  return (
    <PreAssessment
      questions={questions}
      googleFormLink={googleFormLink}
      assessmentType="pre"
    />
  );
};

export default Page;
