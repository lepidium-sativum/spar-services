import React, { useContext, useEffect, useRef, useState } from "react";
// import { useDispatch } from "react-redux";
// import _ from "lodash";
// import { useLocation } from "react-router-dom";


const MyStats = () => {
  // const dispatch = useDispatch();
  // const location = useLocation();

  return (
    <>
      <div className="w-full max-w-[100%]">
        <div className="custom-box flex flex-col h-[450px] lg:flex-row rounded-2xl items-center bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-6 py-6 text-white mb-4"></div>
        <div className="flex flex-row mt-6 w-full">
          <div className="custom-box h-[363.62px] w-[328px] rounded-3xl items-center bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-6 py-6 text-white mb-4"></div>
          <div className="ml-6 custom-box h-[363.62px] w-[627px] rounded-3xl items-center bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-6 py-6 text-white mb-4"></div>
        </div>
      </div>
    </>
  );
};

export default MyStats;
