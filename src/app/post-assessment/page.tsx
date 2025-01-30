import dynamic from "next/dynamic";

// Dynamically import the `PreAssessment` component and disable SSR
const PostAssessment = dynamic(() => import("../assessment"), {
  ssr: false,
});

const questions = [
  {
    id: 1,
    number: "Question 1:",
    title: "",
    text:
      "Generate a random number between 1 to 100 and determine the " +
      "pricing for a movie ticket based on their age. Below 18 is a " +
      "Youth ticket, over 18 and under 60 is a Regular ticket, and 60 " +
      "and over is a Senior ticket.",
    example:
      "Age: 56 # Randomly generated each time\n" +
      "Ticket: Regular\n\n" +
      "***************\n" +
      "Age: 16\n" +
      "Ticket:Youth",
  },
  {
    id: 2,
    number: "Question 2:",
    title: "",
    text:
      "The Fibonacci sequence is a special pattern of numbers where " +
      "each number is the sum of the two numbers before it. It starts with " +
      "0 and 1, and from there, you keep adding the last two numbers to get " +
      "the next one. Here's how it works step by step:\n\n" +
      "Here's how it works step by step:\n" +
      "• Start with 0 and 1.\n" +
      "• Add them together (0 + 1) to get 1.\n" +
      "• Add the last two numbers (1 + 1) to get 2.\n" +
      "• Add the last two numbers (1 + 2) to get 3.\n" +
      "• Keep going: 2 + 3 = 5, 3 + 5 = 8, 5 + 8 = 13, and so on.\n\n" +
      "If you keep following this pattern, the sequence looks like this: " +
      "0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, …\n" +
      "Your task is to generate the first 20 numbers of Fibonacci sequence.",
    example: "0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ..., 4181",
  },
  {
    id: 3,
    number: "Question 3:",
    title: "",
    text:
      "Write a program that simulates coin flips. The loop should stop " +
      "when it reaches heads twice in a row or runs 10 times, whichever " +
      "comes first.",
    example:
      "Flip 1: Heads\n" +
      "Flip 2: Tails\n" +
      "Flip 3: Tails\n" +
      "Flip 4: Heads\n" +
      "Flip 5: Tails\n" +
      "Flip 6: Heads\n" +
      "Flip 7: Heads\n" +
      "# Stopped because it flipped heads twice in a row on flips 6 and 7\n" +
      "***************\n" +
      "Flip 1: Heads\n" +
      "Flip 2: Heads\n" +
      "# Stopped because it flipped heads twice in a row",
  },
];

const googleFormLink = "https://forms.gle/ZrMMh7vDgeYuM7Hq9";

const Page = () => {
  return (
    <PostAssessment
      questions={questions}
      googleFormLink={googleFormLink}
      assessmentType="post"
    />
  );
};

export default Page;
