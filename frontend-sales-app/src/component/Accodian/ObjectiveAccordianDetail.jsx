import React from "react";
import assets from "../../constants/assets";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator, {
  timelineSeparatorClasses,
} from "@mui/lab/TimelineSeparator";
import TimelineConnector, {
  timelineConnectorClasses,
} from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
const ObjectiveAccordianDetail = ({ evidence, onPlayClick, onScrollToTop }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handlePlayIconClick = () => {
    if (evidence.timestamp && onPlayClick) {
      onPlayClick(evidence.timestamp); // Trigger the callback with the timestamp
      onScrollToTop(); // Scroll to the top
    }
  };
  // console.log("evidence object: ", evidence);
  const evidenceType = evidence?.evidence_type || "negative";

  const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#28282A",
      color: "#ffffff",
      boxShadow: theme.shadows[1],
      border: "1px solid #424245",
      borderRadius: "12px",
      display: "inline-flex",
      height: "29px",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Montserrat",
      fontSize: "14px",
      fontWeight: "500",
      lineHeight: "normal",
    },
  }));
  // const keys = Object.keys(evidence);
  // console.log("keys: ", keys);

  return (
    <>
      {evidence.quote && evidence.analysis && (
        <Timeline
          sx={{
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  backgroundColor: "#434345",
                  width: "12px",
                  height: "12px",
                  position: "relative",
                  top: "50%", // Move dot to the middle
                  // transform: "translateY(-50%)", // Perfect centering
                  margin: "0", // Ensures no gap
                }}
                // variant="outlined"
                // color="grey"
              />
              <TimelineConnector
                sx={{
                  backgroundColor: "#434345", // Line color
                  width: "2px", //
                  height: "100%", // Ensures it stretches dynamically
                  position: "relative",
                  // flexGrow: 1, // Ensures it stretches dynamically
                  top: "50%", // Move line to the middle
                }}
              />
            </TimelineSeparator>
            <TimelineContent>
              {evidence.quote && evidence.analysis && (
                <div className="flex flex-col w-full h-auto rounded-[20px] p-4 bg-[#222224] mt-0">
                  <div className="flex flex-row w-full h-auto justify-between">
                    <div className="flex flex-row w-[50%] h-auto">
                      <span
                        className={`ml-2 text-[16px] font-inter font-normal leading-[22.4px] text-white`}
                      >
                        Quote
                      </span>
                    </div>
                    <div className="flex flex-row w-[50%] h-auto justify-end">
                      <span className="font-montserrat font-light text-[16px] leading-[19.5px] text-white">
                        {evidence.timestamp}
                      </span>

                      <LightTooltip title={"Replay"}>
                        <img
                          src={
                            isHovered && evidenceType === "negative"
                              ? assets.VideoCircleRed
                              : isHovered && evidenceType === "positive"
                              ? assets.VideoCircleGreen
                              : assets.VideoCircleWhite
                          }
                          alt=""
                          className="ml-2 cursor-pointer relative object-cover w-[20px] h-[20px] rounded-full"
                          onClick={handlePlayIconClick} // Handle click
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        />
                      </LightTooltip>
                    </div>
                  </div>
                  <div className="mt-5 font-inter font-normal leading-[22.4px] text-[16px] text-white">
                    {evidence.quote}
                  </div>
                </div>
              )}
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  backgroundColor: "#434345", // Change this to your preferred color
                  width: "12px", // Adjust the size
                  height: "12px",
                  margin: "0", // Ensures no gap
                  position: "relative",
                  top: "50%", // Move dot to the middle
                  transform: "translateY(-100%)", // Perfect centering
                }}
              />
            </TimelineSeparator>
            <TimelineContent>
              {evidence.analysis && evidence.quote && (
                <div className="flex flex-col w-full h-auto rounded-[20px] p-4 bg-[#434345] mt-0">
                  <div className="flex flex-row w-full h-auto justify-between">
                    <div className="flex flex-row w-[50%] h-auto">
                      <img
                        src={
                          evidenceType === "positive"
                            ? assets.GreenThumbUp
                            : assets.RedThumbDown
                        }
                        alt=""
                        className="relative object-cover w-[20px] h-[20px] rounded-full"
                      />
                      <span
                        className={`ml-2 text-[16px] font-inter font-normal leading-[22.4px]    ${
                          evidenceType === "positive"
                            ? "text-[#71E684]"
                            : "text-[#FC5858]"
                        } `}
                      >
                        Analysis
                      </span>
                    </div>
                  </div>
                  <div
                    className={`mt-5 font-inter font-normal leading-[22.4px] text-[16px]   ${
                      evidenceType === "positive"
                        ? "text-[#71E684]"
                        : "text-[#FC5858]"
                    }`}
                  >
                    {evidence.analysis}
                  </div>
                </div>
              )}
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      )}

      {!evidence.quote && evidence.analysis && (
        <div className="flex flex-col w-full h-auto rounded-[20px] p-4 bg-[#434345] mt-0">
          <div className="flex flex-row w-full h-auto justify-between">
            <div className="flex flex-row w-[50%] h-auto">
              <img
                src={assets.GreenThumbUp}
                alt=""
                className="relative object-cover w-[20px] h-[20px] rounded-full"
              />
              <span
                className={`ml-2 text-[16px] font-inter font-normal leading-[22.4px]    ${
                  evidenceType === "positive"
                    ? "text-[#71E684]"
                    : "text-[#FC5858]"
                } `}
              >
                Analysis
              </span>
            </div>
            {evidence?.timestamp && (
              <div className="flex flex-row w-[50%] h-auto justify-end">
                <span className="font-montserrat font-light text-[16px] leading-[19.5px] text-white">
                  {evidence.timestamp}
                </span>
                <LightTooltip title={"Replay"}>
                  <img
                    src={
                      isHovered && evidenceType === "negative"
                        ? assets.VideoCircleRed
                        : isHovered && evidenceType === "positive"
                        ? assets.VideoCircleGreen
                        : assets.VideoCircleWhite
                    }
                    alt=""
                    className="ml-2 cursor-pointer relative object-cover w-[20px] h-[20px] rounded-full"
                    onClick={handlePlayIconClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  />
                </LightTooltip>
              </div>
            )}
          </div>
          <div
            className={`mt-5 font-inter font-normal leading-[22.4px] text-[16px]   ${
              evidenceType === "positive" ? "text-[#71E684]" : "text-[#FC5858]"
            }`}
          >
            {evidence.analysis}
          </div>
        </div>
      )}
    </>

    // </div>
  );
};
export default ObjectiveAccordianDetail;
