'use client';

import React from "react";

const QrCodeScanner: React.FC = () => {
  return (
    <>
     <div className="text-center text-2xl">

        <h1>Scan documents from your smartphone to your browser</h1>
     </div>
    
    <div className="max-w-sm mx-auto bg-white mt-10 rounded-2xl shadow-md p-6 text-center">
       
      <h2 className="text-xl font-semibold mb-2">Step 1</h2>
      <p className="text-gray-600 mb-4">
        Use your smartphone&apos;s camera to scan this QR code
      </p>
      <div className="flex justify-center">
        <img
          src="/scanner.JPG" // replace with your QR code image
          alt="QR Code"
          className="w-48 h-48 object-contain"
        />
      </div>
    </div>
    </>

  );
};

export default QrCodeScanner;
