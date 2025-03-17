import React from "react";

const TimelineItem = ({ children, isLast, length }) => {
  return (
    <div className="relative flex items-start">
      {/* Circle (Dot) */}
      {length > 1 && (
        <div
          className="relative rounded-full"
          style={{
            top: "32px",
            width: "9.19px",
            height: "9.19px",
            border: "1px solid #939393",
            boxSizing: "content-box", // Prevents padding from affecting the size
          }}
        />
      )}

      {/* Connector Line */}
      {!isLast && (
        <div
          className="absolute"
          style={{
            left: "4.5px", // Centers the line relative to the circle
            top: "41.59px", // Starts the line from the bottom of the circle
            height: "108.22px",
            width: "1px",
            backgroundColor: "#939393",
          }}
        ></div>
      )}

      {/* Content */}
      <div className="ml-[22px] w-full">{children}</div>
    </div>
  );
};
export default TimelineItem;
