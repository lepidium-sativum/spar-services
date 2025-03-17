import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import assets from "../../../constants/assets";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../utils/showToast";
import {
  getPersonalities,
  getMetahumans,
  getScenes,
  deleteMetahuman,
  deleteScene,
  createAvatar,
  configApi,
} from "../../../../store/thunk/commonThunk";
import AddPersonalityModal from "../../../component/Modal/AddPersonalityModal";
import MetaHumanCard from "../../../component/Avatar/MetaHumanCard";
import BackgroundImageCard from "../../../component/Avatar/BackgroundImageCard";
import AddMetahumanModal from "../../../component/Modal/AddMetahumanModal";
import AddBackgroundModal from "../../../component/Modal/AddBackgroundModal";
import Button from "../../../component/Button/Button";

const CreateAvatar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let location = useLocation();
  const navigateTo = useNavigate();
  const personalitiesList = useSelector(
    (state) => state.commonReducer.personalitiesList
  );
  const metahumanImages = useSelector(
    (state) => state.commonReducer.metahumanImages
  );
  const backgroundImages = useSelector(
    (state) => state.commonReducer.backgroundImages
  );
  // console.log("personalities", personalitiesList);
  // console.log("metahumanImages", metahumanImages);

  const [personalities, setPersonalities] = useState("");
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openMetahumanModal, setOpenMetahumanModal] = useState(false);
  const [openBackgroundModal, setOpenBackgroundModal] = useState(false);

  const [avatarName, setAvatarName] = useState("");
  const [metahumans, setMetahumans] = useState([]);
  const [selectedMetaHuman, setSelectedMetaHuman] = useState(null);
  const [backgrounds, setBackgrounds] = useState([]);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [selectedMhIndex, setSelectedMhIndex] = useState(null); // Track the selected index
  const [selectedBgIndex, setSelectedBgIndex] = useState(null); // Track the selected index

  // console.log("metahumanImages", selectedMetaHuman);
  // console.log("backgrounds", selectedBackground);
  const [error, setError] = useState({
    avatarName: "",
    mImage: "",
    bImage: "",
    personality: "",
  });
  useEffect(() => {
    dispatch(getPersonalities())
      .then((response) => {
        if (response?.payload?.status === 200) {
          const sortedData = response?.payload?.data;

          // setData(sortedData);
          setPersonalities(sortedData);
          //   setOriginalClient(sortedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch, location]);

  useEffect(() => {
    dispatch(configApi());
  }, []);

  useEffect(() => {
    dispatch(getMetahumans())
      .then((response) => {
        if (response?.payload?.status === 200) {
          const sortedData = response?.payload?.data;
          // console.log("dddddddddddd", sortedData);
          // setData(sortedData);
          setMetahumans(sortedData);
          //   setOriginalClient(sortedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch, location]);

  useEffect(() => {
    dispatch(getScenes())
      .then((response) => {
        if (response?.payload?.status === 200) {
          const sortedData = response?.payload?.data;
          // console.log(sortedData);
          // setData(sortedData);
          setBackgrounds(sortedData);
          //   setOriginalClient(sortedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch, location]);

  const handleRadioChange = (personality) => {
    setSelectedPersonality(personality); // Only allow single selection
  };
  const handleMetaHumanSelect = (metaHuman, index) => {
    setSelectedMetaHuman(metaHuman);
    setSelectedMhIndex(index); // Set the selected index
  };
  const handleBackgroundSelect = (background, index) => {
    setSelectedBackground(background);
    setSelectedBgIndex(index);
  };
  const handleValidaton = () => {
    const newErrorsState = { ...error };
    let formIsValid = true;
    if (!avatarName) {
      formIsValid = false;
      newErrorsState.avatarName = "Name of Avatar is required!";
    } else {
      newErrorsState.avatarName = "";
    }
    if (!selectedPersonality) {
      formIsValid = false;
      newErrorsState.personality = "Select personality required!";
    } else {
      newErrorsState.personality = "";
    }
    if (!selectedBackground) {
      formIsValid = false;
      newErrorsState.bImage = "Select background Image!";
    } else {
      newErrorsState.bImage = "";
    }

    if (!selectedMetaHuman) {
      formIsValid = false;
      newErrorsState.mImage = "Select Metahuman Image!";
    } else {
      newErrorsState.mImage = "";
    }
    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Required fields are empty", "error");
      return false;
    }
    // else {
    //   // formIsValid = true;
    //   newErrorsState.mImage = "";
    // }

    // if (formIsValid == false) {
    //   alert("Please select/fill required fields");
    // }
    setError(newErrorsState);
    console.log("Validation errors:", newErrorsState); // Debugging: log validation errors
    console.log("Form is valid:", formIsValid); // Debugging: log form validity
    return formIsValid;
  };
  const handleSubmit = () => {
    // console.log("Initial state:", {
    //   avatarName,
    //   selectedPersonality,
    //   selectedBackground,
    //   selectedMetaHuman,
    // });
    if (handleValidaton()) {
      let data = {
        name: avatarName,
        metahuman_id: selectedMetaHuman?.id,
        bgscene_id: selectedBackground?.id,
        personality_id: selectedPersonality,
      };
      console.log("createAvatar data: ", data);
      dispatch(createAvatar(data))
        .then((res) => {
          if (res?.payload?.status === 200) {
            console.log("Avatar Created successful");
            navigateTo("/create-module");
          } else if (res?.payload) {
            console.log("error in creating Avatar: ", res?.payload);
          }
        })
        .catch((error) => {
          console.log("metahuman error response", error);
        });
    }
  };
  const handleDeleteMetaHuman = (metaHumanId) => {
    if (window.confirm("Are you sure you want to delete this Metahuman?")) {
      dispatch(deleteMetahuman(metaHumanId))
        .then((response) => {
          if (response?.payload?.status === 200) {
            setMetahumans((prev) =>
              prev.filter((metaHuman) => metaHuman.id !== metaHumanId)
            );
            if (selectedMetaHuman?.id === metaHumanId) {
              setSelectedMetaHuman(null);
              setSelectedMhIndex(null);
            }
          }
        })
        .catch((error) => {
          console.error("Error deleting Metahuman:", error);
        });
    }
  };
  const handleDeleteBackground = (bgId) => {
    if (window.confirm("Are you sure you want to delete this Background?")) {
      dispatch(deleteScene(bgId))
        .then((response) => {
          if (response?.payload?.status === 200) {
            setBackgrounds((prev) => prev.filter((bg) => bg.id !== bgId));
            if (selectedBackground?.id === bgId) {
              setSelectedBackground(null);
              setSelectedBgIndex(null);
            }
          }
        })
        .catch((error) => {
          console.error("Error deleting Metahuman:", error);
        });
    }
  };

  return (
    <div className="flex flex-col">
      <div className=" flex-1 flex-col">
        <div className="flex flex-row justify-start items-baseline w-3/4 ">
          <img
            src={assets.back}
            alt="Go Back"
            className="w-[25px] h-[25px]"
            onClick={() => navigate(-1)}
          />
          <h2 className="text-lg -m-4 -mt-2 font-bold ml-5">
            Create a new Avatar
          </h2>
        </div>
        <div className="mt-5 w-full bg-gray-200 border-2 border-gray-200 border-solid min-h-[2px] max-md:max-w-full" />

        <div className="flex h-auto">
          <div className="w-1/3  border-gray-300">
            <div className="flex flex-col w-11/12">
              <div className="flex flex-col  space-y-4 mt-4 w-full ">
                <div className="flex flex-col justify-between w-full">
                  <h2 className="text-sm  mt-4  font-montserrat font-bold">
                    Name the Avatar
                  </h2>
                  <div>
                    <input
                      type="text"
                      name="avatarName"
                      value={avatarName}
                      onChange={(e) => setAvatarName(e.target.value)}
                      placeholder=""
                      className={`w-full h-12 mt-3 bg-white border rounded-md p-[14px] ${
                        avatarName.trim()
                          ? "border-primary font-montserrat font-medium"
                          : "border-grey500 bg-bgInput"
                      } focus:outline-none focus:border-primary transition`}
                    />
                  </div>
                  <div className="w-full mb-10">
                    {error.avatarName ? (
                      <p className="error text-left text-error font-normal text-xs mt-1">
                        {error.avatarName}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="flex flex-row justify-between w-full h-10">
                  <h2 className="text-sm mt-8 font-montserrat font-bold">
                    Personalities
                  </h2>
                  <h2 className="text-sm ml-5 font-montserrat font-bold"></h2>
                  <Button
                    onClick={() => setOpenModal(true)}
                    className="btn-gradient-blue-round font-montserrat font-semibold mt-4"
                  >
                    + Add Personality
                  </Button>
                </div>
                <div className="inset-0 overflow-y-auto p-4 border border-gray-300 rounded-s-md w-full max-h-[30rem] min-h-[20rem] hide-scrollbar">
                  {personalities &&
                    personalities.map((personality, index) => (
                      <div
                        key={index}
                        className="flex flex-row justify-between px-1 py-2.5"
                      >
                        <label
                          htmlFor={`personality-${index}`}
                          className="text-lg"
                        >
                          {personality.description
                            ? personality.description
                            : personality.name}
                        </label>
                        <input
                          type="radio"
                          id={`personality-${index}`}
                          checked={selectedPersonality === personality.id}
                          onChange={() => handleRadioChange(personality.id)}
                          className="mr-2 w-5 "
                        />
                      </div>
                    ))}
                </div>
                <div className="flex w-full justify-start">
                  <div className="w-full">
                    {error.personality ? (
                      <p className="error text-left text-error font-normal text-xs">
                        {error.personality}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center w-4/5 mt-4 pb-4 relative">
            <div className="flex-row mb-4">
              <div className="inset-0 overflow-y-auto p-4 border border-gray-300 rounded-s-md w-full h-80 hide-scrollbar">
                <div className="flex flex-row justify-between w-full h-10 mr-0">
                  <h2 className="text-sm  mt-4 font-montserrat font-bold">
                    Metahuman
                  </h2>
                  <Button
                    onClick={() => setOpenMetahumanModal(true)}
                    className="btn-gradient-blue-round font-montserrat font-semibold "
                  >
                    + Add Metahuman
                  </Button>
                </div>
                <MetaHumanCard
                  images={metahumans}
                  onSelect={handleMetaHumanSelect}
                  selectedMhIndex={selectedMhIndex}
                  onDelete={handleDeleteMetaHuman}
                />
              </div>
              <div className="flex w-full justify-start">
                <div className="w-1/3 pl-8 mt-0">
                  {error.mImage ? (
                    <p className="error text-left text-error font-normal text-xs">
                      {error.mImage}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="inset-0 overflow-y-auto p-4 border border-gray-300 rounded-s-md w-full h-80 hide-scrollbar mt-14">
                <div className="flex flex-row justify-between w-full h-10 mt-0">
                  <h2 className="text-sm mt-4 mb-6 font-montserrat font-bold">
                    Background Image
                  </h2>
                  <Button
                    onClick={() => setOpenBackgroundModal(true)}
                    className="btn-gradient-blue-round font-montserrat font-semibold "
                  >
                    + Add Background
                  </Button>
                </div>
                <BackgroundImageCard
                  images={backgrounds}
                  onSelect={handleBackgroundSelect}
                  selectedBgIndex={selectedBgIndex}
                  onDelete={handleDeleteBackground}
                />
              </div>
              <div className="flex w-full justify-start">
                <div className="w-full pl-8">
                  {error.bImage ? (
                    <p className="error text-left text-error font-normal text-xs">
                      {error.bImage}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <div
              className="w-80 h-96 bg-gray-200 border-gray-300 rounded flex items-center justify-center ml-5 border-spacing-4 mt-14"
              style={{
                backgroundImage: selectedBackground
                  ? `url(${selectedBackground.background_image.url})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {selectedMetaHuman ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedMetaHuman.url}
                    alt={selectedMetaHuman.name}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              ) : (
                <p className="z-1">Avatar Image</p>
              )}
            </div>
            <div className="flex justify-center items-center w-full mt-8 h-12 ml-3">
              <Button
                onClick={handleSubmit}
                className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-200"
                // className="btn-gradient-blue-round font-montserrat font-semibold "
              >
                Save and Close
              </Button>
            </div>
          </div>
          {openModal && (
            <AddPersonalityModal onClose={() => setOpenModal(false)} />
          )}
          {openMetahumanModal && (
            <AddMetahumanModal onClose={() => setOpenMetahumanModal(false)} />
          )}
          {openBackgroundModal && (
            <AddBackgroundModal onClose={() => setOpenBackgroundModal(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAvatar;
