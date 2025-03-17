import React, { useState, useRef } from "react";
import Button from "../Button/Button";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import {
  addScene,
  uploadBackgoundImage,
} from "../../../store/thunk/commonThunk";
import { showToast } from "../../utils/showToast";
import { useNavigate } from "react-router-dom";
import MoonLoader from "react-spinners/MoonLoader";
// import config from "./config.json";
function AddBackgroundModal({ onClose }) {
  const dispatch = useDispatch();
  let navigateTo = useNavigate();
  const isLoader = useSelector((state) => state.commonReducer.loader);
  const [selectedBackground, setSelectedBackGround] = useState("");

  const backgroundURL = useSelector(
    (state) => state.commonReducer.backgroundURL
  ); // Adjust according to your state structure

  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const fileInputRef = useRef();

  const [error, setError] = useState({
    name: "",
    image: "",
  });
  const [inputValue, setInputValue] = useState({
    name: "",
    background: "",
  });
  const handleChangeBackGround = (event) => {
    setInputValue((prevValue) => ({
      ...prevValue,
      name: event.target.value,
    }));
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImage(file); // Set the file directly
    }
  };
  const handleUpload = () => {
    if (image) {
      dispatch(uploadBackgoundImage(image))
        .then((res) => {
          console.log("res: ", res);
          if (res?.payload?.status === 200) {
            setIsUploaded(true);
          } else if (res?.payload) {
            console.log("error uploading background: ", res?.payload);
          }
        })
        .catch((error) => {
          console.log("Uploading image error: ", error);
        });
    }
  };
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleValidation = () => {
    const newErrorsState = {};
    let formIsValid = true;
    if (!imagePreview) {
      formIsValid = false;
      newErrorsState.image = "Background image is required!";
    } else {
      // formIsValid = true;
      newErrorsState.image = "";
    }
    if (!inputValue.name) {
      formIsValid = false;
      newErrorsState.name = "Name is required!";
    } else {
      newErrorsState.name = "";
    }
    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Required fields are empty", "error");
      return false;
    }
    let data = _.extend(inputValue, { image_id: backgroundURL.image_id });
    console.log("form: ", data);

    dispatch(addScene(data))
      .then((res) => {
        if (res?.payload?.status === 200) {
          onClose();
          setError({});
          navigateTo("/createAvatar");
        }
      })
      .catch((error) => {
        console.log("Background error response", error);
        newErrorsState.login = "An unexpected error occurred.";
        setError(newErrorsState);
      });
    setError(newErrorsState);
  };

  const handleSubmit = (e) => {
    // onClose();
    e.preventDefault();
    handleValidation();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevInputValue) => ({
      ...prevInputValue,
      [name]: value,
    }));
  };
  const configureData = useSelector((state) => state.commonReducer.configData);
  return (
    <div className="fixed inset-0 flex max-w-full justify-center h-full bg-opacity-15 backdrop-blur-lg add-user-modal">
      <div className="mt-10 mb-10 text-[rgb(231,231,231)] bg-[#666666] rounded-xl w-1/3 h-4/5  flex flex-col  gap-5 mx-4 overflow-auto p-5 hide-scrollbar shadow-lg">
        <div className="flex justify-end w-full h-20">
          <button
            className="mr-7 mt-5 font-extrabold"
            onClick={() => onClose()}
          >
            X
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h3 className="text-xl mt-0 font-montserrat  font-bold dark:text-white">
            Add a new Background
          </h3>
        </div>

        <div className=" flex w-full flex-col justify-center items-center  ">
          <div
            className="flex flex-col w-2/4 mb-2 mt-6 form-filed"
            // className={`flex flex-col w-1/3 mb-2 mt-6 form-filed ${
            //   error.name ? "error" : ""
            // }`}
          >
            <h4 className="mb-2 font-montserrat font-semibold  ">
              Background Name
            </h4>
            <div className={`flex w-full ${error.background ? "error" : ""}`}>
              <select
                name="background"
                value={inputValue.name}
                onChange={handleChangeBackGround}
                className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[13px] ${
                  inputValue.background.trim()
                    ? "border-primary font-montserrat font-medium"
                    : "border-grey500 bg-[rgb(130,130,130)]"
                } focus:outline-none focus:border-primary transition`}
              >
                <option value="" disabled>
                  Select name of background
                </option>
                {configureData.metahuman_backgrounds.map(
                  (background, index) => (
                    <option key={index} value={background}>
                      {background}
                    </option>
                  )
                )}
              </select>
            </div>
            {error.name ? (
              <p className="error text-left text-error font-normal text-xs mt-1">
                {error.name}
              </p>
            ) : (
              ""
            )}
          </div>
          <div className=" flex w-2/12 flex-col">
            <div className="justify-start">
              <Button
                onClick={handleButtonClick}
                className="btn bg-[rgb(130,130,130)] text-white font-bold py-2 px-2 rounded-md hover:bg-[rgb(70,70,70)] border-[#EAECF0] "
              >
                + Add Image
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>
          <div className="mt-4 border bg-[rgb(130,130,130)] border-[#EAECF0] rounded-xl w-52 h-52">
            {imagePreview && (
              <div className="flex flex-row size-full">
                <img
                  src={imagePreview}
                  alt=""
                  className="w-full h-full rounded-xl"
                />
                {isLoader ? (
                  <MoonLoader
                    color={"#004099"}
                    loading={isLoader}
                    cssOverride={{
                      display: "block",
                      marginLeft: "10px",
                      borderColor: "red",
                    }}
                    size={30}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                ) : null}
              </div>
            )}
            {!isUploaded ? (
              <Button
                onClick={handleUpload}
                className="btn bg-[rgb(130,130,130)] text-white font-bold py-2 px-2 rounded-md hover:bg-[rgb(70,70,70)] border-[#EAECF0]  ml-16"
              >
                Upload
              </Button>
            ) : (
              <h4 className=" text-cyan-600">Image Uploaded</h4>
            )}
          </div>
          <div className="w-1/3">
            {error.image ? (
              <p className="error text-left text-error font-normal text-xs mt-1">
                {error.image}
              </p>
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="flex flex-col mt-8 mb-5 justify-center items-center">
          <Button
            onClick={handleSubmit}
            type="submit"
            className="btn btn-gradient-blue "
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
export default AddBackgroundModal;
