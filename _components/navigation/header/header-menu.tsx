import Link from "next/link";
import classNames from "classnames";
import { Dispatch, SetStateAction } from "react";
import {
  CircleUser,
  BadgeCheck,
  Megaphone,
  ShieldCheck,
  Phone,
  LucideProps,
} from "lucide-react";

import { headerNav } from "@/_data/nav-data.json";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  CircleUser,
  BadgeCheck,
  Megaphone,
  ShieldCheck,
  Phone,
};

interface MobileHeaderProps {
  cssClasses?: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function HeaderMenu({
  cssClasses,
  isOpen,
  setIsOpen,
}: MobileHeaderProps) {
  return (
    <div className={classNames(cssClasses)}>
      <div
        className={classNames(
          "fixed top-[81px] right-0 bottom-[110px] z-40 max-w-[200px] transform bg-white/95 border-l border-black/25 transition-transform duration-300 ease-in-out",
          {
            "translate-x-full": !isOpen,
          },
        )}
      >
        <nav className="p-7">
          <ul className="grid gap-5">
            {headerNav.map(({ title, url, icon }) => {
              const Icon = iconMap[icon];
              return (
                <li key={title}>
                  <Link
                    href={url}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 no-underline desktop:hover:cursor-pointer"
                  >
                    <Icon size={20} color="#1D1D1D" />
                    <span className="text-paragraph text-black">{title}</span>
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
