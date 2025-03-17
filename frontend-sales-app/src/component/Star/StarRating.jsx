import React from "react";
import Star from "./Star";

const StarRating = ({ rating }) => {
  const containerStyle = {
    width: "102px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: "2px",
    borderStyle: "solid",
    borderRadius: "38px",
    boxShadow: "0px 2px 24px 0px rgba(0, 0, 0, 0.45)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
    backgroundImage:
      "linear-gradient(128.49deg, #333333 0%, #232323 100%), linear-gradient(335.03deg, #464646 0%, #1a1a1a 100%)",
    borderImageSource: "linear-gradient(335.03deg, #464646 0%, #1A1A1A 100%)",
    borderImageSlice: 1,
  };

  return (
    <div style={containerStyle}>
      {[0, 1, 2].map((index) => (
        <Star key={index} highlighted={index < rating} />
      ))}
    </div>
  );
};
export default StarRating;
