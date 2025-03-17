import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

const ConversionModel = ({ onClose, data }) => {
  // console.log("Data passed to modal: ", data); // Log the data
  // console.log("Type of data: ", typeof data); // Log the type of data
  // console.log("Is data an array? ", Array.isArray(data)); // Log if data is an array
  // console.log("Data length: ", Array.isArray(data) ? data.length : "N/A"); // Log the length if data is an array

  const isValidData = Array.isArray(data) && data.length > 0;
  return ReactDOM.createPortal(
    <div className="modal-overlay z-50 fixed inset-0 bg-[rgba(37,37,37,0.70)] backdrop-blur-[7px] flex items-center justify-center">
      <div className="flex modal relative transform overflow-hidden custom-box text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[1100px] rounded-3xl">
        <div className="rounded-2xl custom-border gap-6 px-8 py-[50px] text-white flex-1 h-full flex-col">
          <div className="relative justify-center max-h-[500px] overflow-y-auto custom-scrollbar">
            {isValidData ? (
              data.map((list, index) => {
                if (index === 0) {
                  return null;
                }
                return (
                  <div className="flex mb-4 gap-1" key={index}>
                    <p className="flex flex-nowrap min-w-[100px] capitalize">
                      {list?.role}
                      <span className="ml-1">:</span>
                    </p>
                    <p>{list?.content}</p>
                  </div>
                );
              })
            ) : (
              <p>No data available</p>
            )}
          </div>
          <div className="flex justify-center mt-4">
            <button className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,

    document.getElementById("conversion-model")
  );
};

export default ConversionModel;
