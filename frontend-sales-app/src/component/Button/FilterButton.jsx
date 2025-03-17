import React from "react";

const FilterButton = ({ label, isActive, onClick }) => {
  const text = label !== "All";
  const widthHieght1 = "w-[125px] h-[52px]";
  const widthHieght2 = "w-[70px] h-[52px]";
  const baseClasses =
    "px-0 py-4 border border-solid rounded-[50px] btn-gradient-filter";
  const activeClasses =
    "text-primary border-4 border-[#95EBA3] font-montserrat font-semibold leading-[12.87px] text-[16px] ";
  const inactiveClasses =
    "border-white text-white font-montserrat font-semibold leading-[12.87px] text-[16px] ";

  return (
    <button
      className={`${baseClasses} ${text ? widthHieght1 : widthHieght2} ${
        isActive ? activeClasses : inactiveClasses
      }`}
      aria-pressed={isActive}
      onClick={onClick}
    >
      {label === "All"
        ? "All"
        : label === "Beginner"
        ? "Easy"
        : label === "Medium"
        ? "Medium"
        : label === "Expert"
        ? "Hard"
        : ""}
    </button>
  );
};

export default FilterButton;
