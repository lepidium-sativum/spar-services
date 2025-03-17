import React from "react";

function BadgeBottom({ text }) {
  const levelText = {
    Text: text === "Beginner" ? "Easy" : text === "Medium" ? text : "Difficult",
  };
  const levelColors = {
    Easy: "#75ffee",
    Medium: "#f0d299",
    Difficult: "#ba8df2",
  };
  const badgeColor = levelColors[levelText.Text] || "#ccc"; // Default color if level not found

  return (
    <div
      className="h-5 px-3 py-[5px] rounded-tr-xl rounded-tl-xl rounded-bl-xl justify-end items-center gap-1.5 inline-flex"
      style={{ backgroundColor: badgeColor }}
    >
      <div className="text-right text-black text-[10px] font-semibold font-['Montserrat'] leading-[9.65px]">
        {levelText.Text}
      </div>
    </div>
  );
}

export default BadgeBottom;
