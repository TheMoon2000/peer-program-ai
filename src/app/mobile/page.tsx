import Features from "@/views/landing-page/Features";
import Hero from "@/views/landing-page/Hero";

export default function HomePage() {
  return (
    <>
      <div className="flex items-center gap-x-6 bg-gray-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
        <p className="text-sm leading-6 text-white">
          <a href="#">
            <strong className="font-semibold">Join Peer Program on PC</strong>
            <svg
              viewBox="0 0 2 2"
              className="mx-2 inline h-0.5 w-0.5 fill-current"
              aria-hidden="true"
            >
              <circle cx={1} cy={1} r={1} />
            </svg>
            Note: Mobile view is not currently supported&nbsp;
            <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
          >
            <span className="sr-only">Dismiss</span>
            {/* <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" /> */}
          </button>
        </div>
      </div>
      <Hero></Hero>
      <Features></Features>
    </>
  );
}
