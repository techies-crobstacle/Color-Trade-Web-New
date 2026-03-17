// 'use client';

// import './globals.css';
// import ClientWrapper from '@/Components/ClientWrapper';
// import { ReactNode } from 'react';
// import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import "react-toastify/dist/ReactToastify.css";
// import { ToastContainer } from "react-toastify";
// import { LayoutProvider } from "@/contexts/LayoutContext";
// import { usePathname } from 'next/navigation'; // <-- Add this import

// const theme = createTheme({
//   palette: {
//     mode: 'light',
//   },
// });

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: ReactNode;
// }>) {
//   const pathname = usePathname(); // <-- Get current path

//   // Conditionally set className
//   const bodyClass = `antialiased mx-auto bg-white relative min-h-screen ${
//     pathname === '/dashboard' ? 'w-full' : 'max-w-lg'
//   }`;

//   return (
//     <html lang="en" className="bg-black">
//       <body className={bodyClass}>
//         <MuiThemeProvider theme={theme}>
//           <CssBaseline />
//           <LayoutProvider>
//             <ClientWrapper>
//               {children}
//             </ClientWrapper>
//             <ToastContainer
//               position="top-right"
//               autoClose={3000}
//               hideProgressBar={false}
//               newestOnTop={false}
//               closeOnClick
//               pauseOnHover
//             />
//           </LayoutProvider>
//         </MuiThemeProvider>
//       </body>
//     </html>
//   );
// }

'use client';

import './globals.css';
import ClientWrapper from '@/Components/ClientWrapper';
import { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { SocketProvider } from "@/contexts/SocketContext"; // Add this import
import { usePathname } from 'next/navigation';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();

  const bodyClass = `antialiased mx-auto bg-white relative min-h-screen ${
    pathname === '/dashboard' ? 'w-full' : 'max-w-lg'
  }`;

  return (
    <html lang="en" className="bg-black">
      <body className={bodyClass}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <LayoutProvider>
            <SocketProvider>
              <ClientWrapper>
                {children}
              </ClientWrapper>
              <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
                style={{ marginTop: '60px' }}
                toastStyle={{
                  fontSize: '14px',
                  padding: '8px 12px',
                  maxWidth: '320px',
                  margin: '0 auto'
                }}
              />
            </SocketProvider>
          </LayoutProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}