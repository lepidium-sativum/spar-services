import React, { useState, useEffect } from "react";
import Button from "../Button/Button";
import _ from "lodash";
import { useDispatch } from "react-redux";
// import { createClientUser } from "../../../store/thunk/commonThunk";
import { useNavigate } from "react-router-dom";
import Badge from "../Badges/Badge";
import MobileStepper from "@mui/material/MobileStepper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function AfterDetailStartModal({
  onClose,
  avatar,
  id,
  index,
  objectives,
  level,
  avatarName,
  bgName,
  time,
}) {
  const dispatch = useDispatch();
  let navigateTo = useNavigate();

  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const img = new Image();
    img.src = avatar;
    img.src = "https://via.placeholder.com/150"; // Placeholder image URL
    img.onload = () => setLoading(false);
  }, []);
  const steps = [
    "“Understanding client needs involves asking open-ended questions and allowing them to express their concerns.”",
    "“Building rapport and Fostering trust through personal connections and genuine interest enhances client relationships.”",
    "“Knowing your product and Being well-versed in product details enables confident addressing of concerns and showcasing of benefits.”",
    "“Emphasizing how the product solves specific problems, rather than just listing features, is crucial.”",
    "“Anticipating and addressing objections with facts, while guiding the conversation back to the product's value, is effective.”",
    "“Maintaining a presence with personalized follow-ups that offer value, without being pushy, helps in building client relationships.”",
  ];
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prevActiveStep) =>
        prevActiveStep === steps.length - 1 ? 0 : prevActiveStep + 1
      );
    }, 8000); // Change text every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [steps.length]);
  return (
    <div className="fixed inset-0 z-50 flex max-w-full justify-center items-center h-full bg-opacity-15 backdrop-blur-sm add-user-modal">
      <div className="mt-10 mb-10 border border-[#474747] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] rounded-3xl w-[809px] h-[426.07px]  flex flex-col  gap-5 mx-4 p-5 hide-scrollbar">
        <div className="flex">
          <Badge text={level} />
        </div>

        <div className="flex w-full h-full px-[30px] pb-[60px] gap-10">
          <div className="w-[340px] h-[306.07px] flex flex-col">
            <div className="flex w-full justify-center items-center h-[132.07px]">
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
                    size={150} // Slightly larger than the image to act as a border
                    thickness={2} // Adjust the thickness of the loader
                    sx={{
                      color: "#95EBA3", // Your primary color
                      position: "absolute",
                    }}
                  />
                )}
                <img
                  loading="lazy"
                  src={avatar}
                  alt={`Profile of ${name}`}
                  className="object-cover w-[132.07px] h-[132.07px] border rounded-full"
                  style={{ visibility: loading ? "hidden" : "visible" }} // Hide image while loading
                />
              </Box>
            </div>

            <div className="mt-8 flex flex-col w-full items-center h-[135.8px]">
              <div className="flex flex-col h-[58px]">
                <span className="text-white font-montserrat text-[16px] text-center font-bold leading-[21.78px]">
                  Module {id} is loading
                </span>
                <span className="text-primary text-nowrap font-montserrat text-[24px] text-center font-normal leading-[32.66px]">
                  Module duration is{" "}
                  {parseInt(time / 60) < 10
                    ? "0" + parseInt(time / 60)
                    : parseInt(time / 60)}
                  :00m
                </span>
              </div>
            </div>

            <div className="mt-6 flex w-full justify-center items-center">
              <Button className="btn btn-gradient-cancel" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
          {/* adjust width for righ panel  */}
          <div className="flex flex-col justify-center items-center w-[483px] h-[306.07px] bg-[#262626] custom-box border custom-border rounded-2xl p-8 ">
            <div className="text-[16px] leading-[21.78px] text-white font-montserrat font-bold text-center ">
              Did you know?
            </div>
            <div className="mt-5 text-[20px] leading-[24.38px] text-white font-montserrat font-normal text-center">
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
            <div className="mt-10">
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
        {/* <div className="flex justify-center items-center mt-20">
          <Button type="submit" className="btn btn-gradient-blue ">
            Submit
          </Button>
        </div> */}
      </div>
    </div>
  );
}
export default AfterDetailStartModal;
