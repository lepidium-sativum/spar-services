import React, { useState, useMemo, useEffect, useRef } from "react";
import Button from "../Button/Button";
import Select, { components } from "react-select";
import countryList from "react-select-country-list";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import {
  createClient,
  getClient,
  updateClient,
} from "../../../store/thunk/commonThunk";
import MoonLoader from "react-spinners/MoonLoader";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/showToast";

const AddClientModal = ({ onClose, clientId }) => {
  const options = useMemo(() => countryList().getData(), []);
  const dispatch = useDispatch();
  let navigateTo = useNavigate();
  const [country, setCountry] = useState(null);

  const [client, setClient] = useState("");
  const [error, setError] = useState({
    name: "",
    company: "",
    site_url: "",
    description: "",
    email: "",
    domain: "",
    city: "",
    branch: "",
    country: "",
  });
  const [inputValue, setInputValue] = useState({
    name: "",
    company: "",
    site_url: "",
    description: "",
    email: "",
    domain: "",
    city: "",
    branch: "",
    raw_files: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const metahumanURL = useSelector((state) => state.commonReducer.metahumanURL); // Adjust according to your state structure
  const isLoader = useSelector((state) => state.commonReducer.loader);

  // console.log("metahuman image: ", metahumanURL);
  const fileInputRef = useRef(null);
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImage(file); // Set the file directly
    }
  };
  const handleUpload = () => {
    if (image) {
      dispatch(uploadMetahumanImage(image))
        .then((res) => {
          // console.log("res: ", res);
          if (res?.payload?.status === 200) {
            setIsUploaded(true);
          } else if (res?.payload) {
            console.log("error uploading methuman: ", res?.payload);
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
  // data = _.extend(data, { image_id: metahumanURL.image_id });
  useEffect(() => {
    if (clientId) {
      dispatch(getClient(clientId))
        .then((response) => {
          if (response?.payload?.status === 200) {
            const sortedData = response?.payload?.data;
            // const users = sortedData.map((user) => user.users);
            setClient(sortedData);
            setInputValue((prevInputValue) => ({
              ...prevInputValue,
              name: sortedData.name || "",
              company: sortedData.company || "",
              site_url: sortedData.site_url || "",
              description: sortedData.description || "",
              email: sortedData.email || "",
              domain: sortedData.domain || "",
              city: sortedData.locations?.city || "",
              branch: sortedData.locations?.branch || "",
              raw_files: sortedData.raw_files || null,
            }));
            setCountry(
              options.find(
                (option) => option.label === sortedData.locations?.country
              ) || ""
            );
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } else {
      setClient(null);
      setInputValue({
        name: "",
        company: "",
        site_url: "",
        description: "",
        email: "",
        domain: "",
        city: "",
        branch: "",
        raw_files: null,
      });
      setCountry("");
    }
  }, [clientId, dispatch, options]);
  // const moduleOptions = [
  //   { modulueId: "1", value: "module 1", label: "Module 1" },
  //   { modulueId: "2", value: "module 2", label: "Module 2" },
  //   { modulueId: "3", value: "module 3", label: "Module 3" },
  // ];
  // const CheckboxOption = (props) => {
  //   return (
  //     <components.Option {...props}>
  //       <div className="flex flex-row justify-between">
  //         {/* <label className="">{props.modulueId}</label> */}
  //         <label className="">{props.label}</label>
  //         <input
  //           className=""
  //           type="checkbox"
  //           checked={props.isSelected}
  //           onChange={() => null}
  //         />
  //       </div>
  //     </components.Option>
  //   );
  // };

  const handleValidation = () => {
    const newErrorsState = {};
    let formIsValid = true;
    if (!inputValue.company) {
      formIsValid = false;
      newErrorsState.company = "Company Name is required!";
    } else {
      // formIsValid = true;
      newErrorsState.company = "";
    }
    if (!inputValue.site_url) {
      formIsValid = false;
      newErrorsState.site_url = "Company Url is required!";
    } else {
      // formIsValid = true;
      newErrorsState.site_url = "";
    }
    if (!inputValue.email) {
      formIsValid = false;
      newErrorsState.email = "Company email is required!";
    } else {
      // formIsValid = true;
      newErrorsState.email = "";
    }
    if (!inputValue.domain) {
      formIsValid = false;
      newErrorsState.domain = "Company Domain is required!";
    } else {
      // formIsValid = true;
      newErrorsState.domain = "";
    }

    if (!inputValue.city) {
      formIsValid = false;
      newErrorsState.city = "City is required!";
    } else {
      // formIsValid = true;
      newErrorsState.city = "";
    }
    if (!inputValue.branch) {
      formIsValid = false;
      newErrorsState.branch = "Branch Name is required!";
    } else {
      // formIsValid = true;
      newErrorsState.branch = "";
    }
    if (!inputValue.description) {
      formIsValid = false;
      newErrorsState.description = "Company Description is required!";
    } else {
      // formIsValid = true;
      newErrorsState.description = "";
    }
    if (country === "") {
      formIsValid = false;
      newErrorsState.country = "Country is required!";
    } else {
      // formIsValid = true;
      newErrorsState.country = "";
    }
    if (!inputValue.name) {
      formIsValid = false;
      newErrorsState.name = "Name is required!";
    } else {
      // formIsValid = true;
      newErrorsState.name = "";
    }
    // if (selectedModules.length === 0) {
    //   formIsValid = false;
    //   newErrorsState.selectedModules = "Assign Modules is required!";
    // } else {
    //   formIsValid = true;
    //   newErrorsState.selectedModules = "";
    // }

    if (formIsValid == false) {
      setError(newErrorsState);
      showToast("Required fields are empty", "error");
      return false;
    }

    let locations = {
      country: country.label,
      city: inputValue.city,
      branch: inputValue.branch,
    };

    let data = _.extend(inputValue, { locations });
    data = _.omit(data, ["city"]);
    data = _.omit(data, ["branch"]);

    data = _.extend(data, { clientId });
    console.log("form: ", data);
    if (clientId) {
      dispatch(updateClient(data))
        .then((res) => {
          if (res?.payload?.status === 200) {
            console.log("Client created successful");
            setError({});
            onClose();
            navigateTo("/clients");
          } else if (res?.payload) {
            console.log("error creation client: ", res?.payload);
          }
        })
        .catch((error) => {
          console.log("Client error response", error);
          newErrorsState.login = "An unexpected error occurred.";
          setError(newErrorsState);
        });
    } else {
      dispatch(createClient(data))
        .then((res) => {
          if (res?.payload?.status === 200) {
            console.log("Client created successful");
            setError({});
            onClose();
            navigateTo("/clients");
          } else if (res?.payload) {
            console.log("error creation client: ", res?.payload);
          }
        })
        .catch((error) => {
          console.log("Client error response", error);
          newErrorsState.login = "An unexpected error occurred.";
          setError(newErrorsState);
        });
    }

    setError(newErrorsState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleValidation();
  };
  const changeHandler = (value) => {
    setCountry(value);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevInputValue) => ({
      ...prevInputValue,
      [name]: value,
    }));
  };
  // const handleChange = (selected) => {
  //   setSelectedModules(selected);
  // };
  return (
    // add raw_files
    <div className="fixed inset-0 z-50 flex max-w-full justify-center h-full bg-opacity-15 backdrop-blur-lg">
      <div className="mt-10 mb-10 text-[rgb(231,231,231)] bg-[#666666] rounded-xl w-3/4 h-5/6 flex flex-col gap-5 mx-4 overflow-y-auto hide-scrollbar shadow-xl">
        <div className="flex justify-end w-full h-20">
          <button
            className="mr-7 mt-5 font-extrabold"
            onClick={() => onClose()}
          >
            X
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h3 className="text-xl mt-0 font-montserrat text-[rgb(231,231,231)] font-bold">
            Add a new Client
          </h3>
        </div>
        <div>
          <div className=" flex w-full">
            <div className=" flex w-6/12 flex-col justify-center items-center ">
              {/* <div className=" flex w-1/4 flex-col">
                <Button
                  onClick={handleButtonClick}
                  className="btn bg-[rgb(89,89,89)] text-white font-bold py-2 px-2 rounded-md hover:bg-[rgb(70,70,70)] "
                >
                  + Add Logo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div> 
               <div className="mt-2 border bg-[rgb(89,89,89)] border-[#EAECF0] rounded-xl w-2/4 h-52">
                {imagePreview && (
                  <div className="flex flex-row size-full">
                    <img
                      src={imagePreview}
                      alt=""
                      className="w-full h-full rounded-md"
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
                <div className="flex justify-center">
                  {!isUploaded ? (
                    <Button
                      onClick={handleUpload}
                      className="btn bg-[rgb(89,89,89)] text-white font-bold py-2 px-2 rounded-md hover:bg-[rgb(70,70,70)] mt-2"
                    >
                      Upload
                    </Button>
                  ) : (
                    <h4 className="mt-40 text-cyan-600">Image Uploaded</h4>
                  )}
                </div>
              </div> */}
              <div className="justify-center">
                <div className="mb-0 mt-12">
                  <h4>Company Name</h4>
                </div>
                <div className="w-11/12lex flex-col mt-2">
                  <input
                    type="text"
                    name="company"
                    value={inputValue.company}
                    onChange={handleInputChange}
                    placeholder="Sephora"
                    className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                      inputValue.company.trim()
                        ? "border-primary  font-montserrat font-medium"
                        : "border-grey500 bg-[rgb(89,89,89)]"
                    } focus:outline-none focus:border-primary transition`}
                  />
                </div>
                {error.company ? (
                  <p className="error text-left text-error font-normal text-xs mt-1">
                    {error.company}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>

            <div className="w-2/4 flex flex-col mr-10 mt-5">
              <div className="mb-2 block">
                <h4>Name</h4>
              </div>
              <div>
                <input
                  type="text"
                  name="name"
                  value={inputValue.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                    inputValue.name.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500 bg-[rgb(89,89,89)]"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.name ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.name}
                </p>
              ) : (
                ""
              )}

              <div className="mb-2 mt-5 block  ">
                <h4>Company Email</h4>
              </div>
              <div>
                <input
                  type="text"
                  name="email"
                  value={inputValue.email}
                  onChange={handleInputChange}
                  placeholder="hello@spar.com"
                  className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                    inputValue.email.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500 bg-[rgb(89,89,89)]"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.email ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.email}
                </p>
              ) : (
                ""
              )}
              <div className="mb-2 mt-5">
                <h4>Company Url</h4>
              </div>
              <div>
                <input
                  type="text"
                  name="site_url"
                  value={inputValue.site_url}
                  onChange={handleInputChange}
                  placeholder="Sephora"
                  className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                    inputValue.site_url.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500 bg-[rgb(89,89,89)]"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.site_url ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.site_url}
                </p>
              ) : (
                ""
              )}
              <div className="mb-2 mt-5 block  ">
                <h4>Company Description</h4>
              </div>
              <div>
                <textarea
                  name="description"
                  placeholder="Sephora is a multinational retailer of personal care and beauty products"
                  value={inputValue.description}
                  onChange={handleInputChange}
                  rows={2}
                  cols={20}
                  className={`w-full h-full bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                    inputValue.description.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500 bg-[rgb(89,89,89)]"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.description ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.description}
                </p>
              ) : (
                ""
              )}
            </div>

            <div className="w-1/2 flex flex-col mr-20">
              <div className="mb-2 mt-5 block  ">
                <h4>Company Domain</h4>
              </div>
              <div>
                <input
                  type="text"
                  name="domain"
                  value={inputValue.domain}
                  onChange={handleInputChange}
                  placeholder="Spar subdomain"
                  className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                    inputValue.domain.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500 bg-[rgb(89,89,89)]"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.domain ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.domain}
                </p>
              ) : (
                ""
              )}

              <div className="mb-2 mt-5 block ">
                <h4>Country</h4>
              </div>
              <div>
                <Select
                  options={options}
                  value={country}
                  onChange={changeHandler}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      color: "white",
                      height: 48,
                      borderRadius: 6,
                      backgroundColor: "#595959",
                      // backgroundColor: "rgb(89, 89, 89)",
                      borderColor: state.isFocused ? "#95eba3" : "#333333", // primary color when focused
                      boxShadow: state.isFocused
                        ? "0 0 0 1px #95eba3"
                        : "#333333", // primary color shadow when focused
                      "&:hover": {
                        borderColor: "#95eba3",
                      }, // primary color on hover
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "white",
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      borderRadius: 7,
                      backgroundColor: "#595959", // Set background of the dropdown
                      "&::-webkit-scrollbar": {
                        width: "12px", // Width of the scrollbar
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#333333", // Thumb color to match the input background
                        borderRadius: "7px", // Rounded corners for the scrollbar thumb
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "#555", // Track color (background behind the scrollbar thumb)
                        borderRadius: "6px",
                      },
                    }),
                  }}
                />
              </div>
              {error.country ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.country}
                </p>
              ) : (
                ""
              )}

              <div className="mb-2 mt-5 block  ">
                <h4>City</h4>
              </div>
              <div>
                <input
                  type="text"
                  name="city"
                  value={inputValue.city}
                  onChange={handleInputChange}
                  placeholder="Spar subdomain"
                  className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                    inputValue.city.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500 bg-[rgb(89,89,89)]"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.city ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.city}
                </p>
              ) : (
                ""
              )}
              <div className="mb-2 mt-5 block  ">
                <h4>Branch</h4>
              </div>
              <div>
                <input
                  type="text"
                  name="branch"
                  value={inputValue.branch}
                  onChange={handleInputChange}
                  placeholder="branch"
                  className={`w-full h-12 bg-[rgb(130,130,130)] border rounded-md p-[14px] ${
                    inputValue.branch.trim()
                      ? "border-primary  font-montserrat font-medium"
                      : "border-grey500 bg-[rgb(89,89,89)]"
                  } focus:outline-none focus:border-primary transition`}
                />
              </div>
              {error.branch ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.branch}
                </p>
              ) : (
                ""
              )}
              {/* <div className="mb-2 block ">
                <h4>Assign Modules</h4>
              </div>
              <Select
                options={moduleOptions}
                value={selectedModules}
                onChange={handleChange}
                isMulti
                placeholder="Select Modules"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    color: "#555555",
                    borderColor: state.isFocused ? "#95eba3" : "#555555", // primary color when focused
                    boxShadow: state.isFocused
                      ? "0 0 0 1px #95eba3"
                      : "#555555", // primary color shadow when focused
                    "&:hover": {
                      borderColor: "#95eba3",
                    }, // primary color on hover
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    backgroundColor: "#95eba3",
                    color: "#555555",
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: "#555555",
                  }),
                  multiValueRemove: (provided) => ({
                    ...provided,
                    color: "#555555",
                    ":hover": {
                      backgroundColor: "#6750A4",
                      color: "#ffffff",
                    },
                  }),
                }}
                components={{ Option: CheckboxOption }}
              />
              {error.selectedModules ? (
                <p className="error text-left text-error font-normal text-xs mt-1">
                  {error.selectedModules}
                </p>
              ) : (
                ""
              )} */}
            </div>
          </div>
          <div className="flex flex-col mt-8 mb-5 justify-center items-center">
            <Button
              onClick={handleSubmit}
              type="submit"
              className="btn btn-gradient-blue"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AddClientModal;
