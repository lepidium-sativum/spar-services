import { v4 as uuidv4 } from "uuid";
export const generateUniqueId = () => {
  const timestamp = new Date().getTime();
  const randomString = uuidv4().replace(/-/g, ""); // Remove dashes from the UUID

  return `${timestamp}_${randomString}`;
};
