import React from "react";
import NewStar from "./NewStar";

const NewStarRating = ({ rating }) => {
  // console.log("rating: ", rating);

  const containerStyle = {
    width: "112px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={containerStyle}>
      {[0, 1, 2].map((index) => (
        <NewStar key={index} highlighted={index < rating} rating={rating} />
      ))}
    </div>
  );
};
export default NewStarRating;
