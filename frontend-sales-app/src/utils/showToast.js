import { toast } from "react-toastify";

export const showToast = (message, type) => {
  const options = {
    autoClose: 2000, // Set the autoClose duration in milliseconds (2 seconds in this case)
  };
  // console.log("in toast: ", message);

  switch (type) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message.message ? message.message : message, options);
      break;
    case "warn":
      toast.warn(message.message, options);
      break;
    default:
      toast(message, options);
  }
};
