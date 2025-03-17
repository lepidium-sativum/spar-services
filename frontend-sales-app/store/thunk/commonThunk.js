import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  completeModule,
  setLoader,
  setSparData,
  setS3BucketUrl,
  setUpdateSpar,
  getLogout,
  setStopCommunication,
  setPostTranscriptionStatus,
  videoUploadingCount,
  apiFourProgress,
  apiTwoProgress,
  setUserModulesData,
} from "../slices/commonSlice";
import { recommendedList } from "../slices/authSlice";
import ApiUser from "../../config/apiUser";
import { showToast } from "../../src/utils/showToast";
import axios from "axios";
import _ from "lodash";

export const getUserModules = createAsyncThunk(
  "getUserModules",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    // console.log("api data: ", user_id);
    try {
      // https://api-staging.spar.coach/v1/api/v1/modules/spars
      const response = await ApiUser().get(`/modules/spars`);
      dispatch(setLoader(false));
      if (response && response?.status) {
        dispatch(setLoader(false));
        // showToast("User Modules fetched successfully", "success");
        dispatch(setUserModulesData(response?.data));
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
      return error;
    }
  }
);

export const getCompleteModule = createAsyncThunk(
  "getCompleteModule",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("/spars");
      dispatch(setLoader(false));
      if (response && response?.status) {
        dispatch(completeModule(response?.data));
      }
    } catch (error) {
      showToast(error, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);

export const getRecommendedList = createAsyncThunk(
  "getRecommendedList",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("modules", {
        params: _request,
      });
      dispatch(setLoader(false));
      if (response && response?.status) {
        // console.log("response: ", response?.data);
        const sortedModules = response.data.sort(
          (a, b) => a.module.id - b.module.id
        );
        dispatch(recommendedList(sortedModules));
      }
      return response;
    } catch (error) {
      showToast(error, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);

export const postTranscriptionData = createAsyncThunk(
  "postTranscriptionData",
  async (_request, { dispatch }) => {
    const spar_id = _request.sparId;
    const user_id = _request.userId;
    try {
      const response = await ApiUser().post(
        `spars/${spar_id}/communicate-new?user_id=${user_id}`,
        {
          transcription: _request.transcription,
        }
      );
      return response;
    } catch (error) {
      if (error?.response?.status == 422) {
        // TODO:
        //|| error?.response?.status == 504
        if (error?.response?.data?.detail == "SPAR ended successfully") {
          localStorage.removeItem("intervalId");
          dispatch(setPostTranscriptionStatus("success"));
        } else dispatch(setPostTranscriptionStatus("error"));
      }
      dispatch(setStopCommunication(true));
    }
  }
);
export const postSilenceDetection = createAsyncThunk(
  "postSilenceDetection",
  async (_request, { dispatch }) => {
    try {
      // https://api-staging.spar.coach/v1/api/v1/spars/{spar_id}/silence
      const response = await ApiUser().post(`spars/${_request.sparId}/silence`);
      return response;
    } catch (error) {
      console.log(error);
    }
  }
);
export const getS3BucketUrl = createAsyncThunk(
  "getS3BucketUrl",
  async (_request, { dispatch }) => {
    // dispatch(setLoader(true));
    try {
      const response = await ApiUser().get(`/spars/${_request}/media/upload`);
      const responseData = await response.data;
      // console.log("getS3BucketUrl: ", responseData);
      dispatch(setS3BucketUrl(responseData));
      dispatch(setLoader(false));
      return response;
    } catch (error) {
      showToast(error, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);

export const uploadBlobDataToS3 = createAsyncThunk(
  "uploadBlockDatatoS3",
  async (_request, { dispatch }) => {
    try {
      // console.log(_request, "---");
      const responseBlob = await axios.get(_request.blobUrl, {
        responseType: "blob",
      });
      const blobData = responseBlob.data;
      try {
        const responseUpload = await axios.put(_request.url, blobData, {
          headers: {
            "Content-Type": blobData.type,
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            if (_request?.count === 2) {
              const percentCompleted = Math.ceil((loaded / total) * 50);
              // console.log("avatar audio complete 2: ", percentCompleted);
              dispatch(apiTwoProgress(percentCompleted));
            }
            if (_request?.count === 4) {
              const percentCompleted = Math.ceil((loaded / total) * 50);
              // console.log("user audio complete 4: ", percentCompleted);
              dispatch(apiFourProgress(percentCompleted));
            }
          },
        });
        if (responseUpload.status === 200) {
          if (_request?.audio) {
            return { success: true };
          }
          if (_request?.video) {
            console.log("Video count thunk: ", _request?.count);
            dispatch(videoUploadingCount());
          }
        }
      } catch (error) {
        // Handle upload error
        return error;
      }
    } catch (error) {
      // Handle fetch error
      return error;
    }
  }
);

export const createSparData = createAsyncThunk(
  "createSparData",
  async (_request, { dispatch }) => {
    // dispatch(setLoader(true));
    try {
      const response = await ApiUser().post("/spars", {
        name: _request.name,
        module_id: _request.module_id,
        // room_id: _request.room_id,
      });
      const responseData = await response.data;
      // console.log("createSparData: ", responseData);
      dispatch(setSparData(responseData));
      return response;
    } catch (error) {
      showToast(error, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);

export const getUpdateSpar = createAsyncThunk(
  "getUpdateSpar",
  async (_request, { dispatch }) => {
    try {
      const response = await ApiUser().patch(`/spars/${_request.sparDataId}`, {
        state: _request.state,
        current_session_duration: _request.sessionDuration,
        avatar_audio_timeline: _request.avatar_audio_timeline
          ? _request.avatar_audio_timeline
          : "",
        user_audio_timeline: _request.user_audio_timeline
          ? _request.user_audio_timeline
          : "",
      });
      const responseData = await response.data;
      dispatch(setLoader(false));
      dispatch(setUpdateSpar(responseData));
      // console.log("update spar: ", responseData);
      return response;
    } catch (error) {
      dispatch(setLoader(false));
      console.log(error);
      return error;
    }
  }
);

export const createRoom = createAsyncThunk("createRoom", async (_request) => {
  // dispatch(setLoader(true));
  console.log("request Module id: ", _request);
  try {
    // https://api-staging.spar.coach/v1/api/v1/spars/prepare
    const response = await ApiUser().post("/rooms", {
      module_id: _request,
    });
    console.log("create room: ", response);
    return response;
  } catch (error) {
    showToast(error?.response?.data?.detail, "error");
    console.log(error);
  }
});

export const getRoom = createAsyncThunk("getRoom", async (_request) => {
  const room_id = _request;
  try {
    // https://api-staging.spar.coach/v1/api/v1/spars/status
    const response = await ApiUser().get(`/rooms/${room_id}`);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
});

export const getLogoutUser = () => (dispatch) => {
  dispatch(getLogout(false));
  localStorage.removeItem("token");
};
