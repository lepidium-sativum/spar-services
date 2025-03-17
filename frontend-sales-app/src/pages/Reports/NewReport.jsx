import React, { useEffect, useRef, useState, useContext } from "react";
import assets from "../../constants/assets";
import Button from "../../component/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { Timeline } from "@xzdarcy/react-timeline-editor";
import {
  calculateStar,
  checkGradeColor,
  checkGradeLevelText,
  jsonParseCoversion,
  mergeTimelines,
  sparDurationConversion,
} from "../../utils/constant";
import AudioAnalysisData from "./AudioAnalysisData"; //
// import Skeleton from "@mui/material/Skeleton";
// import FeedbackItems from "./FeedbackItems"; //
// import ServerErrorModel from "../../component/Modal/ServerErrorModel";
// import CommonModel from "../../component/Modal/CommonModel";
import {
  postMergeVideo,
  getVideoMergeData,
  getAnalysisData,
} from "../../../store/thunk/statesThunk";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import StatusBadge from "../../component/Badges/StatusBadge";
import CircularProgress from "@mui/material/CircularProgress";
import Confetti from "react-confetti";
import useSound from "use-sound"; // Import the use-sound hook
import failedSound from "../../sounds/Failure.wav";
import passedSound from "../../sounds/Confetti.wav";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";
import Badge from "../../component/Badges/Badge";
import ObjectivesAccordian from "../../component/Accodian/ObjectivesAccordian";
import HalfDonutChart from "../../component/Chart/HalfDonutChart";
import NewStarRating from "../../component/Star/NewStarRating";
import { ThemeContext } from "../../layout/Layout";
import ResultModal from "../../component/Modal/ResultModal";

const NewReport = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { scrollContainerRef } = useContext(ThemeContext); // Access the ref
  // Initialize sounds with useSound
  const [playFailed] = useSound(failedSound);
  const [playPassed] = useSound(passedSound);
  const dispatch = useDispatch();
  const location = useLocation();
  const isVideoFileUploaded = useSelector(
    (state) => state.commonReducer.videoUploadingComplete
  );
  const serverErrorModal = useSelector(
    (state) => state?.statesReducer?.serverErrorModal
  );
  const timeLineConversation = [
    {
      mockData: [
        {
          id: "blank0",
          actions: [],
        },

        {
          id: "0",
          actions: [],
        },
        {
          id: "blank1",
          actions: [],
        },
        {
          id: "blank2",
          actions: [],
        },
        {
          id: "1",
          actions: [],
        },
      ],
    },
    {
      mockEffect: {
        effect0: {
          id: "effect0",
          name: "you",
        },
        effect1: {
          id: "effect1",
          name: "avtar",
        },
      },
    },
  ];

  const additionalData = location.state?.additionalData || {};
  const sparId = additionalData?.sparId;
  // const url = location.state?.additionalData?.url;
  // console.log("level: ", additionalData);

  const [videoSrc, setVideoSrc] = useState(null);
  const [isVideoPlay, setIsVideoPlay] = useState(false);
  const [time, setTime] = useState(0);
  const [scale, setScale] = useState();
  const abortController = useRef(new AbortController());
  const [mergedVideoData, setMergedVideoData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [mergeStatus, setMergeStatus] = useState(null);
  const [scaleWidth, setScaleWidth] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef(null);
  const timelineState = useRef();
  const audioRef = useRef(null);
  const isVideoSrcSetRef = useRef(false);
  const containerRef = useRef(null);
  const [isInitialMergeCallComplete, setIsInitialMergeCallComplete] =
    useState(false);
  const [isSecondMergeCallComplete, setIsSecondMergeCallComplete] =
    useState(false);
  const [videoAvailable, setVideoAvailable] = useState(false);

  // Track source of navigation
  const fromRealTimeSpar = location.state?.fromRealTimeSpar || false;
  const updatedTimeLineConversation =
    mergedVideoData?.spar?.user_audio_timeline &&
    mergedVideoData?.spar?.avatar_audio_timeline &&
    mergeTimelines(mergedVideoData, timeLineConversation);
  // console.log("both timeline: ", updatedTimeLineConversation);
  // console.log("video: ", mergedVideoData);

  // console.log("merge data: ", mergedVideoData);
  // console.log("user timeline: ", mergedVideoData?.spar?.user_audio_timeline);
  // console.log(
  //   "avatar timeline: ",
  //   mergedVideoData?.spar?.avatar_audio_timeline
  // );

  var audioAnalysisData =
    analysisData?.audio_analysis &&
    jsonParseCoversion(analysisData?.audio_analysis);
  var textAnalysisData =
    analysisData?.text_analysis &&
    jsonParseCoversion(analysisData?.text_analysis);
  const feedback = textAnalysisData?.feedback || {};
  const grades = textAnalysisData?.grades || {};
  // console.log(" audio analysis data: ", audioAnalysisData);
  console.log(" text analysis data: ", textAnalysisData);

  useEffect(() => {
    if (mergedVideoData?.merged_video_url && !isVideoSrcSetRef.current) {
      setVideoSrc(mergedVideoData.merged_video_url);
      isVideoSrcSetRef.current = true; // Mark as set
    }
  }, [mergedVideoData?.merged_video_url]);

  const getAnalysisStatus = () => {
    if (abortController.current.signal.aborted) return;
    setIsLoading(true);
    dispatch(getAnalysisData(sparId))
      .then((response) => {
        const state = response?.payload?.data?.state;
        setAnalysisStatus(state);
        if (state === "finished") {
          setAnalysisData(response.payload.data);
          setIsLoading(false);
          setShowModal(true);
        } else if (state === "started" || state === "in_progress") {
          setTimeout(getAnalysisStatus, 3000); // Continue polling
        } else {
          setIsLoading(false);
          console.error("Analysis in unexpected state:", state);
        }
      })
      .catch((error) => {
        console.error("Error in getAnalysisStatus:", error);
        setTimeout(getAnalysisStatus, 3000);
      });
  };

  const getVideoMergeStatus = (isInitialCall = false) => {
    if (abortController.current.signal.aborted) return;
    setIsVideoLoading(true);
    dispatch(getVideoMergeData(sparId))
      .then((response) => {
        // console.log("response: ", response);
        const videoMergingState =
          response?.payload?.data?.spar?.video_merging_state;
        const videoUrl = response?.payload?.data?.merged_video_url || "";
        setMergeStatus(videoMergingState);
        if (videoMergingState === "finished") {
          setMergedVideoData(response.payload.data);
          setVideoAvailable(!!videoUrl); // Set availability based on URL
          setIsVideoLoading(false);
        } else if (videoMergingState === "invalid") {
          setIsVideoLoading(false);
          console.error("Video merge is invalid.");
        } else if (videoMergingState === null) {
          console.error("Video merge is null.");
          dispatch(postMergeVideo({ id: sparId }))
            .then((res) => {
              // console.log("in postmerge when getvideo failed", res);
              if (res?.payload?.status === 200) {
                setTimeout(getVideoMergeStatus, 10000); // Retry polling
              }
            })
            .catch((error) => {
              console.error("Error in postMergeVideo:", error);
            });
        } else if (videoMergingState === "failed") {
          setMergedVideoData(response.payload.data);
          setIsVideoLoading(false);
        } else if (response?.payload.code === "ERR_NETWORK") {
          setIsVideoLoading(false);
        } else {
          setTimeout(getVideoMergeStatus, 10000); // Continue polling for in-progress states
        }

        // Mark completion for initial or second call
        if (isInitialCall) {
          console.log("initial call");
          setIsInitialMergeCallComplete(true);
        } else {
          console.log("second call");
          setIsSecondMergeCallComplete(true);
        }
      })
      .catch((error) => {
        console.error("Error in getVideoMergeStatus:", error);
        // setTimeout(getVideoMergeStatus, 10000);
      });
  };
  useEffect(() => {
    // Re-initialize abortController when sparId changes
    abortController.current = new AbortController();
    // Start polling functions
    getAnalysisStatus();
    getVideoMergeStatus(true);
    return () => {
      // Abort only when component unmounts or sparId changes
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [sparId]);
  useEffect(() => {
    if (fromRealTimeSpar && isVideoFileUploaded) {
      console.log("Video uploaded:", isVideoFileUploaded);
      dispatch(postMergeVideo({ id: sparId }))
        .then((res) => {
          if (res?.payload?.status === 200) {
            getVideoMergeStatus(false); // Start or continue polling
          }
        })
        .catch((error) => {
          console.error("Error in postMergeVideo:", error);
        });
    }
  }, [isVideoFileUploaded, fromRealTimeSpar]);

  useEffect(() => {
    // Stop polling if both analysis and video merge are completed
    if (analysisStatus === "finished" && mergeStatus === "finished") {
      if (abortController.current) abortController.current.abort();
    }
  }, [analysisStatus, mergeStatus]);

  const handlePauseVideo = () => {
    if (videoRef?.current?.paused) {
      videoRef.current.play();
      timelineState.current.play({ autoEnd: true });
      setIsVideoPlay(true);
    } else {
      videoRef?.current.pause();
      timelineState.current.pause();
      setIsVideoPlay(false);
    }
  };
  // Function to handle video playback called from timestamps
  const handlePlayFromTimestamp = (timestamp) => {
    if (!videoRef?.current) return;
    // Parse timestamp from "MM:SS" format
    const [start] = timestamp.split("-").map((time) => {
      const [minutes, seconds] = time.split(":").map(Number);
      return minutes * 60 + seconds; // Convert MM:SS to seconds
    });
    // Set the video's current time and play
    videoRef.current.currentTime = start;
    videoRef.current.play();
    setIsVideoPlay(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling
    });
  };

  const scrollToTop = () => {
    console.log("Scroll to top triggered");

    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      console.error("Scrollable container not found!");
    }
  };
  const handleTimelineTimeChange = (time) => {
    if (videoRef.current && videoRef.current.currentTime !== time) {
      setTime(time);
      videoRef.current.currentTime = time;
    }
  };

  // const handlePlayOrPause = () => {
  //   setPlayBtn(!PlayBtn);
  // };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && timelineState.current) {
      const currentTime = videoRef.current.currentTime;
      // Update the time state variable
      setTime(currentTime);
      // Update the timeline cursor position if it's different from the video time
      if (timelineState.current.getTime() !== currentTime) {
        timelineState.current.setTime(currentTime);
      }
    }
  };

  const handleLoadedMetadata = () => {
    // console.log("duration: ", videoRef?.current?.duration);
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      // console.log("time: ", duration);
      // setScale(parseInt(duration / 9));
      const scaleValue = duration / 9;
      setScale(Math.round(scaleValue)); // Round to the nearest whole number
    }
  };

  const metricsArray = (textAnalysisData && textAnalysisData.metrics) || []; // Access the metrics array
  const metricsCount = metricsArray.length; // Count the number of metrics
  let rows = [];
  if (metricsCount === 2) {
    rows = [metricsArray]; // One centered row for two items
  } else if (metricsCount <= 4) {
    rows = [metricsArray]; // One row for all
  } else {
    for (let i = 0; i < metricsCount; i += 3) {
      rows.push(metricsArray.slice(i, i + 3)); // Split into rows of up to 3 items each
    }
  }

  const badgeText = checkGradeLevelText(textAnalysisData?.overall_score);
  const badgeColor = checkGradeColor(textAnalysisData?.overall_score);
  const isTrophy = calculateStar(textAnalysisData?.overall_score);
  // const badgeText = checkGradeLevelText(24);
  // const badgeColor = checkGradeColor(24);
  // const isTrophy = 3;

  // console.log("text and color: ", badgeText, badgeColor);

  // useEffect(() => {
  //   if ((badgeText === "Passed" || badgeText === "Acceptable") && !isLoading) {
  //     setShowConfetti(true);
  //     playPassed();
  //   }
  //   if (badgeText === "Failed" || badgeText === null) {
  //     setShowConfetti(false);
  //     playFailed();
  //   }
  // }, [isLoading, textAnalysisData?.grades?.general]);

  const formatFeedbackText = (text) => {
    if (!text) {
      return "N/A";
    }
    let formattedText = text
      .replace(/<bold>(.*?)<\/bold>/g, "**$1**")
      .replace(/\n\n+/g, "\n")
      .replace(/(?:^|\n)\s*•/g, "\n-")
      .replace(/(^|\n)-\s*(\*\*[^*]+?\*\*:)/g, "$1$2")
      .replace(/(^|\n)(\*\*[^*]+?\*\*:)/g, "$1\n$2")
      // Add double newline after sentences
      .replace(/([.!?])(\s+)/g, "$1\n\n");
    // Replace <bold> tags with markdown bold syntax
    // let formattedText = text.replace(/<bold>(.*?)<\/bold>/g, "**$1**");

    // // Normalize line breaks: replace multiple consecutive newlines with a single newline
    // formattedText = formattedText.replace(/\n\n+/g, "\n");

    // Replace dots (•) with hyphens (-) for list items
    // formattedText = formattedText.replace(/(?:^|\n)\s*•/g, "\n-");

    // Remove hyphens before headings (e.g., **Positive Aspects:**)
    // formattedText = formattedText.replace(
    //   /(^|\n)-\s*(\*\*[^*]+?\*\*:)/g,
    //   "$1$2"
    // );

    // Ensure proper spacing for markdown parsing
    // formattedText = formattedText.replace(/(^|\n)(\*\*[^*]+?\*\*:)/g, "$1\n$2");
    // formattedText = formattedText.replace(/([.!?])(\s+)/g, "$1\n\n");

    return formattedText;
  };

  const customSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames || []), "em", "span", "strong", "a"],
    attributes: {
      ...defaultSchema.attributes,
      em: ["class"],
      span: ["class", "style"],
      strong: ["class"],
      a: ["href", "title", "class"],
    },
  };

  const getTimestamps = (objectives) => {
    return objectives.flatMap((objective) =>
      objective.evidence_and_analysis.map((evidence) => ({
        timestamp: evidence.timestamp,
        evidence_type: evidence.evidence_type,
      }))
    );
  };

  const timestamps =
    textAnalysisData?.objectives && getTimestamps(textAnalysisData?.objectives); // Extracted intervals as strings
  // console.log("tiemstamp in second: ", timestamps);

  const mapIntervalsToTimeline = (durationInSeconds, intervals, scaleWidth) => {
    if (!Array.isArray(intervals)) {
      console.error("Expected an array for intervals, received:", intervals);
      return []; // Return an empty array if intervals is invalid
    }
    if (!containerRef.current) return []; // Avoid errors if the container is not ready
    const containerWidth = containerRef.current.offsetWidth; // 1317px
    const leftOffsetPixels = containerWidth * 0.1; // 10% offset from the left
    const eachScaleWidth = scaleWidth + 6; // Width of each 20s interval

    return intervals.map((interval) => {
      const [start, end] = interval?.timestamp.split("-").map((time) => {
        const [minutes, seconds] = time.split(":").map(Number);
        return minutes * 60 + seconds; // Convert to seconds
      });

      const startScaleIndex = Math.floor(start / scale); // Which 20s segment this falls in
      const offsetWithinScale = (start % scale) / scale; // Position within the scale (0 to 1)

      // console.log("scaleWidth: ", scaleWidth);
      // Convert to percentage positions on the timeline
      const startPositionPixels = Math.round(
        leftOffsetPixels +
          startScaleIndex * eachScaleWidth +
          offsetWithinScale * eachScaleWidth
      );
      return {
        startPosition: `${startPositionPixels}px`,
        interval,
      };
    });
  };

  const durationInSeconds = videoRef?.current?.duration || 0;
  // console.log("duration in second: ", durationInSeconds);

  const timelineIcons =
    durationInSeconds && timestamps
      ? mapIntervalsToTimeline(durationInSeconds, timestamps, scaleWidth)
      : [];
  console.log("timelineIcons: ", timelineIcons);

  const CustomScale = (props) => {
    const { scale } = props;
    const min = parseInt(scale / 60 + "");
    const second = ((scale % 60) + "").padStart(2, "0");
    return (
      <div className="">
        0{min}:{second}
      </div>
    );
  };

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      console.log("container width: ", containerWidth);
      setScaleWidth(containerWidth / 9);
    }
  }, [containerRef.current]);
  // console.log(
  //   "analysis: ",
  //   textAnalysisData?.communication_pattern?.top_strengths
  // );

  //   const badgeText = "Passed";
  //   const badgeColor = "#71E684";
  return (
    <div className="w-full max-w-[100%] mx-auto text-white">
      <div className="flex flex-col lg:flex-row rounded-[32px] justify-between items-center bg-[#28282A] gap-12 px-8 py-6 text-white mb-4">
        <div className="flex flex-col">
          <div className="flex flex-row items-center">
            <div className=" w-auto h-auto">
              <Badge text={additionalData?.level} />
            </div>
            <div className="ml-4 text-[20px] font-montserrat font-bold leading-[24.38px] text-white">
              Module {mergedVideoData?.spar?.module_id}
            </div>
          </div>
          <div className="flex mt-2 text-[18px] font-montserrat font-normal leading-[21.94px] text-white">
            {mergedVideoData?.spar?.name}
          </div>
        </div>
        {textAnalysisData?.overall_score ? (
          <div className="flex flex-row items-center w-auto">
            <NewStarRating
              rating={calculateStar(textAnalysisData?.overall_score)}
            />
            <div className="ml-6 size-auto">
              <StatusBadge text={badgeText} color={badgeColor} />
            </div>
            {isTrophy === 3 && (
              <div className="ml-6 size-auto">
                <img src={assets.Trophy} alt="" className="w-7 h-9" />
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex flex-row w-auto justify-center items-center  mt-3">
            <div className="mr-1 font-montserrat text-white text-[10px] leading-[12.87px] font-medium ">
              Loading
            </div>
            <CircularProgress style={{ color: "#95eba3" }} size={20} />
          </div>
        ) : null}

        <div className="w-[146px] text-right mt-4 lg:mt-0">
          <span className="text-[15px] font-medium">Time to complete</span>
          {isVideoLoading ? (
            <div className="flex flex-row w-full justify-center items-center  mt-3">
              <div className="mr-1 font-montserrat text-white text-[10px] leading-[12.87px] font-medium ">
                Loading
              </div>
              <CircularProgress style={{ color: "#95eba3" }} size={20} />
            </div>
          ) : (
            <p className="text-base font-bold">
              {videoRef?.current?.duration
                ? sparDurationConversion(videoRef?.current?.duration)
                : "00:00m"}
            </p>
          )}
        </div>
      </div>
      {/* Video part */}
      {(fromRealTimeSpar &&
        isInitialMergeCallComplete &&
        isSecondMergeCallComplete &&
        !videoAvailable &&
        isVideoFileUploaded &&
        !isVideoLoading) ||
        (!fromRealTimeSpar &&
        isInitialMergeCallComplete &&
        !videoAvailable &&
        !isVideoLoading ? (
          ""
        ) : (
          <>
            <div className="flex flex-col items-center rounded-[40px] w-full h-[548px] bg-[#28282A] p-4">
              {videoSrc ? (
                <div className="max-w-[816px] size-auto relative video-preview-wrapper mx-4">
                  {videoSrc && (
                    <video
                      ref={videoRef}
                      onClick={() => handlePauseVideo()}
                      className="w-full h-[323px]"
                      onTimeUpdate={() => handleVideoTimeUpdate()}
                      onLoadedMetadata={() => handleLoadedMetadata()}
                    >
                      <source src={videoSrc} type="video/webm" />
                    </video>
                  )}
                  {!isVideoPlay ? (
                    <div className="flex flex-col items-center justify-center absolute left-1/2 top-24">
                      <button
                        className="mb-4"
                        onClick={() => handlePauseVideo()}
                      >
                        <img src={assets.PlayIcon} alt="" />
                      </button>
                      {/* <span className="text-white">Replay session</span> */}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center left-1/2 top-24 absolute pause-btn-preview">
                      <button
                        className="mb-4"
                        onClick={() => handlePauseVideo()}
                      >
                        <img src={assets.PauseIcon} alt="" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                isVideoLoading && (
                  <div className="flex items-center justify-center w-full h-[337px] bg-[#161618] rounded-[40px] p-4">
                    <div className="flex flex-col justify-center items-center">
                      <CircularProgress
                        size={80}
                        thickness={4}
                        style={{ color: "#71E684" }}
                      />
                      <div className="mt-3 font-montserrat text-white text-[16px] leading-[19.5px] font-normal ">
                        Spar session video is loading...
                      </div>
                    </div>
                  </div>
                )
              )}

              {(isVideoLoading || videoSrc) && (
                <div className="flex relative flex-row w-full px-4">
                  <div className="flex flex-col items-center w-[10%] mt-10">
                    <div
                      className={`flex items-center w-full ${
                        videoSrc ? "mt-6" : "mt-0"
                      }`}
                    >
                      <div className="font-montserrat font-normal text-[20px] leading-[24.38px]">
                        You
                      </div>
                    </div>
                    <div
                      className={`flex items-center w-full ${
                        videoSrc ? "mt-5" : "mt-5"
                      }`}
                    >
                      <div className="font-montserrat font-normal text-[20px] leading-[24.38px]">
                        Avatar
                      </div>
                    </div>
                  </div>
                  {!isVideoLoading && (
                    <div className="absolute flex-grow w-[10%] h-[32px] items-center mt-4 bg-[#3A3A3C]">
                      <div className="flex flex-row mt-1 w-1/5">
                        <div
                          className={`ml-[${
                            scaleWidth < 140 ? "8px" : "12px"
                          }] font-montserrat text-[${
                            scaleWidth < 140 ? "12px" : "17px"
                          }] font-bold leading-[21.94px]`}
                        >
                          Total
                        </div>
                        <div
                          className={`ml-[${
                            scaleWidth < 140 ? "8px" : "12px"
                          }] font-montserrat text-[${
                            scaleWidth < 140 ? "12px" : "17px"
                          }] font-normal leading-[21.94px]`}
                        >
                          {videoRef?.current?.duration
                            ? sparDurationConversion(
                                videoRef?.current?.duration
                              )
                            : "00:00m"}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* <div
            className="w-full border-t my-[10px] absolute bottom-[124px]"
            style={{ borderColor: "#FFFFFF33" }}
          /> */}
                  <div className="timeline-container flex-wrap flex-col w-[90%]">
                    {isVideoLoading ? (
                      <>
                        <div className="flex-grow h-[44px] rounded-2xl bg-[#161618] mt-4"></div>
                        <div className="flex-grow h-[44px] rounded-2xl bg-[#161618] mt-5"></div>
                      </>
                    ) : (
                      <div className="flex-1 mt-4" ref={containerRef}>
                        {mergedVideoData?.spar?.user_audio_timeline &&
                          mergedVideoData?.spar?.avatar_audio_timeline &&
                          videoSrc && (
                            <>
                              <Timeline
                                editorData={
                                  updatedTimeLineConversation?.[0]?.mockData
                                }
                                effects={
                                  updatedTimeLineConversation?.[1]?.mockEffect
                                }
                                rowHeight={12}
                                dragLine={false}
                                disableDrag={true}
                                startLeft={15}
                                autoScroll={false}
                                onScroll={false}
                                onCursorDrag={handleTimelineTimeChange}
                                onActionMoving={handleTimelineTimeChange}
                                ref={timelineState}
                                audioRef={audioRef}
                                scale={scale}
                                scaleSplitCount={5}
                                scaleWidth={scaleWidth - 5}
                                minScaleCount={10}
                                maxScaleCount={10}
                                getScaleRender={(scale) => (
                                  <>
                                    {isVideoLoading ? (
                                      <div className="flex flex-row w-full justify-end items-center mt-0 mr-4">
                                        <CircularProgress
                                          style={{ color: "#95eba3" }}
                                          size={20}
                                        />
                                        <div className="ml-3 font-montserrat text-white text-[16px] leading-[19.5px] font-normal">
                                          Loading
                                        </div>
                                      </div>
                                    ) : (
                                      <CustomScale scale={scale} />
                                    )}
                                  </>
                                )}
                              />

                              {timelineIcons &&
                                timelineIcons.map((icon, index) => (
                                  <div
                                    key={index}
                                    className="absolute"
                                    style={{
                                      left: icon.startPosition, // Start of the interval
                                      width: "28px",
                                      height: "28px",
                                      top: "44%",
                                      // transform: "translateY(-50%)",
                                    }}
                                  >
                                    <img
                                      src={
                                        icon?.interval?.evidence_type ===
                                        "positive"
                                          ? assets.GreenThumbUp
                                          : assets.RedThumbDown
                                      } // Your thumbs-up icon asset
                                      alt="Thumbs Up"
                                      className="w-7 h-7"
                                    />
                                  </div>
                                ))}
                            </>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="w-full my-8 flex items-center">
              <span className="flex-grow h-px border-t border-[#FFFFFF33]"></span>
              <span className="shrink-0 px-4 text-[18px] leading-[21.94px] text-white font-bold flex items-center gap-4">
                More Details
              </span>
              <span className="flex-grow h-px border-t border-[#FFFFFF33]"></span>
            </div>
          </>
        ))}

      {/* AI Feedback */}
      <div className="flex flex-row rounded-[32px] w-full h-[290px] bg-[#28282A] p-6">
        <div className="w-1/5">
          <div className="flex flex-col justify-center items-center h-full">
            <div className="relative w-[112px] h-[112px] rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-black rounded-full" />
              <img
                src={assets.Henry}
                alt=""
                className="relative z-10 object-cover w-full h-full rounded-full"
              />
            </div>
            <div className="font-manrope text-[20px] font-bold leading-[27.32px] mt-4">
              Sales coach feedback
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center w-4/5 h-full bg-[#28282A] rounded-[40px] p-4">
            <div className="flex flex-col justify-center items-center">
              <CircularProgress
                size={80}
                thickness={4}
                style={{ color: "#71E684" }}
              />
              <div className="mt-3 font-montserrat text-white text-[16px] leading-[19.5px] font-normal ">
                Feedback is loading...
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-end items-end w-4/5 gap-4">
            <div className="w-1/2 h-[242px] rounded-3xl border border-[#FFFFFF33] p-6 ">
              <div className="flex flex-row w-full items-center justify-center ">
                <img
                  src={assets.tickCircle}
                  alt=""
                  className="relative z-10 object-cover w-6 h-6 rounded-full"
                />
                <span className="ml-2 font-montserrat text-[18px] font-bold leading-[21.94px] text-[#71E684]">
                  Positive Aspects
                </span>
              </div>
              <div className="flex flex-col mt-4">
                <span className="font-inter text-[16px] font-light leading-[22.4px]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}
                    components={{
                      strong: ({ node, ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal list-inside ml-4"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="leading-normal pl-2" {...props} />
                      ),
                    }}
                  >
                    {formatFeedbackText(
                      textAnalysisData?.communication_pattern?.top_strengths
                    )}
                  </ReactMarkdown>
                </span>
              </div>
            </div>
            <div className="w-1/2 h-[242px] rounded-3xl border border-[#FFFFFF33] p-6 overflow-hidden">
              <div className="flex flex-row w-full items-center justify-center">
                <img
                  src={assets.crossCircle}
                  alt=""
                  className="relative z-10 object-cover w-6 h-6 rounded-full"
                />
                <span className="ml-2 font-montserrat text-[18px] font-bold leading-[21.94px] text-[#FC5858]">
                  Areas for Improvements
                </span>
              </div>
              <div className="flex flex-col mt-4 overflow-y-auto max-h-[140px] custom-scrollbar">
                <span className="font-inter text-[16px] font-light leading-[22.4px]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}
                    components={{
                      strong: ({ node, ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal list-inside ml-4"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="leading-normal pl-2" {...props} />
                      ),
                    }}
                  >
                    {formatFeedbackText(
                      textAnalysisData?.communication_pattern?.growth_areas
                    )}
                  </ReactMarkdown>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* End AI Feedback */}
      {/* Audio analysis starts */}
      <div className="w-full pt-4">
        {rows &&
          rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex flex-wrap ${
                row.length === 2 ? "justify-center" : "justify-between"
              } gap-4 pb-4`}
            >
              {row.map((metric, index) => {
                return (
                  <AudioAnalysisData
                    key={index}
                    title={metric?.title}
                    number={metric?.score}
                    loading={isLoading}
                    info={`Dynamic information for ${metric?.analysis}`}
                    data={!_.isEmpty(textAnalysisData)}
                  />
                );
              })}
            </div>
          ))}
      </div>
      {/* Objectives start */}
      {textAnalysisData?.objectives && (
        <div className="flex flex-col w-full mt-4">
          <ObjectivesAccordian
            item={textAnalysisData?.objectives}
            onPlayClick={handlePlayFromTimestamp} // Pass the function as a prop
            onScrollToTop={scrollToTop} // Pass scroll-to-top function as a prop
          />
        </div>
      )}
      <div className="flex flex-row justify-between gap-4 w-full mt-4">
        <div className="w-1/2 h-[307px] rounded-[32px] bg-[#28282A] p-6">
          <span className="font-montserrat text-[20px] font-bold leading-[24.38px] text-white">
            Recommended next steps
          </span>
          <div className="flex flex-col mt-4">
            <span className="font-montserrat text-[16px] font-light leading-[19.5px] text-white">
              Coming soon
            </span>
            {/* <span className="font-montserrat text-[16px] font-light leading-[19.5px] text-white">
              Complete Product Knowledge Training Module
            </span>
            <span className="font-montserrat text-[16px] font-light leading-[19.5px] text-white">
              Complete Product Knowledge Training Module
            </span>
            <span className="font-montserrat text-[16px] font-light leading-[19.5px] text-white">
              Complete Product Knowledge Training Module
            </span> */}
          </div>
        </div>
        <div className="flex flex-col w-1/2 h-[307px] rounded-[32px] bg-[#28282A] p-6">
          <div className="font-montserrat font-bold text-[20px] leading-[24.38px] ">
            Customer satisfaction Score
          </div>
          <div className="flex justify-center items-end size-full">
            <HalfDonutChart value={70} />
          </div>
        </div>
      </div>
      <div className="mt-4 mb-4 rounded-2xl bg-[#161618] border border-dashed border-[#71E684] gap-12 px-8 py-6 text-white flex items-center">
        <div className="flex items-center justify-between w-full">
          <h4 className="text-[20px] font-bold leading-[24.38px] font-montserrat text-white ">
            Body language analysis
          </h4>
          <div>
            <Button className="bg-[#71E684] w-[184px] h-[44px] px-3 py-2 text-[18px] font-manrope leading-[24.59px] font-bold text-[#292929] rounded-[34px]">
              Coming soon
            </Button>
          </div>
        </div>
      </div>
      {showModal && (
        <ResultModal
          onClick={() => setShowModal(!showModal)}
          result={textAnalysisData}
        />
      )}
    </div>
  );
};
export default NewReport;
