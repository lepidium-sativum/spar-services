import React, { useEffect } from "react";
import Button from "../Button/Button";

const ErrorModel = ({}) => {
  return (
    <div className="p-[64px]">
      <div className="text-center w-max mx-auto relative mb-8">
        <div className="w-28 h-28 bg-black rounded-full bg-logo-img"></div>
      </div>
      <div className="flex flex-col items-center gap-8">
        <p className="text-[#FDA43C] text-[29px] font-bold text-center">
          Permission needed
        </p>

        <p className="font-normal text-[18px] text-white text-center ">
          Please grant audio/video rights.
        </p>

        <p className="font-normal text-[16px] text-white text-center mb-2">
          You first need to go to your settings and allow SPAR to access your
          microphone and camera.
        </p>
        <Button
          className="btn btn-gradient"
          onClick={() => {
            location.reload();
          }}
        >
          Reload page
        </Button>
      </div>
    </div>
  );
};

export default ErrorModel;
