import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";

interface ShareModalProps {
  cssClasses?: string;
}

export default function ShareModal({ cssClasses }: ShareModalProps) {
  return (
    <div
      className={classNames(
        "bg-white border-2 border-black rounded-[6px] flex flex-col items-center gap-5 p-5",
        cssClasses,
      )}
    >
      <h3 className="whitespace-nowrap">Share this app with your friends</h3>
      <Link href="#" className="p-2 -m-2 desktop:hover:cursor-pointer">
        <Image
          src="/icons/whatsapp.svg"
          alt="Share on WhatsApp"
          width={32}
          height={32}
        />
      </Link>
    </div>
  );
}
