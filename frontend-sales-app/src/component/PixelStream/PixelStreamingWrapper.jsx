// Copyright Epic Games, Inc. All Rights Reserved.

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Config,
  Logger,
  PixelStreaming,
} from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.2";
import { uploadBlobDataToS3 } from "../../../store/thunk/commonThunk";
import { useDispatch, useSelector } from "react-redux";

const STOP_SPEAKING_TIMEOUT = 1000;

Logger.SetLoggerVerbosity(0);
Logger.Log = function () {};
Logger.Info = function () {};
Logger.Error = function () {};
Logger.Warning = function () {};

Logger.Log = function (stack, message, verbosity) {
  if (verbosity === 0) {
    console.log(`Error: ${message}`); // Log only errors
  }
  // Ignore other log levels
};

export const PixelStreamingWrapper = forwardRef(
  (
    {
      initialSettings,
      setIsAvatarLoaded,
      onAvatarSpeakingChange,
      avatarSpeakingRef,
      mhName,
      bgName,
      onAudioUploadComplete,
    },
    ref
  ) => {
    // console.log("Verbosity level");
    // console.log(Logger.verboseLogLevel);
    // console.log("SS: ", initialSettings.ss);

    // A reference to parent div element that the Pixel Streaming library attaches into:
    const videoParent = useRef(null);
    const streamingRef = useRef(null);
    const dispatch = useDispatch();
    // Pixel streaming library instance is stored into this state variable after initialization:
    const [pixelStreaming, setPixelStreaming] = useState();

    // A boolean state variable that determines if the Click to play overlay is shown:
    const [clickToPlayVisible, setClickToPlayVisible] = useState(false);
    const [recordedAvatarChunks, setRecordedAvatarChunks] = useState([]);
    const [recordedAvtarAudioChunks, setRecordedAvtarAudioChunks] = useState(
      []
    );
    const mediaRecorderRef = useRef(null);
    const mediaRecorderAudioRef = useRef(null);
    const s3BucketURl = useSelector((state) => state.commonReducer.s3BucketUrl);

    const sendEvent = (event) => {
      if (streamingRef.current) {
        // console.log("sendEvent WR: ", event);
        streamingRef.current.emitUIInteraction(event);
        // const isEventSent = streamingRef.current.emitUIInteraction(event);
        // if (!isEventSent) {
        // console.log('WebRTC data channel not available, using WebSocket');
        // streamingRef.current.webSocketController.webSocket.send(JSON.stringify(event));
        // }
      }
    };
    // Run on component mount:
    useEffect(() => {
      if (videoParent.current) {
        // Attach Pixel Streaming library to videoParent element:
        const config = new Config({ initialSettings });
        const streaming = new PixelStreaming(config, {
          videoElementParent: videoParent.current,
        });
        streamingRef.current = streaming;
        console.log("checking streaming: ", streaming.current);

        // register a playStreamRejected handler to show Click to play overlay if needed:
        streaming.addEventListener("playStreamRejected", () => {
          setClickToPlayVisible(true);
        });

        streaming.addResponseEventListener("handle_responses", (response) => {
          // Logger.Info(Logger.GetStackTrace(), "Response received!");
          // console.log("avatar response: ", response);
          const videoElement = videoParent.current.querySelector("video");
          switch (response) {
            case "SparStartSpeakingEvent":
              videoElement.classList.add("avatar-speaking"); // Add speaking style
              if (avatarSpeakingRef) avatarSpeakingRef.current = true; // Update ref value
              onAvatarSpeakingChange?.(true); // Optional: call if provided for debugging
              break;
            case "SparStopSpeakingEvent":
              // Delay the removal of the speaking style, but only if no new SparStartSpeakingEvent occurs
              videoElement.stopSpeakingTimeout = setTimeout(() => {
                if (avatarSpeakingRef?.current === false) {
                  // Ensure no new speaking event has occurred
                  videoElement.classList.remove("avatar-speaking");
                  onAvatarSpeakingChange?.(false); // Optional: call if provided for debugging
                }
              }, STOP_SPEAKING_TIMEOUT);
              if (avatarSpeakingRef) avatarSpeakingRef.current = false; // Update ref value
              break;
          }
        });

        streaming.addEventListener("dataChannelOpen", () => {
          // console.log("dataChannelOpen event!");
          const descriptor = {
            Background: bgName,
            Metahuman: mhName,
          };
          // streaming.emitUIInteraction(descriptor);
          sendEvent(descriptor);
        });

        streaming.addEventListener("videoInitialized", () => {
          const videoElement = videoParent.current.querySelector("video");
          const videoStream = videoElement.srcObject;
          const audioElement =
            streaming._webRtcController.streamController.audioElement;
          const audioStream = audioElement.srcObject;

          let combinedStream;
          if (audioStream) {
            combinedStream = new MediaStream([
              ...audioStream.getAudioTracks(),
              ...videoStream.getVideoTracks(),
            ]);
          } else {
            combinedStream = videoStream;
          }

          mediaRecorderRef.current = new MediaRecorder(combinedStream, {
            mimeType: "video/webm;codecs=vp9,opus",
          });
          mediaRecorderRef.current.ondataavailable = handleAvatarDataAvailable;
          mediaRecorderRef.current.start(250);

          // AUDIO STREAM
          mediaRecorderAudioRef.current = new MediaRecorder(audioStream, {
            mimeType: "audio/webm;codecs=opus",
          });
          mediaRecorderAudioRef.current.ondataavailable =
            handleAvatarAudioDataAvailable;
          mediaRecorderAudioRef.current.start(250);
          setIsAvatarLoaded(true);
        });

        setPixelStreaming(streaming);
        // Clean up on component unmount:
        return () => {
          try {
            streaming.disconnect();
          } catch {}
        };
      }
    }, []);

    const handleAvatarDataAvailable = (event) => {
      if (event.data.size > 0) {
        setRecordedAvatarChunks((prevChunks) => [...prevChunks, event.data]);
      }
    };

    const handleAvatarAudioDataAvailable = (event) => {
      if (event.data.size > 0) {
        setRecordedAvtarAudioChunks((prevChunks) => [
          ...prevChunks,
          event.data,
        ]);
      }
    };

    const saveAvatarRecording = () => {
      return new Promise((resolve, reject) => {
        try {
          const blob = new Blob(recordedAvatarChunks, { type: "video/mp4" });
          const url = URL.createObjectURL(blob);
          // console.log("avatar video recording called");
          dispatch(
            uploadBlobDataToS3({
              blobUrl: url,
              url: s3BucketURl.avatar_video_url,
              video: true,
              count: 1,
            })
          );
          // Resolve the promise with the blob
          resolve(blob);

          // Clean up
          pixelStreaming.disconnect();
          setRecordedAvatarChunks([]);
        } catch (error) {
          reject(error);
        }
      });
    };

    // const saveAvatarAudioRecording = () => {
    //   const blob = new Blob(recordedAvtarAudioChunks);
    //   const url = URL.createObjectURL(blob);

    //   dispatch(
    //     uploadBlobDataToS3({
    //       blobUrl: url,
    //       url: s3BucketURl.avatar_audio_url,
    //       audio: true,
    //       count: 2,
    //     })
    //   );
    //   pixelStreaming.disconnect();
    //   setRecordedAvtarAudioChunks([]);
    // };

    const saveAvatarAudioRecording = async () => {
      try {
        const blob = new Blob(recordedAvtarAudioChunks);
        const url = URL.createObjectURL(blob);

        const result = await dispatch(
          uploadBlobDataToS3({
            blobUrl: url,
            url: s3BucketURl.avatar_audio_url,
            audio: true,
            count: 2,
          })
        ).unwrap();

        if (result.success) {
          if (typeof onAudioUploadComplete === "function") {
            onAudioUploadComplete();
          }
          console.log("Avatar audio upload completed.");
        }
        setRecordedAvtarAudioChunks([]); // Clean up
      } catch (error) {
        console.error("Error uploading avatar audio:", error);
      }
    };

    const play = () => {
      pixelStreaming?.play();
    };

    // Expose play function to parent component
    useImperativeHandle(ref, () => ({
      play,
      saveAvatarRecording,
      saveAvatarAudioRecording,
      pixelStreaming,
      sendEvent,
    }));

    return (
      <div className="w-full h-full relative">
        <div className="w-full h-full" ref={videoParent} />
        {clickToPlayVisible && (
          <div
            className="absolute w-full h-full flex items-center justify-center cursor-pointer left-0 top-0"
            onClick={() => {
              pixelStreaming?.play();
              setClickToPlayVisible(false);
            }}
          >
            <div>Click to play</div>
          </div>
        )}
      </div>
    );
  }
);
PixelStreamingWrapper.displayName = "PixelStreamingWrapper";
