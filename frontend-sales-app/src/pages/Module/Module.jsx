import { useEffect, useState, useRef, useCallback, useContext } from "react";
// import Modal from "../../component/Modal/Modal";
import Button from "../../component/Button/Button";
import { ExpandIcon } from "../../utils/Icons";
import {
  getUpdateSpar,
  uploadBlobDataToS3,
  postSilenceDetection,
} from "../../../store/thunk/commonThunk";
import { useDispatch, useSelector } from "react-redux";
import CameraPreview from "./CameraPreview";
import { useReactMediaRecorder } from "react-media-recorder";
import {
  useLocation,
  useNavigate,
  unstable_usePrompt as usePrompt,
  useOutletContext,
} from "react-router-dom";

import { PixelStreamingWrapper } from "../../component/PixelStream/PixelStreamingWrapper";
import AzureTranscription from "../../component/Transcription/NewAzure";
// import AzureTranscription from "../../component/Transcription/Azure";

import assets from "../../constants/assets";
import TimerPreview from "../../component/TimerPreview/TimerPreview";
import UpcommingLoaderModal from "../../component/Modal/UpcommingLoaderModal";
import {
  setMediaUploading,
  resetAudioProgressVariables,
} from "../../../store/slices/commonSlice";
import localStorage from "redux-persist/es/storage";
import { postAnalysisData } from "../../../store/thunk/statesThunk";
import CameraMicPermissionModal from "../../component/Modal/CameraMicPermissionModal";
import VADComponent from "../../component/VAD/VADComponent";
import { ThemeContext } from "../../layout/Layout";
import ObjectiveModal from "../../component/Modal/ObjectiveModal";
import QuestionEndModal from "../../component/Modal/QuestionEndModal";

const Module = () => {
  const { expandView, setExpandView } = useOutletContext();
  const recommendedList = useSelector((state) => state.auth.recommendedList);
  const sparData = useSelector((state) => state.commonReducer.sparData);
  const userProfileData = useSelector((state) => state.auth.userProfileData);
  const s3BucketURl = useSelector((state) => state.commonReducer.s3BucketUrl);
  const updateSparData = useSelector(
    (state) => state.commonReducer.updateSparData
  );
  const stopCommunication = useSelector(
    (state) => state.commonReducer.stopCommunication
  );
  const uploadingMedia = useSelector(
    (state) => state.commonReducer.uploadingMedia
  );
  const sparCompletedStatus = useSelector(
    (state) => state.commonReducer.sparCompletedStatus
  );
  const location = useLocation();
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const module = location.state?.selectedModule;
  const mhName = location.state?.mhName;
  const bgName = location.state?.bgName;
  const ss = "wss://" + location.state?.ss;
  // console.log("Module page SS : ", ss);
  // console.log("module : ", module);
  const [showPopup, setShowPopup] = useState(false);
  const [isServerDisconnected, setIsServerDisconnected] = useState(false); // Track server connection status
  // const [expandView, setExpandView] = useState(false);
  const [isPreviewVideo, setIsPreviewVideo] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isSparStart, setIsSparStart] = useState(false);
  const [isFirstMount, setIsFirstMount] = useState(true);
  const [objectives, setObjectives] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [closeResources, setCloseResources] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const [moduleAudioUploadCount, setModuleAudioUploadCount] = useState(0);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const mediaStreamRef = useRef();
  const callInProgressRef = useRef(callInProgress);
  const homeClickedRef = useRef(false);
  const pixelStreamingRef = useRef();
  const stopListeningRef = useRef();
  const cameraRef = useRef(); // Ref to the camera div
  const isUserSpeakingRef = useRef(false); // Ref to track VAD status without causing re-renders
  const azureTranscriptionRef = useRef(null);
  const isAvatarSpeakingRef = useRef(false); // Ref to track speaking status
  const userTimelineRef = useRef([]); // Ref to store user timeline
  const avatarTimelineRef = useRef([]); // Ref to store avatar timeline
  const speechStartRef = useRef(null); // Ref to track start time
  const currentSpeakerRef = useRef(null); // Ref to track the current speaker (user/avatar)
  const globalTimerRef = useRef(null); // Ref for the timer interval
  const globalTimeRef = useRef(0); // Ref to track global time
  const silenceTimerRef = useRef(null); // Timer reference
  const silenceDurationRef = useRef(0); // Silence duration reference
  const userSpeechStartRef = useRef(null); // Ref for user speech start time
  const avatarSpeechStartRef = useRef(null); // Ref for avatar speech start time

  const handleServerDisconnect = (disconnected) => {
    setIsServerDisconnected(disconnected); // Update server connection status
  };
  useEffect(() => {
    callInProgressRef.current = callInProgress;
  }, [callInProgress]);
  const handleSilenceTimeout = () => {
    console.log(
      "User has been silent for 20 seconds, asking why...",
      callInProgress,
      !closeResources
    );
    if (callInProgressRef.current && !closeResources) {
      console.log("inside silence timeout");
      dispatch(postSilenceDetection({ sparId: sparData?.spar?.id }));
    }
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current); // Clear the existing timer
      silenceTimerRef.current = null;
    }
    silenceDurationRef.current = 0; // Reset the silence duration
  };

  const startSilenceTimer = () => {
    if (!silenceTimerRef.current) {
      silenceTimerRef.current = setInterval(() => {
        silenceDurationRef.current += 1; // Increment silence duration every second
        if (
          silenceDurationRef.current >= 20 &&
          !isAvatarSpeakingRef.current // Ensure avatar is not speaking
        ) {
          resetSilenceTimer(); // Reset timer and counter
          handleSilenceTimeout(); // Call the API
        }
      }, 1000); // Increment every 1 second
    }
  };

  const startGlobalTimer = () => {
    if (globalTimerRef.current) {
      clearInterval(globalTimerRef.current); // Clear any existing timer
    }
    globalTimeRef.current = 0; // Reset global time to 0
    globalTimerRef.current = setInterval(() => {
      globalTimeRef.current += 0.1; // Increment global time by 0.1 seconds
    }, 100); // Update every 100ms
  };

  // Function to stop the global timer
  const stopGlobalTimer = () => {
    if (globalTimerRef.current) {
      clearInterval(globalTimerRef.current);
      globalTimerRef.current = null; // Clear the timer reference
    }
  };

  const handleStartSpeaking = (role) => {
    const startTime = globalTimeRef.current;

    if (role === "user" && userSpeechStartRef.current === null) {
      userSpeechStartRef.current = startTime;
      console.log(`User started speaking at ${startTime.toFixed(2)}s`);
    }

    if (role === "avatar" && avatarSpeechStartRef.current === null) {
      avatarSpeechStartRef.current = startTime;
      console.log(`Avatar started speaking at ${startTime.toFixed(2)}s`);
    }
    // if (speechStartRef.current === null) {
    //   // Set the start time for the current speaking event
    //   speechStartRef.current = globalTimeRef.current;
    //   currentSpeakerRef.current = role;
    //   console.log(
    //     `${role} started speaking at ${globalTimeRef.current.toFixed(2)}s`
    //   );
    // }
  };

  const handleStopSpeaking = (role) => {
    const endTime = globalTimeRef.current;

    if (role === "user" && userSpeechStartRef.current !== null) {
      const newSegment = {
        start: parseFloat(userSpeechStartRef.current.toFixed(2)),
        end: parseFloat(endTime.toFixed(2)),
      };
      userTimelineRef.current.push(newSegment);
      console.log(`User stopped speaking at ${endTime.toFixed(2)}s`);
      console.log("User segment:", newSegment);
      userSpeechStartRef.current = null; // Reset user speech start time
    }

    if (role === "avatar" && avatarSpeechStartRef.current !== null) {
      const newSegment = {
        start: parseFloat(avatarSpeechStartRef.current.toFixed(2)),
        end: parseFloat(endTime.toFixed(2)),
      };
      avatarTimelineRef.current.push(newSegment);
      console.log(`Avatar stopped speaking at ${endTime.toFixed(2)}s`);
      console.log("Avatar segment:", newSegment);
      avatarSpeechStartRef.current = null; // Reset avatar speech start time
    }
    // if (speechStartRef.current !== null && currentSpeakerRef.current) {
    //   const endTime = globalTimeRef.current; // Capture the end time
    //   const newSegment = {
    //     start: parseFloat(speechStartRef.current.toFixed(2)),
    //     end: parseFloat(endTime.toFixed(2)),
    //   };

    //   if (currentSpeakerRef.current === "avatar") {
    //     avatarTimelineRef.current.push(newSegment); // Update avatar timeline ref
    //   } else if (currentSpeakerRef.current === "user") {
    //     userTimelineRef.current.push(newSegment); // Update user timeline ref
    //   }
    //   console.log(
    //     `${currentSpeakerRef.current} stopped speaking at ${endTime.toFixed(
    //       2
    //     )}s`
    //   );
    //   // console.log("New segment:", newSegment);
    //   // Reset refs
    //   speechStartRef.current = null;
    //   currentSpeakerRef.current = null;
    // }
  };

  const handleUserSpeechChange = (isUserSpeaking) => {
    isUserSpeakingRef.current = isUserSpeaking; // Store VAD status in ref
    const descriptor = isUserSpeaking
      ? "UserStartedTalking"
      : "UserStoppedTalking";

    if (isUserSpeaking) {
      resetSilenceTimer(); // Reset timer when user starts speaking
      handleStartSpeaking("user");
    } else {
      startSilenceTimer(); // Start silence timer if avatar is not speaking
      handleStopSpeaking("user");
    }
    // if (isUserSpeaking) {
    //   resetSilenceTimer(); // Reset timer when user starts speaking
    //   handleStartSpeaking("user");
    // } else if (!isAvatarSpeakingRef.current) {
    //   startSilenceTimer(); // Start silence timer if avatar is not speaking
    //   handleStopSpeaking();
    // }

    if (pixelStreamingRef.current?.sendEvent) {
      pixelStreamingRef.current.sendEvent(descriptor); // Call sendEvent
    }
    if (cameraRef.current) {
      cameraRef.current.style.borderColor = isUserSpeaking
        ? "#63d97a"
        : "white";
    }
    if (azureTranscriptionRef.current?.handleUserSpeechChange) {
      azureTranscriptionRef.current.handleUserSpeechChange(isUserSpeaking);
    }
  };
  const handleAvatarSpeakingChange = (isAvatarSpeaking) => {
    isAvatarSpeakingRef.current = isAvatarSpeaking;
    // console.log("Avatar Speaking in Module:", isAvatarSpeakingRef.current);
    // if (isAvatarSpeaking) {
    //   resetSilenceTimer(); // Reset timer when avatar starts speaking
    //   handleStartSpeaking("avatar");
    // } else if (!isUserSpeakingRef.current) {
    //   startSilenceTimer(); // Start silence timer if user is not speaking
    //   handleStopSpeaking();
    // }

    if (isAvatarSpeaking) {
      resetSilenceTimer(); // Reset timer when avatar starts speaking
      handleStartSpeaking("avatar");
    } else {
      startSilenceTimer(); // Start silence timer if user is not speaking
      handleStopSpeaking("avatar");
    }

    if (azureTranscriptionRef.current) {
      azureTranscriptionRef.current.handleAvatarSpeakingChange(
        isAvatarSpeaking
      ); // Call the function in AzureTranscription
    }
  };
  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    try {
      const cameraStatus = await navigator.permissions.query({
        name: "camera",
      });
      const microphoneStatus = await navigator.permissions.query({
        name: "microphone",
      });

      // console.log("Camera permission state:", cameraStatus.state);
      // console.log("Microphone permission state:", microphoneStatus.state);

      if (
        cameraStatus.state === "granted" &&
        microphoneStatus.state === "granted"
      ) {
        // Permissions are already granted
        // setPermissionsGranted(true);
        setModalOpen(false);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMediaStream(stream);
      } else if (
        cameraStatus.state === "denied" ||
        microphoneStatus.state === "denied"
      ) {
        // Permissions have been denied
        alert(
          "Permissions have been denied. Please enable them in your browser settings."
        );
        // setPermissionsGranted(false);
        setModalOpen(false);
      } else {
        // Permissions are in 'prompt' state
        // setPermissionsGranted(false);
        setModalOpen(true);
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
    }
  };
  const handlePermissionsOk = async () => {
    try {
      const cameraStatus = await navigator.permissions.query({
        name: "camera",
      });
      const microphoneStatus = await navigator.permissions.query({
        name: "microphone",
      });
      console.log("Attempting to request permissions...");
      const mediaPromise = navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (
        cameraStatus.state === "denied" ||
        microphoneStatus.state === "denied"
      ) {
        // Permissions have been denied
        alert(
          "Permissions have been denied. Please enable them in your browser settings."
        );
        // setPermissionsGranted(false);
        setModalOpen(false);
      }
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Permission prompt timeout")), 2000)
      );
      const stream = await Promise.race([mediaPromise, timeoutPromise]);
      // setPermissionsGranted(true);
      setModalOpen(false);
      setMediaStream(stream);
    } catch (err) {
      console.error("Permissions denied or error occurred:", err);
      alert(
        "Permissions are required to proceed. Please allow access to your camera and microphone."
      );
      setModalOpen(false);
    }
  };

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  // let selectedModule = location?.state?.selectedModule;

  const startMediaRecording = useCallback(() => {
    setCallInProgress(true);
    setSessionStartTime(Date.now());
    // startGlobalTimer(); // Start the global timer when recording starts
    setIsSparStart(true);
    startVideoRecording();
    startAudioRecording();
    setIsPreviewVideo(true);
    pixelStreamingRef.current?.play();
  }, [sparData]);

  useEffect(() => {
    const moduleData =
      recommendedList &&
      recommendedList.find((item) => item.module.id === module?.id);
    if (moduleData) {
      setObjectives(moduleData.module.objectives);
      setAvatarUrl(moduleData.module?.aiavatar?.metahuman?.url);
    }
  }, [recommendedList, module]);
  const idRef = useRef(null);
  useEffect(() => {
    if (isAvatarLoaded) {
      startGlobalTimer();
    }
    return () => stopGlobalTimer();
  }, [isAvatarLoaded]);

  useEffect(() => {
    if (isAvatarLoaded && sparData && !closeResources && !stopCommunication) {
      let currentSessionDuration = 10;
      dispatch(
        getUpdateSpar({
          sparDataId: sparData?.spar?.id,
          state: "started",
          sessionDuration: 0,
        })
      );
      idRef.current = setInterval(() => {
        if (!stopCommunication && !closeResources) {
          dispatch(
            getUpdateSpar({
              sparDataId: sparData?.spar?.id,
              state: "in_progress",
              sessionDuration: currentSessionDuration,
            })
          );
          currentSessionDuration += 10;
        }
      }, 10000);
      return () => {
        // console.log("Clearing interval ID:", idRef.current);
        clearInterval(idRef.current); // Clear the interval
        idRef.current = null;
      };
    }
  }, [closeResources, dispatch, isAvatarLoaded, sparData, stopCommunication]);

  useEffect(() => {
    if (location?.search && !isFirstMount && isAvatarLoaded) {
      startMediaRecording();
    }
  }, [isFirstMount, isAvatarLoaded]);

  useEffect(() => {
    mediaStreamRef.current = mediaStream;
  }, [mediaStream]);

  const handleStop = useCallback(
    async (args) => {
      // setCloseResources(true);
      // setCallInProgress(false);
      const currentStream = mediaStreamRef.current;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (audioPreviewStream) {
        audioPreviewStream.getTracks().forEach((track) => track.stop());
      }
      const descriptor = {
        Background: "empty",
        Metahuman: "empty",
      };

      if (pixelStreamingRef.current?.sendEvent) {
        pixelStreamingRef.current.sendEvent(descriptor); // Call sendEvent
      }
      const intervalId = parseInt(await localStorage.getItem("intervalId"), 10);
      stopVideoRecording();
      stopAudioRecording();
      stopListeningRef?.current?.abortListening();
      dispatch(setMediaUploading(true));
      setIsSparStart(false);
      setIsPreviewVideo(false);
      clearInterval(intervalId);
      pixelStreamingRef.current.saveAvatarRecording();
      pixelStreamingRef.current.saveAvatarAudioRecording();
    },
    [dispatch]
  );
  const finishSession = useCallback(
    (reason) => {
      // handleStopSpeaking(); // Stop speaking event
      console.log("Finishing session...", reason);
      setCloseResources(true);
      setCallInProgress(false);
      stopGlobalTimer(); // Stop the global timer when recording stops
      console.log("User Timeline:", userTimelineRef.current);
      console.log("Avatar Timeline:", avatarTimelineRef.current);
      dispatch(
        getUpdateSpar({
          sparDataId: sparData?.spar?.id,
          state: "finished",
          sessionDuration: Math.floor((Date.now() - sessionStartTime) / 1000),
          user_audio_timeline: JSON.stringify(userTimelineRef.current),
          avatar_audio_timeline: JSON.stringify(avatarTimelineRef.current),
        })
      ).then((response) => {
        if (response.payload.status === 200) {
          handleStop();
        } else {
          console.error("Failed to update spar status");
        }
      });
    },
    [
      userTimelineRef,
      avatarTimelineRef,
      dispatch,
      sparData?.spar?.id,
      sessionStartTime,
      handleStop,
    ]
  );
  useEffect(() => {
    if (stopCommunication && !closeResources && callInProgress) {
      console.log("stop comm: ", stopCommunication);
      handleStopSpeaking();
      finishSession("server stopped");
    }
  }, [stopCommunication, finishSession]);

  const {
    previewStream: videoPreviewStream,
    startRecording: startVideoRecording,
    stopRecording: stopVideoRecording,
    mediaBlobUrl: videoMediaBlobUrl,
  } = useReactMediaRecorder({
    mediaStream: mediaStream,
    video: true,
    audio: true,
    onStop: (blobUrl) => {
      if (s3BucketURl) {
        if (!homeClickedRef.current) {
          console.log("user video recording called");
          dispatch(
            uploadBlobDataToS3({
              blobUrl,
              url: s3BucketURl.user_video_url,
              video: true,
              count: 3,
            })
          );
        }
        stopVideoRecording(); // TODO: check this
      }
    },
  });
  const handleUserAudioUpload = async (blobUrl, uploadUrl) => {
    try {
      const result = await dispatch(
        uploadBlobDataToS3({
          blobUrl,
          url: uploadUrl,
          audio: true,
          count: 4,
        })
      ).unwrap();
      if (result.success) {
        setModuleAudioUploadCount((prevCount) => {
          // console.log("Previous count user audio:", prevCount);
          return prevCount + 1;
        }); // Increment the count
      }
    } catch (error) {
      console.error("Error uploading user audio:", error);
    }
  };

  const {
    previewStream: audioPreviewStream,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    mediaBlobUrl: audioMediaBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl) => {
      if (!homeClickedRef.current) {
        console.log("homeclicked audio", homeClickedRef.current);
        handleUserAudioUpload(blobUrl, s3BucketURl.user_audio_url);
      }
    },
  });

  useEffect(() => {
    // console.log("moduleAudiocount: ", moduleAudioUploadCount);
    if (moduleAudioUploadCount === 2 && !callInProgress) {
      dispatch(postAnalysisData({ id: updateSparData?.id }))
        .then((res) => {
          // console.log("postAnalysisData result:", res);
          if (res?.payload?.status === 200) {
            const sparId = updateSparData?.id;
            // console.log("Navigating to sparreport with sparId:", sparId);
            dispatch(setMediaUploading(false));
            dispatch(resetAudioProgressVariables());
            navigateTo("/newreport", {
              replace: true,
              state: {
                fromRealTimeSpar: true,
                additionalData: {
                  level: module?.level,
                  sparId,
                  url: avatarUrl,
                },
              },
            });
          }
        })
        .catch((error) => {
          console.log("Error in postAnalysisData:", error);
        });
    }
  }, [dispatch, moduleAudioUploadCount, navigateTo, updateSparData, avatarUrl]);

  const handleBeforeUnload = (event) => {
    if (!sparCompletedStatus || callInProgress) {
      const confirmationMessage =
        "You are currently in a call session. Leaving now will end the session. Do you want to proceed?";
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    }
  };

  useEffect(() => {
    if (!sparCompletedStatus || callInProgress) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [callInProgress, sparCompletedStatus]);

  // console.log("call in progress: ", callInProgress);
  // console.log("sparCompletedStatus: ", sparCompletedStatus);
  usePrompt({
    message:
      "You are currently in a call session. back now will end the session. Do you want to proceed?",
    when: ({ currentLocation, nextLocation }) => {
      // Check if we should prompt the user
      const shouldPrompt =
        callInProgress &&
        !sparCompletedStatus &&
        currentLocation.pathname !== nextLocation.pathname;
      return shouldPrompt;
    },
    onConfirm: () => {
      homeClickedRef.current = true; // Update the ref immediately
      handleStop(); // make another handleStop to handle video/audio updloading
    },
  });
  useEffect(() => {
    setIsFirstMount(false);
  }, []);
  const handleStopRef = useRef(handleStop);
  // console.log("avatar ref: ", isAvatarSpeakingRef?.current);
  useEffect(() => {
    const cleanup = () => {
      if (callInProgress) {
        handleStopRef.current(); // Use the ref to get the latest handleStop
      }
      // Stop media recordings
      stopVideoRecording();
      stopAudioRecording();

      // Abort any listening
      if (stopListeningRef.current?.abortListening) {
        stopListeningRef.current.abortListening();
      }
      // Disconnect pixel streaming
      if (pixelStreamingRef.current) {
        pixelStreamingRef.current.disconnect();
      }
      // Remove any event listeners
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };

    return () => {
      cleanup();
    };
  }, []);

  const confirmAndHandleStop = () => {
    setUserConfirmed(true); // Open modal
  };
  const handleConfirmEndSession = () => {
    setUserConfirmed(false); // Close modal
    handleStopSpeaking(); // Stop speaking
    finishSession("user ended"); // Finish session
  };
  const incrementAudioUploadCountFromWrapper = () => {
    setModuleAudioUploadCount((prevCount) => {
      console.log("Previous count avatar audio:", prevCount);
      return prevCount + 1;
    });
  };
  return (
    <>
      <div
        className={`meta-human w-full rounded-3xl bg-black flex flex-col justify-between mt-10 ${
          expandView
            ? "fixed inset-0 h-screen w-full"
            : "relative h-[calc(100vh-125px)]"
        }`}
      >
        {!stopCommunication && !closeResources && isAvatarLoaded && (
          <VADComponent onSpeechChange={handleUserSpeechChange} />
        )}
        {isSparStart && sparData?.spar?.total_session_duration && (
          <TimerPreview
            specificVideoTime={
              sparData?.spar?.total_session_duration -
              sparData?.spar?.current_session_duration
            }
            stopSparCall={() => {
              handleStopSpeaking();
              finishSession("timer ended");
            }} // Pass a function reference
          />
        )}
        <PixelStreamingWrapper
          ref={pixelStreamingRef}
          initialSettings={{
            AutoPlayVideo: true,
            AutoConnect: true,
            AllowPixelStreamingCommands: true,
            ss,
            HoveringMouse: true,
          }}
          setIsAvatarLoaded={setIsAvatarLoaded}
          avatarSpeakingRef={isAvatarSpeakingRef} // Pass ref as prop
          onAvatarSpeakingChange={handleAvatarSpeakingChange} // optional: use this to debug changes
          mhName={mhName}
          bgName={bgName}
          onAudioUploadComplete={incrementAudioUploadCountFromWrapper}
          // onServerDisconnect={handleServerDisconnect} // Pass the disconnect handler
        />
        {!showPopup ? (
          <Button
            onClick={() => setShowPopup(!showPopup)}
            className="btn btn-gradient-objective ml-6 absolute left-4 top-4"
          >
            See objectives
          </Button>
        ) : (
          <img
            src={assets.CloseButton}
            alt="close"
            className="cursor-pointer ml-6 absolute left-4 top-4"
            onClick={() => setShowPopup(!showPopup)}
          />
        )}
        <Button
          onClick={() => {
            setExpandView(!expandView);
          }}
          className="btn btn-outline ml-auto px-5 py-3 w-fit absolute right-4 top-4 transition-all duration-300 hover:bg-transparent hover:scale-110"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: ExpandIcon,
            }}
          ></span>
        </Button>
        {showPopup && (
          <ObjectiveModal
            setShowPopup={setShowPopup}
            url={avatarUrl}
            objectives={objectives}
            module={module}
          />
        )}
        <div className="absolute w-full px-4 py-0 left-0 bottom-4">
          <div className="flex justify-between items-end text-white w-1/2 ml-auto">
            <div
              className="w-14 h-14 bg-[#EF1D04] rounded-full flex justify-center items-center cursor-pointer transition-all duration-300 hover:bg-red-700 hover:scale-110"
              onClick={confirmAndHandleStop}
            >
              <img
                src={assets.EndCall}
                alt=""
                className="transition-all duration-300 hover:scale-110"
              />
            </div>
            <div
              ref={cameraRef} // Attach ref to the camera wrapper
              className="w-72 h-44 border-[5px] rounded-xl overflow-hidden"
              style={{ borderColor: "white", borderStyle: "solid" }} // Default border style
            >
              <CameraPreview
                mediaBlobUrl={videoMediaBlobUrl}
                isPreviewVideo={isPreviewVideo}
                previewStream={videoPreviewStream}
              />
            </div>
          </div>
          {isAvatarLoaded && !closeResources && callInProgress && (
            <AzureTranscription
              ref={azureTranscriptionRef}
              isAvatarLoaded={isAvatarLoaded}
              sparData={sparData}
              isUserSpeakingRef={isUserSpeakingRef} // Pass ref instead of state
              isAvatarSpeakingRef={isAvatarSpeakingRef} // Pass avatar speaking ref
              stopCommunication={stopCommunication}
              data={userProfileData}
            />
          )}
        </div>
      </div>

      {userConfirmed && (
        <QuestionEndModal
          onCancel={() => setUserConfirmed(false)} // Close modal
          onConfirm={() => handleConfirmEndSession()} // Handle confirm action
        />
      )}
      {uploadingMedia && (
        <UpcommingLoaderModal
          uploadingMedia={uploadingMedia}
          avatarUrl={avatarUrl}
        />
      )}
      {modalOpen && (
        <CameraMicPermissionModal
          onClose={() => setModalOpen(false)}
          onOk={handlePermissionsOk}
        />
      )}
    </>
  );
};

export default Module;
