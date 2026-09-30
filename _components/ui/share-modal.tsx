"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";

import ButtonType from "@/_components/ui/buttons/button-type";

interface ShareModalProps {
  cssClasses?: string;
}

const SHARE_URL = "https://www.treasure-hunt-app.com";

export default function ShareModal({ cssClasses }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.share({
        title: "Treasure Hunt App",
        text: "Join the Plett treasure hunt!",
        url: SHARE_URL,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
    }
  }

  return (
    <div
      className={classNames(
        "bg-white border-2 border-black rounded-[6px] flex flex-col items-center gap-5 p-5",
        cssClasses,
      )}
    >
      <h3 className="whitespace-nowrap">Share this app with your friends</h3>
      <ButtonType
        type="button"
        colorOrange
        cssClasses="w-full"
        onClick={handleShare}
      >
        {copied ? "Link copied" : "Share"}
      </ButtonType>
      <Link
        href={`https://wa.me/?text=${encodeURIComponent(
          `Join the Plett treasure hunt! ${SHARE_URL}`,
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 -m-2 desktop:hover:cursor-pointer"
      >
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
