import React from "react";
import assets from "../../constants/assets";
import CircularProgress from "@mui/material/CircularProgress";

const AudioAnalysisData = ({ title, number, info, data, loading }) => {
  let dataColor = title === "Difficulty" ? "yellow" : "#fff";
  // console.log("data in audio component: ", title);
  return (
    <div className="flex flex-col h-[137px] p-6 flex-1 rounded-[32px] relative bg-[#28282A]">
      <p className="text-white text-[13px] font-medium tracking-[0.15px] mb-1">
        {title}
      </p>
      <div
        className={`flex mt-8 text-white text-[40px] leading-[48.76px] not-italic font-bold font-montserrat whitespace-nowrap ${dataColor}`}
      >
        {loading ? (
          <div className="flex flex-row w-full justify-start items-center mt-8">
            <div className="mr-1 font-montserrat text-[10px] leading-[12.87px] font-medium ">
              Loading
            </div>
            <CircularProgress style={{ color: "#95eba3" }} size={20} />
          </div>
        ) : data ? (
          number ? (
            `${number}/10`
          ) : (
            "0/10"
          )
        ) : (
          "N/A"
        )}
      </div>
      <div className="group flex justify-center absolute right-5 bottom-5 ">
        <button className="">
          <img src={assets.InfoIcon} alt="" />
        </button>
        <span className="absolute z-50 w-[204px] text-center bottom-9 scale-0 transition-all rounded bg-black p-4 text-[11px] font-medium text-white group-hover:scale-100">
          {info}
        </span>
      </div>
    </div>
  );
};

export default AudioAnalysisData;
