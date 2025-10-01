import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center">
        <p className="text-xs md:text-sm">© {new Date().getFullYear()} NetGlobalConnect</p>
      </div>
    </footer>
  );
}


