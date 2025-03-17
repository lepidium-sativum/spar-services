import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";

const ServerErrorModel = () => {
  const navigate = useNavigate();

  return (
    <div className="p-[64px]">
      <div className="text-center w-max mx-auto relative mb-8">
        <div className="w-28 h-28 bg-black rounded-full bg-logo-img"></div>
      </div>
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-white text-base text-center font-normal ">
          Spar introduction
        </h2>
        <p className="text-[#FF5555] text-[29px] font-bold text-center">
          Sorry, we failed creating the feedback
        </p>

        <p className="font-normal text-[16px] text-white text-center mb-2">
          We experienced an issue. Sorry for the inconvenience. We will fix it
          as soon as possible.
        </p>
        <Button className="btn btn-gradient">
          <a href="/home">Ok</a>
        </Button>
      </div>
    </div>
  );
};

export default ServerErrorModel;
