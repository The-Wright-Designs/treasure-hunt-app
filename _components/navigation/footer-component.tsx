import { House, MapPinned, Trophy, Share2 } from "lucide-react";
import Link from "next/link";
import classNames from "classnames";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: House, active: true },
  {
    href: "/active-hunt",
    label: "Active Hunt",
    icon: MapPinned,
    active: false,
  },
  { href: "/achievements", label: "Achievements", icon: Trophy, active: false },
  { href: "/share", label: "Share", icon: Share2, active: false },
];

export default function FooterComponent() {
  return (
    <footer className="fixed bottom-0 flex w-full border-t border-black/50 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
      {navItems.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
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
      ))}
    </footer>
  );
}
