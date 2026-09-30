"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";

import InstallModal from "@/_components/ui/install-modal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

interface InstallAppItemProps {
  cssClasses?: string;
}

export default function InstallAppItem({ cssClasses }: InstallAppItemProps) {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [installed, setInstalled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted) return null;

  const isIos =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)").matches;

  if (installed || standalone || (!installEvent && !isIos)) return null;

  return (
    <li className={cssClasses}>
      <button
        type="button"
        onClick={() => (isIos ? setModalOpen(true) : installEvent?.prompt())}
        className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-teal rounded-[6px] desktop:hover:cursor-pointer"
      >
        <Download size={20} color="#FFFFFF" />
        <span className="text-subheading text-white">Install</span>
      </button>
      {modalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[7.5px]"
            onClick={() => setModalOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <InstallModal
                cssClasses="w-[260px]"
                onClose={() => setModalOpen(false)}
              />
            </div>
          </div>,
          document.body,
        )}
    </li>
  );
}
