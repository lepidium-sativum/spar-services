import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loader: false,
  isAlert: false,
  loginDetails: null,
  // getLoginUser: null,
  moduleData: null,
  moduleStatus: null,
  completeModule: null,
  resultData: null,
  feedbackData: null,
  resultInfoData: null,
  videoLink: null,
  progressData: null,
  transcriptionData: null,
  mainObjectives: null,
  getModule: null,
  configSatisfactionChart: null,
  configPerformanceChart: null,
  timeLineConveration: null,
  sparData: null,
  s3BucketUrl: null,
  updateSparData: null,
  analysisData: null,
  messgaeModel: false,
  warningMessage: false,
  uploadingMedia: false,
  sparCompletedStatus: false,
  stopCommunication: false,
  postTranscriptionResult: "",
  showLoadingModel: false,
  videoMerge: null,
  analysisProcessData: null,
  uploadingCount: 0,
  audioUploadingCount: 0,
  videoUploadingCount: 0,
  audioUploadingComplete: false, //
  videoUploadingComplete: false,
  videoMergeData: null,
  apiOneProgress: 0,
  apiTwoProgress: 0,
  apiThreeProgress: 0,
  apiFourProgress: 0,
  userModulesData: null,
  selectedModule: null,
};

export const commonSlice = createSlice({
  name: "getData",
  initialState,
  reducers: {
    setLoader: (state, action) => ({
      ...state,
      loader: action.payload,
    }),
    setAlert: (state, action) => ({
      ...state,
      isAlert: action.payload,
    }),
    getLogin: (state, action) => ({
      ...state,
      loginDetails: action.payload,
    }),
    setUserModulesData: (state, action) => ({
      ...state,
      userModulesData: action.payload,
    }),
    moduleData: (state, action) => ({
      ...state,
      moduleData: action.payload,
    }),
    getModuleStatus: (state, action) => ({
      ...state,
      moduleStatus: action.payload,
    }),
    getStartModule: (state, action) => ({
      ...state,
      getModule: action.payload,
    }),
    completeModule: (state, action) => ({
      ...state,
      completeModule: action.payload,
    }),

    videoLinkData: (state, action) => ({
      ...state,
      videoLink: action.payload,
    }),
    resultsData: (state, action) => ({
      ...state,
      resultData: action.payload,
    }),
    feedbackData: (state, action) => ({
      ...state,
      feedbackData: action.payload,
    }),
    resultInfoData: (state, action) => ({
      ...state,
      resultInfoData: action.payload,
    }),
    progressData: (state, action) => ({
      ...state,
      progressData: action.payload,
    }),
    transcriptionData: (state, action) => ({
      ...state,
      transcriptionData: action.payload,
    }),
    mainObjectives: (state, action) => ({
      ...state,
      mainObjectives: action.payload,
    }),

    configSatisfactionChart: (state, action) => ({
      ...state,
      configSatisfactionChart: action.payload,
    }),
    configPerformanceChartData: (state, action) => ({
      ...state,
      configPerformanceChart: action.payload,
    }),
    timeLineConverationData: (state, action) => ({
      ...state,
      timeLineConveration: action.payload,
    }),
    setSparData: (state, action) => ({
      ...state,
      sparData: action.payload,
    }),
    setS3BucketUrl: (state, action) => ({
      ...state,
      s3BucketUrl: action.payload,
    }),
    setUpdateSpar: (state, action) => ({
      ...state,
      updateSparData: action.payload,
    }),
    setAnalysis: (state, action) => ({
      ...state,
      analysisData: action.payload,
    }),
    setMessageModel: (state, action) => ({
      ...state,
      messgaeModel: action.payload,
    }),
    setWarningModel: (state, action) => ({
      ...state,
      warningMessage: action.payload,
    }),
    setMediaUploading: (state, action) => ({
      ...state,
      uploadingMedia: action.payload,
    }),
    setSparCompletedStatus: (state, action) => ({
      ...state,
      sparCompletedStatus: action.payload,
    }),
    setStopCommunication: (state, action) => ({
      ...state,
      stopCommunication: action.payload,
    }),
    setPostTranscriptionStatus: (state, action) => ({
      ...state,
      postTranscriptionResult: action.payload,
    }),
    setShowLoadingModel: (state, action) => ({
      ...state,
      showLoadingModel: action.payload,
    }),

    setVideoMerge: (state, action) => ({
      ...state,
      videoMerge: action.payload,
    }),
    setAnalysisProcessData: (state, action) => ({
      ...state,
      analysisProcessData: action.payload,
    }),
    // resetCommonState: (state) => Object.assign(state, initialState),
    // resetCommonState: () => initialState,
    resetCommonState: (state) => {
      // console.log("Common initialStatebefore:", state.audioUploadingCount);
      Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
      });
      // console.log("Common initialState after:", state.audioUploadingCount);
    },

    resetAudioProgressVariables: (state) => {
      state.apiTwoProgress = 0;
      state.apiFourProgress = 0;
    },
    resetVideoProgressVariables: (state) => {
      state.apiOneProgress = 0;
      state.apiThreeProgress = 0;
    },
    // incrementUploadingCount: (state) => {
    //   state.uploadingCount += 1;
    //   // Show loader when starting
    //   // console.log("uploadingCount: ", state.uploadingCount);
    //   if (state.uploadingCount === 4) {
    //     state.sparCompletedStatus = true; // Hide loader when upload completes
    //     state.apiOneProgress = 0;
    //     state.apiThreeProgress = 0;
    //   }
    // },
    audioUploadingCount: (state) => {
      state.audioUploadingCount += 1;
      const totalProgress = state.apiTwoProgress + state.apiFourProgress;
      console.log("total progress:", totalProgress);
      if (state.audioUploadingCount >= 2 && totalProgress >= 90) {
        state.audioUploadingComplete = true;
        console.log("audioUploadingComplete: ", state.audioUploadingComplete);
      }
    },
    videoUploadingCount: (state) => {
      state.videoUploadingCount += 1;
      console.log("video count: ", state.videoUploadingCount);
      if (state.videoUploadingCount === 2) {
        state.videoUploadingComplete = true;
        // state.sparCompletedStatus = true;
      }
    },
    apiOneProgress(state, action) {
      state.apiOneProgress = action.payload;
    },
    apiTwoProgress(state, action) {
      state.apiTwoProgress = action.payload;
    },
    apiThreeProgress(state, action) {
      state.apiThreeProgress = action.payload;
    },
    apiFourProgress(state, action) {
      state.apiFourProgress = action.payload;
    },

    setModule(state, action) {
      state.selectedModule = action.payload;
    },

    // setVideoMergeData: (state, action) => ({
    //   ...state,
    //   videoMergeData: action.payload,
    // }),
  },
});

// Action creators are generated for each case reducer function
export const {
  setModule,
  setUserModulesData,
  getLogin,
  setLoader,
  setAlert,
  moduleData,
  getModuleStatus,
  getStartModule,
  completeModule,
  videoLinkData,
  resultsData,
  feedbackData,
  resultInfoData,
  progressData,
  transcriptionData,
  mainObjectives,
  mainObjectivesModal,
  configSatisfactionChart,
  configPerformanceChartData,
  timeLineConverationData,
  setSparData,
  setS3BucketUrl,
  setUpdateSpar,
  setAnalysis,
  setMessageModel,
  getLogout,
  setWarningModel,
  setMediaUploading,
  setSparCompletedStatus,
  setStopCommunication,
  setPostTranscriptionStatus,
  setVideoMerge,
  setShowLoadingModel,
  setAnalysisProcessData,
  // incrementUploadingCount,
  audioUploadingCount,
  videoUploadingCount,
  decrementUploadingCount,
  setVideoMergeData,
  resetCommonState,
  resetAudioProgressVariables,
  apiOneProgress,
  apiTwoProgress,
  apiThreeProgress,
  apiFourProgress,
} = commonSlice.actions;

export default commonSlice.reducer;
