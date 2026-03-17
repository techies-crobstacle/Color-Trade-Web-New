"use client";
import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { Suspense } from "react";
import NewPassword from "@/Components/NewPassword";

export default function Page() {

  const { setShowHeaderFooter } = useLayout();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true); // Reset on unmount
  }, [setShowHeaderFooter]);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPassword />
    </Suspense>
  );
}
