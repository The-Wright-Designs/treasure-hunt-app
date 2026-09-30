import SponsorLogos from "@/_components/ui/sponsor-logos";

export default function SponsorsPage() {
  return (
    <main className="flex flex-col gap-10 items-center justify-center px-7 py-10">
      <h2 className="text-center tracking-[0.32px]">
        Thank you to our app sponsors:
      </h2>
      <SponsorLogos />
    </main>
  );
}
