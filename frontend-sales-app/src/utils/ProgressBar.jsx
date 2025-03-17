import React from "react";

const ProgressBar = ({ apiTwoProgress, apiFourProgress }) => {
  const progressBarWidth = apiTwoProgress + apiFourProgress + "%";
  return (
    <div className="w-full">
      <div className="w-48 bg-gray-200 h-6 rounded mx-auto text-center relative ">
        <div
          className="bg-[#95eba3] h-6 text-center text-black font-bold rounded text-xs flex justify-center items-center"
          style={{ width: progressBarWidth }}
        >
          <span className="absolute left-1/2 transform -translate-x-1/2">
            {progressBarWidth}
          </span>
        </div>
      </div>
    </div>
  );
};
export default ProgressBar;
