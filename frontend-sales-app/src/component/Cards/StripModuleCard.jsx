import React, { useState } from "react";
import StarRating from "../Star/StarRating";
import Button from "../Button/Button";
import Badge from "../Badges/Badge";
import ReadyModal from "../../component/Modal/ReadyModal";
import DetailModal from "../../component/Modal/DetailModal";
import AfterDetailStartModal from "../../component/Modal/AfterDetailStartModal";
import Modal from "../../component/Modal/Modal";
import NewModuleStartModal from "../../pages/Dashboard/NewModuleStartModal";
import { useDispatch, useSelector } from "react-redux";
import { setModule } from "../../../store/slices/commonSlice";
import { calculateStar } from "../../utils/constant";

const StripModuleCard = ({ item, setIsBrowserSupport, index }) => {
  // console.log("item: ", item);

  const dispatch = useDispatch();
  const recommendedList = useSelector((state) => state.auth.recommendedList);
  const [showModal, setShowModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [afterDetail, setAfterDetail] = useState(false);
  const [readyModal, setReadyModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState();
  const [websocketUrl, setWebSocketUrl] = useState("");

  // console.log("module: ", item);

  const browserDetectHandler = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Firefox") || userAgent.includes("OPR")) {
      return false;
    } else {
      return true;
    }
  };
  const handleClick = async (selectId) => {
    // if (id) {
    const isBrowserSupported = browserDetectHandler();
    if (isBrowserSupported) {
      setIsBrowserSupport(true);
      const selectedModuleData =
        recommendedList &&
        recommendedList.find((i) => i?.module?.id === item?.module?.id);

      // Set local state
      setSelectedModule(selectedModuleData);

      // Dispatch action to store selected module in Redux
      dispatch(setModule(selectedModuleData));

      if (selectId === 1) {
        setShowModal(true);
      } else {
        setDetailModal(true);
      }
    } else {
      setIsBrowserSupport(false);
    }
    // } else {
    //   dispatch(setMessageModel(true));
    // }
  };
  const handleStart = () => {
    setDetailModal(false);
    setAfterDetail(true);
  };

  const handleOpenModal = () => {
    setShowModal(false);
    setReadyModal(true);
  };
  return (
    <>
      <div className="flex flex-wrap items-center bg-[#313732] rounded-2xl shadow-[0px_14px_24px_0px_#00000040] w-full h-[106px]">
        <div className="flex flex-col relative w-[135px] h-[105px] rounded-l-2xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center rounded-l-2xl"
            style={{
              backgroundImage: `url(${item?.module?.aiavatar?.bgscene?.background_image?.url})`,
            }}
          />
          <img
            loading="lazy"
            src={item?.module?.aiavatar?.metahuman?.url}
            //   alt={`Profile of ${name}`}
            className="relative z-10 object-cover w-full h-full rounded-l-2xl"
          />
          <div className="absolute bottom-1.5 ml-2 z-20">
            <Badge text={item?.module?.level} />
          </div>
        </div>

        <div className="flex-1 ml-6">
          <div className="text-lg font-montserrat font-bold leading-tight text-white mb-1 tracking-wide">
            Module {item?.module?.id}
          </div>
          <div className="text-base font-montserrat font-normal leading-tight text-white mb-1">
            {/* Customer guidance at Sephora */}
            {item?.module?.name}
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full md:w-auto items-center md:ml-4 md:mr-4 mt-4 md:mt-0">
          {/* <!-- Star Rating and other info in a responsive container --> */}
          <div className="flex items-center mb-2 md:mb-0">
            <div className="w-[100px]">
              <StarRating rating={calculateStar(item?.rating)} />
            </div>
            <div className="h-[38px] w-[1px] border-l border-[#4a4848] mx-4" />
          </div>

          <div className="flex flex-col items-start mb-2 md:mb-0">
            <div className="text-sm font-montserrat font-light leading-tight text-white">
              Average time to complete
            </div>
            <div className="text-sm font-montserrat font-semibold leading-tight text-white tracking-wide">
              {/* {parseInt(item?.module?.session_time / 60) < 10
                ? "0" + parseInt(item?.module?.session_time / 60)
                : parseFloat(item?.module?.session_time / 60)}
              :00m */}
              {item?.module?.session_time < 60
                ? `${item?.module?.session_time}s`
                : parseInt(item?.module?.session_time / 60) < 10
                ? `0${parseInt(item?.module?.session_time / 60)}:00m`
                : `${parseFloat(item?.module?.session_time / 60)}:00m`}
            </div>
          </div>

          <div className="h-[38px] w-[1px] border-l border-[#4a4848] mx-4 md:block" />
          {/* <Button
            onClick={() => {
              handleClick(2);
            }}
            className="btn btn-gradient-detail-sm mt-2 md:mt-0 ml-12 text-xs leading-[9.65px] font-montserrat font-semibold text-white"
          >
            Detail
          </Button> */}
          <Button
            onClick={() => {
              handleClick(1);
            }}
            className=" btn btn-gradient-start-sm ml-2 mt-2 md:mt-0"
          >
            Start
          </Button>
        </div>
      </div>
      {detailModal && (
        <DetailModal
          onClose={() => setDetailModal(false)}
          avatar={item?.module?.aiavatar?.metahuman?.url}
          id={item?.module?.id}
          objectives={item?.module?.objectives}
          onStart={() => handleStart(true)}
          index={index}
          level={item?.module?.level}
        />
      )}
      {afterDetail && (
        <AfterDetailStartModal
          onClose={() => setAfterDetail(false)}
          avatar={item?.module?.aiavatar?.metahuman?.url}
          id={item?.module?.id}
          index={index}
          level={item?.module?.level}
          time={item?.module?.session_time}
        />
      )}
      {readyModal && (
        <ReadyModal
          avatar={item?.module?.aiavatar?.metahuman?.url}
          id={item?.module?.id}
          onClose={() => setReadyModal(false)}
          name={item?.module?.aiavatar?.metahuman?.name}
          selectedModule={selectedModule?.module}
          setReadyModal={setReadyModal}
          index={index}
          level={item?.module?.level}
          avatarName={item?.module?.aiavatar?.name}
          bgName={item?.module?.aiavatar?.bgscene?.name}
          mhName={item?.module?.aiavatar?.metahuman?.name}
          // ss={websocketUrl}
          ss={"vm0.antldvmss-westeurope.westeurope.cloudapp.azure.com/"}
        />
      )}
      <Modal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        id={item?.module?.id}
        innerClass="p-12"
      >
        {
          <NewModuleStartModal
            onClose={() => setShowModal(false)}
            setWebSocketUrl={setWebSocketUrl}
            selectedModule={selectedModule?.module}
            avatar={item?.module?.aiavatar?.metahuman?.url}
            id={item?.module?.id}
            objectives={item?.module?.objectives}
            onStart={() => handleOpenModal(true)}
            title={item?.module?.name}
            level={item?.module?.level}
            ss={"vm0.antldvmss-westeurope.westeurope.cloudapp.azure.com/"}
            index={index}
            bgName={item?.module?.aiavatar?.bgscene?.name}
            mhName={item?.module?.aiavatar?.metahuman?.name}
          />
        }
      </Modal>
    </>
  );
};

export default StripModuleCard;
