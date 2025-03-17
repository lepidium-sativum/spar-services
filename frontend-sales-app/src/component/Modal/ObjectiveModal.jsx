import React from "react";
import Button from "../Button/Button";
import assets from "../../constants/assets";
const ObjectiveModal = ({ setShowPopup, url, objectives, module }) => {
  return (
    // <div className="z-50 text-white absolute top-20 left-5">
    //   <div className="flex w-[495px] h-[550.54px] flex-col p-8 rounded-2xl custom-box custom-border module-box">
    //     <div className="flex justify-between items-center">
    //       <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden">
    //         <div className="absolute inset-0 bg-black rounded-full" />
    //         <img
    //           src={url}
    //           alt=""
    //           className="relative z-10 object-cover w-full h-full rounded-full"
    //         />
    //       </div>
    //       <Button
    //         className="btn btn-gradient"
    //         onClick={() => {
    //           setShowPopup(false);
    //         }}
    //       >
    //         Understood
    //       </Button>
    //     </div>
    //     <div className="flex flex-col mt-[29.6px]">
    //       <span className="primary text-[16.65px] leading-[22.66px] font-montserrat font-semibold">
    //         Context
    //       </span>
    //       <span className="font-normal text-[20px] font-montserrat leading-7">
    //         {module?.name}
    //       </span>
    //     </div>
    //     <div className="mt-[29.6px] md:mt-6 w-full h-[0px] border-[0.92px] custom-border border-black"></div>
    //     <div className="w-full h-[0px] border-[0.92px] custom-border border-[#767474]"></div>
    //     <div className="flex flex-col mt-[29.6px]">
    //       <div className="font-semibold">Objectives</div>
    //       <div className="w-full h-[232.38px] overflow-y-auto hide-scrollbar">
    // {objectives &&
    //   objectives.map((list, index) => {
    //     return (
    //       <div
    //         className="flex items-center justify-between  mt-2 p-4 pl-6 bg-dark800 rounded-[29.6px]"
    //         key={index}
    //       >
    //         <span className="text-[14px] font-medium font-montserrat leading-[17.07px]">
    //           {list?.title}
    //         </span>
    //         {/* <img
    //           loading="lazy"
    //           src={assets.tickCircle}
    //           className="object-cover w-[38px] h-[38px] rounded-l-2xl"
    //           alt={"tick"}
    //         /> */}
    //       </div>
    //     );
    //   })}
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="z-50 flex absolute top-20 left-5">
      <div className="flex flex-col w-[365px] h-[278px] bg-[#28282A] rounded-[28px] p-6">
        <div className="bg-[#71E684] text-[#222121] text-[16px] w-[90px] h-auto font-[700] font-montserrat px-3 py-1 leading-[21.78px] rounded-[100px] ">
          Context
        </div>
        <div className="w-[317px] h-auto mt-5">
          <div className="text-[#FFFFFF] text-[16px] leading-[25.9px] font-montserrat">
            Objectives
          </div>
          {/* <div className="w-[317px] h-auto py-[12px] px-[20px] bg-[#161618] text-[14px] text-[#FFFFFF] rounded-[29.6px] font-montserrat font-[500] leading-[17.7px] ">
              Always be respectful and polite
            </div> */}
          <div className="w-full h-[200.38px] overflow-y-auto hide-scrollbar pb-4">
            {objectives &&
              objectives.map((list, index) => {
                return (
                  <div
                    className="flex flex-col mt-2 py-3 px-5 bg-[#161618] rounded-[29.6px]"
                    key={index}
                  >
                    <span className="text-[14px] text-white font-medium font-montserrat leading-[17.07px]">
                      {list?.title}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ObjectiveModal;
