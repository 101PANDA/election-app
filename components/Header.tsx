import React from "react";

const Header: React.FC = () => {
  return (
    <div className="flex justify-center py-6">
      <div className="text-center">
        <img
          src="/nacos-logo.png"
          alt="School Logo"
          className="w-24 h-24 mx-auto mb-2"
        />
        <div className="border-t border-b border-gray-300 w-48 mx-auto my-2"></div>
      </div>
    </div>
  );
};

export default Header;
