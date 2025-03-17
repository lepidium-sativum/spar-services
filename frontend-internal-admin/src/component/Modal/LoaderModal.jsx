import React from "react";
import LoaderAnalysis from "../Loader/LoaderAnalysis";

const LoaderModal = (props) => {
  const { isVisible, onClose, children } = props;
  if (!isVisible) return null;

  const handleClose = (e) => {
    if (e.target.id === "modal_wraper") return;
  };

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div className="fixed inset-0 bg-[rgba(37,37,37,0.70)] backdrop-blur-[7px] transition-opacity"></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
        <div
          className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          id="modal_wraper"
        >
          <div className="relative transform overflow-hidden custom-box text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[550px] rounded-3xl">
            <div className="rounded-2xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(0deg,#474747,#474747)] custom-border gap-12 px-8 py-[108px] text-white flex flex-col mb-4">
              {/* loading circle */}
              <div className="mx-auto">
                <LoaderAnalysis />
              </div>
              {/* body content */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaderModal;
