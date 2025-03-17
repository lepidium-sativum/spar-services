import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  loader: false,
  analysisData: null,
  videoMerge: null,
  showLoadingModel: false,
  analysisProcessData: null,
  serverErrorModal: false,
  videoMergeData: null,
  skipTutorial: true,
};

export const statesSlice = createSlice({
  name: "states",
  initialState,
  reducers: {
    // setLoader: (state, action) => ({
    //   ...state,
    //   loader: action.payload,
    // }),
    setAnalysis: (state, action) => ({
      ...state,
      analysisData: action.payload,
    }),
    setVideoMerge: (state, action) => ({
      ...state,
      videoMerge: action.payload,
    }),
    setShowLoadingModel: (state, action) => ({
      ...state,
      showLoadingModel: action.payload,
    }),
    setAnalysisProcessData: (state, action) => ({
      ...state,
      analysisProcessData: action.payload,
    }),
    setVideoMergeData: (state, action) => ({
      ...state,
      videoMergeData: action.payload,
    }),
    setServerErrorModal: (state, action) => ({
      ...state,
      serverErrorModal: action.payload,
    }),

    resetState: (state) => {
      Object.assign(state, initialState);
      // console.log("State initialState: ", initialState);
    },
  },
});

export const {
  setAnalysis,
  setVideoMerge,
  setShowLoadingModel,
  setAnalysisProcessData,
  setVideoMergeData,
  resetState,
  setServerErrorModal,
} = statesSlice.actions;

export default statesSlice.reducer;
