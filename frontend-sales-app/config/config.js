const env = await import.meta.env;
export default {
  API_URL_MAIN: env.VITE_API_URL_MAIN,
  AZURE_SERVICE_REGION: env.VITE_AZURE_SERVICE_REGION,
};
