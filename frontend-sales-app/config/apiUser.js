import axios from "axios";
import Config from "./config";

const baseURL = Config.API_URL_MAIN;

const ApiUser = (options) => {
  const access_token = localStorage.getItem("token");
  const clean_token = access_token
    ? access_token.replace(/^"(.*)"$/, "$1")
    : "";
  const headers = { Authorization: `Bearer ${clean_token}` };

  if (options && options?.formData) {
    Object.assign(headers, { "content-type": "multipart/form-data" });
  }

  const instance = axios.create({
    baseURL,
    withCredentials: false,
    headers,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error?.response?.status === 401 &&
        error?.response?.config.url !== "auth/tokens"
      ) {
        window.location.href = "/login";
        localStorage.clear();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default ApiUser;
