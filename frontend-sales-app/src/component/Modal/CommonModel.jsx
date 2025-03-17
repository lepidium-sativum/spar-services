import { Button } from "@mui/material";
import React from "react";
// import Button from "../Button/Button";
import ReactDOM from "react-dom";

const CommonModel = ({
  isVisible,
  onClose,
  children,
  isFull,
  setClass,
  errorMessage,
  isBrowserSupport,
  serverErrorModal,
}) => {
  if (!isVisible) return null;

  //   const handleClose = (e) => {
  //     if (e.target.id === "modal_wraper") return;
  //   };
  return ReactDOM.createPortal(
    <div
      className={`relative z-10 ${setClass ? setClass : ""}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-[rgba(37,37,37,0.70)] backdrop-blur-[7px] transition-opacity"></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          className={`flex min-h-full justify-center p-4 text-center sm:p-0 ${
            isFull ? "" : "items-end sm:items-center"
          }`}
          id="modal_wraper"
        >
          <div
            className={`relative transform text-left shadow-xl transition-all  sm:w-full sm:max-w-[550px] rounded-3xl ${
              isFull ? "" : "custom-box sm:my-8"
            }`}
            style={{ maxWidth: isFull ? "100%" : "550px" }}
          >
            {!isBrowserSupport ||
              (!serverErrorModal && (
                <Button
                  onClick={onClose}
                  className="flex items-center justify-center text-lg font-bold float-right modal-close-btn"
                  style={{
                    fontSize: "1.2rem",
                    position: "absolute",
                    top: 0,
                    right: 0,
                  }}
                >
                  X
                </Button>
              ))}
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("common-model")
  );
};

export default CommonModel;
