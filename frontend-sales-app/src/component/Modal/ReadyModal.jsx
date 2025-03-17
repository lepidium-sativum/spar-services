import { useState, useCallback } from "react";
import Button from "../Button/Button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Badge from "../Badges/Badge";
import {
  getS3BucketUrl,
  createSparData,
} from "../../../store/thunk/commonThunk";
import { setWarningModel } from "../../../store/slices/commonSlice";

const ReadyModal = ({
  onClose,
  avatar,
  id,
  selectedModule,
  setReadyModal,
  index,
  level,
  avatarName,
  bgName,
  mhName,
  ss,
  roomId,
}) => {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  // console.log("ReadyModal: ", selectedModule?.name);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStart = useCallback(() => {
    setIsNavigating(true);
    try {
      console.log("Fetching spar data...");
      dispatch(
        createSparData({
          name: selectedModule?.name,
          module_id: selectedModule?.id,
          room_id: roomId,
        })
      )
        .then(async (res) => {
          if (res?.payload?.status === 200) {
            dispatch(getS3BucketUrl(res?.payload?.data?.spar?.id))
              .then(async (res) => {
                if (res?.payload?.status === 200) {
                  navigate("/module?video=true", {
                    state: {
                      sparData: res?.payload?.data,
                      selectedModule: selectedModule,
                      index,
                      mhName,
                      bgName,
                      ss,
                    },
                  });
                } else {
                  console.log("Signed URL not received");
                  setIsNavigating(false);
                }
              })
              .catch((error) => {
                console.error("Error in getS3BucketUrl: ", error);
                setIsNavigating(false);
              });
          } else {
            console.log("createSparData failed");
            setIsNavigating(false);
          }
        })
        .catch((error) => {
          console.error("Error in createSparData: ", error);
          setIsNavigating(false);
        });
    } catch (error) {
      console.error("Error accessing camera and microphone:", error);
      setReadyModal(false);
      dispatch(setWarningModel(true));
      setIsNavigating(false);
    }
  }, [dispatch, navigate, selectedModule, setReadyModal]);

  // const pollServerStatus = useCallback(() => {
  //   const poll = () => {
  //     if (pollAttemptsRef.current >= maxPollAttempts) {
  //       console.error("Server did not start within expected time");
  //       setIsNavigating(false);
  //       return;
  //     }
  //     dispatch(getRoom())
  //       .then((res) => {
  //         console.log("get server status: ", res);
  //         if (
  //           res?.payload?.status === 200 &&
  //           res?.payload?.data?.status === "ready"
  //         ) {
  //           handleStart();
  //         } else {
  //           pollAttemptsRef.current += 1;
  //           setTimeout(poll, 2000);
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error in getRoom: ", error);
  //         setIsNavigating(false);
  //       });
  //   };

  //   poll();
  // }, [dispatch, handleStart]);

  // const initiateStartProcess = useCallback(() => {
  //   setIsNavigating(true);
  //   pollAttemptsRef.current = 0;
  //   try {
  //     dispatch(createRoom())
  //       .then((res) => {
  //         if (res?.payload?.status === 200) {
  //           pollServerStatus();
  //         } else {
  //           console.log("createRoom failed");
  //           setIsNavigating(false);
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error in createRoom: ", error);
  //         setIsNavigating(false);
  //       });
  //   } catch (error) {
  //     console.error("Error in initiateStartProcess:", error);
  //     setIsNavigating(false);
  //   }
  // }, [dispatch, pollServerStatus]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center h-full bg-opacity-15 backdrop-blur-sm">
      <div className="mt-10 mb-10 border border-[#474747] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] rounded-3xl w-[90%] max-w-[550px] h-auto flex flex-col gap-5 mx-4 overflow-auto p-5">
        <div className="flex">
          <Badge text={level} />
        </div>
        <div className="flex flex-col md:flex-row w-full h-full px-[60px] md:px-[60px] pb-[20px] md:pb-[60px] gap-6 md:gap-10">
          <div className="w-full md:w-[430px] flex flex-col">
            <div className="flex justify-center items-center">
              <img
                loading="lazy"
                src={avatar}
                alt={`Profile of ${id}`}
                className="object-cover w-[132.07px] h-[132.07px] border-[2px] border-[#95EBA3] rounded-full"
                // style={{ visibility: loading ? "hidden" : "visible" }} // Hide image while loading
              />
            </div>
            <div className="mt-8 md:mt-8 flex flex-col w-full items-center">
              <div className="flex flex-col">
                <span className="text-white font-montserrat text-[16px] md:text-[16px] text-center font-bold leading-[21.78px]">
                  Module {id} is loading...
                </span>
              </div>
              <div className="flex flex-col mt-4 md:mt-[14.8px]">
                <span className="text-white font-montserrat text-[24px] md:text-[24px] text-center font-normal leading-[32.66px]">
                  {avatarName} is your sparring partner
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-6 flex justify-center items-center">
              <Button className="btn btn-gradient-cancel" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="btn btn-gradient ml-3"
                onClick={handleStart}
                disabled={isNavigating}
              >
                {isNavigating ? "Loading..." : "Start module"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReadyModal;
