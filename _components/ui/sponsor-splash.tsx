"use client";

import { useState, useSyncExternalStore } from "react";
import ButtonType from "@/_components/ui/buttons/button-type";
import SponsorLogos from "@/_components/ui/sponsor-logos";

const STORAGE_KEY = "sponsorSplashSeen";

const subscribe = () => () => {};

const getSeen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
};

const SponsorSplash = () => {
  const seen = useSyncExternalStore(subscribe, getSeen, () => true);
  const [dismissed, setDismissed] = useState(false);

  if (seen || dismissed) return null;

  const handleContinue = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col gap-10 items-center justify-center px-7 py-10 overflow-y-auto">
      <h2 className="text-center tracking-[0.32px]">
        Thank you to our app sponsors:
      </h2>
      <SponsorLogos />
      <ButtonType
        type="button"
        colorOrange
        onClick={handleContinue}
        cssClasses="w-full max-w-[335px] desktop:hover:cursor-pointer"
      >
        Continue
      </ButtonType>
    </div>
  );
};

export default SponsorSplash;
