"use client";

import { useEffect, useState } from "react";
import { Camera, User2, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserData {
  _id: string;
  name: string;
  number: {
    value: string;
    verified: boolean;
  };
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser({
          _id: decoded.id,
          name: decoded.name,
          number: { value: decoded.number, verified: true },
        });
      } catch (err) {
        console.error("Token decoding failed", err);
        router.push("/login");
      }
    };

    fetchUserData();
  }, [router]);

  return (
    <div className="w-full bg-gray-50 pb-4">
      {/* Cover */}
      <div className="relative w-full h-64">
        <Image
          src="/profile-cover.jpg"
          alt="Cover"
          fill
          className="object-cover w-full h-[350px] rounded-lg shadow-lg"
          style={{ objectFit: "cover" }}
          priority
        />
        <button className="absolute top-3 right-3 flex items-center space-x-1 bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-800 px-3 py-1 rounded">
          <Camera className="w-5 h-5" />
          <span className="text-sm">Edit Cover</span>
        </button>

        {/* Avatar + Name */}
        <div className="absolute left-4 bottom-0 transform translate-y-1/2 flex items-center">
          <Image
            src="/avatar2.png"
            alt="Profile"
            width={128}
            height={128}
            className="w-32 h-32 rounded-full border-4 border-white object-cover"
            style={{ objectFit: "cover" }}
            priority
          />
          <h1 className="ml-4 text-2xl font-semibold text-white drop-shadow">
            {user?.name || "Loading..."}
          </h1>
        </div>
      </div>

      {/* About Tab */}
      <div className="mx-4 mt-32">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            {/* User ID */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full">
                <User2 className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p>
                  ID:{" "}
                  <span className="font-medium text-green-700">
                    {user?._id || "Loading..."}
                  </span>
                </p>
                <p className="text-sm text-gray-500">User Profile ID</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-gray-500" />
              <div>
                <p className="font-medium">
                  Phone: {user?.number?.value || "Loading..."}
                </p>
                <p className="text-sm text-gray-500">
                  Verified: {user?.number?.verified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
