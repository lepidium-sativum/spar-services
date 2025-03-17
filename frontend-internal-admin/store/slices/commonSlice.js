import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loader: false,
  newClientRes: null,
  newClientUsersRes: null,
  moduleResponse: null,
  clientList: null,
  clientData: null,
  clientUsersList: null,
  allClientUsersList: null,
  metahumanURL: null,
  backgroundURL: null,
  backgroundImages: null,
  metahumanImages: null,
  personalitiesList: null,
  avatarList: null,
  templateList: null,
  // new above
  checkUserLogin: null,
  updateResultData: null,
  sparLinkModaldata: null,
  sparList: null,
  moduleList: null,
  moduleData: null,
  userModulesData: null,
  clientModulesList: null,
  videoLink: null,
  getSparLink: null,
  sparDetails: null,
  error: null,
  hideModel: false,
  s3BucketUrl: null,
  updateSparData: null,
  userProfileData: null,
  messgaeModel: false,
  conversionModel: false,
  customModel: false,
  stopCommunication: false,
  considerationRes: null,
  personalityRes: null,
  metahumanRes: null,
  backgroundImageRes: null,
  showLoadingModel: null,
  analysisProcessData: null,
  videoMergeData: null,
  configData: null,
};

export const commonSlice = createSlice({
  name: "getData",
  initialState,
  reducers: {
    setLoader: (state, action) => ({
      ...state,
      loader: action.payload,
    }),
    // new
    newClientResponse: (state, action) => ({
      ...state,
      newClientRes: action.payload,
    }),
    newClientUserResponse: (state, action) => ({
      ...state,
      newClientUsersRes: action.payload,
    }),
    newModuleResponse: (state, action) => ({
      ...state,
      moduleResponse: action.payload,
    }),
    setClientsData: (state, action) => ({
      ...state,
      clientList: action.payload,
    }),
    setClientData: (state, action) => ({
      ...state,
      clientData: action.payload,
    }),
    setClientUsers: (state, action) => ({
      ...state,
      clientUsersList: action.payload,
    }),
    setAllClientUsers: (state, action) => ({
      ...state,
      allClientUsersList: action.payload,
    }),
    metahumanUrl: (state, action) => ({
      ...state,
      metahumanURL: action.payload,
    }),
    backgroundUrl: (state, action) => ({
      ...state,
      backgroundURL: action.payload,
    }),

    // new above
    considerationResponse: (state, action) => ({
      ...state,
      considerationRes: action.payload,
    }),

    personalityResponse: (state, action) => ({
      ...state,
      personalityRes: action.payload,
    }),
    metahumanResponse: (state, action) => ({
      ...state,
      metahumanRes: action.payload,
    }),

    backgroundImageResponse: (state, action) => ({
      ...state,
      backgroundImageRes: action.payload,
    }),

    checkLogin: (state, action) => ({
      ...state,
      checkUserLogin: action.payload,
    }),

    getSparList: (state, action) => ({
      ...state,
      sparList: action.payload,
    }),

    getPersonalitiesData: (state, action) => ({
      ...state,
      personalitiesList: action.payload,
    }),

    getModulesData: (state, action) => ({
      ...state,
      moduleList: action.payload,
    }),
    getModuleData: (state, action) => ({
      ...state,
      moduleData: action.payload,
    }),

    setUserModulesData: (state, action) => ({
      ...state,
      userModulesData: action.payload,
    }),

    setClientModules: (state, action) => ({
      ...state,
      clientModulesList: action.payload,
    }),

    getMetahumansData: (state, action) => ({
      ...state,
      metahumanImages: action.payload,
    }),
    getScenesData: (state, action) => ({
      ...state,
      backgroundImages: action.payload,
    }),
    setAvatarData: (state, action) => ({
      ...state,
      avatarList: action.payload,
    }),

    setPromptTemplateData: (state, action) => ({
      ...state,
      templateList: action.payload,
    }),
    // old
    sparLinkData: (state, action) => ({
      ...state,
      getSparLink: action.payload,
    }),
    getVideoLink: (state, action) => ({
      ...state,
      videoLink: action.payload,
    }),

    getCreateLinkData: (state, action) => ({
      ...state,
      sparLinkModaldata: action.payload,
    }),

    setSparDetails: (state, action) => ({
      ...state,
      sparDetails: action.payload,
    }),
    setError: (state, action) => ({
      ...state,
      error: action.payload,
    }),
    setHideModel: (state, action) => ({
      ...state,
      hideModel: action.payload,
    }),
    setS3BucketUrl: (state, action) => ({
      ...state,
      s3BucketUrl: action.payload,
    }),
    setUpdateSpar: (state, action) => ({
      ...state,
      updateSparData: action.payload,
    }),
    userProfile: (state, action) => ({
      ...state,
      userProfileData: action.payload,
    }),
    setMessageModel: (state, action) => ({
      ...state,
      messgaeModel: action.payload,
    }),
    setConversionModel: (state, action) => ({
      ...state,
      conversionModel: action.payload,
    }),
    setCustomModel: (state, action) => ({
      ...state,
      customModel: action.payload,
    }),
    setStopCommunication: (state, action) => ({
      ...state,
      stopCommunication: action.payload,
    }),
    // my-stats
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
    setConfigData: (state, action) => ({
      ...state,
      configData: action.payload,
    }),
  },
});

// Action creators are generated for each case reducer function
export const {
  setShowLoadingModel,
  setAnalysisProcessData,
  setVideoMergeData,
  setClientData,
  setAllClientUsers,
  setClientUsers,
  newClientResponse,
  newClientUserResponse,
  newModuleResponse,
  metahumanUrl,
  backgroundUrl,
  considerationResponse,
  personalityResponse,
  metahumanResponse,
  backgroundImageResponse,
  sparLinkData,
  setLoader,
  getResultData,
  // getUpdateResultData,
  checkLogin,
  getCreateLinkData,
  getPersonalitiesData,
  getSparList,
  setClientsData,
  getMetahumansData,
  getScenesData,
  setAvatarData,
  setPromptTemplateData,
  getModulesData,
  getModuleData,
  setUserModulesData,
  setClientModules,
  getVideoLink,
  setSparDetails,
  setError,
  setHideModel,
  setS3BucketUrl,
  setUpdateSpar,
  userProfile,
  setMessageModel,
  setConversionModel,
  setCustomModel,
  setStopCommunication,
  setConfigData,
} = commonSlice.actions;

export default commonSlice.reducer;
