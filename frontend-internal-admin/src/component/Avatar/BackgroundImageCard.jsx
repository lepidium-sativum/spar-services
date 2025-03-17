import React, { useEffect, useState } from "react";
import assets from "../../constants/assets";

const BackgroundImageCard = ({
  images,
  selectedBgIndex,
  onSelect,
  onDelete,
}) => {
  // console.log("bg images: ", images);
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
              className={`relative w-full h-28 border rounded-md ${
                index === selectedBgIndex
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
              onClick={() => onSelect(image, index)}
            >
              {/* {console.log("Bg image: ", image.background_image.url)} */}
              <img
                src={image.background_image?.url}
                alt={`Image ${index}`}
                className="w-full h-28 object-cover relative"
              />
              <img
                src={assets.trashBlack}
                alt="Delete"
                className="absolute top-2 right-2 w-6 h-6 cursor-pointer z-1 bg-white rounded-full p-1"
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

export default BackgroundImageCard;
