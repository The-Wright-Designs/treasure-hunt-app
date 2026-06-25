"use client";

import Link from "next/link";
import HeaderMenu from "./header-menu";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect } from "react";
import { useHeaderMenu } from "@/_context/header-menu-context";

const HeaderComponent = () => {
  const { isOpen, open, close } = useHeaderMenu();

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
    <header className="top-0 sticky z-50 bg-white px-7 py-5 border-b border-black/25 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
      <div className="flex w-full items-center gap-10 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo/treasure-hunt-app-logo.png"
            alt="Treasure Hunt App logo"
            width={40}
            height={40}
          />
          <h3>Treasure Hunt App</h3>
        </Link>
        <button
          onClick={() => (isOpen ? close() : open())}
          className="ease-in-out duration-300 -m-2 p-2 desktop:hover:cursor-pointer"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X size={28} color="#1D1D1D" />
          ) : (
            <Menu size={28} color="#1D1D1D" />
          )}
        </button>
      </div>
      <HeaderMenu isOpen={isOpen} setIsOpen={(val) => (val ? open() : close())} />
    </header>
  );
};

export default HeaderComponent;
