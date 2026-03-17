"use client";
import React, { createContext, useContext, useState } from "react";

type LayoutContextType = {
  showHeaderFooter: boolean;
  setShowHeaderFooter: (show: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  return (
    <LayoutContext.Provider value={{ showHeaderFooter, setShowHeaderFooter }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
};