import React, { useEffect, useRef, useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";

const CameraStremPreview = ({ stream }) => {
  const videoRef = useRef(null);
  // useEffect(() => {
  //   return () => {
  //     // Stop the preview stream when component unmounts
  //     if (stream) {
  //       stream.getTracks().forEach((track) => track.stop());
  //     }
  //   };
  // }, [stream]);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  if (!stream) {
    return null;
  }
  return (
    <div
      className={`enable-video bg-[radial-gradient(50%_50%_at_50%_50%,rgba(39,39,39,0.96)_0%,#272727_100%)] h-full`}
    >
      <video
        className="video-preview w-full h-full"
        ref={videoRef}
        width={"100%"}
        height="100%"
        autoPlay
        // controls
        // style={{height:"100%", width:"100%"}}
      />
    </div>
  );
};

const CameraPreview = ({ previewStream, isPreviewVideo }) => {
  return (
    <>
      {isPreviewVideo && (
        <CameraStremPreview
          stream={previewStream}
          // avatarSpeaking={avatarSpeaking}
        />
      )}
    </>
  );
};

export default CameraPreview;
