"use client";

import { createContext, useContext, useState } from "react";

interface ShareModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ShareModalContext = createContext<ShareModalContextType | null>(null);

export function ShareModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ShareModalContext.Provider
      value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
    >
      {children}
    </ShareModalContext.Provider>
  );
}

export function useShareModal() {
  const context = useContext(ShareModalContext);
  if (!context) throw new Error("useShareModal must be used within ShareModalProvider");
  return context;
}
