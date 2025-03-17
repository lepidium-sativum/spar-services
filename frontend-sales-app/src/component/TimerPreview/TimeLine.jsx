import React from "react";
import TimelineItem from "./TimeLineItem";
import _ from "lodash";
const Timeline = ({ items }) => {
  // console.log("items:", items);

  return (
    <div className="flex flex-col w-full space-y-2">
      {items &&
        items.map((item, index) => (
          <TimelineItem
            key={index}
            isLast={index === items.length - 1}
            length={_.size(items)}
          >
            {item.content}
          </TimelineItem>
        ))}
    </div>
  );
};
export default Timeline;
