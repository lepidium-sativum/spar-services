import React, { useState } from "react";
import ReactPlayer from "react-player";
import assets from "../../constants/assets";

const VideoTutorial = () => {
  const [play, setPlay] = useState(false);

  return (
    <div className="flex justify-center items-center w-[1244px] max-w-full h-[699px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(39,39,39,0.96)_0%,#272727_100%)] rounded-lg overflow-hidden relative">
      {play ? (
        <ReactPlayer
          url="https://www.youtube.com/watch?v=RthSQphUoQ8"
          playing
          width="100%"
          height="100%"
          controls={true}
        />
      ) : (
        <>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/RthSQphUoQ8"
            title="LVMH SPAR Short Version"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
          <img
            loading="lazy"
            src={assets.PlayIcon}
            alt="Play"
            className="absolute w-[46px] h-[46px] cursor-pointer"
            onClick={() => setPlay(true)}
          />
        </>
      )}
    </div>
  );
};

export default VideoTutorial;
