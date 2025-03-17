import React from "react";
import assets from "../../constants/assets";

function PoweredBy() {
  return (
    <div className="flex gap-1 z-50  justify-center items-center px-6 py-4 text-xs leading-3 border-t border-solid border-[#FFFFFF33] text-white">
      <img
        loading="lazy"
        src={assets.LogoWebp}
        alt="Company logo"
        className="shrink-0 my-auto w-8 h-[8.87px]"
      />
    </div>
  );
}

export default PoweredBy;
