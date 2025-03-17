import React, { useState } from "react";
import Button from "../Button/Button";
import assets from "../../constants/assets";
import NewStarRating from "../Star/NewStarRating";
import { calculateStar } from "../../utils/constant";
const ResultModal = ({ onClick, result }) => {
  console.log("result", result);

  const value = calculateStar(result?.overall_score);
  //   const value = 3;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-15 backdrop-blur-sm">
      <div className="bg-[#28282A] rounded-[32px] w-[517px] h-auto p-9 border border-[#424245]">
        <div className="h-auto w-[445px]">
          <div className="h-auto w-auto flex justify-center items-center flex-col">
            <div className="w-[169px] h-[169px] flex justify-center items-center ">
              <img
                src={
                  value === 3
                    ? assets.Result1
                    : value === 2
                    ? assets.Result2
                    : value === 1
                    ? assets.Result3
                    : assets.Result4
                }
              />
            </div>
            <div className="w-[32px] h-[32px] flex justify-center items-center flex-row ml-2 mt-2">
              <NewStarRating rating={value} />
            </div>
          </div>

          <div className="h-auto w-auto flex justify-center items-center flex-col mt-6 ">
            <div
              className={`h-auto w-auto font-montserrat text-[16px] font-[700] text-[#222121] ${
                value === 3
                  ? "bg-[#EBB495]"
                  : value === 2 || value === 1
                  ? "bg-[#EBB495]"
                  : "bg-[#FC5858]"
              } rounded-[100px] px-3 py-1  leading-[21.78px]`}
            >
              {value >= 1
                ? "Congratulations! You’ve passed the test!"
                : "Unfortunately, you failed the test..."}
            </div>

            {value === 0 ? (
              <div className="w-full h-auto font-montserrat text-[24px] leading-[32.66px] font-semibold text-[#FFFFFF] mt-3 text-center">
                You’re on the right track, but there’s room for improvement.
                Focus on strengthening your weak points.
              </div>
            ) : value === 1 ? (
              <div className="w-full h-auto font-montserrat text-[24px] leading-[32.66px] font-semibold text-[#FFFFFF] mt-3 text-center">
                You’re on the right track, but there’s room for improvement.
                Focus on strengthening your weak points.
              </div>
            ) : value === 2 ? (
              <div className="w-full h-auto font-montserrat text-[24px] leading-[32.66px] font-semibold text-[#FFFFFF] mt-3 text-center">
                Your hard work is paying off! Keep building your skills and
                achieve even more!
              </div>
            ) : (
              <div className="w-full h-auto font-montserrat text-[24px] leading-[32.66px] font-semibold text-[#FFFFFF] mt-3 text-center">
                Outstanding performance! Keep up the excellent work and continue
                aiming high!
              </div>
            )}
          </div>
          <div className="flex justify-center mt-6">
            <Button
              className={`${
                value >= 2
                  ? "btn-gradient-result3"
                  : value === 1
                  ? "btn-gradient-result1"
                  : "btn-gradient-result0"
              }`}
              onClick={onClick}
            >
              Check results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResultModal;
