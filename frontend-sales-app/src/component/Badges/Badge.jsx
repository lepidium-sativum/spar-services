import React from "react";

function Badge({ text }) {
  const levelText = {
    Text: text === "Beginner" ? "Easy" : text === "Medium" ? text : "Hard",
  };
  const levelColors = {
    Easy: "#22E4BA",
    Medium: "#E4C422",
    Hard: "#AA22E4",
  };
  const badgeColor = levelColors[levelText.Text] || "#ccc"; // Default color if level not found

  return (
    <div
      className="px-3 py-1 rounded-[100px] justify-end items-center gap-1.5 inline-flex"
      style={{ backgroundColor: badgeColor }}
    >
      <div
        className={`${
          levelText.Text === "Hard" ? "text-white" : "text-black"
        } text-[16px] font-bold font-montserrat leading-[21.78px]`}
      >
        {levelText.Text}
      </div>
    </div>
  );
}

export default Badge;
