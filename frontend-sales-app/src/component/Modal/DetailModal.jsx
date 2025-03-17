import React, { useState, useEffect } from "react";
import Button from "../Button/Button";
import _ from "lodash";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Badge from "../Badges/Badge";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import StarRating from "../Star/StarRating";
import { calculateStar } from "../../utils/constant";
import Marquee from "react-fast-marquee";

function DetailModal({
  onClose,
  avatar,
  id,
  objectives,
  onStart,
  title,
  wants,
  index,
  rating,
  level,
}) {
  const dispatch = useDispatch();
  let navigateTo = useNavigate();

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const img = new Image();
    img.src = avatar;
    img.src = "https://via.placeholder.com/150"; // Placeholder image URL
    img.onload = () => setLoading(false);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex max-w-full justify-center items-center h-full bg-opacity-15 backdrop-blur-sm add-user-modal">
      <div className="mt-10 mb-10 border border-[#474747] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] rounded-3xl w-[550px] h-[742.63px]  flex flex-col  gap-5 mx-4 p-5 hide-scrollbar">
        <div className="flex">
          <Badge text={level} />
        </div>

        <div className="flex w-full h-full px-[60px] pb-[60px]">
          <div className="w-[430px] h-[622.63px] flex flex-col">
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
            <div className="mt-8 flex flex-col w-full items-center h-auto">
              <div className="flex flex-col h-[102.8px]">
                <span className="text-white font-montserrat text-[16px] text-center font-bold leading-[21.78px]">
                  Module {id}
                </span>
                {/* <span className="text-white font-montserrat text-[24px] text-center font-light leading-[32.66px]">
                  {title}
                </span> */}
                <Marquee
                  speed={40}
                  loop={10}
                  pauseOnHover={true}
                  className="text-white font-montserrat text-[24px] text-center font-light leading-[32.66px]"
                >
                  {title}{" "}
                </Marquee>
                <span className="overflow-y-auto hide-scrollbar mt-[8.8px] text-white font-montserrat text-[14px] text-center font-normal leading-[29.6px]">
                  The Client wants to {wants}
                </span>
                {/* <span className="text-primary font-montserrat text-[24px] text-center font-light leading-[32.66px]">
                  Module duration is 05:00m
                </span> */}
              </div>
              {/* <div className="flex flex-col w-full mt-[8.8px]"> */}
              {/* <span className="text-white font-montserrat text-[14px] text-center font-medium leading-[29.6px]">
                  The Client wants to {wants}
                </span> */}
              {/* </div> */}
            </div>
            <div className="relative flex justify-center items-center w-full mt-8 h-[38px]">
              <div className="absolute top-1/2 w-[430px]  h-[1px]  bg-[#1A1A1A]"></div>
              <div className="flex relative z-10 ">
                <StarRating rating={calculateStar(rating)} />
              </div>
            </div>
            <div className="mt-6 mb-4 h-[26px] text-[16px] text-primary font-montserrat font-semibold leading-[25.898px]">
              Objectives
            </div>
            <div className="w-full h-[155.79px] overflow-y-auto hide-scrollbar">
              {objectives &&
                objectives.map((obj, index) => (
                  <div
                    key={index}
                    className="mb-2 bg-[#333333] pl-[22.2px] py-[14.8px] pr-[14.8px] rounded-[29.06px] h-[46.6px] text-[14px] text-white font-montserrat font-medium leading-[17.07px]"
                  >
                    {obj?.title}
                  </div>
                ))}
            </div>
            <div className="mt-6 flex w-full justify-center items-center">
              <Button className="btn btn-gradient-cancel" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onStart} className="btn btn-gradient ml-2">
                Start module
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DetailModal;
