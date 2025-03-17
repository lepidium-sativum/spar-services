import React from "react";
import assets from "../../../constants/assets";

const AudioAnalysisData = ({ title, number, info, data }) => {
  let dataColor = title === "Difficulty" ? "yellow" : "#fff";
  // console.log('number audio: ',number,data);
  return (
    <div className="custom-box flex flex-col h-[124px] p-7 flex-1 relative">
      <p className="text-white text-[13px] font-medium tracking-[0.15px] mb-1">
        {title}
      </p>
      <p
        className={`text-white text-4xl not-italic font-extrabold whitespace-nowrap ${dataColor}`}
      >
        {data ? (number ? number : "0") : "N/A"}
      </p>
      <div className="group flex justify-center absolute right-5 top-5 ">
        <button className="">
          <img src={assets.InfoIcon} alt="" />
        </button>
        <span className="absolute w-[204px] text-center bottom-9 scale-0 transition-all rounded bg-black p-4 text-[11px] font-medium text-white group-hover:scale-100">
          {info}
        </span>
      </div>
    </div>
  );
};

export default AudioAnalysisData;
