import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecommendedList } from "../../../store/thunk/commonThunk";
import { resetCommonState } from "../../../store/slices/commonSlice";
import { setSkipTutorial } from "../../../store/slices/authSlice";
import CommonModel from "../../component/Modal/CommonModel";
import BrowserSupportModel from "../../component/Modal/BrowserSupportModel";
import { resetState } from "../../../store/slices/statesSlice";
import VideoTutorial from "../../component/Tutorial/VideoTutorial";
import ProfileCard from "../../component/Cards/ProfileCard";
import ModuleCard from "../../component/Cards/ModuleCard";
import FilterSection from "../../component/Button/FilterSection";
import Button from "../../component/Button/Button";
import { set } from "lodash";
const Home = () => {
  // const { width, height } = useWindowSize();
  const recommendedList = useSelector((state) => state.auth.recommendedList);
  const skipTutorial = useSelector((state) => state.auth.skipTutorial);
  const dispatch = useDispatch();
  const [isBrowserSupport, setIsBrowserSupport] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All"); // State to store selected filter
  const [modalClicked, setModalClicked] = useState(false);
  const handleFilterChange = (filterLabel) => {
    setSelectedFilter(filterLabel);
  };
  const handleBrowserSupportModel = () => {
    setIsBrowserSupport(true);
  };
  useEffect(() => {
    const initialize = async () => {
      const storedSkipTutorial = localStorage.getItem("skipTutorial");
      if (storedSkipTutorial !== null) {
        dispatch(setSkipTutorial(JSON.parse(storedSkipTutorial)));
      }
      await dispatch(getRecommendedList());
      dispatch(resetCommonState());
      dispatch(resetState());
    };
    initialize();
  }, [dispatch]);

  const handleCardClick = (selectId) => {
    // console.log(`Module clicked SelectId: ${selectId}`);
    // Implement any logic you need on card click
  };

  const handleSkipTutorial = () => {
    // console.log("skiptutorial home: ", skipTutorial);
    dispatch(setSkipTutorial(false));
    localStorage.setItem("skipTutorial", JSON.stringify(false));
  };

  // console.log("home modules: ", recommendedList);
  return skipTutorial ? (
    <div className="flex inset-0 justify-center items-center px-16 gap-12 max-md:px-5">
      <div className="flex flex-col z-50 w-full max-w-[1244px] max-md:max-w-full">
        <VideoTutorial />
        <Button
          onClick={handleSkipTutorial}
          className="btn btn-gradient-tutorial self-center px-6 py-4 mt-6 "
        >
          Skip Tutorial
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col flex-1 h-[774px] mt-0 overflow-x-hidden max-md:px-5 mb-20 rounded-3x px-12 bg-gradient-to-br shadow-2xl from-[#333333] to-[#232323] rounded-3xl">
      <div className="flex text-base justify-end items-center px-0 py-8 text-white whitespace-nowrap max-md:flex-wrap">
        <div className="flex gap-2 px-5 my-auto font-medium tracking-normal">
          <div>Filter</div>
        </div>
        <FilterSection onFilterChange={handleFilterChange} />
      </div>
      <div className="flex w-full mt-6 h-[552px] mb-4 gap-5 rounded-2xl overflow-x-auto custom-scrollbar">
        {!isBrowserSupport && (
          <CommonModel
            isVisible={true}
            onClose={handleBrowserSupportModel}
            isBrowserSupport={isBrowserSupport}
          >
            <BrowserSupportModel />
          </CommonModel>
        )}
        {recommendedList &&
          recommendedList
            .filter((list) => {
              if (selectedFilter === "All") {
                return true;
              } else {
                return list?.module?.level === selectedFilter;
              }
            })
            .map((list, index) => {
              return (
                <div
                  className="flex flex-col gap-5 items-start border-[#464646] shadow-lg mt-0 cursor-pointer"
                  key={index}
                  onClick={() => handleCardClick(1)} // Pass `1` to simulate a "Start" click
                >
                  <div
                    className="rounded-2xl p-[1px]"
                    style={{
                      background:
                        "linear-gradient(335.03deg, #464646 0%, #1A1A1A 100%)",
                      boxShadow: "0px 14px 24px 0px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    <div className="flex flex-col rounded-2xl overflow-hidden">
                      <div className="flex flex-col w-[250px]">
                        <div className="flex w-full h-full">
                          <ModuleCard
                            id={list?.module?.id}
                            key={index}
                            avatarName={list?.module?.aiavatar?.name}
                            bgName={list?.module?.aiavatar?.bgscene?.name}
                            imageAvatar={list?.module?.aiavatar?.metahuman?.url}
                            imageBg={
                              list?.module?.aiavatar?.bgscene?.background_image
                                ?.url
                            }
                            title={list?.module?.name}
                            setIsBrowserSupport={setIsBrowserSupport}
                            objectives={list?.module?.objectives}
                            wants={list?.module?.scenario?.what_avatar_wants}
                            index={index}
                            rating={list?.rating}
                            attempts={list?.num_attempts}
                            level={list?.module?.level}
                            time={list?.module?.session_time}
                            mhName={list?.module?.aiavatar?.metahuman?.name}
                            handleCardClick={() => handleCardClick(1)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};
export default Home;
