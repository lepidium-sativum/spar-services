import React, { useEffect, useState } from "react";
import Modal from "../../component/Modal/Modal";
import ModuleStartModal from "./ModuleStartModal";
import Button from "../../component/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { setMessageModel } from "../../../store/slices/commonSlice";

const RecommendedModules = React.memo((props) => {
  const { setIsBrowserSupport } = props;
  const dispatch = useDispatch();
  const recommendedList = useSelector((state) => state.auth.recommendedList);

  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState();

  const browserDetectHandler = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Firefox") || userAgent.includes("OPR")) {
      return false;
    } else {
      return true;
    }
  };

  const handleClick = async (id) => {
    if (id === 1) {
      const isBrowserSupported = browserDetectHandler();
      if (isBrowserSupported) {
        setIsBrowserSupport(true);
        setSelectedModule(recommendedList.find((item) => item.id === id));
        setShowModal(true);
      } else {
        setIsBrowserSupport(false);
      }
    } else {
      dispatch(setMessageModel(true));
    }
  };
  console.log("list: ", recommendedList);
  return (
    <>
      <div className="main-box-container flex w-[491px] flex-col border p-8 rounded-3xl custom-box bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)]">
        <div className="mb-8 flex justify-between items-center">
          <h3 className="text-[19px] font-bold leading-[12.871px] tracking-[0.19px] text-white">
            Recommended modules
          </h3>
        </div>
        <div className="max-h-[719px] overflow-y-scroll custom-scrollbar">
          {recommendedList &&
            recommendedList.map((list, index) => {
              return (
                <div
                  className="rounded-2xl bg-[#313732] gap-12 px-6 py-8 text-white flex items-center mb-4"
                  key={index}
                >
                  <div className="w-full">
                    <h5 className="text-base font-bold">{list?.name}</h5>
                    <p className="text-lg font-normal mb-4">
                      {list?.objectives}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="leading-[normal]">
                        <p className="text-xs font-light">Spar duration</p>
                        <span className="text-xs font-semibold">
                          {/* {list?.duration} */}
                          05:00m
                        </span>
                      </div>
                      <div>
                        <Button
                          onClick={() => {
                            handleClick(list?.id);
                          }}
                          className="btn btn-gradient"
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          <div className="rounded-2xl bg-[#313732] gap-12 px-6 py-8 text-white flex items-center mb-4">
            <div className="w-full">
              <h5 className="text-base font-bold">Module 4</h5>
              <p className="text-lg font-normal mb-4">
                Customer complaining about product quality
              </p>
              <div className="flex items-center justify-between">
                <div className="leading-[normal]">
                  <p className="text-xs font-light">Spar duration</p>
                  <span className="text-xs font-semibold">03:00m</span>
                </div>
                <div>
                  <Button
                    onClick={() => dispatch(setMessageModel(true))}
                    className="btn btn-gradient"
                  >
                    Start
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-[#313732] gap-12 px-6 py-8 text-white flex items-center mb-4">
            <div className="w-full">
              <h5 className="text-base font-bold">Module 5</h5>
              <p className="text-lg font-normal mb-4">
                Customer requesting product replacement
              </p>
              <div className="flex items-center justify-between">
                <div className="leading-[normal]">
                  <p className="text-xs font-light">Spar duration</p>
                  <span className="text-xs font-semibold">02:30m</span>
                </div>
                <div>
                  <Button
                    onClick={() => dispatch(setMessageModel(true))}
                    className="btn btn-gradient"
                  >
                    Start
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        moduleNumber={selectedModule?.id}
        innerClass="p-12"
      >
        {
          <ModuleStartModal
            selectedModule={selectedModule}
            // userProfileData={userProfileData}
            onClose={() => setShowModal(false)}
            setShowModal={setShowModal}
          />
        }
      </Modal>
    </>
  );
});
RecommendedModules.displayName = "RecommendedModules";

export default RecommendedModules;
