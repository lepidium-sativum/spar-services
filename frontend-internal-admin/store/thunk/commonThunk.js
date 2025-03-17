import { createAsyncThunk } from "@reduxjs/toolkit";
import ApiUser from "../../config/apiUser";

import {
  setClientsData,
  setClientData,
  setClientUsers,
  setAllClientUsers,
  getModulesData,
  getModuleData,
  metahumanUrl,
  backgroundUrl,
  setUserModulesData,
  setClientModules,
  getPersonalitiesData,
  getMetahumansData,
  getScenesData,
  setAvatarData,
  setPromptTemplateData,
  setLoader,
  newClientResponse,
  personalityResponse,
  metahumanResponse,
  backgroundImageResponse,
  setShowLoadingModel,
  setConfigData,
} from "../slices/commonSlice";
import { showToast } from "../../src/utils/showToast";
import axios from "axios";

export const createClient = createAsyncThunk(
  "createClient",
  async (_request, { dispatch }) => {
    console.log("send data: ", _request);
    try {
      const response = await ApiUser().post("admin/clients", {
        name: _request.name,
        company: _request.company,
        domain: _request.domain,
        description: _request.description,
        email: _request.email,
        site_url: _request.site_url,
        locations: _request.locations,
        raw_files: _request.raw_files,
      });
      dispatch(setLoader(false));
      if (response && response?.status) {
        showToast("Client created successfuly", "success");
        dispatch(newClientResponse(response?.data || {}));
        return response;
      }
      return response.data;
    } catch (error) {
      dispatch(setLoader(false));
      showToast(error?.response?.data?.detail, "error");
      console.log("error", error);
      return error;
    }
  }
);

export const updateClient = createAsyncThunk(
  "updateClient",
  async (_request, { dispatch }) => {
    //console.log("send data: ", _request);
    const client_id = _request.clientId;
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/clients/{client_id}
      const response = await ApiUser().patch(`admin/clients/${client_id}`, {
        name: _request.name,
        company: _request.company,
        domain: _request.domain,
        description: _request.description,
        email: _request.email,
        site_url: _request.site_url,
        locations: _request.locations,
        raw_files: _request.raw_files,
      });
      dispatch(setLoader(false));
      if (response && response?.status) {
        showToast("Client Updated successfuly", "success");
        dispatch(newClientResponse(response?.data || {}));
        return response;
      }
      return response.data;
    } catch (error) {
      showToast(error.response.data.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);

export const createClientUser = createAsyncThunk(
  "createClientUser",
  async (_request, { dispatch }) => {
    //console.log("send data: ", _request);
    try {
      const response = await ApiUser().post("admin/users/register", {
        client_id: _request.client_id,
        username: _request.username,
        first_name: _request.first_name,
        last_name: _request.last_name,
        email: _request.email,
        password: _request.password,
      });
      dispatch(setLoader(false));
      if (response && response?.status === 200) {
        showToast("Client created successfuly", "success");
        // dispatch(newClientUserResponse(response?.data || {}));
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log("error", error);
    }
  }
);

export const createExpandedObjective = createAsyncThunk(
  "createExpandedObjective",
  async (_request, { dispatch }) => {
    // console.log("data expanded objective thunk: ", _request);
    dispatch(setLoader(true));
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/objectives/expand
      const response = await ApiUser().post("admin/objectives/expand", {
        title: _request.title,
        description: _request.description,
      });
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("Expanded Objective created successfuly", "success");
        // dispatch(newModuleResponse(response?.data || {}));
        return response;
      }
    } catch (error) {
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
export const createModule = createAsyncThunk(
  "createModule",
  async (_request, { dispatch }) => {
    console.log("send data: ", _request);
    try {
      const response = await ApiUser().post("admin/modules", {
        name: _request.name,
        avatar_id: _request.avatar_id,
        system_prompt: _request.system_prompt,
        scenario: _request.scenario,
        objectives: _request.objectives,
        considerations: _request.considerations,
        stt_phrase_list: _request.stt_phrase_list,
        level: _request.level,
        session_time: _request.session_time,
        avatar_mode: _request.avatarMode,
        // initial_emotion: _request.moduleMode,
      });
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("Module created successfuly", "success");
        // dispatch(newModuleResponse(response?.data || {}));
        return response;
      }
    } catch (error) {
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
export const updateModule = createAsyncThunk(
  "updateModule",
  async (_request, { dispatch }) => {
    //console.log("send data: ", _request);
    const module_id = _request.module_id;
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/modules/{module_id}
      const response = await ApiUser().patch(`admin/modules/${module_id}`, {
        name: _request.name,
        avatar_id: _request.avatar_id,
        system_prompt: _request.system_prompt,
        scenario: _request.scenario,
        objectives: _request.objectives,
        considerations: _request.considerations,
        stt_phrase_list: _request.stt_phrase_list,
        level: _request.level,
        session_time: _request.session_time,
        avatar_mode: _request.avatarMode,
      });
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("Module updated successfully", "success");
        return response;
      }
    } catch (error) {
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);

export const deleteSpar = createAsyncThunk(
  "deleteSpar",
  async (_request, { dispatch }) => {
    //console.log("spar id: ", _request);
    const spar_id = _request;
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/spars/{spar_id}
      const response = await ApiUser().delete(`admin/spars/${spar_id}`);
      if (response && response?.status) {
        dispatch(setLoader(false));
        showToast("Spar deleted successfuly", "success");
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
export const deleteAllSpars = createAsyncThunk(
  "deleteAllSpars",
  async (_request, { dispatch }) => {
    //console.log("spar id: ", _request);
    const module_id = _request;
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/spars/modules/{module_id}
      const response = await ApiUser().delete(
        `admin/spars/modules/${module_id}`
      );
      if (response && response?.status) {
        dispatch(setLoader(false));
        showToast("All spars deleted successfuly", "success");
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);

export const assignModules = createAsyncThunk(
  "assignModules",
  async (_request, { dispatch }) => {
    //console.log("send data: ", _request);
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/modules/assign
      const response = await ApiUser().post("admin/modules/assign", {
        assignees: _request.assignees,
        modules: _request.modules,
      });
      dispatch(setLoader(false));
      if (response && response?.status) {
        showToast("Module assigned successfuly", "success");
        // dispatch(newModuleResponse(response?.data || {}));
        return response;
      }
    } catch (error) {
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
export const createPersonality = createAsyncThunk(
  "createPersonality",
  async (_request, { dispatch }) => {
    // console.log("personality data: ", _request);
    try {
      const response = await ApiUser().post(`admin/personalities`, {
        name: _request.name,
        description: _request.description,
        personality_info: _request.personality_info,
        instructions: _request.instructions,
        llm: {
          style: _request.style,
          model: _request.model,
          temperature: _request.temperature ? _request.temperature : 0,
          url: _request.url,
          type: _request.type,
        },
        tts: {
          lang: _request.lang,
          voice: _request.voice,
          region: _request.region,
        },
      });
      dispatch(setLoader(false));
      if (response && response?.status) {
        dispatch(setLoader(false));
        // showToast("Personality created successfuly", "success");
        dispatch(personalityResponse(response?.data || {}));
        return response;
      } else {
        dispatch(setLoader(false));
        showToast("Personality not created ", "error");
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);

// getPersonalities
export const getPersonalities = createAsyncThunk(
  "getPersonalities",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      // const response = await ApiUser().get("/admin/investor/spars"); // will change when api done
      const response = await ApiUser().get("/admin/personalities"); // will change when api done
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("Personalities data fetched successfully", "success");
        dispatch(setLoader(false));
        dispatch(getPersonalitiesData(response.data));
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
// end
export const createMetahuman = createAsyncThunk(
  "createMetahuman",
  async (_request, { dispatch }) => {
    // console.log("Metahuman data: ", _request);
    try {
      const response = await ApiUser().post("admin/metahumans", {
        name: _request.name,
        age: parseInt(_request.age),
        gender: _request.gender,
        ue_mh_id: "",
        race: "",
        url: "",
        image_id: _request.image_id,
      });

      if (response && response?.status) {
        dispatch(setLoader(false));
        showToast("Methuman created successfuly", "success");
        dispatch(metahumanResponse(response?.data || {}));
        return response;
      } else {
        showToast("Methuman not created", "error");
        dispatch(setLoader(false));
      }
      return response.data;
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
//end
export const getMetahumans = createAsyncThunk(
  "getMetahumans",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("/admin/metahumans"); // will change when api done
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("Metahuman fetched successfully", "success");
        dispatch(getMetahumansData(response.data));
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      //console.log(error);
      return error;
    }
  }
);
//end
export const uploadMetahumanImage = createAsyncThunk(
  "uploadMetahumanImage",
  async (_request, { dispatch }) => {
    //console.log("request: ", _request);

    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("admin/metahumans/media/upload");
      if (response?.data) {
        const signedUrl = response.data.image_url;
        if (!signedUrl) {
          throw new Error("Signed URL is not available");
        }
        const res = await axios.put(signedUrl, _request, {
          headers: {
            "Content-Type": _request.type,
          },
        });
        const uploadedImageUrl = response?.data; // Adjust according to response structure
        // console.log("Image URL: ", res);
        dispatch(setLoader(false));
        showToast("metahuman Image uploaded Successfully", "success");
        dispatch(metahumanUrl(uploadedImageUrl));
        return res;
      }
      // dispatch(setS3BucketUrl(responseData));
    } catch (error) {
      showToast(error.response.data.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
// end image url
export const uploadBackgoundImage = createAsyncThunk(
  "uploadBackgoundImage",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("admin/scenes/media/upload");
      if (response?.data) {
        const signedUrl = response.data.image_url;
        if (!signedUrl) {
          throw new Error("Signed URL is not available");
        }
        const res = await axios.put(signedUrl, _request, {
          headers: {
            "Content-Type": _request.type,
          },
        });
        const uploadedImageUrl = response?.data; // Adjust according to response structure
        //console.log("Image URL: ", res);
        dispatch(setLoader(false));
        showToast("Background Image uploaded Successfully", "success");
        dispatch(backgroundUrl(uploadedImageUrl));
        return res;
      }
      // dispatch(setS3BucketUrl(responseData));
    } catch (error) {
      showToast(error.response.data.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
// end image url

export const addScene = createAsyncThunk(
  "addScene",
  async (_request, { dispatch }) => {
    console.log("BackgroundImage data: ", _request);
    try {
      //
      const response = await ApiUser().post("/admin/scenes", {
        name: _request.name,
        ue_scene_id: "",
        background_image: {
          name: _request.name,
          image_id: _request.image_id,
          fileExtension: "",
          etag: "",
          url: "",
        },
      });
      if (response && response?.status) {
        dispatch(setLoader(false));
        // showToast("Background created successfuly", "success");
        dispatch(backgroundImageResponse(response?.data || {}));
        return response;
      } else {
        showToast("Background not created", "error");
        dispatch(setLoader(false));
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
//end
export const getScenes = createAsyncThunk(
  "getMetahumans",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("/admin/scenes");
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("Background Images fetched successfully", "success");
        dispatch(getScenesData(response.data));
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
//end
// start delete api
export const deleteMetahuman = createAsyncThunk(
  "deleteMetahuman",
  async (_request, { dispatch }) => {
    //console.log("metahuman image id: ", _request);
    const mh_id = _request;
    try {
      const response = await ApiUser().delete(`admin/metahumans/${mh_id}`);
      if (response && response?.status) {
        dispatch(setLoader(false));
        showToast("Metahuman deleted successfuly", "success");
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
export const deleteScene = createAsyncThunk(
  "deleteScene",
  async (_request, { dispatch }) => {
    //console.log("BackgroundImage id: ", _request);
    const scene_id = _request;
    try {
      const response = await ApiUser().delete(`admin/scenes/${scene_id}`);
      if (response && response?.status) {
        dispatch(setLoader(false));
        showToast("Background deleted successfuly", "success");
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
export const deleteModule = createAsyncThunk(
  "deleteScene",
  async (_request, { dispatch }) => {
    //console.log("module id: ", _request);
    const module_id = _request;
    try {
      const response = await ApiUser().delete(`admin/modules/${module_id}`);
      if (response && response?.status) {
        dispatch(setLoader(false));
        showToast("Module deleted successfuly", "success");
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
export const deleteClient = createAsyncThunk(
  "deleteClient",
  async (_request, { dispatch }) => {
    console.log("metahuman image id: ", _request);
    const client_id = _request;
    try {
      const response = await ApiUser().delete(`admin/clients/${client_id}`);
      if (response && response?.status) {
        dispatch(setLoader(false));
        showToast("Client deleted successfuly", "success");
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
export const deleteClientUser = createAsyncThunk(
  "deleteClientUser",
  async (_request, { dispatch }) => {
    // console.log("metahuman image id: ", _request);
    const user_id = _request;
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/users/{user_id}
      const response = await ApiUser().delete(`/admin/users/${user_id}`);
      if (response && response?.status) {
        dispatch(setLoader(false));
        // showToast("User deleted successfuly", "success");
        return response;
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
//end delete api scene

export const createAvatar = createAsyncThunk(
  "createAvatar",
  async (_request, { dispatch }) => {
    // console.log("Metahuman data: ", _request);
    try {
      const response = await ApiUser().post("admin/aiavatars", {
        name: _request.name,
        metahuman_id: _request.metahuman_id,
        bgscene_id: _request.bgscene_id,
        personality_id: _request.personality_id,
      });

      if (response && response?.status) {
        dispatch(setLoader(false));
        showToast("Avatar created successfuly", "success");
        // dispatch(avatarResponse(response?.data || {}));
        return response;
      } else {
        showToast("Avatar not created", "error");
        dispatch(setLoader(false));
      }
    } catch (error) {
      showToast(error?.response?.data?.detail, "error");
      dispatch(setLoader(false));
      console.log(error);
    }
  }
);
//end
export const getAvatars = createAsyncThunk(
  "getAvatars",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("/admin/aiavatars");
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("Background Images fetched successfully", "success");
        dispatch(setAvatarData(response.data));
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
//end
export const getPromptTemplate = createAsyncThunk(
  "getPromptTemplate",
  async (_request, { dispatch }) => {
    const template_name = _request;
    dispatch(setLoader(true));
    // https://api-staging.spar.coach/v1/api/v1/admin/modules/prompts/templates
    try {
      const response = await ApiUser().get(
        `/admin/modules/prompts/templates?template_name=${template_name}`
      );
      if (response && response?.status) {
        // showToast("Propmt fetched successfully", "success");
        dispatch(setPromptTemplateData(response.data));
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
//end

export const getClients = createAsyncThunk(
  "getClients",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("/admin/clients"); // will change when api done
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("All Clients fetch successfully", "success");
        dispatch(setClientsData(response?.data));
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
export const getClient = createAsyncThunk(
  "getClient",
  async (_request, { dispatch }) => {
    const client_id = _request;
    dispatch(setLoader(true));
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/clients/{client_id}
      const response = await ApiUser().get(`/admin/clients/${client_id}`); // will change when api done
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("Client fetch successfully", "success");
        dispatch(setClientData(response?.data));
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
export const getClientUsers = createAsyncThunk(
  "getClientUsers",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    // console.log("clientID: ", _request);
    try {
      const response = await ApiUser().get(`/admin/clients/${_request}/users`); // will change when api done
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("Users fetched successfully", "success");
        dispatch(setClientUsers(response?.data));
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
export const getAllClientUsers = createAsyncThunk(
  "getAllClientUsers",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    // console.log("clientID: ", _request);
    try {
      const response = await ApiUser().get(`/admin/clients/users`); // will change when api done
      dispatch(setLoader(false));
      if (response && response?.status) {
        // showToast("All Clients & Users fetched successfully", "success");
        dispatch(setAllClientUsers(response?.data));
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
// Get module list
export const getModules = createAsyncThunk(
  "getModules",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("admin/modules");

      dispatch(setLoader(false));
      if (response && response?.status) {
        dispatch(setLoader(false));
        // showToast("Modules fetch successfully", "success");
        dispatch(getModulesData(response?.data));
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
// Get single module
export const getModule = createAsyncThunk(
  "getModule",
  async (_request, { dispatch }) => {
    // console.log("module id: ", _request);

    const module_id = _request;
    dispatch(setLoader(true));
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/modules/{module_id}
      const response = await ApiUser().get(`admin/modules/${module_id}`);

      dispatch(setLoader(false));
      if (response && response?.status) {
        dispatch(setLoader(false));
        // showToast("Modules fetch successfully", "success");
        dispatch(getModuleData(response?.data));
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
// end module list
export const getClientModules = createAsyncThunk(
  "getClientModules",
  async (_request, { dispatch }) => {
    const client_id = _request;
    //console.log("common thunk data: ", client_id);
    dispatch(setLoader(true));
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/clients/{client_id}/modules
      const response = await ApiUser().get(
        `/admin/clients/${client_id}/modules`
      ); // will change when api done
      dispatch(setLoader(false));
      if (response && response?.status) {
        dispatch(setLoader(false));
        // showToast("Client Modules fetched successfully", "success");
        dispatch(setClientModules(response.data));
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

// start getUserModules
export const getUserModules = createAsyncThunk(
  "getUserModules",
  async (_request, { dispatch }) => {
    const user_id = _request;
    dispatch(setLoader(true));
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/modules/users/{user_id}/spars
      const response = await ApiUser().get(
        `/admin/modules/users/${user_id}/spars`
      ); // will change when api done
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

// end

export const postMergeVideoStart = createAsyncThunk(
  "postMergeVideoStart",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().post(
        `admin/investor/spars/${_request}/media/videos/merge`
      );

      if (response) {
        dispatch(setLoader(false));
        return response;
      }
    } catch (error) {
      dispatch(setLoader(false));
      return error;
    }
  }
);
// export const getuserProfileData = createAsyncThunk(
//   "getuserProfileData",
//   async (_request, { dispatch }) => {
//     dispatch(setLoader(true));
//     try {
//       const response = await ApiUser().get("/auth/me");
//       dispatch(setLoader(false));
//       if (response && response?.status) {
//         if (response?.data) {
//           dispatch(userProfile(response?.data));
//         }
//         return response;
//       }
//     } catch (error) {
//       showToast(error, "error");
//       dispatch(setLoader(false));
//       console.log(error);
//       return error;
//     }
//   }
// );

export const postMergeVideo = createAsyncThunk(
  "postMergeVideo",
  async (_request, { dispatch }) => {
    console.log("post merged video call: ", _request);
    dispatch(setLoader(true));
    try {
      // https://api-staging.spar.coach/v1/api/v1/spars/{spar_id}/media/videos/merge
      const response = await ApiUser().post(
        `spars/${_request}/media/videos/merge`
      );
      return response;
    } catch (error) {
      showToast(error, "error");
      return error?.response?.status;
      // console.log(error);
    }
  }
);
export const getAnalysisProcessData = createAsyncThunk(
  "getAnalysisProcessData",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      // https://api-staging.spar.coach/v1/api/v1/analysis/{analysis_id}
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
    const spar_id = _request.sparId;
    const user_id = _request.userId;
    // console.log("get video merge: ", _request);
    try {
      // https://api-staging.spar.coach/v1/api/v1/admin/spars/{spar_id}/media/videos/download
      const response = await ApiUser().get(
        `admin/spars/${spar_id}/media/videos/download?user_id=${user_id}`
      );
      return response;
    } catch (error) {
      console.log("thunk error", error);
      return error?.response?.status;
      // dispatch(setShowLoadingModel(false));
      // showToast(error, "error");
    }
  }
);

export const postAnalysisData = createAsyncThunk(
  "postAnalysisData",
  async (_request, { dispatch }) => {
    // console.log("id integer: ", _request);
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().post(`/analysis/spars/${_request}`, {});
      // dispatch(setAnalysis(response.data));
      return response;
    } catch (error) {
      showToast(error, "error");
      console.log(error);
    }
  }
);
// for admin
export const getAnalysisData = createAsyncThunk(
  "getAnalysisData",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    console.log("called");
    try {
      // https://api-staging.spar.coach/v1/api/v1/analysis/spars/{spar_id}
      const response = await ApiUser().get(`/analysis/spars/${_request}`);
      console.log("analysis thunk: ", response);
      return response;
    } catch (error) {
      showToast(error, "error");
      dispatch(setShowLoadingModel(false));
      console.log(error);
      return error?.response?.status;
    }
  }
);
export const configApi = createAsyncThunk(
  "configApi",
  async (_request, { dispatch }) => {
    dispatch(setLoader(true));
    try {
      const response = await ApiUser().get("/admin/configs");

      dispatch(setLoader(false));
      if (response && response?.status) {
        dispatch(setConfigData(response?.data));
        return response;
      }
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      return error?.response?.status;
    }
  }
);
