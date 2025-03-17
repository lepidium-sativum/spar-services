import React from "react";
import assets from "../../constants/assets";
import Button from "../../component/Button/Button";

const CameraMicPermissionModal = ({ onClose, onOk }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center h-full bg-opacity-15 backdrop-blur-sm">
      <div className="mt-10 mb-10 border border-[#474747] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] rounded-3xl w-[90%] max-w-[550px] h-auto flex flex-col gap-5 mx-4 overflow-auto p-5">
        <div className="p-[60px]">
          <div className="text-center w-max mx-auto relative">
            <img
              loading="lazy"
              src={assets.audioVideo}
              className="shrink-0 w-[120px] h-[120px] aspect-square"
              alt=""
            />
          </div>
          <div className="flex flex-col items-center mt-8">
            <p className="text-primary text-[29px] font-bold text-center font-montserrat">
              Permissions needed
            </p>
            <p className="font-light  text-[24px] leading-[29.26px] text-white text-center font-montserrat">
              To start a Spar session you need to
              <strong> grant audio and video permissions</strong> for Spar to
              work.
            </p>
            <Button
              onClick={onOk}
              className="btn btn-gradient-browser mx-auto mt-8"
            >
              Got it, get started!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraMicPermissionModal;
