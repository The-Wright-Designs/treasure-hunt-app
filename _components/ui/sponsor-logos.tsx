import Image from "next/image";
import classNames from "classnames";

const SponsorLogos = ({ cssClasses }: { cssClasses?: string }) => {
  return (
    <div
      className={classNames(
        "flex flex-col gap-10 items-center w-full",
        cssClasses,
      )}
    >
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
  );
};

export default SponsorLogos;
