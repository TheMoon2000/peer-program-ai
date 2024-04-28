import { Loader } from "lucide-react";
type ILoadingProps = {
  text?: string
}
const Loading = ({ text }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <Loader className="h-6 w-6 text-muted-foreground animate-spin" />
      {text && <p className="text-lg">{text}</p>}
    </div>
  );
};

export default Loading;
