import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center mt-auto shadow-inner">
      <div className="container mx-auto">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Garbage Collection Portal.Developed by: CybaTech-IT | All rights reserved.
        </p>
      </div>
    </footer>
  );
}
