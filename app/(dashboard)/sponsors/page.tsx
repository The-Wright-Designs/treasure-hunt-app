import Image from "next/image";

export default function SponsorsPage() {
  return (
    <main className="flex flex-col gap-10 items-center justify-center px-7 py-10">
      <h2 className="text-center tracking-[0.32px]">
        Thank you to our app sponsors:
      </h2>
      <div className="flex flex-col gap-10 items-center w-full">
        <Image
          src="/images/sponsors/smhart-security-logo.png"
          alt="SMHART Security"
          width={150}
          height={200}
        />
        <Image
          src="/images/sponsors/plett-security-logo.png"
          alt="Plett Security"
          width={236}
          height={106}
        />
      </div>
    </main>
  );
}
