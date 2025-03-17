import React from "react";
import assets from "../../constants/assets";

const SparCompleteBadge = ({ status }) => {
  const isCompleted = status === "Completed";

  return (
    <div className="flex flex-row">
      <div className="flex flex-col justify-end items-end">
        <div className="text-[14px] font-montserrat font-light leading-[17.07px] text-white mb-1">
          Spar Status
        </div>
        <div
          className={`text-[14px] font-montserrat font-semibold leading-[12.87px] mb-1 ${
            isCompleted ? "text-primary" : "text-[#FF5555]"
          }`}
        >
          {status}
        </div>
      </div>
      <div className="ml-2">
        <img
          loading="lazy"
          src={isCompleted ? assets.tickCircle : assets.crossCircle}
          className="object-cover w-[38px] h-[38px] rounded-l-2xl"
          alt={status}
        />
      </div>
    </div>
  );
};

export default SparCompleteBadge;
