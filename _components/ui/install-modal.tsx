"use client";

import classNames from "classnames";

import ButtonType from "@/_components/ui/buttons/button-type";

interface InstallModalProps {
  cssClasses?: string;
  onClose: () => void;
}

export default function InstallModal({ cssClasses, onClose }: InstallModalProps) {
  return (
    <div
      className={classNames(
        "bg-white border-2 border-black rounded-[6px] flex flex-col items-center gap-5 p-5",
        cssClasses,
      )}
    >
      <h3 className="whitespace-nowrap">Install this app</h3>
      <ol className="list-decimal pl-5 grid gap-2">
        <li className="text-paragraph">
          Press and hold the address bar in Safari
        </li>
        <li className="text-paragraph">Tap &quot;Share&quot;</li>
        <li className="text-paragraph">Tap &quot;View More&quot;</li>
        <li className="text-paragraph">Tap &quot;Add to Home Screen&quot;</li>
      </ol>
      <ButtonType
        type="button"
        colorOrange
        cssClasses="w-full"
        onClick={onClose}
      >
        Got it
      </ButtonType>
    </div>
  );
}
