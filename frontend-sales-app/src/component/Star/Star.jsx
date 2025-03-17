import React from "react";
import assets from "../../constants/assets"; // Adjust the path according to your project structure

const Star = ({ highlighted }) => {
  // console.log("highlighted: ", highlighted);
  return (
    <img
      src={highlighted ? assets.activeStar : assets.starIcon}
      alt="Star"
      className={`w-6 h-6 ${highlighted ? "drop-shadow-customShadow" : ""}`}
    />
  );
};

export default Star;
