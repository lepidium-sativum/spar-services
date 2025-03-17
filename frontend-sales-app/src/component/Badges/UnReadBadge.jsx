import React from "react";

const UnReadBadge = ({ number, reports }) => {
  return (
    <div className="AlertingStripe h-6 px-2 py-[7px] bg-white rounded-[30px] justify-center items-center gap-1.5 inline-flex">
      <div className="UnreadReports text-black text-[10px] font-medium font-['Montserrat'] leading-[9.65px]">
        {number} Unread {reports}
      </div>
      <div className="Ellipse332 w-2 h-2 bg-[#f34b4b] rounded-full" />
    </div>
  );
};

export default UnReadBadge;
