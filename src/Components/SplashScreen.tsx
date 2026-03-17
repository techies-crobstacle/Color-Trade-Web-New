// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";

// const COOKIE_NAME = "hasSeenSplash";

// function getCookie(name: string): string | null {
//   const match = document.cookie.match(
//     new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[]\/+^])/g, "\\$1") + "=([^;]*)")
//   );
//   return match ? decodeURIComponent(match[1]) : null;
// }

// function setSessionCookie(name: string, value: string) {
//   // No 'expires' or 'max-age' → becomes a session cookie
//   document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
// }

// export default function SplashScreen() {
//   const [stage, setStage] = useState<"splash" | "none">("splash");

//   useEffect(() => {
//     const seen = getCookie(COOKIE_NAME);

//     if (!seen) {
//       // first visit: show splash, then set a session cookie
//       setSessionCookie(COOKIE_NAME, "true");

//       const t = setTimeout(() => {
//         setStage("none");
//       }, 1000);

//       return () => clearTimeout(t);
//     } else {
//       // already seen this session, skip splash immediately
//       setStage("none");
//     }
//   }, []);

//   if (stage === "splash") {
//     return (
//       <div className="fixed inset-0 bg-[#1ab266] flex items-center justify-center z-50">
//         <Image
//           src="/headerlogo.png"
//           alt="Logo"
//           width={320}
//           height={120}
//           className="w-40"
//         />
//       </div>
//     );
//   }

//   return null;
// }



// Implemented using Session Storage

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

function getLocalStorageItem(key: string): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
}

function setLocalStorageItem(key: string, value: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
}

export default function SplashScreen() {
  const [stage, setStage] = useState<"splash" | "none">("splash");
  const COOKIE_NAME = "hasSeenSplash";

  useEffect(() => {
    const seen = getLocalStorageItem(COOKIE_NAME);

    if (!seen) {
      // First time visit ever
      setLocalStorageItem(COOKIE_NAME, "true");

      const t = setTimeout(() => {
        setStage("none");
      }, 1000);

      return () => clearTimeout(t);
    } else {
      // Already seen
      setStage("none");
    }
  }, []);

  if (stage === "splash") {
    return (
      <div className="fixed inset-0 bg-[#1ab266] flex items-center justify-center z-50">
        <Image
          src="/headerlogo.png"
          alt="Logo"
          width={320}
          height={120}
          className="w-40"
        />
      </div>
    );
  }

  return null;
}
