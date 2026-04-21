"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { SocketProvider } from "@/contexts/SocketContext";
import ClientWrapper from "@/Components/ClientWrapper";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function BodyWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const bodyClass = `antialiased mx-auto bg-white relative min-h-screen ${
    pathname === "/dashboard" ? "w-full" : "max-w-lg"
  }`;

  return (
    <body className={bodyClass}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <LayoutProvider>
          <SocketProvider>
            <ClientWrapper>{children}</ClientWrapper>
            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={true}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              style={{ marginTop: "60px" }}
              toastStyle={{
                fontSize: "14px",
                padding: "8px 12px",
                maxWidth: "320px",
                margin: "0 auto",
              }}
            />
          </SocketProvider>
        </LayoutProvider>
      </MuiThemeProvider>
    </body>
  );
}
