import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

const Footer = () => {
  // State for game link based on client-side token
  const [gameLink, setGameLink] = useState("#");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      setGameLink("/game1");
    }
  }, []);

  return (
    <div className="fixed max-w-lg bottom-0 w-full bg-white">
      <div className="border-t-2 flex justify-center py-2 sm:py-2">
        {/* Download link */}
        <Link
          href="https://diuvin.com/app.apk"
          className="basis-1/5 flex flex-col items-center justify-center"
        >
          <Image
            className="w-8 sm:w-9 rounded-lg"
            src="/download.png"
            width={70}
            height={70}
            alt="Account Icon"
          />
          <p className="text-xs sm:text-sm text-gray-500">Download</p>
        </Link>

        {/* Wallet link */}
        <Link
          href="/wallet"
          onClick={(e) => {
            if (
              typeof window !== "undefined" &&
              !localStorage.getItem("token")
            ) {
              e.preventDefault();
              toast.error("You will need to login first.", {
                position: "top-center",
                autoClose: 3000,
              });

              // Redirect to login after 3 seconds
              // setTimeout(() => {
              //   window.location.href = "/login";
              // }, 3000); // same as autoClose
            }
          }}
          className="basis-1/5 flex flex-col items-center"
        >
          <Image
            className="w-8 h-8 sm:w-9 sm:h-9 p-1 rounded-lg"
            src="/wallet1.png"
            width={70}
            height={70}
            alt="Wallet Icon"
          />
          <p className="text-xs sm:text-sm text-gray-500">Wallet</p>
        </Link>

        {/* Home link */}
        <div className="basis-1/5 flex flex-col items-center justify-center">
          <Link href="/">
            <div className="bg-green-600 p-1.5 sm:p-2 px-5 sm:px-7 rounded-3xl">
              <Image
                className="w-6 sm:w-7"
                src="/gameHome.png"
                width={70}
                height={70}
                alt="Home Icon"
              />
            </div>
          </Link>
        </div>

        {/* Game1 link (uses client-only logic) */}
        <div className="basis-1/5 flex flex-col items-center">
          <Link
            href={gameLink}
            onClick={(e) => {
              if (
                typeof window !== "undefined" &&
                !localStorage.getItem("token")
              ) {
                e.preventDefault();
                toast.error("You will need to login first.", {
                  position: "top-center",
                  autoClose: 3000,
                });

                // Redirect to login after 3 seconds
                // setTimeout(() => {
                //   window.location.href = "/login";
                // }, 3000); // same as autoClose
              }
            }}
          >
            <Image
              className="w-8 h-8 sm:w-9 sm:h-9 p-1 rounded-lg"
              src="/win.png"
              width={70}
              height={70}
              alt="Account Icon"
            />
          </Link>
          <p className="text-xs sm:text-sm text-gray-500">game</p>
        </div>

        {/* Account link */}
        <div className="basis-1/5 flex flex-col items-center">
          <Link
            href="/account"
            onClick={(e) => {
              if (
                typeof window !== "undefined" &&
                !localStorage.getItem("token")
              ) {
                e.preventDefault();
                toast.error("You will need to login first.", {
                  position: "top-center",
                  autoClose: 3000,
                });

                // Redirect to login after 3 seconds
                // setTimeout(() => {
                //   window.location.href = "/login";
                // }, 3000); // same as autoClose
              }
            }}
          >
            <Image
              className="w-8 h-8 sm:w-9 sm:h-9 p-1 rounded-lg"
              src="/profile (1).png"
              width={70}
              height={70}
              alt="Account Icon"
            />
          </Link>
          <p className="text-xs sm:text-sm text-gray-500">Account</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
