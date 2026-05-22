"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";

import navData from "@/_data/nav-data.json";
import { Menu, X } from "lucide-react";

interface MobileHeaderProps {
  cssClasses?: string;
}

export function HeaderMobile({ cssClasses }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div className={classNames(cssClasses)}>
      <div className="flex w-full items-center gap-10 justify-between">
        <Link href="/" className="flex flex-wrap gap-y-2 gap-x-3 items-center">
          <Image src="" alt="" width={66} height={57} />
          <h1 className="text-[18px] min-[400px]:text-[28px] font-semibold flex flex-col">
            Treasure Hunt App
          </h1>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="ease-in-out duration-300 -m-2 p-2"
          aria-label="Open menu"
        >
          <Menu size={28} color="#202020" />
        </button>
      </div>

      <div
        className={classNames(
          "fixed inset-0 z-50 transform bg-black/98 transition-transform duration-300 ease-in-out",
          {
            "translate-x-full": !isOpen,
          },
        )}
      >
        <div className="flex w-full py-8.5 items-center px-7 justify-end">
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="p-2 -m-2"
          >
            <X size={28} color="#FFFFFF" />
          </button>
        </div>
        <nav className="px-5">
          <ul className="grid gap-4">
            {navData.map(({ title, url }, id) => {
              return (
                <li key={id}>
                  <Link
                    href={url}
                    onClick={() => setIsOpen(false)}
                    className="text-paragraph text-white font-extralight p-2 -m-2"
                  >
                    {title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
