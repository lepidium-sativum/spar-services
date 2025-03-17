import React from "react";
import Badge from "../Badges/Badge";
const ProfileCard = ({
  imageAvatar,
  imageBg,
  name,
  // index,
  // isLast = false,
  level,
  // onProfileClick,
}) => {
  // console.log("key: ", index);

  return (
    <div className="flex flex-col size-full grow justify-center max-md:mt-7 rounded-t-2xl overflow-hidden">
      <div
        className="flex flex-col overflow-hidden flex-grow size-full relative items-start pb-7 aspect-[0.83]"
        // onClick={() => {
        //   console.log(`ProfileCard clicked!`);
        //   onProfileClick(); // Trigger the passed callback
        // }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center rounded-tl-2xl rounded-tr-[16px]"
          style={{ backgroundImage: `url(${imageBg})` }}
        />
        <img
          loading="lazy"
          src={imageAvatar}
          alt={`Profile of ${name}`}
          className="object-cover absolute inset-0 size-full rounded-tl-2xl rounded-tr-[16px]"
        />
        <div className="flex flex-row justify-between w-full">
          <div className="relative ml-[13px] mt-[10.5px] text-sm font-semibold leading-3 text-white max-md:mt-2 max-md:ml-2.5">
            {name}
          </div>
          <div className="flex justify-center mr-[10px] items-center relative mt-[10.5px] max-md:mt-2 max-md:ml-2.5">
            <Badge text={level} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
