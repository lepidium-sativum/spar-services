import React from "react";

function NewLoader() {
  return (
    <div
      className="flex gap-1 items-center text-xs font-medium tracking-normal leading-none text-white whitespace-nowrap"
      role="status"
    >
      <span className="self-stretch my-auto">Loading</span>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/1fcd7af8214a730a3e3450ffb74dd201af9afb00faeddd5c9d150b594c81cbf2?placeholderIfAbsent=true&apiKey=a5594380ceab442aaf8adb38f72c697c"
        className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
        alt=""
      />
      <span className="sr-only">Loading in progress</span>
    </div>
  );
}

export default NewLoader;
