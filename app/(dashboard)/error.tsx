"use client";

import ButtonType from "@/_components/ui/buttons/button-type";
import PageWrapper from "@/_lib/utils/page-wrapper";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error = ({ reset }: Props) => {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-5 py-10">
        <h1>Something went wrong</h1>
        <p>
          We couldn&apos;t load this page. Check your connection and give it
          another go.
        </p>
        <ButtonType
          type="button"
          onClick={reset}
          colorTeal
          cssClasses="w-full desktop:hover:cursor-pointer"
        >
          Try again
        </ButtonType>
      </div>
    </PageWrapper>
  );
};

export default Error;
