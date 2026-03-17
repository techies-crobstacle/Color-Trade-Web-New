"use client";
import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import Login from '@/Components/Login';
import { Suspense } from 'react';

export default function Page() {

const { setShowHeaderFooter } = useLayout();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true); // Reset on unmount
  }, [setShowHeaderFooter]);

  return (
  <Suspense fallback={<div>Loading...</div>}>
  <Login />
  </Suspense>
  );
}
