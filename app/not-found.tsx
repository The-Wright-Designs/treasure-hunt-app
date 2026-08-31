import ButtonLink from "@/_components/ui/buttons/button-link";
import PageWrapper from "@/_lib/utils/page-wrapper";

const NotFound = () => {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-5 py-10">
        <h1>Page not found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        <ButtonLink
          href="/dashboard"
          colorTeal
          cssClasses="w-full desktop:hover:cursor-pointer"
        >
          Back to dashboard
        </ButtonLink>
      </div>
    </PageWrapper>
  );
};

export default NotFound;
