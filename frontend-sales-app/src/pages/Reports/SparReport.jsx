import { useEffect, useRef, useState } from "react";
import ProgressData from "./ProgressData"; //
import ReactApexChart from "react-apexcharts";
import assets from "../../constants/assets";
import Button from "../../component/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { Timeline } from "@xzdarcy/react-timeline-editor";
import {
  calculateStar,
  checkGradeColor,
  checkGradeLevelText,
  configSatisfactionChart,
  createConfigSatisfactionChartOption,
  createConfigSatisfactionChartSeries,
  jsonParseCoversion,
  mergeTimelines,
  sparDurationConversion,
} from "../../utils/constant";
import AudioAnalysisData from "./AudioAnalysisData"; //
import Skeleton from "@mui/material/Skeleton";
import FeedbackItems from "./FeedbackItems"; //
import ServerErrorModel from "../../component/Modal/ServerErrorModel";
import CommonModel from "../../component/Modal/CommonModel";
import {
  postMergeVideo,
  getVideoMergeData,
  getAnalysisData,
} from "../../../store/thunk/statesThunk";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import StarRating from "../../component/Star/StarRating";
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
const SparReport = () => {
  const [showConfetti, setShowConfetti] = useState(false);
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
  // console.log("stat page location: ", url);
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
  const videoRef = useRef(null);
  const timelineState = useRef();
  const audioRef = useRef(null);
  const isVideoSrcSetRef = useRef(false);
  // console.log("video data: ", mergedVideoData);

  const updatedTimeLineConversation =
    mergedVideoData?.spar?.user_audio_timeline &&
    mergedVideoData?.spar?.avatar_audio_timeline &&
    mergeTimelines(mergedVideoData, timeLineConversation);
  // console.log(
  //   "userTimeLineConversation: ",
  //   mergedVideoData?.spar?.user_audio_timeline
  // );
  // console.log(
  //   "avatarTimeLineConversation: ",
  //   mergedVideoData?.spar?.avatar_audio_timeline
  // );
  // console.log("merge data: ", mergedVideoData);

  var audioAnalysisData =
    analysisData?.audio_analysis &&
    jsonParseCoversion(analysisData?.audio_analysis);
  var textAnalysisData =
    analysisData?.text_analysis &&
    jsonParseCoversion(analysisData?.text_analysis);
  const feedback = textAnalysisData?.feedback || {};
  const grades = textAnalysisData?.grades || {};
  // console.log(" analysis data: ", audioAnalysisData);

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

  const getVideoMergeStatus = () => {
    if (abortController.current.signal.aborted) return;
    setIsVideoLoading(true);
    dispatch(getVideoMergeData(sparId))
      .then((response) => {
        const videoMergingState =
          response?.payload?.data?.spar?.video_merging_state;
        setMergeStatus(videoMergingState);
        if (videoMergingState === "finished") {
          setMergedVideoData(response.payload.data);
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
          // if(isInitialFailure){
          // }
        } else {
          setTimeout(getVideoMergeStatus, 10000); // Continue polling for in-progress states
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
    getVideoMergeStatus();

    return () => {
      // Abort only when component unmounts or sparId changes
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [sparId]);
  useEffect(() => {
    if (isVideoFileUploaded) {
      console.log("Video uploaded:", isVideoFileUploaded);
      dispatch(postMergeVideo({ id: sparId }))
        .then((res) => {
          if (res?.payload?.status === 200) {
            getVideoMergeStatus(); // Start or continue polling
          }
        })
        .catch((error) => {
          console.error("Error in postMergeVideo:", error);
        });
    }
  }, [isVideoFileUploaded]);

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

  const timeRender = (time) => {
    // Extract minutes and seconds
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    // Format seconds with leading zero if necessary
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    // Return formatted time
    return `${minutes}:${formattedSeconds} m`;
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
      setScale(parseInt(duration / 7.2));
    }
  };

  const fillerWords = audioAnalysisData?.filler_words?.user;
  const speechRate = audioAnalysisData?.speech_rate?.user;
  const formattedSpeechRate =
    speechRate !== undefined && speechRate < 500 ? speechRate.toFixed(0) : 0;
  const languageComplexity = audioAnalysisData?.language_complexity?.user;
  const totalSpeakingTime = audioAnalysisData?.total_speaking_time
    ? audioAnalysisData?.total_speaking_time.user.toFixed(0) + "%"
    : "0";

  const badgeText = checkGradeLevelText(analysisData?.rating);
  const badgeColor = checkGradeColor(analysisData?.rating);
  // const badgeText = checkGradeLevelText(80);
  // const badgeColor = checkGradeColor(80);
  // console.log("text and color: ", badgeText, badgeColor);

  useEffect(() => {
    if ((badgeText === "Passed" || badgeText === "Acceptable") && !isLoading) {
      setShowConfetti(true);
      playPassed();
    }
    if (badgeText === "Failed" || badgeText === null) {
      setShowConfetti(false);
      playFailed();
    }
  }, [isLoading, textAnalysisData?.grades?.general]);
  function preprocessMarkdownText(markdownText) {
    return markdownText
      .split("\n")
      .map((line) => {
        // Regular expression to match "- **Heading:**" format at the beginning of the line
        const headingPattern = /^-\s*(\*\*[^*]+?\*\*):/;

        // Only modify lines that match the heading pattern
        if (headingPattern.test(line.trim())) {
          return line.replace(/^-+\s*/, ""); // Remove leading hyphen and spaces
        }
        return line; // Leave other lines as they are
      })
      .join("\n");
  }
  const formatFeedbackText = (text) => {
    if (!text) {
      return "N/A";
    }
    // let formattedText = preprocessMarkdownText(text);
    // console.log("after process: ", formattedText);

    // Replace <bold> tags with markdown bold syntax
    let formattedText = text.replace(/<bold>(.*?)<\/bold>/g, "**$1**");

    // Normalize line breaks: replace multiple consecutive newlines with a single newline
    formattedText = formattedText.replace(/\n\n+/g, "\n");

    // Replace dots (•) with hyphens (-) for list items
    formattedText = formattedText.replace(/(?:^|\n)\s*•/g, "\n-");

    // Remove hyphens before headings (e.g., **Positive Aspects:**)
    formattedText = formattedText.replace(
      /(^|\n)-\s*(\*\*[^*]+?\*\*:)/g,
      "$1$2"
    );

    // Ensure proper spacing for markdown parsing
    formattedText = formattedText.replace(/(^|\n)(\*\*[^*]+?\*\*:)/g, "$1\n$2");

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

  return (
    <>
      {showConfetti && !isLoading && <Confetti recycle={false} />}
      <div className="w-full max-w-[90%] mx-auto">
        <div className="custom-box flex flex-col lg:flex-row rounded-2xl justify-between items-center bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-6 py-6 text-white mb-4">
          <div className="flex flex-col ">
            <p className="font-montserrat text-[18px] leading-[21.94px] font-bold">
              Module {mergedVideoData?.spar?.module_id}
            </p>
            <p className="font-montserrat text-white text-[16px] leading-[19.5px] font-normal">
              {mergedVideoData?.spar?.name}
            </p>
          </div>
          <div className="w-[281.64px] h-[62px] flex justify-start items-center mt-4 lg:mt-0">
            <StarRating rating={calculateStar(mergedVideoData?.spar?.rating)} />
            {isLoading ? (
              <div className="flex flex-row w-full justify-center items-center  mt-3">
                <div className="mr-1 font-montserrat text-white text-[10px] leading-[12.87px] font-medium ">
                  Loading
                </div>
                <CircularProgress style={{ color: "#95eba3" }} size={20} />
              </div>
            ) : (
              <div className=" w-[149.64px] h-[62px] ml-8">
                <StatusBadge text={badgeText} color={badgeColor} />
              </div>
            )}
          </div>
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

        {/* {!_.isEmpty(mergedVideoData) &&
        mergedVideoData?.spar?.user_audio_timeline &&
        mergedVideoData?.spar?.avatar_audio_timeline &&
        mergedVideoData?.merged_video_url !== "" ? ( */}
        <>
          <div className="rounded-2xl bg-[#161616] mb-4">
            {videoSrc ? (
              <div className="bg-[#161616] max-w-[816px] relative mx-auto video-preview-wrapper">
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
                  <div className="absolute -translate-x-2/4 -translate-y-2/4 flex flex-col items-center left-2/4 top-2/4">
                    <button className="mb-4" onClick={() => handlePauseVideo()}>
                      <img src={assets.PlayIcon} alt="" />
                    </button>
                    <span className="text-white">Replay session</span>
                  </div>
                ) : (
                  <div className="absolute -translate-x-2/4 -translate-y-2/4 flex flex-col items-center left-2/4 top-2/4 pause-btn-preview">
                    <button className="mb-4" onClick={() => handlePauseVideo()}>
                      <img src={assets.PauseIcon} alt="" />
                    </button>
                  </div>
                )}
              </div>
            ) : isVideoLoading ||
              mergedVideoData?.spar?.video_merging_state !== "failed" ? (
              <div className="flex justify-center relative">
                <Skeleton
                  sx={{
                    height: 323,
                    background: "#00000080",
                  }}
                  width={"816px"}
                  variant="rectangular"
                  className="wave"
                />
                {isVideoLoading && (
                  <div className="flex absolute flex-row w-full justify-center items-center mt-3 top-32">
                    <div className="mr-1 font-montserrat text-white text-[10px] leading-[12.87px] font-medium ">
                      Loading
                    </div>
                    <CircularProgress style={{ color: "#95eba3" }} size={20} />
                  </div>
                )}
              </div>
            ) : null}
          </div>
          {isVideoLoading ||
          (mergedVideoData?.spar?.avatar_audio_timeline !== null &&
            mergedVideoData?.spar?.user_audio_timeline !== null &&
            mergedVideoData?.merged_video_url) ? (
            <div className="custom-box rounded-2xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-6 py-6 text-white  mb-4">
              <div className="flex items-center justify-between w-full">
                <h4 className="text-[22px] font-bold">Conversation timeline</h4>
                <div className="flex">
                  {isVideoLoading ? (
                    <div className="flex flex-row w-full justify-center items-center  mt-3">
                      <div className="mr-1 font-montserrat text-white text-[10px] leading-[12.87px] font-medium ">
                        Loading
                      </div>
                      <CircularProgress
                        style={{ color: "#95eba3" }}
                        size={20}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="mr-3 pr-3 border-r border-[#FFFFFF4D] text-[15px] font-medium">
                        {timeRender(time)}
                      </p>
                      <p className="text-[15px] font-medium">
                        {videoRef?.current?.duration
                          ? sparDurationConversion(videoRef?.current?.duration)
                          : "00:00m"}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex pt-4">
                <div className="flex w-full">
                  <div
                    className={`flex flex-col gap-[20px] justify-center
                ${
                  mergedVideoData?.spar?.user_audio_timeline &&
                  mergedVideoData?.spar?.avatar_audio_timeline
                    ? "w-auto"
                    : "w-full"
                }
                `}
                  >
                    <div className="flex items-center w-full">
                      <div className="min-w-[140px] font-normal text-[18px]">
                        You
                      </div>
                      <div className="flex-grow h-[15px] bg-[#1C1C1C] mt-2"></div>
                    </div>
                    <div className="flex items-center w-full">
                      <div className="min-w-[140px] font-normal text-[18px]">
                        Avatar
                      </div>
                      <div className="flex-grow h-[15px] bg-[#1C1C1C] mt-2"></div>
                    </div>
                  </div>

                  <div className="flex-1">
                    {mergedVideoData?.spar?.user_audio_timeline &&
                      mergedVideoData?.spar?.avatar_audio_timeline && (
                        <Timeline
                          editorData={
                            updatedTimeLineConversation?.[0]?.mockData
                          }
                          effects={updatedTimeLineConversation?.[1]?.mockEffect}
                          rowHeight={15}
                          dragLine={true}
                          disableDrag={true}
                          startLeft={5}
                          autoScroll={false}
                          onScroll={false}
                          onCursorDrag={handleTimelineTimeChange}
                          onActionMoving={handleTimelineTimeChange}
                          ref={timelineState}
                          audioRef={audioRef}
                          scale={scale}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
        {/* Detail container */}
        <div className="w-full my-8 flex items-center">
          <span className="flex-grow h-px border-t border-dashed border-[#FFFFFF63]"></span>
          <span className="shrink-0 px-4 text-[19px] text-white font-bold flex items-center gap-4">
            Feedback
          </span>
          <span className="flex-grow h-px border-t border-dashed border-[#FFFFFF63]"></span>
        </div>
        {/* AI trainer feedback */}
        <div className="custom-box rounded-2xl mb-8 bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-6 py-6 text-white">
          <div className="flex flex-col">
            <div className="flex justify-center items-center h-full">
              <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-black rounded-full" />
                <img
                  src={additionalData?.url}
                  alt=""
                  className="relative z-10 object-cover w-full h-full rounded-full"
                />
              </div>
            </div>
            <p className="text-white text-center font-montserrat leading-[26.82px] text-[22px] font-bold mt-4">
              AI trainer feedback
            </p>
            {isLoading ? (
              <div className="flex flex-row w-full justify-center items-center  mt-3">
                <div className="mr-1 font-montserrat text-[10px] leading-[12.87px] font-medium ">
                  Loading
                </div>
                <CircularProgress style={{ color: "#95eba3" }} size={20} />
              </div>
            ) : textAnalysisData?.summary ? (
              <span className="mt-3 text-white text-left font-montserrat leading-[21.94px] tracking-wide font-light text-[18px]">
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
                  {formatFeedbackText(textAnalysisData?.summary)}
                </ReactMarkdown>
              </span>
            ) : (
              <div className="text-white text-[18px] font-bold">N/A</div>
            )}
          </div>
        </div>

        <div className="custom-box p-8 mb-8">
          <div>
            <h4 className="text-white text-[18px] font-montserrat leading-[21.94px] font-bold mb-8">
              Feedback by objectives
            </h4>
            {isLoading ? (
              <div className="flex flex-row w-full justify-center items-center  mt-3">
                <div className="mr-1 font-montserrat text-white text-[10px] leading-[12.87px] font-medium ">
                  Loading
                </div>
                <CircularProgress style={{ color: "#95eba3" }} size={20} />
              </div>
            ) : _.size(feedback) > 0 ? (
              <div className="topics-feedback-container">
                {Object.keys(feedback).map((key, index) => (
                  <FeedbackItems
                    key={index}
                    title={key}
                    description={feedback[key]}
                    number={grades[key]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-white text-[18px] font-bold">N/A</div>
            )}
          </div>
        </div>

        <div className="max-w-full mb-8 w-full">
          <div className="custom-box">
            <ProgressData
              audioAnalysisData={audioAnalysisData}
              textAnalysisData={textAnalysisData}
              loading={isLoading}
            />
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-wrap lg:flex-nowrap feedback-container gap-4">
            <div className="max-w-full w-full">
              {textAnalysisData?.avatar_assistant_satisfaction_grades &&
              !_.isEmpty(
                textAnalysisData?.avatar_assistant_satisfaction_grades
              ) ? (
                <div className="custom-box rounded-2xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-8 py-6 text-white mb-8">
                  <div className="flex items-center justify-between w-full">
                    <h4 className="text-[22px] font-bold">
                      Customer satisfaction curve
                    </h4>
                  </div>
                  <div className="relative pl-3.5">
                    <div className="absolute h-full flex flex-col justify-between px-0 py-[18px] left-0">
                      <img src={assets.FaceIcon} alt="" />
                      <img src={assets.FaceIcon1} alt="" />
                      <img src={assets.FaceIcon2} alt="" />
                    </div>
                    {configSatisfactionChart && textAnalysisData && (
                      <ReactApexChart
                        options={createConfigSatisfactionChartOption(
                          textAnalysisData || []
                        )}
                        series={createConfigSatisfactionChartSeries(
                          textAnalysisData || []
                        )}
                        type="line"
                        height={350}
                      />
                    )}
                  </div>
                </div>
              ) : null}
              <div className="w-full">
                <div className="flex flex-wrap gap-4 mb-[34px]">
                  <AudioAnalysisData
                    title={"Total number of fillers words"}
                    number={fillerWords}
                    loading={isLoading}
                    info={
                      "Counts the number of filler words like 'um', 'uh', etc"
                    }
                    data={!_.isEmpty(audioAnalysisData)}
                  />
                  <AudioAnalysisData
                    title={"Average number of words per minute"}
                    number={formattedSpeechRate}
                    loading={isLoading}
                    info={
                      "Measures your speaking speed in words per minute (WPM), calculated by dividing the total words spoken by the minutes spent talking"
                    }
                    data={!_.isEmpty(audioAnalysisData)}
                  />
                  <AudioAnalysisData
                    title={"Total number of unique words"}
                    number={languageComplexity}
                    loading={isLoading}
                    info={
                      "Shows the number of different words you used during your speech"
                    }
                    data={!_.isEmpty(audioAnalysisData)}
                  />
                  <AudioAnalysisData
                    title={"Your speaking time"}
                    number={totalSpeakingTime}
                    loading={isLoading}
                    info={
                      "Displays the share of your speaking time compared to the total speaking time of both participants"
                    }
                    data={!_.isEmpty(audioAnalysisData)}
                  />
                </div>
              </div>
              <div className="custom-box mb-8 rounded-2xl bg-[linear-gradient(128deg, #333 0%, #232323 100%)] border border-dashed border-[#B0B0B0] custom-border gap-12 px-8 py-6 text-white flex items-center">
                <div className="flex items-center justify-between w-full">
                  <h4 className="text-[22px] font-bold leading-[26.82px] font-montserrat tracking-[0.22px] text-white opacity-40 ">
                    Body language analysis
                  </h4>
                  <div>
                    <Button className="bg-[#19DBAD] px-3 py-2 text-[11px] font-bold text-[#292929] rounded-[34px]">
                      Coming soon
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <LoaderModal isVisible={showLoadingModel}>
        <ModuleLoading type="error" />
      </LoaderModal> */}
      {serverErrorModal && (
        <CommonModel isVisible={true} serverErrorModal={serverErrorModal}>
          <ServerErrorModel />
        </CommonModel>
      )}
    </>
  );
};

export default SparReport;
