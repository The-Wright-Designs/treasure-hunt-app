import PageWrapper from "@/_lib/utils/page-wrapper";

const Loading = () => {
  return (
    <PageWrapper>
      <div className="grid place-items-center py-20" role="status">
        <div className="spinner" />
        <span className="visually-hidden">Loading</span>
      </div>
    </PageWrapper>
  );
};

export default Loading;
