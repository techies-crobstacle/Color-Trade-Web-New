"use client"
import { useSocket } from "@/contexts/SocketContext";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  const { token } = useSocket();
  const isLoggedIn = !!token;

  
  return (
    <div className="fixed w-full max-w-lg z-20 flex justify-between items-center bg-white px-3 sm:px-5 py-3 sm:py-4">
      <div>
        <Image
          className="w-20 sm:w-24 rounded-md"
          src="/Logo.png"
          width={320}
          height={120}
          alt="Logo"
        />
      </div>

      <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
        {!isLoggedIn ? (
          <>
            <Link href="/login">
              <button className="rounded-md border-[1.5px] sm:border-2 border-[#1ab266] text-white bg-[#1ab266] px-3 sm:px-5 py-1">
                Log in
              </button>
            </Link>
            <Link href="/register">
              <button className="rounded-md border-[1.5px] sm:border-2 border-[#1ab266] text-[#1ab266] bg-white px-3 sm:px-5 py-1">
                Register
              </button>
            </Link>
          </>
        ) : (
          <a
            href="https://diuvin.com/app.apk"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex justify-center items-center gap-1 rounded-md border-[1.5px] sm:border-2 border-[#1ab266] text-white bg-[#1ab266] px-2 sm:px-4 py-1 text-xs sm:text-sm font-semibold"
          >
            <ArrowDown size={16} className="inline sm:hidden" />
            <ArrowDown size={20} className="hidden sm:inline" />
            <h2>Download App</h2>
          </a>
        )}
      </div>
    </div>
  );
};

export default Header;