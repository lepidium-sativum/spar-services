import React, { useEffect, useState } from "react";
import FilterSection from "../../component/Button/FilterSection";
import { useDispatch } from "react-redux";
import StripModuleCard from "../../component/Cards/StripModuleCard";
import { getRecommendedList } from "../../../store/thunk/commonThunk";
import assets from "../../constants/assets";
import CommonModel from "../../component/Modal/CommonModel";
import BrowserSupportModel from "../../component/Modal/BrowserSupportModel";
import {
  resetCommonState,
  // setMediaUploading,
} from "../../../store/slices/commonSlice";
import { resetState } from "../../../store/slices/statesSlice";

const AllModules = () => {
  const dispatch = useDispatch();
  // const recommendedList = useSelector(
  //   (state) => state.commonReducer.recommendedList
  // );
  const [isBrowserSupport, setIsBrowserSupport] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userModules, setUserModules] = useState();
  const [originalModule, setOriginalModule] = useState();
  const [selectedFilter, setSelectedFilter] = useState("All"); // State to store selected filter
  // console.log("filter value: ", selectedFilter);

  // Function to handle receiving the selected filter from the child
  const handleFilterChange = (filterLabel) => {
    setSelectedFilter(filterLabel);
  };

  useEffect(() => {
    const fetchDataAndResetState = async () => {
      try {
        // Fetch the recommended list
        const response = await dispatch(getRecommendedList());
        if (response?.payload?.status === 200) {
          setUserModules(response.payload.data || []);
          setOriginalModule(response.payload.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // Reset the state after fetching data
        dispatch(resetCommonState());
        dispatch(resetState());
      }
    };

    fetchDataAndResetState();
  }, [dispatch]);

  // console.log("modules: ", recommendedList);
  // console.log("user modules: ", userModules);

  const handleBrowserSupportModel = () => {
    setIsBrowserSupport(true);
  };

  // Search handler function to filter modules by name or id
  const onSearchHandler = (data) => {
    if (data.trim() === "") {
      setUserModules(originalModule); // Reset to original module list if search term is empty
    } else {
      const lowerCasedData = data.toLowerCase();
      const resultData = originalModule.filter((item) => {
        const moduleName = item?.module?.name?.toLowerCase() || "";
        const moduleId = item?.module?.id?.toString() || "";
        return (
          moduleName.includes(lowerCasedData) ||
          moduleId.includes(lowerCasedData)
        );
      });
      setUserModules(resultData);
    }
  };
  // Update search term state and trigger the search handler
  const onChangeHandler = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    onSearchHandler(newSearchTerm);
  };
  return (
    <div className="flex h-screen flex-1 flex-col px-8 max-md:px-5 justify-start">
      <div className="text-base w-[1497px] mt-0 h-[13px] font-montserrat font-bold leading-[12.87px] text-primary mb-0 tracking-[0.10px]">
        Which module do you want to start?
      </div>
      <div className="flex flex-row w-full h-[52px] justify-between mt-9 mb-4">
        <div className="flex items-center justify-end w-[310px] px-4 text-[14px] font-semibold leading-[17.07px] rounded-2xl bg-[#333333] min-h-[48px] text-white text-opacity-70">
          <input
            value={searchTerm}
            onChange={onChangeHandler}
            type="text"
            id="searchInput"
            placeholder="Search module by name"
            className="bg-[#333333] border-none outline-none flex-grow w-full"
            // aria-label="Search module by name"
          />
          <button aria-label="Search" className="focus:outline-none">
            <img
              loading="lazy"
              src={assets.search}
              className="object-contain shrink-0 self-stretch my-auto ml-4 w-5 aspect-square"
              alt=""
            />
          </button>
        </div>
        <div className="flex flex-row w-full justify-end">
          <div className="flex flex-row items-center justify-center gap-2 px-5 my-auto">
            <span className="text-base font-montserrat font-bold leading-[12.87px] text-white mb-0 tracking-[0.10px]">
              Filter
            </span>
          </div>
          <div className="flex justify-end">
            <FilterSection onFilterChange={handleFilterChange} />
          </div>
        </div>
      </div>
      {!isBrowserSupport && (
        <CommonModel
          isVisible={true}
          onClose={handleBrowserSupportModel}
          isBrowserSupport={isBrowserSupport}
        >
          <BrowserSupportModel />
        </CommonModel>
      )}
      {userModules &&
        userModules.length > 0 &&
        userModules
          .filter((list) => {
            // Apply filter based on the selectedFilter
            if (selectedFilter === "All") {
              return true; // Show all if "All" is selected
            } else {
              return list?.module?.level === selectedFilter; // Filter by module level
            }
          })
          .map((item, index) => {
            return (
              <div
                key={index}
                className="flex flex-col w-full mt-2 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(335.03deg, #464646 0%, #1A1A1A 100%)  padding-box, #313732 border-box",
                  border: "1px solid transparent",
                }}
              >
                <StripModuleCard
                  item={item}
                  setIsBrowserSupport={setIsBrowserSupport}
                  index={index}
                />
              </div>
            );
          })}
    </div>
  );
};

export default AllModules;
