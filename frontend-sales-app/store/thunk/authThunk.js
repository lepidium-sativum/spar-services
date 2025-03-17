import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiUser from "../../config/apiUser";
import { showToast } from "../../src/utils/showToast";
import { getLogout, loginUser, userProfile } from "../slices/authSlice";
import { setLoader } from "../slices/commonSlice";

export const postLoginDetails = createAsyncThunk(
  "postLoginDetails",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().post("auth/tokens", {
        username: _request?.username,
        password: _request?.password,
      });

      if (response && response?.status) {
        localStorage.setItem(
          "token",
          JSON.stringify(response?.data?.access_token)
        );
        dispatch(loginUser(response?.data || {}));
        dispatch(setLoader(false));
        // showToast("Login Successfully", "success");
        return response;
      }
    } catch (error) {
      showToast({ message: error?.response?.data?.detail }, "error");
      dispatch(setLoader(false));
      return error;
    }
  }
);
export const getuserProfileData = createAsyncThunk(
  "getuserProfileData",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("/users/me", {
        params: _request,
      });
      dispatch(setLoader(false));

      if (response && response.status === 200 && response.data) {
        dispatch(userProfile(response.data));
      }
    } catch (error) {
      showToast(error, "error");
      console.log(error);
    } finally {
      dispatch(setLoader(false));
    }
  }
);
export const getLogoutUser = () => (dispatch) => {
  dispatch(getLogout(false));
  dispatch(setLoader(false));
  localStorage.removeItem("token");
};
