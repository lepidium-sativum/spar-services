import React, { useEffect, useRef, useState, useCallback } from "react";
import ProgressData from "./ProgressData";
import ReactApexChart from "react-apexcharts";
import assets from "../../../constants/assets";
import Button from "../../../component/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { Timeline } from "@xzdarcy/react-timeline-editor";
import LoaderModal from "../../../component/Modal/LoaderModal";
import ModuleLoading from "./ModuleLoading";
import {
  checkGradeLevel,
  checkGradeLevelText,
  createConfigSatisfactionChartOption,
  createConfigSatisfactionChartSeries,
  jsonParseCoversion,
  mergeTimelines,
  sparDurationConversion,
} from "../../../utils/constant";
import AudioAnalysisData from "./AudioAnalysisData";
import Skeleton from "@mui/material/Skeleton";
import FeedbackItems from "./FeedbackItems";
import {
  postMergeVideo,
  getVideoMergeData,
  getAnalysisProcessData,
} from "../../../../store/thunk/commonThunk";
import {
  setAnalysisProcessData,
  setShowLoadingModel,
  setVideoMergeData,
} from "../../../../store/slices/commonSlice";
import { useLocation, useNavigate } from "react-router-dom";
import _ from "lodash";
import ConversionModal from "../../../component/Modal/ConversionModel";

const MyStats = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const analysisId = location.state?.analysisId;
  const sparId = location.state?.sparId;
  const user_id = location.state?.userId;
  const feedbackData = useSelector((state) => state.commonReducer.feedbackData);
  const showLoadingModel = useSelector(
    (state) => state.commonReducer.showLoadingModel
  );

  const [videoSrc, setVideoSrc] = useState(null);
  const [isVideoPlay, setIsVideoPlay] = useState(false);
  const [time, setTime] = useState(0);
  const [scale, setScale] = useState();
  const abortControllerRef = useRef(new AbortController());
  const [error, setError] = useState(false);
  const [mergedVideoData, setMergedVideoData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [conversation, setConversation] = useState([]);

  const videoRef = useRef(null);
  const timelineState = useRef();
  const audioRef = useRef(null);
  const isVideoSrcSetRef = useRef(false);

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

  const updatedTimeLineConversation =
    mergedVideoData?.spar?.user_audio_timeline &&
    mergedVideoData?.spar?.avatar_audio_timeline &&
    mergeTimelines(mergedVideoData, timeLineConversation);
  console.log("updatedTimeLineConversation: ", updatedTimeLineConversation);
  console.log("merg video data: ", mergedVideoData);

  const audioAnalysisData =
    analysisData?.audio_analysis &&
    jsonParseCoversion(analysisData?.audio_analysis);
  const textAnalysisData =
    analysisData?.text_analysis &&
    jsonParseCoversion(analysisData?.text_analysis);
  // console.log("text analysis data: ", textAnalysisData);
  // console.log("Audio analysis data: ", audioAnalysisData);
  useEffect(() => {
    if (mergedVideoData?.merged_video_url && !isVideoSrcSetRef.current) {
      setVideoSrc(mergedVideoData.merged_video_url);
      isVideoSrcSetRef.current = true; // Mark as set
    }
  }, [mergedVideoData?.merged_video_url]);

  useEffect(() => {
    const abortController = abortControllerRef.current;

    const checkAnalysisStatus = async () => {
      try {
        if (analysisId) {
          const response = await dispatch(getAnalysisProcessData(analysisId), {
            signal: abortController.signal,
          });

          if (response?.payload?.status === 200) {
            const state = response?.payload?.data?.state;

            if (state === "finished") {
              dispatch(setAnalysisProcessData(response?.payload?.data));
              setAnalysisData(response?.payload?.data);
              dispatch(setShowLoadingModel(false));
            } else if (state === "failed" || state === null) {
              abortController.abort(); // Abort if state is "failed" or null
            } else {
              setTimeout(checkAnalysisStatus, 3000); // Poll every 3 seconds
            }
          } else {
            dispatch(setShowLoadingModel(false)); // Stop loading if the response is not successful
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    const videoMergingStatus = async () => {
      try {
        const response = await dispatch(
          getVideoMergeData({
            sparId: parseInt(sparId),
            userId: parseInt(user_id),
          }),
          {
            signal: abortController.signal,
          }
        );

        const videoMergingState =
          response?.payload?.data?.spar?.video_merging_state;

        if (videoMergingState === "finished") {
          dispatch(setVideoMergeData(response?.payload?.data));
          setMergedVideoData(response?.payload?.data);
          dispatch(setShowLoadingModel(false)); // Stop loading
        } else if (
          videoMergingState === null ||
          videoMergingState === "failed"
        ) {
          abortController.abort(); // Abort if merging state is null or failed
        } else if (response?.payload === 404) {
          setError(true);
          callPostMergeVideo(); // Call merge video function
        } else {
          setTimeout(videoMergingStatus, 10000); // Poll every 10 seconds
        }
      } catch (error) {
        dispatch(setShowLoadingModel(false)); // Stop loading if error occurs
        console.error(error);
      }
    };

    const callPostMergeVideo = async () => {
      if (error) {
        try {
          const res = await dispatch(postMergeVideo(parseInt(sparId)));
          if (res?.payload?.status === 200) {
            setError(false);
            videoMergingStatus(); // Retry video merging status after successful post
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    // Start status checks
    checkAnalysisStatus();
    videoMergingStatus();

    // Cleanup on unmount
    return () => {
      abortController.abort();
    };
  }, [dispatch, analysisId, sparId, error, user_id]);

  const handlePauseVideo = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      timelineState.current.play({ autoEnd: true });
      setIsVideoPlay(true);
    } else {
      videoRef.current.pause();
      timelineState.current.pause();
      setIsVideoPlay(false);
    }
  };

  const timeRender = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${formattedSeconds} m`;
  };

  const handleTimelineTimeChange = (time) => {
    if (videoRef.current && videoRef.current.currentTime !== time) {
      setTime(time);
      videoRef.current.currentTime = time;
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && timelineState.current) {
      const currentTime = videoRef.current.currentTime;
      setTime(currentTime);
      // console.log("handleVideoTimeUpdate: ", currentTime);
      if (timelineState.current.getTime() !== currentTime) {
        timelineState.current.setTime(currentTime);
      }
    }
  };

  const handleLoadedMetadata = () => {
    // console.log("handleLoadedMetadata: ", videoRef?.current?.duration);
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
  // console.log("data: ", mergedVideoData?.spar?.conversation);
  const handleOpenModal = (data) => {
    setConversation(data);
    setIsOpenModal(true);
  };
  return (
    <>
      <div className="w-full h-screen max-w-[1499px]">
        <div className="custom-box rounded-2xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-8 py-6 text-white flex items-center mb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-row">
              <div className="flex justify-start mr-5">
                <img
                  src={assets.backWhite}
                  alt="Go Back"
                  className="w-[30px] h-[30px] mt-2"
                  onClick={() => navigate(-1)}
                />
              </div>
              <div>
                <p className="text-2xl font-extrabold">Spar result</p>
                <span className="text-2xl font-normal">Module</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="font-extrabold text-[22px] text-[#5F5F5F]">
                <strong className="text-[36px] text-primaryLight">
                  {textAnalysisData?.grades?.general}
                </strong>
                /100
              </span>
              <div
                className={`${checkGradeLevel(
                  textAnalysisData?.grades?.general
                )} w-[150px] h-[72.99px] rounded-2xl flex justify-center items-center`}
              >
                <span className="text-black font-extrabold">{`${checkGradeLevelText(
                  textAnalysisData?.grades?.general
                )}`}</span>
              </div>
              <span
                onClick={() =>
                  handleOpenModal(
                    JSON.parse(mergedVideoData?.spar?.conversation)
                  )
                }
                className="underline cursor-pointer"
              >
                Transcript
              </span>
            </div>
            <div className="text-right">
              <span className="text-[15px] font-medium">Time to complete</span>
              <p className="text-base font-bold">
                {videoRef?.current?.duration
                  ? sparDurationConversion(videoRef?.current?.duration)
                  : "00:00m"}
              </p>
            </div>
          </div>
        </div>
        {!_.isEmpty(mergedVideoData) &&
        mergedVideoData?.spar?.video_merging_state === "finished" ? (
          <>
            <div className="rounded-2xl bg-[#161616] mb-4">
              {videoSrc ? (
                <div className="bg-[#161616] max-w-[816px] relative mx-auto video-preview-wrapper">
                  <video
                    ref={videoRef}
                    onClick={handlePauseVideo}
                    className="w-full h-[323px]"
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                  >
                    <source src={videoSrc} type="video/webm" />
                  </video>
                  {!isVideoPlay ? (
                    <div className="absolute -translate-x-2/4 -translate-y-2/4 flex flex-col items-center left-2/4 top-2/4">
                      <button className="mb-4" onClick={handlePauseVideo}>
                        <img src={assets.PlayIcon} alt="" />
                      </button>
                      <span className="text-white">Replay session</span>
                    </div>
                  ) : (
                    <div className="absolute -translate-x-2/4 -translate-y-2/4 flex flex-col items-center left-2/4 top-2/4 pause-btn-preview">
                      <button className="mb-4" onClick={handlePauseVideo}>
                        <img src={assets.PauseIcon} alt="" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Skeleton
                  sx={{ height: 190 }}
                  width={"100%"}
                  animation="wave"
                  variant="rectangular"
                  className="wave"
                />
              )}
            </div>
            <div className="custom-box rounded-2xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-8 py-6 text-white  mb-4">
              <div className="flex items-center justify-between w-full">
                <h4 className="text-[22px] font-bold">Conversation timeline</h4>
                <div className="flex">
                  <p className="mr-3 pr-3 border-r border-[#FFFFFF4D] text-[15px] font-medium">
                    {timeRender(time)}
                  </p>
                  <p className="text-[15px] font-medium">
                    {videoRef?.current?.duration
                      ? sparDurationConversion(videoRef?.current?.duration)
                      : "00:00m"}
                  </p>
                </div>
              </div>
              <div className="pt-4">
                {mergedVideoData?.spar?.user_audio_timeline &&
                mergedVideoData?.spar?.avatar_audio_timeline ? (
                  <div className="flex">
                    <div className="flex flex-col gap-[20px] justify-center flex-[0_0_100px]">
                      <span className="font-normal text-[18px]">You</span>
                      <span className="font-normal text-[18px]">Avatar</span>
                    </div>
                    <div className="pl-4 flex-1">
                      <>
                        {/* {console.log(
                          "timeline: ",
                          mergedVideoData?.spar?.user_audio_timeline,
                          mergedVideoData?.spar?.avatar_audio_timeline
                        )} */}
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
                      </>
                    </div>
                  </div>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </>
        ) : null}

        <div>
          <span className="flex items-center my-8">
            <span className="h-px flex-1 border border-dashed border-[#FFFFFF63]"></span>
            <span className="shrink-0 px-4 text-[19px] text-white font-bold flex items-center gap-4">
              Details <img src={assets.ExpandIcon} alt="" />
            </span>
            <span className="h-px flex-1 border border-dashed border-[#FFFFFF63]"></span>
          </span>
        </div>
        <div className="w-full">
          <div className="flex gap-4 mb-[34px]">
            <AudioAnalysisData
              title={"Total number of fillers words"}
              number={fillerWords}
              info={"Counts the number of filler words like 'um', 'uh', etc"}
              data={!_.isEmpty(audioAnalysisData) ? true : false}
            />
            <AudioAnalysisData
              title={"Average number of words per minute"}
              number={formattedSpeechRate}
              info={
                "Measures your speaking speed in words per minute (WPM), calculated by dividing the total words spoken by the minutes spent talking"
              }
              data={!_.isEmpty(audioAnalysisData) ? true : false}
            />
            <AudioAnalysisData
              title={"Total number of unique words"}
              number={languageComplexity}
              info={
                "Shows the number of different words you used during your speech"
              }
              data={!_.isEmpty(audioAnalysisData) ? true : false}
            />
            <AudioAnalysisData
              title={"Your speaking time"}
              number={totalSpeakingTime}
              info={
                "Displays the share of your speaking time compared to the total speaking time of both participants"
              }
              data={!_.isEmpty(audioAnalysisData) ? true : false}
            />
          </div>
        </div>

        <div className="w-full">
          <div className="flex feedback-container">
            <div className="max-w-[900px] w-full">
              <div className="custom-box p-8 mb-8">
                <div className="text-center mb-8">
                  <div className="w-[70px] h-[70px] rounded-[50%] mx-auto mb-4">
                    <img
                      src={assets.AiAvatarIcon}
                      alt=""
                      className="w-[70px] h-[70px] rounded-[50%] object-cover"
                    />
                  </div>
                  <p className="text-white text-[22px] font-bold mb-3">
                    AI trainer feedback
                  </p>
                  <span className="text-white text-[18px]">
                    {feedbackData?.description}
                  </span>
                </div>

                <div>
                  <h4 className="text-white text-[18px] font-bold mb-8">
                    Feedback by topics
                  </h4>
                  <div className="topics-feedback-container">
                    <FeedbackItems
                      title={"Attitude"}
                      description={textAnalysisData?.feedback?.attitude}
                      number={textAnalysisData?.grades?.attitude}
                    />
                    <FeedbackItems
                      title={"Knowledge"}
                      description={textAnalysisData?.feedback?.knowledge}
                      number={textAnalysisData?.grades?.knowledge}
                    />
                    <FeedbackItems
                      title={"Closure"}
                      description={textAnalysisData?.feedback?.closure}
                      number={textAnalysisData?.grades?.closure}
                    />
                    <FeedbackItems
                      title={"General"}
                      description={textAnalysisData?.feedback?.general}
                      number={textAnalysisData?.grades?.general}
                    />
                  </div>
                </div>
              </div>
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
                    <ReactApexChart
                      options={createConfigSatisfactionChartOption(
                        textAnalysisData
                      )}
                      series={createConfigSatisfactionChartSeries(
                        textAnalysisData
                      )}
                      type="line"
                      height={350}
                    />
                  </div>
                </div>
              ) : null}
              <div className="custom-box mb-8 rounded-2xl bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] custom-border gap-12 px-8 py-6 text-white flex items-center">
                <div className="flex items-center justify-between w-full">
                  <h4 className="text-[22px] font-bold">
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
            <div className="max-w-[500px] w-full flex-shrink-0">
              <div className="custom-box">
                <ProgressData
                  audioAnalysisData={audioAnalysisData}
                  textAnalysisData={textAnalysisData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoaderModal isVisible={showLoadingModel}>
        <ModuleLoading type="error" />
      </LoaderModal>
      {isOpenModal && (
        <ConversionModal
          onClose={() => setIsOpenModal(false)}
          data={conversation}
        />
      )}
    </>
  );
};

export default MyStats;
