import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  getRecommendedList,
  getUserModules,
} from "../../../store/thunk/commonThunk";
import assets from "../../constants/assets";
import FilterSection from "../../component/Button/FilterSection";
import StripReportCard from "../../component/Cards/StripReportCard";

const MyReports = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [userModules, setUserModules] = useState("");
  const [moduleList, setModuleList] = useState("");
  const [originalModule, setOriginalModule] = useState();
  const [selectedFilter, setSelectedFilter] = useState("All"); // State to store selected filter
  // console.log("filter value: ", selectedFilter);

  // Function to handle receiving the selected filter from the child
  const handleFilterChange = (filterLabel) => {
    setSelectedFilter(filterLabel);
  };
  // const recommendedList = useSelector(
  //   (state) => state.commonReducer.recommendedList
  // );
  useEffect(() => {
    dispatch(getRecommendedList())
      .then((response) => {
        if (response?.payload?.status === 200) {
          setModuleList(response?.payload?.data || []);
          setOriginalModule(response?.payload?.data || []);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch]);

  useEffect(() => {
    // console.log("userId: ", userId);
    dispatch(getUserModules())
      .then((response) => {
        if (response?.payload?.status === 200) {
          // console.log("data: ", response?.payload?.data);
          const sortedData = response?.payload?.data.map((item) => item.module);
          setUserModules(sortedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch]);

  const onSearchHandler = (data) => {
    if (data.trim() === "") {
      setModuleList(originalModule);
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
      setModuleList(resultData);
    }
  };

  const onChangeHandler = (event) => {
    setSearchTerm(event.target.value);
    onSearchHandler(event.target.value);
  };
  // console.log("spar and modules: ", userModules);

  return (
    <div className="flex h-screen flex-1 flex-col py-0 px-8  max-md:px-5 justify-start">
      <div className="text-[16px] mt-0 h-[13px] font-montserrat font-bold leading-[12.87px] text-primary mb-0 tracking-tightest">
        Which spar session do you want to review?
      </div>
      <div className="flex flex-row w-full h-[52px] justify-between mt-9">
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
      <div className="mt-4"></div>
      {moduleList &&
        moduleList.length > 0 &&
        moduleList
          .filter((list) => {
            // Apply filter based on the selectedFilter
            if (selectedFilter === "All") {
              return true; // Show all if "All" is selected
            } else {
              return list?.module?.level === selectedFilter; // Filter by module level
            }
          })
          .map((item, index) => {
            const spars =
              userModules &&
              userModules.find((i) => i.id === item?.module?.id)?.spars;
            // console.log("filter: ", spars);
            return (
              <div key={index} className="flex flex-col w-full mt-0">
                <StripReportCard item={item} spars={spars} value={index} />
              </div>
            );
          })}
    </div>
  );
};

export default MyReports;
