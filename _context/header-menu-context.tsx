"use client";

import { createContext, useContext, useState } from "react";

interface HeaderMenuContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const HeaderMenuContext = createContext<HeaderMenuContextType | null>(null);

export function HeaderMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HeaderMenuContext.Provider
      value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
    >
      {children}
    </HeaderMenuContext.Provider>
  );
}

export function useHeaderMenu() {
  const context = useContext(HeaderMenuContext);
  if (!context) throw new Error("useHeaderMenu must be used within HeaderMenuProvider");
  return context;
}
