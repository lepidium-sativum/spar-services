import { useState } from "react";
import ReactDOM from "react-dom";
import { Button } from "@mui/material";
import ProgressBar from "../../utils/ProgressBar";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import assets from "../../constants/assets";
const UpcommingLoaderModal = ({ onClose, uploadingMedia, avatarUrl }) => {
  const uploadingCount = useSelector(
    (state) => state.commonReducer.uploadingCount
  );

  const apiTwoProgress = useSelector(
    (state) => state.commonReducer.apiTwoProgress
  );

  const apiFourProgress = useSelector(
    (state) => state.commonReducer.apiFourProgress
  );
  const [uploadCountNumber, setUploadCountNumber] = useState(0);
  // const [loading, setLoading] = useState(true);
  const progressValue = apiTwoProgress + apiFourProgress;
  const progressBarWidth = apiTwoProgress + apiFourProgress;

  useEffect(() => {
    setUploadCountNumber(uploadingCount);
  }, [uploadingCount]);

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <div className="fixed inset-0 bg-[rgba(37,37,37,0.70)] backdrop-blur-[7px] transition-opacity"></div>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
          <div
            className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
            id="modal_wraper"
          >
            <div className="relative transform overflow-hidden custom-box text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[550px] rounded-3xl">
              <div className="rounded-2xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(0deg,#474747,#474747)] custom-border gap-6 px-8 py-[50px] text-white flex flex-col">
                <div className="mx-auto">
                  <Box
                    position="relative"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width={132.07}
                    height={132.07}
                  >
                    <img
                      loading="lazy"
                      src={assets.sparLogoMessageIcon}
                      className="object-cover w-[132.07px] h-[132.07px] rounded-full"
                    />
                  </Box>
                </div>
                <div className="relative justify-center mt-6">
                  <p className="flex justify-center text-center font-montserrat font-bold text-[16px] leading-[21.77px] text-[#EBB495] ">
                    {uploadingMedia
                      ? "Well done! Spar session ended..."
                      : " Available in next version"}
                  </p>
                  <p className=" mt-4 flex justify-center text-white text-center font-montserrat font-semibold text-[24px] leading-[32.664px]">
                    {uploadingMedia && "We are generating your Spar results"}
                  </p>
                  {uploadingMedia && (
                    <div className="flex flex-col w-full mt-[12px] ">
                      <LinearProgress
                        value={progressValue}
                        variant="determinate"
                        sx={{
                          backgroundColor: "#222121",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "#71E684",
                          },
                        }}
                      />
                    </div>
                  )}
                  <p className=" mt-3 flex justify-center text-primary text-center font-montserrat font-normal text-[12px] leading-[12.87px]  ">
                    {uploadingMedia && "Usually less than 30 seconds..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default UpcommingLoaderModal;
