// import React from "react";
import { level } from "../../utils/constant";
// import PropTypes from "prop-types";
import CircularProgress from "@mui/material/CircularProgress";

const ProgressDataItems = ({
  title,
  decs,
  performance,
  isHardcoded,
  loading,
}) => {
  function getPerformanceState(performance) {
    if (title == "Sentence length") {
      if (performance > level.greenStart && performance <= level.greenEnd) {
        return "Perfect";
      } else if (
        performance >= level.orangeStart &&
        performance <= level.orangeEnd
      ) {
        return "Good";
      } else {
        return "Bad";
      }
    }
  }

  return (
    <div
      className="mb-[40px]"
      style={{
        opacity: isHardcoded ? 0.3 : 1, // Set opacity to 0.5 for hardcoded values
      }}
    >
      <div className="flex flex-row w-full justify-between">
        <h4 className="text-white text-lg font-bold leading-[25.898px] mb-2">
          {title}
        </h4>
        {loading && (
          <div className="flex flex-row w-auto justify-center items-center  mt-3">
            <div className="mr-1 font-montserrat text-white text-[10px] leading-[12.87px] font-medium ">
              Loading
            </div>
            <CircularProgress style={{ color: "#95eba3" }} size={20} />
          </div>
        )}
      </div>
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
        <div className="border h-[8px] w-[438.11px] rounded-[10px] border-solid border-[#767676] bg-[#d9d9d9] relative mb-10 progressbar-container">
          <div className="absolute h-[103%] w-full flex bg-black bg-[linear-gradient(90deg,rgba(235,175,149,0.50)_30%,rgba(253,210,78,0.50)_30%,rgba(255,214,70,0.50)_66%,rgba(37,251,71,0.50)_66%)]">
            <span className="bg-[#EBAF9580] flex-[0_0_33.33%] border-black border-r-2 relative">
              {getPerformanceState(performance) == "Bad" && (
                <div
                  className="progress-bar-child absolute h-[103%] bg-[#ebaf95]"
                  style={{ width: "50%" }}
                ></div>
              )}
            </span>
            <span className="bg-[#FFD64680] flex-[0_0_33.33%] border-black border-r-2 relative">
              {getPerformanceState(performance) == "Good" && (
                <div
                  className="progress-bar-child absolute h-[103%] bg-[#FFD646] "
                  style={{ width: "50%" }}
                ></div>
              )}
            </span>
            <span className="bg-[#95EBA380] flex-[0_0_33.33%] relative">
              {getPerformanceState(performance) == "Perfect" && (
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
              {getPerformanceState(performance) == "Bad" && (
                <p className="text-[10px]">
                  {performance ? `${performance} words average` : "N/A"}
                </p>
              )}
            </div>
            <div className="flex-[0_0_33.33%] text-[14px] font-medium">
              Good
              {getPerformanceState(performance) == "Good" && (
                <p className="text-[10px]">{`${performance} words average`}</p>
              )}
            </div>
            <div className="flex-[0_0_33.33%] text-[14px] font-medium">
              Perfect
              {getPerformanceState(performance) == "Perfect" && (
                <p className="text-[10px]">{`${performance} words average`}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// ProgressDataItems.propTypes = {
//   title: PropTypes.string.isRequired,
//   performance: PropTypes.object.isRequired,
//   isHardcoded: PropTypes.bool.isRequired,
//   decs: PropTypes.object.isRequired,
// };
export default ProgressDataItems;
