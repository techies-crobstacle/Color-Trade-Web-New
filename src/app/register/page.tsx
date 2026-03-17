"use client";
import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import Register from '@/Components/Register';


export default function Page() {

  const { setShowHeaderFooter } = useLayout();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true); // Reset on unmount
  }, [setShowHeaderFooter]);

  return <Register />;
}
