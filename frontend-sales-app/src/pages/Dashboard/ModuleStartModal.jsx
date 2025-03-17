import { useCallback, useEffect, useState, useRef } from "react";
import Button from "../../component/Button/Button";
import { useDispatch } from "react-redux";
import Badge from "../../component/Badges/Badge";
import MobileStepper from "@mui/material/MobileStepper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { getRoom } from "../../../store/thunk/commonThunk";
import { showToast } from "../../utils/showToast";
import CircularProgress from "@mui/material/CircularProgress";

const ModuleStartModal = ({
  onClose,
  setWebSocketUrl,
  avatar,
  id,
  objectives,
  onStart,
  title,
  level,
  time,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(3 - 0); // Initialize with max polling duration
  const dispatch = useDispatch();
  // console.log("ReadyModal: ", roomId);

  const pollAttemptsRef = useRef(0);
  const cancelPollRef = useRef(false); // Ref to track cancellation
  const maxPollAttempts = 36;
  // useEffect(() => {
  //   const img = new Image();
  //   img.src = avatar;
  //   img.onload = () => setLoading(false);
  // }, [avatar]);

  const steps = [
    "“Understanding client needs involves asking open-ended questions and allowing them to express their concerns.”",
    "“Building rapport and Fostering trust through personal connections and genuine interest enhances client relationships.”",
    "“Knowing your product and Being well-versed in product details enables confident addressing of concerns and showcasing of benefits.”",
    "“Emphasizing how the product solves specific problems, rather than just listing features, is crucial.”",
    "“Anticipating and addressing objections with facts, while guiding the conversation back to the product's value, is effective.”",
    "“Maintaining a presence with personalized follow-ups that offer value, without being pushy, helps in building client relationships.”",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prevActiveStep) =>
        prevActiveStep === steps.length - 1 ? 0 : prevActiveStep + 1
      );
    }, 8000);
    return () => clearInterval(interval);
  }, [steps.length]);

  // useEffect(() => {
  //   pollGetRoom();
  // }, []);

  const pollServerStatus = useCallback(() => {
    const poll = () => {
      if (pollAttemptsRef.current >= maxPollAttempts || cancelPollRef.current) {
        console.error("Server did not start within expected time or cancelled");
        return;
      }
      dispatch(getServerStatus())
        .then((res) => {
          // console.log("get server status: ", res);
          if (
            res?.payload?.status === 200 &&
            res?.payload?.data?.status === "ready"
          ) {
            if (!cancelPollRef.current) {
              setWebSocketUrl(res?.payload?.data?.server);
              onStart();
            }
          } else {
            pollAttemptsRef.current += 1;
            setTimeout(poll, 2000);
          }
        })
        .catch((error) => {
          console.error("Error in getServerStatus: ", error);
        });
    };

    poll();
  }, [dispatch]);

  const handleCancel = () => {
    cancelPollRef.current = true; // Set the cancel flag to stop polling
    onClose(); // Close the modal
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center h-full bg-opacity-15 backdrop-blur-sm">
      <div className="mt-10 mb-10 border border-[#474747] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] rounded-3xl w-[90%] max-w-[1020px] h-auto flex flex-col gap-5 mx-4 overflow-auto p-5">
        <div className="flex">
          <Badge text={level} />
        </div>

        <div className="flex flex-col md:flex-row w-full h-full px-[20px] md:px-[60px] pb-[20px] md:pb-[60px] gap-6 md:gap-10">
          <div className="w-full md:w-[430px] flex flex-col">
            <div className="flex justify-center items-center h-[132.07px]">
              <Box
                position="relative"
                display="flex"
                justifyContent="center"
                alignItems="center"
                width={132.07}
                height={132.07}
              >
                <>
                  <CircularProgress
                    size={140} // Loader size slightly larger than the image
                    thickness={2} // Loader thickness
                    sx={{
                      color: "#95EBA3", // Loader color
                      position: "absolute",
                    }}
                  />
                  <img
                    loading="lazy"
                    src={avatar}
                    alt={`Profile of ${id}`}
                    className="object-cover w-[132.07px] h-[132.07px] rounded-full"
                  />
                </>
              </Box>
            </div>

            <div className="mt-6 md:mt-8 flex flex-col w-full items-center">
              <div className="flex flex-col">
                <span className="text-white font-montserrat text-[14px] md:text-[16px] text-center font-bold leading-[21.78px]">
                  Module {id} is loading...
                </span>
                <span className="text-primary font-montserrat text-[24px] md:text-[24px] text-center font-light leading-[32.66px]">
                  Remaining time{" "}
                  {String(Math.floor(remainingTime / 60)).padStart(2, "0")}:
                  {String(remainingTime % 60).padStart(2, "0")}m
                  {/* {parseInt(time / 60) < 10
                    ? "0" + parseInt(time / 60)
                    : parseInt(time / 60)}
                  :00m */}
                </span>
              </div>
              <div className="flex flex-col mt-4 md:mt-[14.8px]">
                <span className="text-white font-montserrat text-[18px] md:text-[24px] text-center font-normal leading-[32.66px]">
                  {title}
                </span>
              </div>
            </div>

            <div className="mt-4 md:mt-6 w-full h-[0px] border-[0.92px] custom-border border-black"></div>
            <div className="w-full h-[0px] border-[0.92px] custom-border border-[#767474]"></div>

            <div className="mt-4 md:mt-6 mb-2 md:mb-4 h-[26px] text-[16px] text-primary font-montserrat font-semibold leading-[25.898px]">
              Objectives
            </div>
            <div className="w-full h-[155.79px] overflow-y-auto hide-scrollbar">
              {objectives &&
                objectives.map((obj, index) => (
                  <div
                    key={index}
                    className="mb-2 bg-[#333333] pl-[22.2px] py-[14.8px] pr-[14.8px] rounded-[29.06px] text-[14px] text-white font-montserrat font-medium leading-[17.07px]"
                  >
                    {obj?.title}
                  </div>
                ))}
            </div>

            <div className="mt-4 md:mt-6 flex justify-center items-center">
              <Button
                className="btn btn-gradient-cancel-module"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className="ml-3 btn btn-gradient-start-module"
                onClick={onStart}
              >
                Start module
              </Button>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-full md:w-[430px] h-[622.63px] bg-[#262626] custom-box border custom-border rounded-2xl p-6 md:p-8">
            <div className="text-[14px] md:text-[16px] leading-[21.78px] text-white font-montserrat font-bold text-center">
              Did you know?
            </div>
            <div className="mt-4 md:mt-5 text-[18px] md:text-[20px] leading-[24.38px] text-white font-montserrat font-normal text-center">
              <Typography
                variant="h6"
                component="div"
                align="center"
                sx={{
                  marginBottom: 2,
                }}
              >
                {steps[activeStep]}
              </Typography>
            </div>

            <div className="mt-6 md:mt-10">
              <MobileStepper
                variant="dots"
                steps={steps.length}
                position="static"
                activeStep={activeStep}
                sx={{
                  maxWidth: 400,
                  flexGrow: 1,
                  backgroundColor: "transparent", // Transparent background
                  "& .MuiMobileStepper-dot": {
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#0C0C0C", // Inactive dot color
                  },
                  "& .MuiMobileStepper-dotActive": {
                    backgroundColor: "#95EBA3", // Active dot color
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleStartModal;
