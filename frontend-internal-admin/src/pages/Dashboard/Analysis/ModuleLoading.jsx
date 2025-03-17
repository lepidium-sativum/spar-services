import React from "react";

const ModuleLoading = () => {
  console.log("ModuleLoading");

  return (
    <>
      <div className="flex flex-col gap-4 items-center">
        <span className="text-base font-normal">It's our turn to work...</span>
        <p className="text-[19px] font-bold primary">
          We are generating your Spar results
        </p>
        <span className="text-xs font-normal">a few seconds</span>
      </div>
    </>
  );
};

export default ModuleLoading;
