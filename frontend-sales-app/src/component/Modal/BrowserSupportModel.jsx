import React from "react";

const BrowserSupportModel = ({ onClose }) => {
  return (
    <div className="p-[64px]">
      <div className="text-center w-max mx-auto relative mb-8">
        <div className="w-28 h-28 bg-black rounded-full bg-logo-img"></div>
      </div>
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          {/* <h2 className="text-white text-base text-center font-normal ">
          Spar introduction
        </h2> */}

          <p className="text-[#E93838] text-[29px] font-bold text-center">
            Unsupported Browser
          </p>
        </div>
        <p className="font-normal text-[18px] text-white text-center ">
          We currently only support Google Chrome and Microsoft Edge. Please
          access the link on a supported browser. Sorry for the inconvenience.
        </p>
      </div>
    </div>
  );
};

export default BrowserSupportModel;
