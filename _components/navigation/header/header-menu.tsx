"use client";

import Link from "next/link";
import classNames from "classnames";
import { Dispatch, SetStateAction } from "react";
import {
  CircleUser,
  BadgeCheck,
  Megaphone,
  ShieldCheck,
  Phone,
  LogOut,
  LucideProps,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

import { headerNav } from "@/_data/nav-data.json";
import { auth } from "@/_lib/firebase-client";
import { deleteSession } from "@/_actions/auth-actions";

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
  const router = useRouter();

  async function handleLogout() {
    setIsOpen(false);
    await signOut(auth);
    await deleteSession();
    router.push("/login");
  }

  return (
    <div className={classNames(cssClasses)}>
      {isOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
      )}
      <div
        className={classNames(
          "fixed top-[81px] right-0 bottom-[87px] min-[375px]:bottom-[110px] z-40 min-w-[200px] w-1/2 max-w-[240px] transform bg-white/95 border-l border-black/25 transition-transform duration-300 ease-in-out",
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
                    className="flex items-center gap-2"
                  >
                    <Icon size={20} color="#1D1D1D" />
                    <span className="text-paragraph text-black">{title}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={20} color="#1D1D1D" />
                <span className="text-paragraph text-black">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
