import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isAuthenticated: false,
  getLoginUser: null,
  skipTutorial: true,
  userProfileData: null,
  recommendedList: null,
};

export const authSlice = createSlice({
  name: "authUser",
  initialState,
  reducers: {
    getLogout: (state, action) => ({
      ...state,
      isAuthenticated: action.payload,
    }),
    loginUser: (state, action) => ({
      ...state,
      getLoginUser: action.payload,
      isAuthenticated: true,
    }),
    setSkipTutorial: (state, action) => ({
      ...state,
      skipTutorial: action.payload,
    }),
    userProfile: (state, action) => ({
      ...state,
      userProfileData: action.payload,
    }),
    recommendedList: (state, action) => ({
      ...state,
      recommendedList: action.payload,
    }),
  },
});

export const {
  getLogout,
  loginUser,
  setSkipTutorial,
  userProfile,
  recommendedList,
} = authSlice.actions;

export default authSlice.reducer;
