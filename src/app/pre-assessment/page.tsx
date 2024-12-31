import dynamic from "next/dynamic";

// Dynamically import the `PreAssessment` component and disable SSR
const PreAssessment = dynamic(() => import("./PreAssessment"), {
  ssr: false,
});

const Page = () => {
  return <PreAssessment />;
};

export default Page;
