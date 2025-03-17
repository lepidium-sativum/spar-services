import React from "react";
import {
  feedBackGradeIcon,
  feedBackStatus,
  checkGradeLevelTextColor,
} from "../../../utils/constant";

const FeedbackItems = ({ title, description, number }) => {
  const formatFeedbackText = (text, grade) => {
    if (!text) {
      return "N/A";
    }
    const regex = /<bold>(.*?)<\/bold>/g;
    const highLightTextColor = checkGradeLevelTextColor(grade);
    return text.replace(regex, (match, p1) => {
      return `<strong class="font-bold ${highLightTextColor}">${p1}</strong>`;
    });
  };

  const formattedDescription = formatFeedbackText(description, number);
  return (
    <div className="knowledge-list bg-[#4B4B4B] gap-6 mb-4 border border-[color:#464646] shadow-[0px_2.76726px_2.21381px_0px_rgba(0,0,0,0.02),0px_6.6501px_5.32008px_0px_rgba(0,0,0,0.03),0px_12.52155px_10.01724px_0px_rgba(0,0,0,0.04),0px_10px_60px_0px_rgba(0,0,0,0.35)] rounded-2xl border-solid;">
      <div className="flex justify-between">
        <div className="p-6">
          <h3 className={`text-base font-bold text-white mb-3`}>{title}</h3>
          <span
            className="text-white text-base font-normal leading-6"
            dangerouslySetInnerHTML={{
              __html: formattedDescription,
            }}
          ></span>
        </div>
        <div className="border-l-[#1A1A1A] border-l-2 border-solid p-6 flex items-center justify-center">
          <div className="flex flex-col justify-center items-center gap-2">
            {number === undefined ? (
              <h2 className={`text-[16px] font-extrabold text-white`}>N/A</h2>
            ) : (
              <div>
                <img src={feedBackGradeIcon(number)} alt="" />
                <h2 className={`text-[16px] font-extrabold text-white`}>
                  {number}%
                </h2>
                <span className="text-white text-[10px]">
                  {feedBackStatus(number)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackItems;
