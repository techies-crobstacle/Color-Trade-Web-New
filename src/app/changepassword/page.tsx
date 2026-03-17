// "use client";
// import React, { useState, useEffect } from 'react';
// import { useLayout } from "@/contexts/LayoutContext";
// import Image from 'next/image';

// function ChangePassword() {

//   const { setShowHeaderFooter } = useLayout();

//   useEffect(() => {
//     setShowHeaderFooter(false);
//     return () => setShowHeaderFooter(true); // Reset on unmount
//   }, [setShowHeaderFooter]);
  
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [passwordVis, setPasswordVis] = useState({
//     current: false,
//     new: false,
//     confirm: false,
//   });
//   const [errorMessage, setErrorMessage] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   const handleBackButtonClick = () => {
//     window.history.back();
//   };

//   const handlePasswordVisToggle = (field: 'current' | 'new' | 'confirm') => {
//     setPasswordVis(prevState => ({
//       ...prevState,
//       [field]: !prevState[field],
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     // Basic validation
//     if (newPassword !== confirmNewPassword) {
//       setErrorMessage('New passwords do not match.');
//       return;
//     }


//     // Simulate a successful password change
//     setSuccessMessage('Password changed successfully');
//     setErrorMessage(''); // Clear any previous error messages
//   };

//   return (
//     <div className="flex-1 bg-white min-h-screen">
//       <div className="bg-[#1ab266] px-5">
//         <div className="relative">
//           {/* Back button */}
//           <button onClick={handleBackButtonClick} className="absolute left-0 top-[15px]">
//             <Image src="/back-white.png" alt="back-button" width={100} height={100} className="w-5" />
//           </button>
//         </div>
//         <h1 className="text-xl font-semibold text-white text-center py-3">Change Password</h1>
//       </div>

//       <div className="px-5 py-10">
//         <form onSubmit={handleSubmit}>
//           {/* Current Password Field */}
//           <div className="mb-7">
//             <div className="relative">
//               <div className="flex items-center gap-2 mb-3">
//                 <Image className="w-6" src="/forgetpassword.png" width={100} height={100} alt="" />
//                 <h1 className="font-semibold">Current Password</h1>
//               </div>
//               <input
//                 className="w-full bg-gray-200 text-black p-3 rounded-md"
//                 type={passwordVis.current ? "text" : "password"}
//                 value={currentPassword}
//                 onChange={(e) => setCurrentPassword(e.target.value)}
//                 required
//               />
//               <Image
//                 onClick={() => handlePasswordVisToggle('current')}
//                 className="w-5 h-5 absolute right-3 top-12 cursor-pointer"
//                 src={passwordVis.current ? "/eye.png" : "/eye-hide.png"}
//                 width={60}
//                 height={60}
//                 alt="toggle password visibility"
//               />
//             </div>
//           </div>

//           {/* New Password Field */}
//           <div className="mb-7">
//             <div className="relative">
//               <div className="flex items-center gap-2 mb-3">
//                 <Image className="w-6" src="/forgetpassword.png" width={100} height={100} alt="" />
//                 <h1 className="font-semibold">New Password</h1>
//               </div>
//               <input
//                 className="w-full bg-gray-200 text-black p-3 rounded-md"
//                 type={passwordVis.new ? "text" : "password"}
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 required
//               />
//               <Image
//                 onClick={() => handlePasswordVisToggle('new')}
//                 className="w-5 h-5 absolute right-3 top-12 cursor-pointer"
//                 src={passwordVis.new ? "/eye.png" : "/eye-hide.png"}
//                 width={60}
//                 height={60}
//                 alt="toggle password visibility"
//               />
//             </div>
//           </div>

//           {/* Confirm New Password Field */}
//           <div className="mb-7">
//             <div className="relative">
//               <div className="flex items-center gap-2 mb-3">
//                 <Image className="w-6" src="/forgetpassword.png" width={100} height={100} alt="" />
//                 <h1 className="font-semibold">Confirm New Password</h1>
//               </div>
//               <input
//                 className="w-full bg-gray-200 text-black p-3 rounded-md"
//                 type={passwordVis.confirm ? "text" : "password"}
//                 value={confirmNewPassword}
//                 onChange={(e) => setConfirmNewPassword(e.target.value)}
//                 required
//               />
//               <Image
//                 onClick={() => handlePasswordVisToggle('confirm')}
//                 className="w-5 h-5 absolute right-3 top-12 cursor-pointer"
//                 src={passwordVis.confirm ? "/eye.png" : "/eye-hide.png"}
//                 width={60}
//                 height={60}
//                 alt="toggle password visibility"
//               />
//             </div>
//           </div>

//           {/* Display error/success messages */}
//           {errorMessage && (
//             <p className="text-red-500 text-center">{errorMessage}</p>
//           )}
//           {successMessage && (
//             <p className="text-[#1ab266] text-center">{successMessage}</p>
//           )}

//           {/* Submit Button */}
//           <div className="flex flex-col items-center gap-4">
//             <button
//               type="submit"
//               className="bg-[#1ab266] p-2 rounded-full my-3 text-white font-semibold px-8"
//             >
//               Change Password
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ChangePassword;

"use client";
import React, { useState, useEffect } from 'react';
import { useLayout } from "@/contexts/LayoutContext";
import Image from 'next/image';

function ChangePassword() {
  const { setShowHeaderFooter } = useLayout();

  useEffect(() => {
    setShowHeaderFooter(false);
    return () => setShowHeaderFooter(true);
  }, [setShowHeaderFooter]);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordVis, setPasswordVis] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleBackButtonClick = () => {
    window.history.back();
  };

  const handlePasswordVisToggle = (field: 'current' | 'new' | 'confirm') => {
    setPasswordVis(prevState => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setSuccessMessage('Password changed successfully');
    setErrorMessage('');
  };

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-[#1ab266] px-3 sm:px-5">
        <div className="relative">
          {/* Back button */}
          <button onClick={handleBackButtonClick} className="absolute left-0 top-[13px] sm:top-[15px]">
            <Image 
              src="/back-white.png" 
              alt="back-button" 
              width={100} 
              height={100} 
              className="w-4 sm:w-5" 
            />
          </button>
        </div>
        <h1 className="text-lg sm:text-xl font-semibold text-white text-center py-3">
          Change Password
        </h1>
      </div>

      {/* Form Section */}
      <div className="px-3 sm:px-5 py-6 sm:py-10">
        <form onSubmit={handleSubmit}>
          {/* Current Password Field */}
          <div className="mb-5 sm:mb-7">
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Image 
                  className="w-5 sm:w-6" 
                  src="/forgetpassword.png" 
                  width={100} 
                  height={100} 
                  alt="Password icon" 
                />
                <h1 className="font-semibold text-sm sm:text-base">Current Password</h1>
              </div>
              <input
                className="w-full bg-gray-200 text-black p-2 sm:p-3 rounded-md text-sm sm:text-base pr-10"
                type={passwordVis.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <Image
                onClick={() => handlePasswordVisToggle('current')}
                className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-10 sm:top-12 cursor-pointer"
                src={passwordVis.current ? "/eye.png" : "/eye-hide.png"}
                width={60}
                height={60}
                alt="toggle password visibility"
              />
            </div>
          </div>

          {/* New Password Field */}
          <div className="mb-5 sm:mb-7">
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Image 
                  className="w-5 sm:w-6" 
                  src="/forgetpassword.png" 
                  width={100} 
                  height={100} 
                  alt="Password icon" 
                />
                <h1 className="font-semibold text-sm sm:text-base">New Password</h1>
              </div>
              <input
                className="w-full bg-gray-200 text-black p-2 sm:p-3 rounded-md text-sm sm:text-base pr-10"
                type={passwordVis.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <Image
                onClick={() => handlePasswordVisToggle('new')}
                className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-10 sm:top-12 cursor-pointer"
                src={passwordVis.new ? "/eye.png" : "/eye-hide.png"}
                width={60}
                height={60}
                alt="toggle password visibility"
              />
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div className="mb-5 sm:mb-7">
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Image 
                  className="w-5 sm:w-6" 
                  src="/forgetpassword.png" 
                  width={100} 
                  height={100} 
                  alt="Password icon" 
                />
                <h1 className="font-semibold text-sm sm:text-base">Confirm New Password</h1>
              </div>
              <input
                className="w-full bg-gray-200 text-black p-2 sm:p-3 rounded-md text-sm sm:text-base pr-10"
                type={passwordVis.confirm ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              <Image
                onClick={() => handlePasswordVisToggle('confirm')}
                className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-10 sm:top-12 cursor-pointer"
                src={passwordVis.confirm ? "/eye.png" : "/eye-hide.png"}
                width={60}
                height={60}
                alt="toggle password visibility"
              />
            </div>
          </div>

          {/* Display error/success messages */}
          {errorMessage && (
            <p className="text-red-500 text-center text-sm sm:text-base mb-3">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-[#1ab266] text-center text-sm sm:text-base mb-3">{successMessage}</p>
          )}

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              type="submit"
              className="bg-[#1ab266] p-2 sm:p-3 rounded-full my-3 text-white font-semibold px-8 sm:px-12 text-sm sm:text-base hover:bg-[#159955] transition-colors"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;