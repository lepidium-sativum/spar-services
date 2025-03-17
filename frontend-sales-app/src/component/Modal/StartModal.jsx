import React, { useState, useEffect } from "react";
import Button from "../Button/Button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Badge from "../Badges/Badge";
import MobileStepper from "@mui/material/MobileStepper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function StartModal({ onClose, avatar, id, objectives }) {
  const dispatch = useDispatch();
  let navigateTo = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = avatar;
    img.onload = () => setLoading(false);
  }, [avatar]);

  const steps = [
    "“Quisque efficitur, lectus non ullamcorper fermentum, eros lorem bibendum lorem, sit amet consectetur nisl arcu ac odio.”",
    "“Morbi ac odio at tortor ultricies fermentum. Curabitur quis risus vel libero pulvinar placerat. Praesent vehicula, .”",
    "“Phasellus at purus ac mauris ullamcorper volutpat. Aenean posuere, lacus ac tincidunt consequat, erat mi interdum.”",
    "“Vivamus nec lorem ac nisi efficitur vehicula. Cras consequat, arcu vel dictum efficitur, urna sapien gravida dui.”",
    "“Duis tempus velit non massa condimentum, non dignissim purus faucibus. Maecenas pharetra elit ut turpis tempor.”",
    "“Lorem ipsum dolor sit amet consectetur valoris concept doloris etamus celar.”",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prevActiveStep) =>
        prevActiveStep === steps.length - 1 ? 0 : prevActiveStep + 1
      );
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center h-full bg-opacity-15 backdrop-blur-sm">
      <div className="mt-10 mb-10 border border-[#474747] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] rounded-3xl w-[90%] max-w-[1020px] h-auto flex flex-col gap-5 mx-4 overflow-auto p-5">
        <div className="flex">
          <Badge text="Medium" />
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
                {loading && (
                  <CircularProgress
                    size={150} // Loader size slightly larger than the image
                    thickness={2} // Loader thickness
                    sx={{
                      color: "#95EBA3", // Loader color
                      position: "absolute",
                    }}
                  />
                )}
                <img
                  loading="lazy"
                  src={avatar}
                  alt={`Profile of ${id}`}
                  className="object-cover w-[132.07px] h-[132.07px] border rounded-full"
                  style={{ visibility: loading ? "hidden" : "visible" }} // Hide image while loading
                />
              </Box>
            </div>

            <div className="mt-6 md:mt-8 flex flex-col w-full items-center">
              <div className="flex flex-col">
                <span className="text-white font-montserrat text-[14px] md:text-[16px] text-center font-bold leading-[21.78px]">
                  Module {id} is loading...
                </span>
                <span className="text-primary font-montserrat text-[18px] md:text-[24px] text-center font-normal leading-[32.66px]">
                  Remaining time 1:32s
                </span>
              </div>
              <div className="flex flex-col mt-4 md:mt-[14.8px]">
                <span className="text-white font-montserrat text-[18px] md:text-[24px] text-center font-normal leading-[32.66px]">
                  Customer guidance at Sephora
                </span>
                <span className="text-white font-montserrat text-[12px] md:text-[14px] text-center font-medium leading-[29.6px]">
                  The Client wants to replace a product by another
                </span>
              </div>
            </div>

            <div className="mt-4 md:mt-6 w-full h-[0px] border-[0.92px] custom-border border-black"></div>
            <div className="w-full h-[0px] border-[0.92px] custom-border border-[#767474]"></div>

            <div className="mt-4 md:mt-6 mb-2 md:mb-4 h-[26px] text-[16px] text-primary font-montserrat font-semibold leading-[25.898px]">
              Objectives
            </div>
            <div className="w-full">
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
              <Button className="btn btn-gradient-cancel" onClick={onClose}>
                Cancel
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
}

export default StartModal;
