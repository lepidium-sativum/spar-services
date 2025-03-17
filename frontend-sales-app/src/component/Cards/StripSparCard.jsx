import React from "react";
import StarRating from "../Star/StarRating";
import Button from "../Button/Button";
import Badge from "../Badges/Badge";
// import UnReadBadge from "../Badges/UnReadBadge";
import SparCompleteBadge from "../Badges/SparCompleteBadge";
import { calculateStar } from "../../utils/constant";

const StripSparCard = ({ item, onClick, value, level }) => {
  // console.log("spar", item);
  return (
    <div className="flex flex-wrap w-full h-[110px] justify-between items-center bg-[#464646] border-stone-600 rounded-2xl">
      <div className="flex-1 w-[818px] ml-6">
        <div className="text-lg font-montserrat font-bold leading-tight text-white mb-1 tracking-wide">
          Spar {item?.id}
        </div>
        <div className="text-[18px] font-montserrat font-normal leading-[21.94px] text-white mb-1">
          {item?.name}
        </div>
        <div className="">
          <Badge text={level} />
        </div>
      </div>
      <div className="flex flex-col  md:flex-row w-[525px] md:w-auto items-center md:ml-4 md:mr-4 mt-4 md:mt-0">
        <div className="flex items-center mb-2 md:mb-0">
          <div className="w-[68px] mr-12">{/* <UnReadBadge /> */}</div>
          <div className="flex w-[155px] justify-end">
            <SparCompleteBadge
              // status={item?.state}
              status={
                item?.state === "finished" || item?.state === "failed"
                  ? "Completed"
                  : item?.state === "in_progress" ||
                    item?.state === "pending" ||
                    item?.state === "started"
                  ? "Not completed"
                  : null
              }
            />
          </div>
          <div className="w-[100px] ml-4">
            <StarRating rating={calculateStar(item?.rating)} />
          </div>
        </div>
        <div className="h-[38px] w-[1px] border-l border-[#4a4848] mx-4 md:block" />
        <Button
          onClick={onClick}
          className=" btn btn-gradient-start-sm ml-2 mt-2 md:mt-0"
        >
          View
        </Button>
      </div>
    </div>
  );
};

export default StripSparCard;
