import React, { useState } from "react";
import Button from "../../component/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../../component/Modal/Modal";
import NewModuleStartModal from "../../pages/Dashboard/NewModuleStartModal";
import { setModule } from "../../../store/slices/commonSlice";
import StarRating from "../Star/StarRating";
import ReadyModal from "../Modal/ReadyModal";
import DetailModal from "../Modal/DetailModal";
import AfterDetailStartModal from "../Modal/AfterDetailStartModal";
import { calculateStar } from "../../utils/constant";
import ProfileCard from "./ProfileCard";
const ModuleCard = ({
  id,
  title,
  setIsBrowserSupport,
  imageAvatar,
  objectives,
  avatarName,
  imageBg,
  bgName,
  wants,
  index,
  rating,
  attempts,
  level,
  time,
  mhName,
  handleCardClick, // Receive this from parent
}) => {
  const dispatch = useDispatch();
  const recommendedList = useSelector((state) => state.auth.recommendedList);
  const [showModal, setShowModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [afterDetail, setAfterDetail] = useState(false);
  const [readyModal, setReadyModal] = useState(false);
  const [websocketUrl, setWebSocketUrl] = useState("");
  const [selectedModule, setSelectedModule] = useState();
  const [roomId, setRoomId] = useState("");

  const browserDetectHandler = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Firefox") || userAgent.includes("OPR")) {
      return false;
    } else {
      return true;
    }
  };

  const handleClick = async (selectId) => {
    handleCardClick(selectId); // Trigger parent's callback
    const isBrowserSupported = browserDetectHandler();
    if (isBrowserSupported) {
      setIsBrowserSupport(true);
      const selectedModuleData =
        recommendedList &&
        recommendedList.find((item) => item?.module?.id === id);
      console.log("module id: ", selectedModuleData);
      // try {
      //   dispatch(createRoom(selectedModuleData?.module?.id))
      //     .then((res) => {
      //       if (res?.payload?.status === 200) {
      //         console.log("create room response: ", res?.payload?.data?.id);
      //         setRoomId(res?.payload?.data?.id);
      //         setShowModal(true);
      //       } else {
      //         //TODO: handle all other cases
      //         console.log("createRoom failed");
      //       }
      //     })
      //     .catch((error) => {
      //       console.error("Error in createRoom: ", error);
      //     });
      // } catch (error) {
      //   console.error("Error in initiateStartProcess:", error);
      // }
      setSelectedModule(selectedModuleData);
      dispatch(setModule(selectedModuleData));
      if (selectId === 1) {
        setShowModal(true);
      }
    } else {
      setIsBrowserSupport(false);
    }
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
      <div
        className="flex flex-col grow-0 size-full"
        onClick={(e) => {
          e.stopPropagation(); // Prevent bubbling to parent
          handleCardClick(1); // Trigger parent's handler
          handleClick(1); // Trigger local handler
        }}
      >
        <div className="flex flex-col grow-0 pb-6 size-full rounded-b-2xl shadow bg-[linear-gradient(128deg,#333333_0%,#232323_100%)] max-md:px-5">
          <div className="flex w-full h-[180px]">
            <ProfileCard
              key={index}
              index={index}
              imageAvatar={imageAvatar}
              imageBg={imageBg}
              name={avatarName}
              level={level}
              // onProfileClick={() => handleCardClick(1)}
            />
          </div>

          <div className="flex flex-col w-full px-6 h-[64px] mt-6 items-center justify-center">
            <div className="font-montserrat text-base font-bold leading-[19.5px] text-center text-white h-[20px]">
              Module
            </div>
            <div className="font-montserrat font-light text-base leading-[19.5px] text-center text-white h-[40px]">
              {title}
            </div>
          </div>
          {/* rating */}
          <div className="relative flex justify-center items-center w-full mt-4 h-[38px]">
            <div className="absolute top-1/2 w-[202px] h-[1px] bg-black"></div>
            <div className="flex relative z-10 ">
              <StarRating rating={calculateStar(rating)} />
            </div>
          </div>
          <div className="flex flex-row mt-4 h-[17px] justify-between items-start px-6">
            <div className="font-montserrat text-base font-light leading-[19.5px] text-white ">
              Attempts
            </div>
            <div className="font-montserrat font-bold text-base leading-[19.5px]  text-white">
              {attempts}
            </div>
          </div>

          <div className="flex flex-col items-end justify-end mt-4 text-[16px] font-semibold leading-3 text-white whitespace-nowrap">
            <Button className="btn btn-gradient-start mx-auto mt-2">
              Start
            </Button>
          </div>
        </div>
      </div>
      {detailModal && (
        <DetailModal
          onClose={() => setDetailModal(false)}
          avatar={imageAvatar}
          id={id}
          objectives={objectives}
          onStart={() => handleStart(true)}
          title={title}
          wants={wants}
          index={index}
          rating={rating}
          level={level}
        />
      )}
      {afterDetail && (
        <AfterDetailStartModal
          onClose={() => setAfterDetail(false)}
          avatar={imageAvatar}
          id={id}
          index={index}
          level={level}
          avatarName={avatarName}
          bgName={bgName}
          time={time}
        />
      )}
      {readyModal && (
        <ReadyModal
          avatar={imageAvatar}
          id={id}
          onClose={() => setReadyModal(false)}
          mhName={mhName}
          selectedModule={selectedModule?.module}
          setReadyModal={setReadyModal}
          index={index}
          level={level}
          avatarName={avatarName}
          bgName={bgName}
          ss={"vm0.antldvmss-westeurope.westeurope.cloudapp.azure.com/"}
        />
      )}
      <Modal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        moduleNumber={id}
        innerClass="p-12"
      >
        {
          <NewModuleStartModal
            onClose={() => setShowModal(false)}
            setWebSocketUrl={setWebSocketUrl}
            selectedModule={selectedModule?.module}
            avatar={imageAvatar}
            id={id}
            objectives={objectives}
            onStart={() => handleOpenModal(true)}
            title={title}
            level={level}
            ss={"vm0.antldvmss-westeurope.westeurope.cloudapp.azure.com/"}
            index={index}
            bgName={bgName}
            mhName={mhName}
          />
        }
      </Modal>
    </>
  );
};
ModuleCard.displayName = "ModuleCard";

export default ModuleCard;
