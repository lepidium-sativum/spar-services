import { useCallback, useEffect, useState, useRef } from "react";
import Button from "../../component/Button/Button";
import { useDispatch } from "react-redux";
import Badge from "../../component/Badges/Badge";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import {
  getS3BucketUrl,
  createSparData,
} from "../../../store/thunk/commonThunk";
import { useNavigate } from "react-router-dom";

const ModuleStartModal = ({
  onClose,
  avatar,
  id,
  objectives,
  ss,
  title,
  level,
  selectedModule,
  index,
  bgName,
  mhName,
}) => {
  const dispatch = useDispatch();
  let navigate = useNavigate();

  // console.log("ReadyModal: ", roomId);
  const [progressStart, setProgressStart] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moduleReady, setModuleReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    if (progressStart) {
      progressRef.current = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(progressRef.current);
            setModuleReady(true);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 500);
    }
    return () => clearInterval(progressRef.current);
  }, [progressStart]);

  const handleStart = () => {
    if (moduleReady) {
      onStart();
    } else {
      setProgressStart(true);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    clearInterval(progressRef.current);
    setProgressStart(false);
    setProgress(0);
    setModuleReady(false);
    onClose();
  };
  const onStart = () => {
    setIsNavigating(true);
    try {
      console.log("Fetching spar data...");
      dispatch(
        createSparData({
          name: selectedModule?.name,
          module_id: selectedModule?.id,
          // room_id: roomId,
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
      setIsNavigating(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-15 backdrop-blur-sm">
      <div className="w-[517px] h-auto bg-[#28282A] border border-[#424245] rounded-3xl p-[36px] ">
        <div className="w-[445px] flex flex-col">
          <div className="flex flex-col justify-center items-center">
            <Box
              position="relative"
              display="flex"
              justifyContent="center"
              alignItems="center"
              width={140}
              height={140}
            >
              <>
                <img
                  loading="lazy"
                  src={avatar}
                  alt={`Profile of ${id}`}
                  className="object-cover w-[140px] h-[140px] rounded-full"
                />
              </>
            </Box>
            {progressStart && progress < 100 ? (
              <>
                <div className="flex flex-col w-full mt-[12px] ">
                  <LinearProgress
                    value={progress}
                    variant="determinate"
                    sx={{
                      backgroundColor: "#222121",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#71E684",
                      },
                    }}
                  />
                </div>
                <div className=" mt-[12px] w-full flex items-center justify-center text-[#71E684] text-[16px] leading-[29.6px ]">
                  It usually takes 30 seconds...
                </div>
              </>
            ) : null}
          </div>

          <div className=" w-full text-[#FFFFFF] flex flex-col justify-center items-center mt-4">
            <div className="flex flex-row w-auto justify-center items-center">
              <div className="h-auto  text-[24px] mr-[12px]  ">Module {id}</div>
              <div className="">
                <Badge text={level} />
              </div>
            </div>
            <div className="flex flex-col mt-4 md:mt-[14.8px]">
              <span className="text-white font-montserrat text-[18px] md:text-[24px] text-center font-normal leading-[32.66px]">
                {title}
              </span>
            </div>
            {/* <div className=" w-[445px] h-auto mt-[12px] text-[#C0C0C0] font-['Montserrat'] leading-[29.6px] flex justify-center items-center">
              The Client wants to replace a product by another
            </div> */}
          </div>
        </div>

        <div className="w-[445px] h-[269px] mt-[18px]">
          <div className="w-[445px] h-auto p-6 rounded-[28px] bg-[#161618] flex flex-col ">
            <div className="w-full h-auto text-[#FFFFFF] text-[16px] leading-[25.9px] font-['Montserrat'] mb-3 ">
              Objectives
            </div>
            {objectives &&
              objectives.map((obj, index) => (
                <div
                  key={index}
                  className="flex flex-col w-[397px] h-[48px] justify-center bg-[#28282A] rounded-[29.6px] mb-2 px-5 py-[14px]"
                >
                  <span className="text-[14px] text-[#FFFFFF] leading-[17.07px]">
                    {obj?.title}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="w-full items-center justify-center h-[52px] flex flex-row ">
          <Button
            className={"btn btn-gradient-cancel-module"}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            className={`btn-gradient-start-module ml-3 ${
              progressStart && !moduleReady ? "bg-[#161618]" : "bg-[#71E684]"
            } ${
              progressStart && !moduleReady
                ? "text-[#71E684]"
                : "text-[#272727]"
            }`}
            onClick={handleStart}
            disabled={progressStart && !moduleReady}
          >
            {moduleReady
              ? "Module is ready"
              : progressStart
              ? "Module is loading..."
              : "Start"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModuleStartModal;
