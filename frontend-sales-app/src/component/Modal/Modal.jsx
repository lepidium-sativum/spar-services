import { useSelector } from "react-redux";
import assets from "../../constants/assets";
import { ErrorIcon, SuccessIcon, WarningIcon } from "../../utils/Icons";
import Loader from "../Loader/Loader";
import { useEffect } from "react";
import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const Modal = ({
  isVisible,
  onClose,
  children,
  type,
  moduleNumber,
  innerClass,
}) => {
  const handleClose = (e) => {
    if (e.target.id === "modal_wraper") return;
  };
  const loader = useSelector((state) => state.commonReducer.loader);
  const postTranscriptionResult = useSelector(
    (state) => state?.commonReducer?.postTranscriptionResult
  );
  if (!isVisible) return null;
  return (
    <>
      {loader ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
          {/* <div className="fixed inset-0 bg-[rgba(37,37,37,0.70)] backdrop-blur-[7px] transition-opacity"></div> */}

          {/* <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div
              className="relative z-50 w-full max-w-lg p-4 mx-auto mt-10 rounded-2xl"
              id="modal_wraper"
            >
              <div className="relative transform overflow-hidden custom-box text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[550px] rounded-3xl">
                <div
                  className={`p-12 border relative border-[#474747] rounded-3xl ${innerClass}`}
                > */}
          {/* {!type && (
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
                  )} */}
          {/* modal header */}
          {/* <div className="text-center w-max mx-auto relative mb-8">
                    <h1 className="relative text-white text-center text-[100px] font-black leading-[82px]">
                      {moduleNumber}
                      {postTranscriptionResult == "success" && (
                        <div
                          className="w-[31px] h-[31px] absolute top-3 right-[-16px]"
                          dangerouslySetInnerHTML={{ __html: SuccessIcon }}
                        ></div>
                      )}
                      {(postTranscriptionResult == "warning" ||
                        postTranscriptionResult == "finished") && (
                        <div
                          className="w-[31px] h-[31px] absolute top-3 right-[-16px]"
                          dangerouslySetInnerHTML={{ __html: WarningIcon }}
                        ></div>
                      )}
                      {postTranscriptionResult == "error" && (
                        <div
                          className="w-[31px] h-[31px] absolute top-3 right-[-16px]"
                          dangerouslySetInnerHTML={{ __html: ErrorIcon }}
                        ></div>
                      )}
                    </h1>
                    <img
                      src={assets.GameIcon}
                      alt=""
                      className="absolute -translate-x-2/4 left-2/4 -bottom-0.5"
                    />
                  </div> */}
          {/* modal body content */}
          {children}
          {/* </div> */}
          {/* </div> */}
          {/* </div> */}
          {/* // </div> */}
        </div>
      )}
    </>
  );
};

export default Modal;
