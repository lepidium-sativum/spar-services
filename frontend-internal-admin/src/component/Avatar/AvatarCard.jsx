import React from "react";

const AvatarCard = ({ avatar, onClick, isSelected }) => {
  // console.log("avatar: ", avatar);
  return (
    <div
      className={`flex flex-col p-2 border rounded-md  ${
        isSelected ? "border-[#0070FF]" : "border-gray-300"
      }`}
      onClick={() => onClick(avatar)}
    >
      <div
        className="bg-gray-200 rounded-lg w-full h-[166px]"
        style={{
          backgroundImage: `url(${avatar.bgscene?.background_image?.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img
          src={avatar.metahuman?.url}
          alt={avatar.metahuman?.name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="mt-5 text-base font-semibold leading-4 text-stone-900">
        {avatar.name}
      </div>
      <div className="mt-5 text-sm  font-medium   leading-5 text-gray-500">
        {/* h-16 */}
        Id: {avatar.id}, {avatar.metahuman?.race}
        {avatar.metahuman?.age} years old, {avatar.bgscene?.name}
        <br />
        {avatar.personality?.description}
      </div>
    </div>
  );
};

export default AvatarCard;
