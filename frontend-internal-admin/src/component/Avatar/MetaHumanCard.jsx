import React, { useEffect, useState } from "react";
import assets from "../../constants/assets";

const MetaHumanCard = ({ images, selectedMhIndex, onSelect, onDelete }) => {
  // console.log("metahuman: ", images);
  return (
    <div className="p-4 h-full">
      <div className="grid grid-cols-4 gap-4">
        {images.length === 0 && (
          <div className="flex gap-4">
            <div className="w-full flex flex-col items-center justify-center border border-gray-300 p-4">
              <div className="flex items-center justify-center h-full text-blue-500">
                No Images Available
              </div>
            </div>
          </div>
        )}
        {images &&
          images.map((image, index) => (
            <div
              key={index}
              className={`relative w-full h-full border rounded-xl cursor-pointer ${
                index === selectedMhIndex
                  ? "border-blue-500"
                  : "border-gray-300"
              }`} // Highlight the selected image
              onClick={() => onSelect(image, index)}
            >
              {/* {console.log("Mh images: ", image.url)} */}
              <img
                src={image.url}
                alt={`Image ${index}`}
                className="w-full h-52 object-cover"
              />
              <img
                src={assets.trashBlack}
                alt="Delete"
                className="absolute top-2 right-2 w-5 h-5 cursor-pointer z-1 bg-white rounded-full p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(image.id);
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default MetaHumanCard;
