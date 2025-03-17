import React, { useEffect, useState } from "react";
import assets from "../../constants/assets";
import { useDispatch } from "react-redux";
import { setPostTranscriptionStatus } from "../../../store/slices/commonSlice";

const TimerPreview = (props) => {
  const dispatch = useDispatch();
  const { specificVideoTime, stopSparCall } = props;
  const [delay, setDelay] = useState(specificVideoTime);
  const [incrementValue, setIncrementValue] = useState(0);
  const [deg, setdeg] = useState(1);

  let minutes = Math.floor(delay / 60);
  let seconds = Math.floor(delay % 60);
  let hours = Math.floor(minutes / 60);
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  useEffect(() => {
    const timer = setInterval(() => {
      setDelay(delay - 1);
      let data1 = ((incrementValue + 1) / specificVideoTime) * 360;
      setIncrementValue(incrementValue + 1);
      setdeg(data1);
    }, 1000);

    if (delay === 0) {
      console.log("Timer is done");
      clearInterval(timer);
      dispatch(setPostTranscriptionStatus("warning"));
      stopSparCall();
    }

    return () => {
      clearInterval(timer);
    };
  }, [delay]);
  return (
    // <div
    //   className={`bg-conic-gradient w-[173px] h-[44px] absolute left-[900px] z-50 top-1 ${
    //     delay && delay < 30 ? "" : ""
    //   }`}
    //   // style={{
    //   //   background: `conic-gradient(from 0deg at 50% 26.16%, ${
    //   //     delay && delay < 30 ? "#F75632" : "#54FF65"
    //   //   } 0deg, ${
    //   //     delay && delay < 30 ? "#F75632" : "#54FF65"
    //   //   } ${deg}deg, rgba(255, 255, 255, 0) ${
    //   //     deg + 120
    //   //   }deg, rgba(255, 255, 255, 0) 360deg)`,
    //   // }}
    // >
    <div className="flex items-center w-[173px] h-[44px] justify-center px-6 py-4 rounded-[50px] bg-white absolute left-[200px] z-50 top-4">
      {/* {delay && delay < 30 ? (
          <img src={assets.Timer} alt="" />
        ) : (
          <img src={assets.TimerPrimary} alt="" />
        )} */}
      <span
        className={`${
          delay <= 59 ? "text-[#E83838]" : "text-[#222121]"
        } text-[20px] leading-[27.22px] font-semibold font-montserrat `}
      >
        {hours}:{minutes}:{seconds}
      </span>
    </div>
    // </div>
  );
};

export default TimerPreview;
