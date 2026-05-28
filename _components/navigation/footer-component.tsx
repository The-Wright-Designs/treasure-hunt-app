"use client";

import { House, MapPinned, Trophy, Share2, LucideProps } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";

import { footerNav } from "@/_data/nav-data.json";
import { useShareModal } from "@/_context/share-modal-context";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  House,
  MapPinned,
  Trophy,
  Share2,
};

export default function FooterComponent() {
  const pathname = usePathname();
  const { isOpen, open, close } = useShareModal();

  return (
    <footer className="fixed z-50 bg-white bottom-0 flex w-full border-t border-black/50 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
      {footerNav.map(({ url, label, icon }) => {
        const Icon = iconMap[icon];
        const isShare = icon === "Share2";
        const active = isShare ? isOpen : !isOpen && pathname === url;

        if (isShare) {
          return (
            <button
              key={url}
              onClick={isOpen ? close : open}
              className={classNames(
                "flex flex-1 flex-col items-center justify-center gap-1.5 py-7.5 desktop:hover:cursor-pointer",
                { "bg-black/90": active },
              )}
            >
              <Icon size={28} color={active ? "#FFFFFF" : "#1D1D1D"} />
              <span
                className={classNames("text-[12px]", {
                  "text-white": active,
                  "text-black": !active,
                })}
              >
                {label}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={url}
            href={url}
            onClick={close}
            className={classNames(
              "flex flex-1 flex-col items-center justify-center gap-1.5 py-7.5 desktop:hover:cursor-pointer",
              { "bg-black/90": active },
            )}
          >
            <Icon size={28} color={active ? "#FFFFFF" : "#1D1D1D"} />
            <span
              className={classNames("text-[12px]", {
                "text-white": active,
                "text-black": !active,
              })}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </footer>
  );
}
