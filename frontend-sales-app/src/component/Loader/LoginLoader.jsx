import React from "react";
import Loader from "./Loader";
import assets from "../../constants/assets";


const LoginLoader = () => {
  return (
    <div className="rounded-2xl loader-container w-full max-w-[400px] fixed z-[999] -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4 bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(0deg,#474747,#474747)] custom-border gap-12 px-8 py-[48px] text-white flex flex-col mb-4">
      <div className="mx-auto">
        <div className="custom-loader">
          <div className="loader"></div>
          <div className="logo-image">
            <img src={assets.SparLogo} alt="" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center">
        <p className="text-[19px] text-center font-bold primary">
          we are logging you in...
        </p>
      </div>
    </div>
  );
};

export default LoginLoader;
