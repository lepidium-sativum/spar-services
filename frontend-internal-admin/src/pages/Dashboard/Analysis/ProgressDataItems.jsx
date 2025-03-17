import React from "react";
import { level } from "../../../utils/constant";

const ProgressDataItems = ({ title, decs, performance }) => {
  function getPerformanceState(performance) {
    if (title == "Sentence length") {
      if (performance >= level.greenStart && performance <= level.greenEnd) {
        return "Perfect";
      } else if (
        (performance >= level.orangeStart1 && performance < level.orangeEnd1) ||
        (performance > level.orangeStart2 && performance <= level.orangeEnd2)
      ) {
        return "Good";
      } else {
        return "Bad";
      }
    }
  }

  return (
    <div className="mb-[40px]">
      <h4 className="text-white text-lg font-bold leading-[25.898px] mb-2">
        {title}
      </h4>
      <span className="text-white text-[14.799px] font-medium leading-[normal] mb-2 block">
        {decs}
      </span>
      {title !== "Sentence length" ? (
        <div className="border h-[8px] rounded-[10px] border-solid border-[#767676] bg-[#d9d9d9] relative mb-10 progressbar-container">
          <div
            className={`absolute h-[103%] left-0 rounded-[10px]
            ${
              performance > 75
                ? "bg-primary"
                : performance > 45
                ? "bg-yellow"
                : "bg-orange200"
            }`}
            style={{ width: performance + "%" }}
          ></div>
        </div>
      ) : (
        <div className="border h-[8px] rounded-[10px] border-solid border-[#767676] bg-[#d9d9d9] relative mb-10 progressbar-container">
          <div className="absolute h-[103%] w-full flex bg-black bg-[linear-gradient(90deg,rgba(235,175,149,0.50)_30%,rgba(253,210,78,0.50)_30%,rgba(255,214,70,0.50)_66%,rgba(37,251,71,0.50)_66%)]">
            <span className="bg-[#EBAF9580] flex-[0_0_33.33%] border-black border-r-2 relative">
              {getPerformanceState() == "Bad" && (
                <div
                  className="progress-bar-child absolute h-[103%] bg-[#ebaf95]"
                  style={{ width: "50%" }}
                ></div>
              )}
            </span>
            <span className="bg-[#FFD64680] flex-[0_0_33.33%] border-black border-r-2 relative">
              {" "}
              {getPerformanceState() == "Good" && (
                <div
                  className="progress-bar-child absolute h-[103%] bg-[#FFD646] "
                  style={{ width: "50%" }}
                ></div>
              )}
            </span>
            <span className="bg-[#95EBA380] flex-[0_0_33.33%] relative">
              {getPerformanceState() == "Perfect" && (
                <div
                  className="progress-bar-child absolute h-[103%] bg-[#25FB47]"
                  style={{ width: "50%" }}
                ></div>
              )}
            </span>
          </div>
          <div className="flex mt-5 text-center text-white">
            <div className="flex-[0_0_33.33%] text-[14px] font-medium">
              Bad
              {getPerformanceState() == "Bad" && (
                <p className="text-[10px]">{`${performance} words average`}</p>
              )}
            </div>
            <div className="flex-[0_0_33.33%] text-[14px] font-medium">
              Good
              {getPerformanceState() == "Good" && (
                <p className="text-[10px]">{`${performance} words average`}</p>
              )}
            </div>
            <div className="flex-[0_0_33.33%] text-[14px] font-medium">
              Perfect
              {getPerformanceState() == "Perfect" && (
                <p className="text-[10px]">{`${performance} words average`}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDataItems;
