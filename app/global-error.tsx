"use client";

import "@/_styles/globals.css";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError = ({ reset }: Props) => {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex flex-col gap-5 px-5 py-10">
          <h1>Something went wrong</h1>
          <p>The app ran into a problem. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            className="flex font-medium text-subheading text-center px-4 py-3 justify-center rounded-[6px] min-w-[140px] bg-teal text-white desktop:hover:cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
