import React from "react";
import assets from "../../constants/assets"; // Adjust the path according to your project structure

const NewStar = ({ highlighted, rating }) => {
  // console.log("highlighted: ", highlighted);
  return (
    <img
      src={
        rating === 0
          ? assets.RedEmpty
          : rating === 1
          ? highlighted
            ? assets.PinkActive
            : assets.PinkEmpty
          : rating === 2 || rating === 3
          ? highlighted
            ? assets.GreenActive
            : assets.GreenEmpty
          : assets.RedEmpty
      }
      alt="Star"
      className={`w-6 h-6 mr-2 ${
        highlighted ? "drop-shadow-customShadow" : ""
      }`}
    />
  );
};

export default NewStar;
