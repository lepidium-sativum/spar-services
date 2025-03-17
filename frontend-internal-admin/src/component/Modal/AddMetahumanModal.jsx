import React, { useState, useRef } from "react";
import Button from "../Button/Button";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
// import config from "../Modal/config.json";
import {
  createMetahuman,
  uploadMetahumanImage,
} from "../../../store/thunk/commonThunk";
import { useNavigate } from "react-router-dom";
import MoonLoader from "react-spinners/MoonLoader";
import { showToast } from "../../utils/showToast";
import imageCompression from "browser-image-compression";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const AddMetahumanModal = ({ onClose }) => {
  const dispatch = useDispatch();
  let navigateTo = useNavigate();
  const isLoader = useSelector((state) => state.commonReducer.loader);
  const [selectedColour, setSelectedColour] = useState("");

  const [selectedGender, setSelectedGender] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const metahumanURL = useSelector((state) => state.commonReducer.metahumanURL); // Adjust according to your state structure
  // console.log("metahuman image: ", metahumanURL);
  const fileInputRef = useRef(null);
  const [error, setError] = useState({
    name: "",
    age: "",
    gender: "",
    image: "",
  });
  const [inputValue, setInputValue] = useState({
    name: "",
    age: "",
  });

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };
  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const options = {
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        maxIteration: 20,
        initialQuality: 0.2,
      };

      try {
        const compressedFile = await imageCompression(file, options);

        setImagePreview(URL.createObjectURL(compressedFile));
        setImage(compressedFile);
      } catch (error) {
        console.error("Image compression error:", error);
      }
    }
  };

  // const handleImageChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setImagePreview(URL.createObjectURL(file));
  //     setImage(file); // Set the file directly
  //   }
  // };

  const handleChangeStyle = (event) => {
    setSelectedColour(event.target.value);
  };
  const handleUpload = () => {
    if (image) {
      dispatch(uploadMetahumanImage(image))
        .then((res) => {
          console.log("res: ", res);
          if (res?.payload?.status === 200) {
            setIsUploaded(true);
          } else if (res?.payload) {
            console.log("error uploading methuman: ", res?.payload);
          }
        })
        .catch((error) => {
          console.log("Uploading image error: ", error);
        });
    } else {
      alert("select image");
    }
  };
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  const handleValidation = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;
    if (!imagePreview) {
      formIsValid = false;
      newErrorsState.image = "Metahuman image is required!";
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
    if (!inputValue.age) {
      formIsValid = false;
      newErrorsState.age = "Age is required!";
    } else {
      newErrorsState.age = "";
    }
    if (!selectedGender) {
      formIsValid = false;
      newErrorsState.gender = "Gender is required!";
    } else {
      newErrorsState.gender = "";
    }

    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Required fields are empty", "error");
      return false;
    }
    let data = _.extend(inputValue, { gender: selectedGender });
    data = _.extend(data, { image_id: metahumanURL.image_id });
    // console.log("form: ", data);

    dispatch(createMetahuman(data))
      .then((res) => {
        if (res?.payload?.status === 200) {
          setError({});
          onClose();
          navigateTo("/createAvatar");
        } else if (res?.payload) {
          onClose();
          console.log("error creating methuman: ", res?.payload);
        }
      })
      .catch((error) => {
        console.log("metahuman error response", error);
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
  // console.log("loader: ", configureData);

  return (
    <div className="fixed inset-0  flex max-w-full justify-center items-center h-full bg-opacity-15 backdrop-blur-lg add-user-modal">
      <div className="mt-0 mb-2 text-[rgb(231,231,231)] bg-[#666666] rounded-xl w-3/4 h-10/12  flex flex-col  gap-4 mx-4 overflow-auto p-5 hide-scrollbar shadow-xl">
        <div className="flex justify-end w-full h-16">
          <button className="mr-7  font-extrabold" onClick={() => onClose()}>
            X
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h3 className="text-xl font-montserrat text-white font-bold dark:text-white">
            Add a new Metahuman
          </h3>
        </div>
        <div className="flex w-full flex-row justify-center ml-20">
          <div className="flex w-full flex-col p-4 ">
            <div
              className="flex flex-col w-10/12 mb-2  form-filed"
              // className={`flex flex-col w-1/3 mb-2 mt-6 form-filed ${
              //   error.name ? "error" : ""
              // }`}
            >
              <h4 className="mb-2 font-montserrat font-semibold">
                Methuman Name
              </h4>

              <div
                className={`flex w-full  bg-[rgb(89,89,89)] border-[#EAECF0] ${
                  error.name ? "error" : ""
                }`}
              >
                <select
                  name="name"
                  value={inputValue.name}
                  onChange={handleInputChange}
                  className={`w-full h-12 bg-[rgb(89,89,89)] border rounded-md p-[14px] ${
                    inputValue.name.trim()
                      ? "border-primary  font-montserrat font-medium "
                      : " border bg-[rgb(89,89,89)] border-[#EAECF0] "
                  } focus:outline-none focus:border-primary transition`}
                >
                  <option value="" disabled>
                    Select a Metahuman
                  </option>
                  {configureData.metahuman_names.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
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
            <div
              className="flex flex-col w-10/12 mb-2 mt-6 form-filed"
              // className={`flex flex-col w-1/3 mb-2 mt-6 form-filed ${
              //   error.age ? "error" : ""
              // }`}
            >
              <h4 className="mb-2 font-montserrat font-semibold">Age</h4>
              <div className={`flex w-full ${error.age ? "error" : ""}`}>
                <input
                  type="text"
                  name="age"
                  value={inputValue.age}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                  className={`w-full h-12 bg-[rgb(89,89,89)] border rounded-md p-[14px] ${
                    inputValue.age.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : " border bg-[rgb(89,89,89)] border-[#EAECF0]"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.age ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.age}
                </p>
              ) : (
                ""
              )}
            </div>
            <div
              className="flex flex-col w-10/12 mb-2 mt-4 form-filed"
              // className={`flex flex-col w-1/3 mb-2 form-filed ${
              //   error.age ? "error" : ""
              // }`}
            >
              <h4 className="mb-2 font-montserrat font-semibold">Gender</h4>

              <div className="inset-0 overflow-y-auto p-4 border bg-[rgb(89,89,89)] border-[#EAECF0] rounded-s-md w-full h-24 hide-scrollbar">
                {genderOptions &&
                  genderOptions.map((gender) => (
                    <div
                      key={gender.label}
                      className="flex flex-row justify-between px-5"
                    >
                      <label htmlFor={gender} className="text-lg">
                        {gender.label}
                      </label>
                      <div className={`${error.gender ? "error" : ""}`}>
                        <input
                          type="radio"
                          name="gender"
                          value={gender.value}
                          checked={selectedGender === gender.value}
                          onChange={handleGenderChange}
                          className="w-5"
                        />
                      </div>
                    </div>
                  ))}
              </div>
              {error.gender ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.gender}
                </p>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className=" flex flex-col w-full   ">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
            <Button
              onClick={handleButtonClick}
              className=" w-48 mt-6 ml-4 bg-[rgb(89,89,89)] text-white font-bold py-2 px-2 justify-center rounded-md hover:bg-[rgb(70,70,70)]"
            >
              + Add Metahuman
            </Button>
            <div className="mt-2 mb-2 border bg-[rgb(89,89,89)] border-[#EAECF0] rounded-xl w-56 h-56">
              {imagePreview && (
                <div className="flex flex-row size-full">
                  <img
                    src={imagePreview}
                    alt=""
                    className="w-full h-full rounded-xl "
                  />
                  {isLoader ? (
                    <MoonLoader
                      color={"#004099"}
                      loading={isLoader}
                      cssOverride={{
                        display: "block",
                        margin: "0 auto",
                        borderColor: "red",
                      }}
                      size={30}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  ) : null}
                </div>
              )}
            </div>
            {imagePreview ? (
              !isUploaded ? (
                <Button
                  onClick={handleUpload}
                  className="btn-gradient-white text-white bg-[rgb(89,89,89)]  mx-4 ml-10"
                >
                  Upload
                </Button>
              ) : (
                <h4 className=" text-green-600">Image Uploaded</h4>
              )
            ) : null}

            <div>
              {error.image ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.image}
                </p>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        <div className=" mb-10 justify-center ml-96 ">
          <div className=" mt-8 w-full">
            <Button
              onClick={handleSubmit}
              className="btn bg-green-600 text-xl w-96 "
              disabled={isUploaded}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AddMetahumanModal;
