import React from "react";
import assets from "../../constants/assets";

const StatusBadge = ({ text, color }) => {
  // Determine the image based on the text
  // console.log(text, color);

  let image;
  if (text === "Passed") {
    image = assets.tickCircleBlack;
  } else if (text === "Acceptable") {
    image = assets.thumbUp;
  } else if (text === "Warning") {
    image = assets.WarningIcon;
  } else if (text === "Failed") {
    image = assets.crossCircleBlack;
  }

  return (
    <section
      className={`flex px-4 py-2 items-center ${color} justify-center w-full h-full rounded-3xl shadow-2xl`}
      // style={{ backgroundColor: color }} // Use inline styles for dynamic color
    >
      {image && (
        <img
          loading="lazy"
          src={image}
          className="object-contain z-0 shrink-0 self-stretch my-auto w-[24px] h-[24px]"
          alt="Status icon"
        />
      )}
      <p className="z-0 pl-2 self-stretch my-auto text-[16px] leading-[12.87px] font-bold font-montserrat text-black">
        {text}
      </p>
    </section>
  );
};

export default StatusBadge;
