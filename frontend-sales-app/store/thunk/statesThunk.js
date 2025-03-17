import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiUser from "../../config/apiUser";
import { showToast } from "../../src/utils/showToast";
import { setLoader } from "../slices/commonSlice";
import {
  setAnalysis,
  setShowLoadingModel,
  setVideoMerge,
} from "../slices/statesSlice";

export const postAnalysisData = createAsyncThunk(
  "postAnalysisData",
  async (_request, { dispatch }) => {
    // dispatch(setLoader(true));
    // console.log("request in post: ", _request.id);

    try {
      const response = await ApiUser().post(
        `/analysis/spars/${_request.id}?use_new_textual_analysis=true`,
        {
          // use_new_textual_analysis: _request.use_new_textual_analysis
          //   ? _request.use_new_textual_analysis
          //   : false,
        }
      );
      dispatch(setAnalysis(response.data));
      return response;
    } catch (error) {
      showToast(error, "error");

      console.log(error);
    }
  }
);
export const postMergeVideo = createAsyncThunk(
  "postMergeVideo",
  async (_request, { dispatch }) => {
    // console.log("post merged video call: ", _request?.id);
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().post(
        `spars/${_request.id}/media/videos/merge`,
        {}
      );
      // setVideoMerge(response);
      return response;
    } catch (error) {
      // showToast(error, "error");
      console.log(error);
    }
  }
);
export const getAnalysisProcessData = createAsyncThunk(
  "getAnalysisProcessData",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get(`/analysis/${_request}`);
      return response;
    } catch (error) {
      showToast(error, "error");
      dispatch(setShowLoadingModel(false));
      console.log(error);
    }
  }
);
export const getVideoMergeData = createAsyncThunk(
  "getVideoMergeData",
  async (_request, { dispatch }) => {
    try {
      const response = await ApiUser().get(
        `/spars/${_request}/media/videos/download`
      );
      return response;
    } catch (error) {
      // dispatch(setShowLoadingModel(false));
      // showToast(error, "error");
      console.log("Error:", error);
      return error;
    }
  }
);
export const getAnalysisData = createAsyncThunk(
  "getAnalysisData",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      // https://api-staging.spar.coach/v1/api/v1/analysis/spars/{spar_id}
      const response = await ApiUser().get(`/analysis/spars/${_request}`);
      // console.log("getAnalysisData thunk: ", response);
      return response;
    } catch (error) {
      dispatch(setShowLoadingModel(false));
      console.log(error);
      return error?.response?.status;
    }
  }
);
