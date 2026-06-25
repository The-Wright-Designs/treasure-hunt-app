"use client";

import classNames from "classnames";

import { useShareModal } from "@/_context/share-modal-context";
import ShareModal from "@/_components/ui/share-modal";

export default function BodyWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, close } = useShareModal();

  return (
    <div className="relative flex-1 pb-32">
      <div
        className={classNames({
          "blur-[7.5px] opacity-50 pointer-events-none": isOpen,
        })}
      >
        {children}
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          onClick={close}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ShareModal cssClasses="w-[260px]" />
          </div>
        </div>
      )}
    </div>
  );
}
