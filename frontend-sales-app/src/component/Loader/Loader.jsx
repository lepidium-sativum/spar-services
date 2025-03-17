import React from "react";
import assets from "../../constants/assets";

const Loader = () => {
  return (
    <div className="z-[999] rounded-2xl loader-container w-[400px] fixed  -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(0deg,#474747,#474747)] custom-border gap-12 px-8 py-[48px] text-white flex flex-col mb-4">
      <div className="mx-auto">
        <div className="custom-loader">
          <div className="loader"></div>
          <div className="logo-image">
            <img src={assets.SparLogo} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
