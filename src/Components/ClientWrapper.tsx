// Updated Client Wrapper to use Context

"use client";
import Header from "@/Components/CommonComponents/Header";
import Footer from "@/Components/CommonComponents/Footer";
import SplashScreen from "./SplashScreen";
import { useLayout } from "@/contexts/LayoutContext";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const { showHeaderFooter } = useLayout();

  return (
    <>
      <SplashScreen />
      {showHeaderFooter && <Header />}
      {children}
      {showHeaderFooter && <Footer />}
    </>
  );
}