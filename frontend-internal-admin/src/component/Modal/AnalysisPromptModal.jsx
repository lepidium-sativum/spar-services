import React from "react";

const AnalysisPromptModal = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex max-w-full justify-center h-full bg-opacity-15 backdrop-blur-lg add-user-modal">
      <div className="mt-5 mb-10 text-[rgb(231,231,231)] bg-[#333333] rounded-xl w-1/2 h-5/6  flex flex-col  gap-5 mx-4 overflow-auto p-5 hide-scrollbar shadow-black">
        <div className="flex justify-end w-full h-10">
          <button
            className="mr-7 mt-2 font-extrabold"
            onClick={() => onClose()}
          >
            X
          </button>
        </div>
        <div className="flex flex-col justify-center items-center">
          <h3 className="text-xl mt-0 font-montserrat text-[rgb(231,231,231)] font-bold">
            Module Analysis Prompt
          </h3>
          <div style={{ whiteSpace: "pre-line", marginTop: "20px" ,fontSize:18}}>
            {data ? data : "No data available."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPromptModal;
