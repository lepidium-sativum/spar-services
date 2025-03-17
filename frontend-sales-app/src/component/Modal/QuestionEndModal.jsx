import React, { useState } from "react";
import Button from "../Button/Button";

import { calculateStar } from "../../utils/constant";
const QuestionEndModal = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-15 backdrop-blur-sm">
      <div className="bg-[#28282A] rounded-[32px] max-w-[537px] h-auto p-9 border border-[#424245]">
        <div className="h-auto w-full flex flex-col justify-center items-center">
          <div className="w-full h-auto font-montserrat text-[22px] leading-[32.66px] font-semibold text-white text-center">
            Do you want to end the Spar session?
          </div>
          <div className="mt-3 w-full h-auto font-montserrat text-[16px] leading-[29.6px] font-normal text-white text-center">
            Your result will not be saved...
          </div>
        </div>
        <div className="flex flex-row justify-center mt-6">
          <Button className="btn btn-gradient-cancel-module" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="ml-4 btn btn-gradient-end-module"
            onClick={onConfirm}
          >
            End session
          </Button>
        </div>
      </div>
    </div>
  );
};
export default QuestionEndModal;
